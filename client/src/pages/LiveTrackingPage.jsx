import React, { useEffect, useState } from "react";
import { Phone, RefreshCw, XCircle } from "lucide-react";
import api from "../services/api";
import { useSocket } from "../context/SocketContext";
import EmergencyMap from "../components/map/EmergencyMap";
import StatusBadge from "../components/common/StatusBadge";

export default function LiveTrackingPage({ requestId, onNavigateRequest }) {
  const { socket, joinRoom } = useSocket();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchRequest = async () => {
    setLoading(true);
    try {
      const response = requestId
        ? await api.get(`/requests/${requestId}`)
        : await api.get("/requests/my");
      const data = requestId ? response.data : response.data?.[0];
      setRequest(data || null);
      setError("");
    } catch (err) {
      setError("Could not load active emergency request.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequest();
  }, [requestId]);

  useEffect(() => {
    if (!socket || !request?.id) return undefined;
    joinRoom(`request_${request.id}`);
    const handleUpdate = (updated) =>
      setRequest((current) => ({ ...current, ...updated }));
    const handleMovement = ({ latitude, longitude, distanceKm, etaMinutes }) =>
      setRequest((current) =>
        current
          ? {
              ...current,
              tech_lat: latitude,
              tech_lon: longitude,
              distance_km: distanceKm ?? current.distance_km,
              eta_minutes: etaMinutes ?? current.eta_minutes,
            }
          : current,
      );
    socket.on("request_updated", handleUpdate);
    socket.on("technician_moved", handleMovement);
    return () => {
      socket.off("request_updated", handleUpdate);
      socket.off("technician_moved", handleMovement);
    };
  }, [socket, request?.id, joinRoom]);

  const cancelRequest = async () => {
    if (!request?.id || !window.confirm("Cancel this emergency request?"))
      return;
    try {
      await api.post(`/requests/${request.id}/cancel`);
      await fetchRequest();
    } catch {
      setError("Could not cancel the request.");
    }
  };

  if (loading)
    return (
      <div className="p-8 text-sm text-slate-500">
        Loading tracking details...
      </div>
    );
  if (error)
    return (
      <div className="m-6 p-4 bg-red-50 text-red-700 rounded-xl text-sm">
        {error}
      </div>
    );
  if (!request)
    return (
      <div className="p-8 text-center">
        <p className="text-slate-600">No active emergency request found.</p>
        <button
          onClick={onNavigateRequest}
          className="mt-4 px-4 py-2 bg-black text-white rounded-lg text-sm"
        >
          Create a request
        </button>
      </div>
    );

  const customerLocation =
    request.latitude && request.longitude
      ? {
          lat: request.latitude,
          lon: request.longitude,
          address: request.address,
        }
      : undefined;
  const technicianLocation =
    request.tech_lat && request.tech_lon
      ? {
          lat: request.tech_lat,
          lon: request.tech_lon,
          name: request.technician_name,
        }
      : undefined;

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-red-600">
            Emergency tracking
          </p>
          <h1 className="text-2xl font-black text-slate-900 mt-1">
            Request #{request.id}
          </h1>
        </div>
        <StatusBadge status={request.status} />
      </div>
      <EmergencyMap
        customerLocation={customerLocation}
        technicianLocation={technicianLocation}
        showRoute
      />
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-xs text-slate-500">Service</p>
          <p className="font-bold text-slate-900 mt-1">{request.category}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-xs text-slate-500">Estimated arrival</p>
          <p className="font-bold text-slate-900 mt-1">
            {request.eta_minutes
              ? `${Math.round(request.eta_minutes)} min`
              : "Calculating"}
          </p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-xs text-slate-500">Technician</p>
          <p className="font-bold text-slate-900 mt-1">
            {request.technician_name || "Dispatching"}
          </p>
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={fetchRequest}
          className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-bold flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
        {request.technician_phone && (
          <a
            href={`tel:${request.technician_phone}`}
            className="px-4 py-2 bg-black text-white rounded-lg text-sm font-bold flex items-center gap-2"
          >
            <Phone className="w-4 h-4" /> Call technician
          </a>
        )}
        {!["COMPLETED", "CANCELLED"].includes(request.status) && (
          <button
            onClick={cancelRequest}
            className="px-4 py-2 text-red-700 border border-red-200 rounded-lg text-sm font-bold flex items-center gap-2"
          >
            <XCircle className="w-4 h-4" /> Cancel
          </button>
        )}
      </div>
    </div>
  );
}
