import { v4 as uuidv4 } from "uuid";
import { query } from "../db/database.js";
import { calculateDistance, calculateETA } from "../utils/geo.js";

// In-memory active dispatch timers and rejection tracking
// Map: requestId -> { timer, candidateQueue: [], currentTechId: null, rejectedTechIds: Set }
const activeDispatches = new Map();

export const dispatchEngine = {
  /**
   * Find and rank eligible technicians for a given request
   */
  async findEligibleTechnicians(category, lat, lon, excludedTechIds = []) {
    const allTechs = await query.all(
      `SELECT t.*, u.name, u.phone, u.avatar
       FROM technicians t
       JOIN users u ON t.user_id = u.id
       WHERE t.category = ?
         AND t.is_online = 1
         AND t.is_busy = 0
         AND (t.status = 'Approved' OR t.status IS NULL)`,
      [category],
    );

    const candidates = [];

    for (const tech of allTechs) {
      if (excludedTechIds.includes(tech.id)) continue;

      const distanceKm = calculateDistance(
        lat,
        lon,
        tech.latitude,
        tech.longitude,
      );
      const etaMinutes = calculateETA(distanceKm);

      // The radius is enforced server-side; a browser cannot widen it.
      if (distanceKm > 15) continue;

      // Scoring formula: prioritize proximity heavily, boost high ratings, slightly penalize higher historical response times
      const proximityScore = 100 / (1 + distanceKm * 0.8);
      const ratingScore = (tech.rating || 4.5) * 12;
      const experienceScore = Math.min((tech.total_jobs || 0) * 0.1, 10);
      const compositeScore = Math.round(
        proximityScore + ratingScore + experienceScore,
      );

      candidates.push({
        ...tech,
        distanceKm,
        etaMinutes,
        compositeScore,
      });
    }

    // Dispatch and the customer list both prefer the nearest eligible pro.
    candidates.sort((a, b) => a.distanceKm - b.distanceKm || b.compositeScore - a.compositeScore);
    return candidates;
  },

  /**
   * Start automated dispatch process for an emergency request
   */
  async autoDispatch(requestId, io) {
    const request = await query.get(
      "SELECT * FROM service_requests WHERE id = ?",
      [requestId],
    );
    if (!request) return { success: false, error: "Request not found" };

    // Initialize or retrieve active dispatch state
    let state = activeDispatches.get(requestId);
    if (!state) {
      state = {
        candidateQueue: [],
        currentTechId: null,
        rejectedTechIds: new Set(),
        timer: null,
      };
      activeDispatches.set(requestId, state);
    }

    // Find ranked candidates excluding previously rejected
    const excluded = Array.from(state.rejectedTechIds);
    const candidates = await this.findEligibleTechnicians(
      request.category,
      request.latitude,
      request.longitude,
      excluded,
    );

    if (candidates.length === 0) {
      // No available technician found within network
      await query.run(
        `UPDATE service_requests SET status = 'REQUESTED', updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        [requestId],
      );
      await query.run(
        `INSERT INTO status_logs (id, request_id, old_status, new_status, note)
         VALUES (?, ?, 'AUTO_DISPATCHED', 'REQUESTED', 'All nearby units busy or declined. Escalated to Admin Control Room.')`,
        [uuidv4(), requestId],
      );

      io.to(`request_${requestId}`).emit("request_updated", {
        requestId,
        status: "REQUESTED",
        message:
          "High demand: Escalating to dispatch supervisor for priority assignment.",
      });

      io.to("role_admin").emit("admin_alert", {
        type: "DISPATCH_UNFULFILLED",
        requestId,
        category: request.category,
        priority: request.priority,
        message: `No available online technician for ${request.category} (${request.priority} priority). Supervisor intervention needed.`,
      });

      activeDispatches.delete(requestId);
      return { success: false, reason: "NO_TECHNICIANS_AVAILABLE" };
    }

    // Pick top candidate
    const topTech = candidates[0];
    state.currentTechId = topTech.id;

    // Update request in database
    await query.run(
      `UPDATE service_requests 
       SET technician_id = ?, status = 'AUTO_DISPATCHED', eta_minutes = ?, distance_km = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [topTech.id, topTech.etaMinutes, topTech.distanceKm, requestId],
    );

    await query.run(
      `INSERT INTO status_logs (id, request_id, old_status, new_status, note)
       VALUES (?, ?, ?, 'AUTO_DISPATCHED', ?)`,
      [
        uuidv4(),
        requestId,
        request.status,
        `Auto-dispatch selected ${topTech.name} (${topTech.distanceKm} km away, ~${topTech.etaMinutes} min ETA, Score: ${topTech.compositeScore}). Offer valid for 45s.`,
      ],
    );

    // Broadcast updates
    const updatedRequest = await query.get(
      `SELECT sr.*, u.name as customer_name, u.phone as customer_phone,
              t.vehicle_type, tu.name as technician_name, tu.phone as technician_phone, t.rating as technician_rating
       FROM service_requests sr
       JOIN users u ON sr.customer_id = u.id
       LEFT JOIN technicians t ON sr.technician_id = t.id
       LEFT JOIN users tu ON t.user_id = tu.id
       WHERE sr.id = ?`,
      [requestId],
    );

    io.to(`request_${requestId}`).emit("request_updated", updatedRequest);
    io.to("role_admin").emit("admin_dispatch_event", {
      type: "DISPATCH_OFFERED",
      request: updatedRequest,
      technician: topTech,
    });

    // Send targeted offer modal to specific technician
    io.to(`user_${topTech.user_id}`).emit("emergency_dispatch_offer", {
      requestId,
      category: request.category,
      priority: request.priority,
      description: request.description,
      address: request.address,
      latitude: request.latitude,
      longitude: request.longitude,
      distanceKm: topTech.distanceKm,
      etaMinutes: topTech.etaMinutes,
      expiresInSeconds: 45,
    });

    // Start 45-second acceptance timer
    if (state.timer) clearTimeout(state.timer);
    state.timer = setTimeout(async () => {
      console.log(
        `[Dispatch Engine] Offer timed out for technician ${topTech.name} on request ${requestId}`,
      );
      await dispatchEngine.handleDeclineOrTimeout(
        requestId,
        topTech.id,
        io,
        "Timeout (no response within 45s)",
      );
    }, 45000);

    return { success: true, technician: topTech };
  },

  /**
   * Handle technician accepting the dispatch offer
   */
  async handleAccept(requestId, techId, io) {
    const state = activeDispatches.get(requestId);
    if (state && state.timer) {
      clearTimeout(state.timer);
    }
    activeDispatches.delete(requestId);

    // Update technician availability
    await query.run(
      `UPDATE technicians SET is_busy = 1, current_request_id = ? WHERE id = ?`,
      [requestId, techId],
    );

    // Update service request
    await query.run(
      `UPDATE service_requests 
       SET status = 'ACCEPTED', updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [requestId],
    );

    await query.run(
      `INSERT INTO status_logs (id, request_id, old_status, new_status, note)
       VALUES (?, ?, 'AUTO_DISPATCHED', 'ACCEPTED', 'Technician confirmed emergency acceptance. Preparing immediate departure.')`,
      [uuidv4(), requestId],
    );

    const fullRequest = await query.get(
      `SELECT sr.*, u.name as customer_name, u.phone as customer_phone,
              t.vehicle_type, t.latitude as tech_lat, t.longitude as tech_lon,
              tu.name as technician_name, tu.phone as technician_phone, t.rating as technician_rating
       FROM service_requests sr
       JOIN users u ON sr.customer_id = u.id
       JOIN technicians t ON sr.technician_id = t.id
       JOIN users tu ON t.user_id = tu.id
       WHERE sr.id = ?`,
      [requestId],
    );

    io.to(`request_${requestId}`).emit("request_updated", fullRequest);
    io.to("role_admin").emit("admin_dispatch_event", {
      type: "DISPATCH_ACCEPTED",
      request: fullRequest,
    });

    return { success: true, request: fullRequest };
  },

  /**
   * Handle technician declining or timing out -> Cascade to next best technician
   */
  async handleDeclineOrTimeout(
    requestId,
    techId,
    io,
    reason = "Declined by technician",
  ) {
    const state = activeDispatches.get(requestId) || {
      candidateQueue: [],
      currentTechId: null,
      rejectedTechIds: new Set(),
      timer: null,
    };

    if (state.timer) clearTimeout(state.timer);
    state.rejectedTechIds.add(techId);
    activeDispatches.set(requestId, state);

    await query.run(
      `INSERT INTO status_logs (id, request_id, old_status, new_status, note)
       VALUES (?, ?, 'AUTO_DISPATCHED', 'AUTO_DISPATCHED', ?)`,
      [
        uuidv4(),
        requestId,
        `Technician candidate unavailable: ${reason}. Cascading auto-dispatch to next fastest unit.`,
      ],
    );

    io.to("role_admin").emit("admin_dispatch_event", {
      type: "DISPATCH_DECLINED",
      requestId,
      techId,
      reason,
    });

    // Auto-cascade to next eligible technician
    return await this.autoDispatch(requestId, io);
  },

  /**
   * Admin manual dispatch override
   */
  async manualAssign(requestId, techId, io, adminName = "Supervisor") {
    const state = activeDispatches.get(requestId);
    if (state && state.timer) {
      clearTimeout(state.timer);
    }
    activeDispatches.delete(requestId);

    const tech = await query.get(
      `SELECT t.*, u.name, u.phone FROM technicians t JOIN users u ON t.user_id = u.id WHERE t.id = ?`,
      [techId],
    );
    const req = await query.get("SELECT * FROM service_requests WHERE id = ?", [
      requestId,
    ]);

    const distanceKm = calculateDistance(
      req.latitude,
      req.longitude,
      tech.latitude,
      tech.longitude,
    );
    const etaMinutes = calculateETA(distanceKm);

    await query.run(
      `UPDATE service_requests 
       SET technician_id = ?, status = 'ASSIGNED', eta_minutes = ?, distance_km = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [techId, etaMinutes, distanceKm, requestId],
    );

    await query.run(
      `UPDATE technicians SET is_busy = 1, current_request_id = ? WHERE id = ?`,
      [requestId, techId],
    );

    await query.run(
      `INSERT INTO status_logs (id, request_id, old_status, new_status, note)
       VALUES (?, ?, ?, 'ASSIGNED', ?)`,
      [
        uuidv4(),
        requestId,
        req.status,
        `Manual assignment by ${adminName} to technician ${tech.name}.`,
      ],
    );

    const fullRequest = await query.get(
      `SELECT sr.*, u.name as customer_name, u.phone as customer_phone,
              t.vehicle_type, t.latitude as tech_lat, t.longitude as tech_lon,
              tu.name as technician_name, tu.phone as technician_phone, t.rating as technician_rating
       FROM service_requests sr
       JOIN users u ON sr.customer_id = u.id
       JOIN technicians t ON sr.technician_id = t.id
       JOIN users tu ON t.user_id = tu.id
       WHERE sr.id = ?`,
      [requestId],
    );

    io.to(`request_${requestId}`).emit("request_updated", fullRequest);
    io.to(`user_${tech.user_id}`).emit("emergency_dispatch_offer", {
      requestId,
      category: req.category,
      priority: req.priority,
      description: req.description,
      address: req.address,
      distanceKm,
      etaMinutes,
      expiresInSeconds: 60,
      isManualAssignment: true,
    });

    return { success: true, request: fullRequest };
  },
};
