import React, { useState } from "react";
import { Flame, MapPin, Send, ShieldAlert, Wrench, Zap } from "lucide-react";
import api from "../services/api";
import EmergencyMap from "../components/map/EmergencyMap";

const categories = [
  { id: "Plumbing", label: "Plumbing Emergency", icon: Wrench },
  { id: "Electrical", label: "Electrical Failure", icon: Zap },
  { id: "HVAC", label: "AC & Heating Failure", icon: Flame },
  { id: "Gas Leak", label: "Gas Leak & Safety", icon: ShieldAlert },
];

export default function CustomerRequestPage({ onRequestCreated }) {
  const [category, setCategory] = useState("Plumbing");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [coordinates, setCoordinates] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submitRequest = async (event) => {
    event.preventDefault();
    if (!coordinates) {
      setError("Enable location permission or select your service point on the map before requesting service.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await api.post("/requests", {
        category,
        priority: "High",
        description,
        address,
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
        scheduled_date: new Date().toISOString().slice(0, 10),
        scheduled_time: "ASAP",
      });
      onRequestCreated?.(response.data.id);
    } catch (err) {
      setError(
        err.response?.data?.error || "Could not create the emergency request.",
      );
    } finally {
      setLoading(false);
    }
  };

  const useCurrentLocation = () =>
    navigator.geolocation?.getCurrentPosition(
      ({ coords }) =>
        setCoordinates({
          latitude: coords.latitude,
          longitude: coords.longitude,
        }),
      () => setError("Location permission was denied. Select your service point on the map or enable location permission."),
    );

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-red-600">
          Emergency assistance
        </p>
        <h1 className="text-3xl font-black text-slate-900 mt-1">
          What do you need help with?
        </h1>
        <p className="text-sm text-slate-500 mt-2">
          A certified professional will be dispatched to your location.
        </p>
      </div>
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
          {error}
        </div>
      )}
      <form onSubmit={submitRequest} className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-5">
          <div className="grid grid-cols-2 gap-3">
            {categories.map(({ id, label, icon: Icon }) => (
              <button
                type="button"
                key={id}
                onClick={() => setCategory(id)}
                className={`p-4 rounded-xl border text-left ${category === id ? "border-black bg-black text-white" : "border-slate-200 hover:border-slate-400 text-slate-800"}`}
              >
                <Icon className="w-5 h-5 mb-3" />
                <span className="block text-sm font-bold">{label}</span>
              </button>
            ))}
          </div>
          <label className="block">
            <span className="block text-xs font-bold text-slate-700 mb-1">
              Describe the problem
            </span>
            <textarea
              required
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows="4"
              placeholder="Tell us what is happening..."
              className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            />
          </label>
          <label className="block">
            <span className="block text-xs font-bold text-slate-700 mb-1">
              Service address
            </span>
            <input
              required
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              placeholder="Enter the address"
              className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            />
          </label>
          <button
            type="button"
            onClick={useCurrentLocation}
            className="text-xs font-bold text-slate-700 flex items-center gap-2"
          >
            <MapPin className="w-4 h-4" /> Use my current location
          </button>
          <button
            disabled={loading}
            className="w-full py-3 bg-black text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            {loading ? "Dispatching..." : "Request emergency service"}
          </button>
        </div>
        <EmergencyMap
          center={coordinates ? [coordinates.latitude, coordinates.longitude] : undefined}
          isInteractive
          onLocationSelect={(location) =>
            setCoordinates({ latitude: location.lat, longitude: location.lng })
          }
        />
      </form>
    </div>
  );
}
