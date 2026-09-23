import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import {
  X,
  Navigation,
  MapPin,
  Phone,
  Clock,
  Compass,
  CheckCircle2,
  AlertCircle,
  LocateFixed,
} from "lucide-react";

export default function InAppMapNavigationSheet({
  job,
  onClose,
  onStatusUpdate,
  actionLoading = false,
  technicianCoords = null,
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [userLocation, setUserLocation] = useState(technicianCoords || null);
  const [gpsStatus, setGpsStatus] = useState(
    technicianCoords ? "connected" : "detecting",
  ); // 'detecting' | 'connected' | 'simulated'
  const [isNavigating, setIsNavigating] = useState(false);
  const [navStepIndex, setNavStepIndex] = useState(0);

  if (!job) return null;

  // Base coordinates: parse job coords if present or derive from typical metro coordinates
  const destLat = Number(job.latitude || job.lat) || 28.5355;
  const destLng = Number(job.longitude || job.lng) || 77.391;

  // Compute or fallback technician starting location
  const defaultTechLat = destLat + 0.024;
  const defaultTechLng = destLng - 0.018;

  // Live turn-by-turn navigation steps
  const navigationSteps = [
    {
      instruction: "Head south on Sector Road towards Destination",
      dist: "450 m",
      time: "1 min",
    },
    {
      instruction: "At the roundabout, take the 2nd exit onto Main Avenue",
      dist: "1.2 km",
      time: "4 mins",
    },
    {
      instruction: "Turn left onto Customer Street",
      dist: "300 m",
      time: "1 min",
    },
    {
      instruction: "Arriving at customer doorstep on the left",
      dist: "50 m",
      time: "30 sec",
    },
  ];

  // Geolocation detection
  useEffect(() => {
    let isMounted = true;
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          if (!isMounted) return;
          setUserLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
          setGpsStatus("connected");
        },
        () => {
          if (!isMounted) return;
          setUserLocation({
            lat: defaultTechLat,
            lng: defaultTechLng,
          });
          setGpsStatus("simulated");
        },
        { enableHighAccuracy: true, timeout: 5000 },
      );
    } else {
      setUserLocation({
        lat: defaultTechLat,
        lng: defaultTechLng,
      });
      setGpsStatus("simulated");
    }

    return () => {
      isMounted = false;
    };
  }, [destLat, destLng, defaultTechLat, defaultTechLng]);

  // Turn-by-turn navigation simulator timer
  useEffect(() => {
    if (!isNavigating) return;
    const interval = setInterval(() => {
      setNavStepIndex((prev) => (prev + 1) % navigationSteps.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isNavigating, navigationSteps.length]);

  // Leaflet Map Initialization
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const startLat = userLocation?.lat || defaultTechLat;
    const startLng = userLocation?.lng || defaultTechLng;

    // Destroy existing instance if any
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    try {
      const map = L.map(mapContainerRef.current, {
        center: [(startLat + destLat) / 2, (startLng + destLng) / 2],
        zoom: 13,
        zoomControl: false,
        attributionControl: false,
      });

      // Standard clean OpenStreetMap tiles
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
      }).addTo(map);

      // Custom icon helper
      const createHtmlIcon = (bgColor, iconHtml, label) => {
        return L.divIcon({
          className: "custom-leaflet-pin",
          html: `
            <div style="display:flex;flex-direction:column;align-items:center;">
              <div style="background-color:${bgColor};color:white;width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 10px rgba(0,0,0,0.3);border:2px solid white;font-weight:bold;font-size:12px;">
                ${iconHtml}
              </div>
              <div style="background:white;color:#1e293b;padding:2px 8px;border-radius:10px;font-size:10px;font-weight:800;box-shadow:0 2px 6px rgba(0,0,0,0.15);margin-top:3px;white-space:nowrap;border:1px solid #cbd5e1;">
                ${label}
              </div>
            </div>
          `,
          iconSize: [36, 52],
          iconAnchor: [18, 48],
        });
      };

      // Technician Marker
      const techMarker = L.marker([startLat, startLng], {
        icon: createHtmlIcon("#059669", "&#9650;", "You (Technician)"),
      }).addTo(map);
      techMarker.bindPopup(
        "<b>Your Current Position</b><br>En route to customer.",
      );

      // Destination Marker
      const destMarker = L.marker([destLat, destLng], {
        icon: createHtmlIcon("#dc2626", "&#9679;", "Customer Destination"),
      }).addTo(map);
      destMarker.bindPopup(
        `<b>${job.customer_name || "Customer"}</b><br>${job.address || "Destination"}`,
      );

      // Route polyline with slight intermediate curve
      const midLat = (startLat + destLat) / 2 + 0.003;
      const midLng = (startLng + destLng) / 2 - 0.004;
      const latlngs = [
        [startLat, startLng],
        [midLat, midLng],
        [destLat, destLng],
      ];

      const polyline = L.polyline(latlngs, {
        color: "#059669",
        weight: 5,
        opacity: 0.85,
        dashArray: isNavigating ? "10, 10" : null,
      }).addTo(map);

      // Fit map to bounds
      const bounds = L.latLngBounds([
        [startLat, startLng],
        [destLat, destLng],
      ]);
      map.fitBounds(bounds, { padding: [50, 50] });

      mapInstanceRef.current = map;
    } catch (e) {
      console.error("Leaflet map initialization error:", e);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [
    userLocation,
    destLat,
    destLng,
    defaultTechLat,
    defaultTechLng,
    job,
    isNavigating,
  ]);

  // Haversine distance estimation
  const computeDistanceKm = () => {
    const lat1 = userLocation?.lat || defaultTechLat;
    const lon1 = userLocation?.lng || defaultTechLng;
    const lat2 = destLat;
    const lon2 = destLng;
    const R = 6371; // km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const trueDistanceKm = computeDistanceKm();
  const distanceMeters = Math.round(trueDistanceKm * 1000);
  const distanceDisplay =
    distanceMeters < 1000
      ? `${distanceMeters} m`
      : `${trueDistanceKm.toFixed(1)} km`;
  const estimatedMins = Math.max(1, Math.round((trueDistanceKm / 24) * 60) + 1);
  const isWithinDoorstep = distanceMeters <= 100;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/70 backdrop-blur-xs transition-opacity animate-fade-in">
      {/* Click outside to close backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Main Bottom Sheet / Modal Card */}
      <div className="relative w-full sm:max-w-2xl bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] z-10 transition-transform">
        {/* Handle bar on mobile */}
        <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto mt-2.5 sm:hidden shrink-0" />

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 bg-white shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-emerald-700 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Navigation className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-black uppercase text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">
                  In-App Navigation
                </span>
                <span className="text-[11px] font-bold text-slate-400">
                  Order #{job.id}
                </span>
              </div>
              <h3 className="text-sm font-black text-slate-900 truncate">
                {job.service_name || job.category || "Emergency Service"}
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Close Map"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Navigation Guidance Banner (when active) */}
        {isNavigating && (
          <div className="bg-emerald-800 text-white px-5 py-3 shrink-0 flex items-center justify-between border-b border-emerald-900 shadow-inner">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center animate-pulse shrink-0">
                <Compass className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-xs font-black text-white">
                  {navigationSteps[navStepIndex].instruction}
                </p>
                <p className="text-[10px] text-emerald-200">
                  {navigationSteps[navStepIndex].dist} remaining • ~
                  {navigationSteps[navStepIndex].time}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsNavigating(false)}
              className="text-[11px] font-bold bg-white/20 hover:bg-white/30 text-white px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
            >
              Exit Nav
            </button>
          </div>
        )}

        {/* Map Container */}
        <div className="relative w-full h-56 sm:h-72 bg-slate-100 shrink-0">
          <div ref={mapContainerRef} className="w-full h-full z-0" />

          {/* Quick Floating Status Pill */}
          <div className="absolute top-3 left-3 z-40 bg-white/95 backdrop-blur-xs px-3 py-1.5 rounded-xl shadow-md border border-slate-200/80 flex items-center gap-2 text-xs font-bold text-slate-800">
            <LocateFixed className="w-3.5 h-3.5 text-emerald-700 animate-pulse" />
            <span>
              {gpsStatus === "connected"
                ? "Live GPS Active"
                : "GPS Simulated Origin"}
            </span>
          </div>

          {/* Distance & ETA Overlay Chip */}
          <div className="absolute bottom-3 right-3 z-40 bg-slate-900/90 backdrop-blur-xs text-white px-3.5 py-1.5 rounded-xl shadow-lg flex items-center gap-3 text-xs font-bold">
            <div className="flex items-center gap-1">
              <Navigation className="w-3 h-3 text-emerald-400" />
              <span>{distanceDisplay}</span>
            </div>
            <span className="text-slate-500">•</span>
            <div className="flex items-center gap-1 text-emerald-300">
              <Clock className="w-3 h-3 text-emerald-400" />
              <span>~{estimatedMins} mins</span>
            </div>
          </div>
        </div>

        {/* Destination & Details Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3.5 bg-white text-slate-800">
          {/* Destination Address Card */}
          <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200/80 flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-red-100 text-red-600 flex items-center justify-center shrink-0 mt-0.5">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                  Customer Destination
                </p>
                <p className="text-xs font-bold text-slate-900 mt-0.5 break-words">
                  {job.address}
                </p>
                <p className="text-xs text-slate-600 mt-1">
                  Customer:{" "}
                  <span className="font-semibold text-slate-900">
                    {job.customer_name || "Verified Customer"}
                  </span>
                </p>
              </div>
            </div>

            {/* Quick Call Button */}
            {job.customer_phone && (
              <a
                href={`tel:${job.customer_phone}`}
                className="shrink-0 p-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-colors flex items-center gap-1.5 text-xs font-bold"
                title="Call Customer"
              >
                <Phone className="w-4 h-4" />
                <span className="hidden sm:inline">Call</span>
              </a>
            )}
          </div>

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row gap-2 pt-1">
            {/* Toggle In-App Turn-by-Turn Navigation */}
            {!isNavigating ? (
              <button
                type="button"
                onClick={() => setIsNavigating(true)}
                className="flex-1 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-colors"
              >
                <Navigation className="w-4 h-4 text-emerald-400" />
                <span>Start Navigation</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsNavigating(false)}
                className="flex-1 py-3 px-4 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <span>Stop Navigation Preview</span>
              </button>
            )}

            {/* In-Panel Workflow Button (if Start Trip is pending) */}
            {onStatusUpdate &&
              ["ACCEPTED", "ASSIGNED"].includes(job.status) && (
                <button
                  type="button"
                  onClick={() =>
                    onStatusUpdate(job.id, "ON_THE_WAY", "On The Way")
                  }
                  disabled={actionLoading}
                  className="flex-1 py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-colors"
                >
                  <Navigation className="w-4 h-4" />
                  <span>
                    {actionLoading ? "Updating..." : "Start Trip (On The Way)"}
                  </span>
                </button>
              )}

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="py-3 px-4 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs transition-colors cursor-pointer text-center"
            >
              Close
            </button>
          </div>

          {/* In-Panel Doorstep Arrival (when ON_THE_WAY) */}
          {onStatusUpdate && job.status === "ON_THE_WAY" && (
            <div className="space-y-2 pt-2 border-t border-slate-100">
              {isWithinDoorstep ? (
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>
                    You are at the service location (within 100m). Ready to mark
                    arrived.
                  </span>
                </div>
              ) : (
                <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 shrink-0 text-amber-600" />
                    <span>
                      You are {distanceDisplay} away from customer location.
                      Move within 100m to mark arrived.
                    </span>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={() =>
                  onStatusUpdate(
                    job.id,
                    "ARRIVED",
                    "Arrived",
                    userLocation || { lat: destLat, lng: destLng },
                  )
                }
                disabled={actionLoading || !isWithinDoorstep}
                className={`w-full py-3 px-4 rounded-xl font-black text-xs flex items-center justify-center gap-2 shadow-xs transition-colors ${
                  isWithinDoorstep
                    ? "bg-amber-600 hover:bg-amber-700 text-white cursor-pointer"
                    : "bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300"
                }`}
                title={
                  !isWithinDoorstep
                    ? `Must be within 100m of customer doorstep (${distanceDisplay} away)`
                    : "Mark Arrived at Doorstep"
                }
              >
                <MapPin className="w-4 h-4" />
                <span>
                  {actionLoading
                    ? "Verifying GPS..."
                    : isWithinDoorstep
                      ? "Mark Arrived at Doorstep"
                      : "Reach Doorstep (<100m) to Mark Arrived"}
                </span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
