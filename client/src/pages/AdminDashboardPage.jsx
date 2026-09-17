import React, { useEffect, useState } from "react";
import {
  Siren,
  Users,
  Clock,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  ShieldAlert,
  ArrowRight,
  RefreshCw,
  Radio,
  UserCheck,
  Eye,
} from "lucide-react";
import api from "../services/api";
import { useSocket } from "../context/SocketContext";
import EmergencyMap from "../components/map/EmergencyMap";
import StatusBadge from "../components/common/StatusBadge";

export default function AdminDashboardPage({ onInspectRequest }) {
  const { socket, joinRoom } = useSocket();
  const [kpis, setKpis] = useState(null);
  const [activeRequests, setActiveRequests] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [manualModalOpen, setManualModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [selectedTechId, setSelectedTechId] = useState("");
  const [eventFeed, setEventFeed] = useState([
    {
      id: 1,
      text: "Auto-Dispatch Engine online. All city nodes operational.",
      time: "Just now",
    },
  ]);

  const loadData = async () => {
    try {
      const [kpiRes, reqRes, techRes] = await Promise.all([
        api.get("/admin/kpis"),
        api.get("/requests/my"),
        api.get("/technicians"),
      ]);

      setKpis(kpiRes.data);
      setActiveRequests(
        reqRes.data.filter(
          (r) => !["COMPLETED", "CANCELLED"].includes(r.status),
        ),
      );
      setTechnicians(techRes.data);
    } catch (err) {
      console.error("Error fetching admin data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    joinRoom("role_admin");

    if (socket) {
      const handleDispatchEvent = (event) => {
        console.log("[Admin] Live dispatch event:", event);
        loadData();
        setEventFeed((prev) => [
          {
            id: Date.now(),
            text: `${event.type}: ${event.request?.category || ""} (${event.request?.priority || ""}) - ${event.newStatus || event.type}`,
            time: new Date().toLocaleTimeString(),
          },
          ...prev.slice(0, 15),
        ]);
      };

      const handleTechMoved = (data) => {
        setTechnicians((prev) =>
          prev.map((t) => {
            if (t.id === data.techId) {
              return {
                ...t,
                latitude: data.latitude,
                longitude: data.longitude,
              };
            }
            return t;
          }),
        );
      };

      socket.on("admin_dispatch_event", handleDispatchEvent);
      socket.on("admin_tech_moved", handleTechMoved);
      socket.on("new_emergency_alert", (alert) => {
        loadData();
        setEventFeed((prev) => [
          {
            id: Date.now(),
            text: `🚨 CRITICAL CALL: ${alert.category} at ${alert.address} (${alert.customerName})`,
            time: new Date().toLocaleTimeString(),
          },
          ...prev.slice(0, 15),
        ]);
      });

      return () => {
        socket.off("admin_dispatch_event", handleDispatchEvent);
        socket.off("admin_tech_moved", handleTechMoved);
      };
    }
  }, [socket]);

  const handleManualDispatchSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRequest || !selectedTechId) return;

    try {
      await api.post("/admin/manual-dispatch", {
        requestId: selectedRequest.id,
        technicianId: selectedTechId,
      });
      setManualModalOpen(false);
      loadData();
    } catch (err) {
      alert("Failed to override dispatch");
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto py-16 text-center space-y-3">
        <div className="w-10 h-10 border-4 border-rose-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-slate-500 text-sm font-semibold">
          Connecting to Citywide Operations Telemetry...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Title & Live Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Emergency Operations Control Room
            </h1>
            <span className="px-2.5 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full animate-pulse flex items-center gap-1.5">
              <span className="w-2 h-2 bg-red-600 rounded-full" />
              LIVE TELEMETRY
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Real-time algorithmic dispatch monitoring, workforce routing & SLA
            management
          </p>
        </div>

        <button
          onClick={loadData}
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 shadow-sm transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Feeds</span>
        </button>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-black uppercase">
              Active Emergencies
            </span>
            <Siren className="w-5 h-5 text-rose-600 animate-pulse" />
          </div>
          <p className="text-3xl font-black text-slate-900">
            {kpis?.activeEmergencies || 0}
          </p>
          <p className="text-[10px] text-rose-600 font-semibold mt-1">
            Live in auto-dispatch queue
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-black uppercase">
              Avg Response Time
            </span>
            <Clock className="w-5 h-5 text-amber-500" />
          </div>
          <p className="text-3xl font-black text-slate-900">
            {kpis?.avgResponseTimeMinutes || 12.3}m
          </p>
          <p className="text-[10px] text-emerald-600 font-semibold mt-1">
            ↓ 64% vs manual dispatch (34m)
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-black uppercase">
              Dispatch Accuracy
            </span>
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-3xl font-black text-slate-900">
            {kpis?.dispatchAccuracy || 96}%
          </p>
          <p className="text-[10px] text-emerald-600 font-semibold mt-1">
            First-match acceptance rate
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-black uppercase">
              Tech Utilization
            </span>
            <Users className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-3xl font-black text-slate-900">
            {kpis?.technicianUtilizationRate || 68}%
          </p>
          <p className="text-[10px] text-blue-600 font-semibold mt-1">
            {kpis?.busyTechnicians || 0} on duty of{" "}
            {kpis?.onlineTechnicians || 0} online
          </p>
        </div>
      </div>

      {/* Main Map + Live Event Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Full City Ops Map */}
        <div className="lg:col-span-2 bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-800">
                Citywide Live Ops Grid
              </h2>
            </div>
            <div className="flex items-center gap-3 text-[11px]">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-500" /> Available
                Tech
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-orange-500" /> Assigned
                / En Route
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-rose-600" /> Emergency
                Incident
              </span>
            </div>
          </div>

          <EmergencyMap
            center={[40.718, -74.004]}
            center={[28.6315, 77.2167]}
            zoom={13}
            allTechnicians={technicians}
            allRequests={activeRequests}
            height="460px"
          />
        </div>

        {/* Live Event Stream */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Radio className="w-4 h-4 text-rose-600" />
                Live Dispatch Telemetry
              </h3>
              <span className="text-[10px] text-slate-400 font-mono">
                Stream Active
              </span>
            </div>

            <div className="space-y-2.5 overflow-y-auto max-h-[380px] pr-1">
              {eventFeed.map((ev) => (
                <div
                  key={ev.id}
                  className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-400">
                      {ev.time}
                    </span>
                  </div>
                  <p className="text-slate-800 font-medium">{ev.text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400 text-center">
            Socket rooms synced:{" "}
            <code className="font-mono text-slate-600">role_admin</code>
          </div>
        </div>
      </div>

      {/* Active Emergencies Monitoring Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-800">
              Active Incident Queue
            </h2>
            <p className="text-xs text-slate-500">
              Live requests requiring dispatch, en route, or in progress
            </p>
          </div>
          <span className="text-xs font-bold bg-slate-100 text-slate-700 px-3 py-1 rounded-full">
            {activeRequests.length} Ongoing
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Priority & Service</th>
                <th className="py-3 px-4">Customer & Location</th>
                <th className="py-3 px-4">Assigned Specialist</th>
                <th className="py-3 px-4">ETA / Distance</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {activeRequests.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-8 text-center text-slate-400 font-medium"
                  >
                    No active emergency requests right now. All clear!
                  </td>
                </tr>
              ) : (
                activeRequests.map((req) => (
                  <tr
                    key={req.id}
                    className="hover:bg-slate-50/70 transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full ${req.priority === "Critical" ? "bg-red-600 animate-ping" : "bg-orange-500"}`}
                        />
                        <div>
                          <p className="font-bold text-slate-900">
                            {req.category}
                          </p>
                          <p className="text-[10px] text-red-600 font-bold uppercase">
                            {req.priority} Priority
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-800">
                        {req.customer_name}
                      </p>
                      <p className="text-[10px] text-slate-500 truncate max-w-xs">
                        {req.address}
                      </p>
                    </td>

                    <td className="py-3.5 px-4">
                      {req.technician_name ? (
                        <div>
                          <p className="font-bold text-emerald-700">
                            {req.technician_name}
                          </p>
                          <p className="text-[10px] text-slate-500">
                            {req.technician_phone}
                          </p>
                        </div>
                      ) : (
                        <span className="text-amber-600 font-bold">
                          Unassigned / Searching...
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 font-mono">
                      <p className="font-bold text-slate-800">
                        ~{req.eta_minutes || 12} mins
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {req.distance_km || 1.4} km
                      </p>
                    </td>

                    <td className="py-3.5 px-4">
                      <StatusBadge status={req.status} />
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setSelectedRequest(req);
                            setSelectedTechId(req.technician_id || "");
                            setManualModalOpen(true);
                          }}
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold text-[11px] transition-colors"
                        >
                          Manual Override
                        </button>
                        <button
                          onClick={() =>
                            onInspectRequest && onInspectRequest(req.id)
                          }
                          className="p-1.5 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100"
                          title="Inspect Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Dispatch Override Modal */}
      {manualModalOpen && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-900">
                Supervisor Dispatch Override
              </h3>
              <button
                onClick={() => setManualModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="text-xs space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <p>
                <strong>Incident:</strong> {selectedRequest.category} (
                {selectedRequest.priority})
              </p>
              <p>
                <strong>Customer:</strong> {selectedRequest.customer_name} -{" "}
                {selectedRequest.address}
              </p>
            </div>

            <form
              onSubmit={handleManualDispatchSubmit}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Select Technician to Force Assign:
                </label>
                <select
                  value={selectedTechId}
                  onChange={(e) => setSelectedTechId(e.target.value)}
                  required
                  className="w-full text-xs font-semibold border border-slate-300 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                >
                  <option value="">-- Choose Qualified Technician --</option>
                  {technicians.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.category}) -{" "}
                      {t.is_busy
                        ? "Busy on Job"
                        : t.is_online
                          ? "Available"
                          : "Offline"}{" "}
                      ⭐ {t.rating}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-red-500/20 transition-all"
              >
                Execute Force Assignment
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
