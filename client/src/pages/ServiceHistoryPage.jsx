import React, { useEffect, useState } from "react";
import {
  History,
  Search,
  Filter,
  Calendar,
  Star,
  FileText,
  ChevronRight,
  CheckCircle2,
  X,
} from "lucide-react";
import api from "../services/api";
import StatusBadge from "../components/common/StatusBadge";

export default function ServiceHistoryPage({ onInspectRequest }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedDetail, setSelectedDetail] = useState(null);

  const fetchHistory = async () => {
    try {
      const res = await api.get("/requests/my");
      setRequests(res.data);
    } catch (err) {
      console.error("Error fetching history:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleOpenDetail = async (reqId) => {
    try {
      const res = await api.get(`/requests/${reqId}`);
      setSelectedDetail(res.data);
    } catch (err) {
      alert("Failed to load request audit trail");
    }
  };

  const filteredRequests = requests.filter((r) => {
    const matchesSearch =
      (r.description || "").toLowerCase().includes(search.toLowerCase()) ||
      (r.address || "").toLowerCase().includes(search.toLowerCase()) ||
      (r.category || "").toLowerCase().includes(search.toLowerCase());
    const matchesCat =
      categoryFilter === "ALL" || r.category === categoryFilter;
    const matchesStatus = statusFilter === "ALL" || r.status === statusFilter;
    return matchesSearch && matchesCat && matchesStatus;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <History className="w-6 h-6 text-rose-600" />
            Service History & Audit Trail
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Full chronological records, dispatch verification, and customer
            ratings
          </p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search address, issue description..."
            className="w-full text-xs pl-9 pr-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs font-semibold border border-slate-300 rounded-xl px-3 py-2 focus:outline-none"
          >
            <option value="ALL">All Categories</option>
            <option value="Plumbing">Plumbing</option>
            <option value="Electrical">Electrical</option>
            <option value="HVAC">HVAC</option>
            <option value="Gas Leak">Gas Leak</option>
            <option value="Locksmith">Locksmith</option>
            <option value="Appliance">Appliance</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs font-semibold border border-slate-300 rounded-xl px-3 py-2 focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="COMPLETED">Completed</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="ON_THE_WAY">En Route</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Requests List */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-slate-400 text-xs">
            Loading records...
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs">
            No service records matched your filters.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredRequests.map((r) => (
              <div
                key={r.id}
                onClick={() => handleOpenDetail(r.id)}
                className="p-5 hover:bg-slate-50/80 transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={r.status} />
                    <span className="text-[11px] font-mono text-slate-400">
                      {new Date(r.created_at).toLocaleDateString()} at{" "}
                      {new Date(r.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    <span className="text-[11px] font-extrabold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                      {r.priority}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-rose-600 transition-colors">
                    {r.category}: {r.description}
                  </h3>

                  <p className="text-xs text-slate-500">
                    Location: <strong>{r.address}</strong>
                  </p>

                  {r.technician_name && (
                    <p className="text-xs text-emerald-700 font-semibold">
                      Specialist: {r.technician_name} ({r.vehicle_type || "Van"}
                      )
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  {r.rating && (
                    <div className="text-right">
                      <div className="flex items-center gap-0.5 text-amber-500 font-bold text-xs">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span>{r.rating}.0 / 5.0</span>
                      </div>
                      <span className="text-[10px] text-slate-400">
                        Verified Rating
                      </span>
                    </div>
                  )}
                  <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-rose-600 group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Audit Detail & Timeline Modal */}
      {selectedDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black text-slate-900">
                    Incident Audit & Dispatch Ledger
                  </h3>
                  <StatusBadge status={selectedDetail.status} />
                </div>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  ID: {selectedDetail.id}
                </p>
              </div>
              <button
                onClick={() => setSelectedDetail(null)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Core Info Grid */}
            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
              <div>
                <span className="text-slate-400 font-bold block">CUSTOMER</span>
                <p className="font-bold text-slate-800 text-sm mt-0.5">
                  {selectedDetail.customer_name}
                </p>
                <p className="text-slate-500">
                  {selectedDetail.customer_phone}
                </p>
              </div>
              <div>
                <span className="text-slate-400 font-bold block">
                  ASSIGNED TECHNICIAN
                </span>
                <p className="font-bold text-emerald-700 text-sm mt-0.5">
                  {selectedDetail.technician_name || "Unassigned"}
                </p>
                <p className="text-slate-500">
                  {selectedDetail.technician_phone || "--"}
                </p>
              </div>
            </div>

            {/* Status Logs Timeline */}
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 mb-3">
                Lifecycle State Transition Log
              </h4>
              <div className="space-y-3 relative pl-6 border-l-2 border-slate-200 ml-2">
                {selectedDetail.logs && selectedDetail.logs.length > 0 ? (
                  selectedDetail.logs.map((log) => (
                    <div key={log.id} className="relative text-xs">
                      <div className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full bg-rose-600 border-2 border-white shadow-sm" />
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">
                          {log.new_status}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-slate-600 text-[11px] mt-0.5">
                        {log.note}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400">
                    No transition logs recorded.
                  </p>
                )}
              </div>
            </div>

            {/* Feedback section if rated */}
            {selectedDetail.feedback && (
              <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl text-xs space-y-1">
                <div className="flex items-center gap-1 font-bold text-amber-800">
                  <Star className="w-4 h-4 fill-current text-amber-500" />
                  <span>Customer Review ({selectedDetail.rating} / 5.0)</span>
                </div>
                <p className="text-slate-700 italic">
                  "{selectedDetail.feedback}"
                </p>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedDetail(null)}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs"
              >
                Close Audit Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
