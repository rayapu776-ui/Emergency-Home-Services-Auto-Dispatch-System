import React, { useEffect, useState, useRef } from "react";
import {
  Radio,
  Power,
  Navigation,
  Phone,
  MapPin,
  CheckCircle2,
  Clock,
  Play,
  Pause,
  AlertTriangle,
  ShieldCheck,
  Star,
  Wrench,
  ArrowRight,
} from "lucide-react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import EmergencyMap from "../components/map/EmergencyMap";
import StatusBadge from "../components/common/StatusBadge";

export default function TechnicianDashboardPage({
  activeRequestId,
  onNavigateHistory,
}) {
  const { user } = useAuth();
  const { socket, joinRoom } = useSocket();

  const [techData, setTechData] = useState(null);
  const [activeJob, setActiveJob] = useState(null);
  const [isOnline, setIsOnline] = useState(true);
  const [loading, setLoading] = useState(true);

  // GPS Simulation state
  const [isSimulatingGps, setIsSimulatingGps] = useState(false);
  const simulationIntervalRef = useRef(null);

  const fetchTechStatus = async () => {
    try {
      const res = await api.get("/technicians/current-status");
      setTechData(res.data.technician);
      setActiveJob(res.data.activeJob);
      setIsOnline(res.data.technician?.is_online === 1);
    } catch (err) {
      console.error("Error fetching technician status:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTechStatus();
  }, [activeRequestId]);

  useEffect(() => {
    if (activeJob?.id) {
      joinRoom(`request_${activeJob.id}`);
    }
  }, [activeJob?.id]);

  // Toggle Online/Offline
  const handleToggleOnline = async () => {
    try {
      const newStatus = !isOnline;
      await api.put("/technicians/availability", { is_online: newStatus });
      setIsOnline(newStatus);
    } catch (err) {
      alert("Failed to update availability");
    }
  };

  // Progress Active Job Status
  const handleStatusTransition = (nextStatus, note) => {
    if (!activeJob || !socket) return;

    socket.emit("update_request_status", {
      requestId: activeJob.id,
      newStatus: nextStatus,
      techId: techData?.id,
      note,
    });

    setActiveJob((prev) => ({ ...prev, status: nextStatus }));

    if (nextStatus === "COMPLETED") {
      stopSimulation();
      setTimeout(() => {
        fetchTechStatus();
      }, 1000);
    }
  };

  // Real-time GPS movement simulation
  const startSimulation = () => {
    if (!activeJob || !socket || !techData) return;

    setIsSimulatingGps(true);

    const startLat = techData.latitude;
    const startLon = techData.longitude;
    const destLat = activeJob.latitude;
    const destLon = activeJob.longitude;

    let currentStep = 0;
    const totalSteps = 20;

    if (simulationIntervalRef.current)
      clearInterval(simulationIntervalRef.current);

    simulationIntervalRef.current = setInterval(() => {
      currentStep++;
      const fraction = currentStep / totalSteps;

      const currentLat = Number(
        (startLat + (destLat - startLat) * fraction).toFixed(6),
      );
      const currentLon = Number(
        (startLon + (destLon - startLon) * fraction).toFixed(6),
      );

      // Emit live coordinates over WebSocket to Customer & Admin
      socket.emit("technician_location_update", {
        techId: techData.id,
        requestId: activeJob.id,
        latitude: currentLat,
        longitude: currentLon,
      });

      setTechData((prev) => ({
        ...prev,
        latitude: currentLat,
        longitude: currentLon,
      }));

      if (currentStep >= totalSteps) {
        clearInterval(simulationIntervalRef.current);
        setIsSimulatingGps(false);
        handleStatusTransition(
          "ARRIVED",
          "Technician vehicle arrived at customer doorstep.",
        );
      }
    }, 1500);
  };

  const stopSimulation = () => {
    if (simulationIntervalRef.current) {
      clearInterval(simulationIntervalRef.current);
      simulationIntervalRef.current = null;
    }
    setIsSimulatingGps(false);
  };

  useEffect(() => {
    return () => {
      if (simulationIntervalRef.current)
        clearInterval(simulationIntervalRef.current);
    };
  }, []);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center space-y-3">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-slate-500 text-sm font-semibold">
          Initializing technician telematics...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-green-500 text-white font-black text-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Wrench className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                {techData?.name || user?.name}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                {techData?.category || "Master"} Specialist
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Unit: {techData?.vehicle_type || "Rapid Response Van"} • Base: New
              York Metro Area
            </p>
          </div>
        </div>

        {/* Online / Offline Toggle */}
        <div className="flex items-center gap-4 bg-slate-50 p-2.5 rounded-2xl border border-slate-200">
          <div className="text-right">
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Dispatch Status
            </p>
            <p
              className={`text-xs font-black ${isOnline ? "text-emerald-600" : "text-slate-500"}`}
            >
              {isOnline ? "ONLINE & DISPATCHABLE" : "OFFLINE / SHIFT END"}
            </p>
          </div>
          <button
            onClick={handleToggleOnline}
            className={`p-3 rounded-xl transition-all shadow-md flex items-center justify-center ${
              isOnline
                ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20"
                : "bg-slate-300 hover:bg-slate-400 text-slate-700"
            }`}
          >
            <Power className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Metric Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-[11px] font-bold uppercase text-slate-400">
            Total Jobs
          </p>
          <p className="text-2xl font-black text-slate-800 mt-1">
            {techData?.total_jobs || 142}
          </p>
          <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">
            ↑ 98% completion rate
          </p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-[11px] font-bold uppercase text-slate-400">
            Rating
          </p>
          <p className="text-2xl font-black text-slate-800 mt-1 flex items-center gap-1">
            ⭐ {techData?.rating || 4.9}
          </p>
          <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
            Top 5% in network
          </p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-[11px] font-bold uppercase text-slate-400">
            Avg Response Time
          </p>
          <p className="text-2xl font-black text-slate-800 mt-1">
            {techData?.response_time_avg || 12.3}m
          </p>
          <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">
            &lt; 15m SLA target
          </p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-[11px] font-bold uppercase text-slate-400">
            Today's Earnings
          </p>
          <p className="text-2xl font-black text-emerald-700 mt-1">$485</p>
          <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
            4 emergencies handled
          </p>
        </div>
      </div>

      {/* Active Emergency Job Section */}
      {activeJob ? (
        <div className="bg-white rounded-3xl border-2 border-emerald-500/80 p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <span className="p-2.5 bg-red-100 text-red-600 rounded-xl animate-pulse">
                <AlertTriangle className="w-5 h-5" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-black text-slate-900">
                    Active Emergency: {activeJob.category}
                  </h2>
                  <StatusBadge status={activeJob.status} />
                </div>
                <p className="text-xs text-slate-500 font-medium">
                  Priority:{" "}
                  <strong className="text-red-600">{activeJob.priority}</strong>{" "}
                  • Customer: <strong>{activeJob.customer_name}</strong>
                </p>
              </div>
            </div>

            {/* Simulated Live GPS Drive Button */}
            {["ACCEPTED", "ON_THE_WAY"].includes(activeJob.status) && (
              <div>
                {!isSimulatingGps ? (
                  <button
                    onClick={startSimulation}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl text-xs shadow-md transition-all animate-pulse"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Simulate Driving to Customer</span>
                  </button>
                ) : (
                  <button
                    onClick={stopSimulation}
                    className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs shadow-md transition-all"
                  >
                    <Pause className="w-3.5 h-3.5" />
                    <span>Pause GPS Simulation</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Details & Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="space-y-3">
              <div>
                <span className="text-slate-400 font-bold uppercase block">
                  Customer Location
                </span>
                <div className="flex items-start gap-2 mt-1">
                  <MapPin className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <p className="font-bold text-slate-800 text-sm">
                    {activeJob.address}
                  </p>
                </div>
              </div>

              <div>
                <span className="text-slate-400 font-bold uppercase block">
                  Problem Description
                </span>
                <p className="text-slate-700 italic bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs mt-1">
                  "{activeJob.description}"
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <a
                  href={`tel:${activeJob.customer_phone || "+15550000000"}`}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Call Homeowner</span>
                </a>
              </div>
            </div>

            {/* Interactive Map view of Destination */}
            <div>
              <EmergencyMap
                customerLocation={{
                  lat: activeJob.latitude,
                  lon: activeJob.longitude,
                  title: activeJob.customer_name,
                  address: activeJob.address,
                }}
                technicianLocation={
                  techData
                    ? {
                        lat: techData.latitude,
                        lon: techData.longitude,
                        name: "You (Technician)",
                        vehicle: techData.vehicle_type,
                        isBusy: true,
                      }
                    : null
                }
                showRoute={true}
                height="220px"
              />
            </div>
          </div>

          {/* Job Lifecycle Step Progression Action Buttons */}
          <div className="pt-4 border-t border-slate-100">
            <p className="text-xs font-black uppercase text-slate-500 mb-3 tracking-wider">
              Step-By-Step Job Workflow:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <button
                onClick={() =>
                  handleStatusTransition("ON_THE_WAY", "Technician en route")
                }
                disabled={activeJob.status !== "ACCEPTED"}
                className={`py-3 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  activeJob.status === "ACCEPTED"
                    ? "bg-orange-500 hover:bg-orange-600 text-white shadow-md animate-bounce"
                    : "bg-slate-100 text-slate-400 cursor-not-allowed"
                }`}
              >
                <Navigation className="w-4 h-4" />
                <span>1. Start Trip</span>
              </button>

              <button
                onClick={() =>
                  handleStatusTransition(
                    "ARRIVED",
                    "Technician arrived on-site",
                  )
                }
                disabled={activeJob.status !== "ON_THE_WAY"}
                className={`py-3 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  activeJob.status === "ON_THE_WAY"
                    ? "bg-sky-600 hover:bg-sky-700 text-white shadow-md"
                    : "bg-slate-100 text-slate-400 cursor-not-allowed"
                }`}
              >
                <MapPin className="w-4 h-4" />
                <span>2. Mark Arrived</span>
              </button>

              <button
                onClick={() =>
                  handleStatusTransition("IN_PROGRESS", "Repair work commenced")
                }
                disabled={activeJob.status !== "ARRIVED"}
                className={`py-3 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  activeJob.status === "ARRIVED"
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-md"
                    : "bg-slate-100 text-slate-400 cursor-not-allowed"
                }`}
              >
                <Wrench className="w-4 h-4" />
                <span>3. Start Work</span>
              </button>

              <button
                onClick={() =>
                  handleStatusTransition(
                    "COMPLETED",
                    "Work finished and customer signoff received",
                  )
                }
                disabled={activeJob.status !== "IN_PROGRESS"}
                className={`py-3 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  activeJob.status === "IN_PROGRESS"
                    ? "bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/30 font-black"
                    : "bg-slate-100 text-slate-400 cursor-not-allowed"
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>4. Complete Job</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-10 border border-slate-200 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <Radio className="w-8 h-8 animate-pulse" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">
              {isOnline
                ? "Standby: Listening for Emergency Dispatches"
                : "You Are Currently Offline"}
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
              {isOnline
                ? "The Auto-Dispatch Engine will automatically route the nearest emergency matching your certified skill with a 45s audio alert."
                : "Toggle your status to ONLINE above when you are ready to receive priority jobs."}
            </p>
          </div>

          <div className="pt-2">
            <EmergencyMap
              technicianLocation={
                techData
                  ? {
                      lat: techData.latitude,
                      lon: techData.longitude,
                      name: "Current Standby Station",
                      vehicle: techData.vehicle_type,
                      isBusy: false,
                    }
                  : null
              }
              height="260px"
            />
          </div>
        </div>
      )}
    </div>
  );
}
