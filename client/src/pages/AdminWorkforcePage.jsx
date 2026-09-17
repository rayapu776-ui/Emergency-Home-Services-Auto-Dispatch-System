import React, { useEffect, useState } from "react";
import {
  Users,
  Power,
  Star,
  Phone,
  MapPin,
  Wrench,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";
import api from "../services/api";

export default function AdminWorkforcePage() {
  const [workforce, setWorkforce] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWorkforce = async () => {
    try {
      const res = await api.get("/admin/workforce");
      setWorkforce(res.data);
    } catch (err) {
      console.error("Failed to load workforce:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkforce();
  }, []);

  const handleToggle = async (techId) => {
    try {
      await api.put(`/admin/technicians/${techId}/toggle`);
      fetchWorkforce();
    } catch (err) {
      alert("Failed to toggle status");
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-rose-600" />
            Technician Workforce Management
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Fleet readiness, certifications, and active shift supervision
          </p>
        </div>

        <button
          onClick={fetchWorkforce}
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 shadow-sm transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Fleet</span>
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Technician Specialist</th>
                <th className="py-3 px-4">Skill Category</th>
                <th className="py-3 px-4">Current Status</th>
                <th className="py-3 px-4">Rating & Experience</th>
                <th className="py-3 px-4">GPS Coordinates</th>
                <th className="py-3 px-4 text-right">Shift Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {workforce.map((t) => (
                <tr
                  key={t.id}
                  className="hover:bg-slate-50/70 transition-colors"
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-900 text-white font-black flex items-center justify-center">
                        {t.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{t.name}</p>
                        <p className="text-[10px] text-slate-500 flex items-center gap-1">
                          <Phone className="w-3 h-3 text-emerald-600" />{" "}
                          {t.phone}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="py-4 px-4">
                    <span className="font-bold text-slate-800">
                      {t.category}
                    </span>
                    <p className="text-[10px] text-slate-400">
                      {t.vehicle_type}
                    </p>
                  </td>

                  <td className="py-4 px-4">
                    {t.is_busy ? (
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-orange-100 text-orange-800">
                        Assigned to Incident
                      </span>
                    ) : t.is_online ? (
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1 w-fit">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Available for Dispatch
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-500">
                        Shift Inactive (Offline)
                      </span>
                    )}
                  </td>

                  <td className="py-4 px-4">
                    <div className="flex items-center gap-1 font-bold text-amber-500">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span>{t.rating}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-medium">
                      {t.total_jobs} completed emergencies
                    </p>
                  </td>

                  <td className="py-4 px-4 font-mono text-[11px] text-slate-500">
                    {t.latitude.toFixed(4)}, {t.longitude.toFixed(4)}
                  </td>

                  <td className="py-4 px-4 text-right">
                    <button
                      onClick={() => handleToggle(t.id)}
                      className={`px-3 py-1.5 rounded-xl font-bold text-[11px] transition-all ${
                        t.is_online
                          ? "bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200"
                          : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                      }`}
                    >
                      {t.is_online ? "Mark Offline" : "Set Available"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
