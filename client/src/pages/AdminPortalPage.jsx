import React, { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { RefreshCw } from "lucide-react";
import adminStore from "../services/adminStore";
import { useSocket } from "../context/SocketContext";
import EmergencyMap from "../components/map/EmergencyMap";

const pageTitles = {
  dashboard: [
    "Platform overview",
    "Current activity from the Argent Your database.",
  ],
  customers: ["Customers", "Customer accounts and booking history."],
  professionals: [
    "Professionals",
    "Service-provider accounts, availability, and performance.",
  ],
  verification: [
    "Professional verification",
    "Review submitted identity and business references.",
  ],
  bookings: ["Bookings", "Customer service requests and their current status."],
  dispatch: [
    "Live dispatch",
    "Unassigned requests and eligible nearby professionals.",
  ],
  payments: [
    "Payments",
    "Payment transactions are not recorded in the current database.",
  ],
  earnings: ["Professional earnings", "Recorded payouts and completed work."],
  reviews: ["Reviews", "Customer feedback attached to completed bookings."],
  notifications: [
    "Notifications",
    "Notification history and delivery to active users.",
  ],
  activity: ["Admin activity", "Recorded changes made in the admin portal."],
  analytics: [
    "Analytics",
    "Booking and account trends calculated from stored records.",
  ],
  settings: [
    "Administrator settings",
    "Manage administrator accounts and role assignments.",
  ],
};

const notConfigured = {
  services:
    "Services currently come from the customer application's catalog; there is no persisted service-management table yet.",
  categories:
    "Categories currently come from the customer application's catalog; there is no persisted category-management table yet.",
  offers: "Coupon storage and redemption are not configured.",
  reviews:
    "Customer reviews are not stored as separate records in the current database.",
  support: "Support tickets are not stored in the current database.",
  content: "Editable content is not stored in the current database.",
};

const dashboardMetrics = [
  ["Customers", "customers"],
  ["Professionals", "professionals"],
  ["Online professionals", "onlineProfessionals"],
  ["Offline professionals", "offlineProfessionals"],
  ["Pending approvals", "pendingApprovals"],
  ["Active jobs", "activeJobs"],
  ["Pending requests", "pendingBookings"],
  ["Confirmed bookings", "confirmedBookings"],
  ["Completed bookings", "completedBookings"],
  ["Cancelled bookings", "cancelledBookings"],
];

function formatValue(value) {
  if (value === null || value === undefined || value === "")
    return "Not recorded";
  if (typeof value === "number") return value.toLocaleString("en-IN");
  return String(value);
}

function DataTable({ rows, section, onAction, onAssign }) {
  if (!rows?.length) {
    return (
      <p className="px-5 py-12 text-center text-sm text-slate-500">
        No matching records in the database.
      </p>
    );
  }

  if (section === "dispatch") {
    return (
      <div className="divide-y divide-slate-100">
        {rows.map((booking) => (
          <article
            key={booking.id}
            className="grid gap-4 p-5 lg:grid-cols-[1fr_2fr_auto]"
          >
            <div>
              <p className="font-semibold">
                {booking.service_name || booking.category}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {booking.id} · {booking.customer_name}
              </p>
              {booking.technician_name && (
                <p className="mt-1 text-xs text-slate-500">
                  Currently assigned: {booking.technician_name}
                </p>
              )}
              <p className="mt-1 text-xs text-slate-500">{booking.address}</p>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {(booking.candidates || []).map((candidate) => (
                <div
                  key={candidate.id}
                  className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 p-3 text-xs"
                >
                  <span className="min-w-0 truncate">
                    {candidate.name} · {candidate.distanceKm.toFixed(1)} km · ★{" "}
                    {candidate.rating}
                  </span>
                  <button
                    onClick={() => onAssign(booking.id, candidate.id)}
                    className="shrink-0 rounded-md bg-emerald-700 px-2.5 py-1.5 font-semibold text-white hover:bg-emerald-800"
                  >
                    Assign
                  </button>
                </div>
              ))}
              {!booking.candidates?.length && (
                <p className="text-xs text-slate-500">
                  No eligible professional is currently available.
                </p>
              )}
            </div>
            <span className="h-fit rounded-md bg-amber-50 px-2.5 py-1.5 text-xs font-semibold text-amber-800">
              {booking.status}
            </span>
          </article>
        ))}
      </div>
    );
  }

  const columns =
    {
      customers: [
        "name",
        "email",
        "phone",
        "address",
        "created_at",
        "total_bookings",
        "completed_bookings",
        "cancelled_bookings",
        "account_status",
      ],
      professionals: [
        "name",
        "email",
        "phone",
        "category",
        "service_areas",
        "is_online",
        "status",
        "experience_years",
        "rating",
        "total_jobs",
        "recorded_earnings",
      ],
      verification: [
        "name",
        "email",
        "category",
        "account_type",
        "id_document_type",
        "id_document_url",
        "business_registration_number",
        "status",
      ],
      bookings: [
        "id",
        "customer_name",
        "technician_name",
        "service_name",
        "scheduled_date",
        "scheduled_time",
        "address",
        "price",
        "payment_method",
        "status",
        "created_at",
      ],
      earnings: [
        "name",
        "category",
        "completed_jobs",
        "paid_out",
        "pending_payout",
      ],
      activity: [
        "created_at",
        "admin_name",
        "action",
        "target_type",
        "target_id",
        "previous_value",
        "new_value",
      ],
      analytics: [
        "period",
        "bookings",
        "completed",
        "cancelled",
        "new_customers",
        "new_professionals",
      ],
      reviews: [
        "booking_id",
        "rating",
        "feedback",
        "customer_name",
        "professional_name",
        "service_name",
        "review_hidden",
        "updated_at",
      ],
      notifications: [
        "title",
        "description",
        "user_name",
        "user_role",
        "type",
        "unread",
        "created_at",
      ],
      settings: ["name", "email", "admin_role", "account_status", "created_at"],
    }[section] || [];

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[760px] border-collapse text-left text-sm">
        <thead className="bg-slate-50 text-[11px] uppercase text-slate-500">
          <tr>
            {columns.map((column) => (
              <th
                key={column}
                className="whitespace-nowrap px-4 py-3 font-semibold"
              >
                {column.replaceAll("_", " ")}
              </th>
            ))}
            {[
              "customers",
              "professionals",
              "verification",
              "bookings",
            ].includes(section) && <th className="px-4 py-3">Actions</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row) => (
            <tr
              key={row.id || row.booking_id || `${row.period}-${row.name}`}
              className="align-top hover:bg-slate-50/70"
            >
              {columns.map((column) => (
                <td key={column} className="max-w-64 px-4 py-3 text-slate-700">
                  {column === "avatar" ? (
                    <img
                      src={row[column]}
                      alt=""
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : column === "is_online" ? (
                    row[column] ? (
                      "Online"
                    ) : (
                      "Offline"
                    )
                  ) : (
                    formatValue(row[column])
                  )}
                </td>
              ))}
              {[
                "customers",
                "professionals",
                "verification",
                "bookings",
                "reviews",
              ].includes(section) && (
                <td className="whitespace-nowrap px-4 py-3">
                  {section === "customers" && (
                    <button
                      onClick={() => onAction("customer-status", row)}
                      className="text-xs font-semibold text-emerald-800 underline"
                    >
                      {row.account_status === "Suspended"
                        ? "Activate"
                        : "Suspend"}
                    </button>
                  )}
                  {section === "professionals" && (
                    <button
                      onClick={() => onAction("professional-status", row)}
                      className="text-xs font-semibold text-emerald-800 underline"
                    >
                      {row.account_status === "Suspended"
                        ? "Activate"
                        : "Suspend"}
                    </button>
                  )}
                  {section === "verification" && (
                    <div className="flex gap-3">
                      <button
                        disabled={!row.has_required_documents}
                        onClick={() => onAction("approve", row)}
                        className="text-xs font-semibold text-emerald-800 underline disabled:text-slate-400"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => onAction("reject", row)}
                        className="text-xs font-semibold text-red-700 underline"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                  {section === "bookings" &&
                    !["COMPLETED", "CANCELLED"].includes(row.status) && (
                      <button
                        onClick={() => onAction("cancel-booking", row)}
                        className="text-xs font-semibold text-red-700 underline"
                      >
                        Cancel booking
                      </button>
                    )}
                  {section === "reviews" && (
                    <button
                      onClick={() => onAction("review-toggle", row)}
                      className="text-xs font-semibold text-emerald-800 underline"
                    >
                      {row.review_hidden ? "Restore" : "Hide"}
                    </button>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function AdminPortalPage() {
  const { section = "dashboard" } = useParams();
  const { socket, joinRoom } = useSocket();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [analyticsRange, setAnalyticsRange] = useState("30d");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [notificationRecipients, setNotificationRecipients] = useState([]);
  const [notificationForm, setNotificationForm] = useState({
    audience: "all",
    userIds: [],
    title: "",
    description: "",
    type: "announcement",
  });
  const [adminForm, setAdminForm] = useState({
    name: "",
    email: "",
    password: "",
    adminRole: "operations_admin",
  });
  const page = pageTitles[section];

  const load = useCallback(async () => {
    if (!page || notConfigured[section]) {
      setData(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const config =
        section === "analytics"
          ? {
              params: {
                range: analyticsRange,
                ...(analyticsRange === "custom"
                  ? { start: customStart, end: customEnd }
                  : {}),
              },
            }
          : undefined;
      const response = await adminStore.api.get(`/admin/${section}`, config);
      setData(response.data);
      if (
        section === "notifications" &&
        ["super_admin", "operations_admin"].includes(
          adminStore.getUser()?.adminRole,
        )
      ) {
        const recipients = await adminStore.api.get(
          "/admin/notification-recipients",
        );
        setNotificationRecipients(recipients.data.rows);
      }
    } catch (loadError) {
      setError(loadError.response?.data?.error || "Could not load admin data.");
    } finally {
      setLoading(false);
    }
  }, [analyticsRange, customEnd, customStart, page, section]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!socket) return undefined;
    joinRoom("role_admin");
    const refresh = () => load();
    socket.on("admin_dispatch_event", refresh);
    socket.on("new_emergency_alert", refresh);
    socket.on("technician_status_changed", refresh);
    return () => {
      socket.off("admin_dispatch_event", refresh);
      socket.off("new_emergency_alert", refresh);
      socket.off("technician_status_changed", refresh);
    };
  }, [joinRoom, load, socket]);

  const handleAction = async (action, row) => {
    try {
      if (action === "customer-status" || action === "professional-status") {
        const endpoint =
          action === "customer-status" ? "customers" : "professionals";
        const status =
          row.account_status === "Suspended" ? "Active" : "Suspended";
        await adminStore.api.put(`/admin/${endpoint}/${row.id}/status`, {
          status,
        });
      } else if (action === "approve" || action === "reject") {
        await adminStore.api.put(
          `/admin/professionals/${row.id}/verification`,
          {
            status: action === "approve" ? "Approved" : "Rejected",
          },
        );
      } else if (action === "cancel-booking") {
        await adminStore.api.put(`/admin/bookings/${row.id}/status`, {
          status: "CANCELLED",
        });
      } else if (action === "review-toggle") {
        await adminStore.api.put(
          `/admin/reviews/${row.booking_id}/moderation`,
          { hidden: !row.review_hidden },
        );
      }
      await load();
    } catch (actionError) {
      setError(
        actionError.response?.data?.error ||
          "That action could not be completed.",
      );
    }
  };

  const handleAssign = async (requestId, technicianId) => {
    try {
      await adminStore.api.post("/admin/manual-dispatch", {
        requestId,
        technicianId,
      });
      await load();
    } catch (actionError) {
      setError(
        actionError.response?.data?.error || "Professional assignment failed.",
      );
    }
  };

  const sendNotification = async (event) => {
    event.preventDefault();
    setError("");
    setNotice("");
    try {
      const response = await adminStore.api.post(
        "/admin/notifications",
        notificationForm,
      );
      setNotice(`Notification sent to ${response.data.sent} active accounts.`);
      setNotificationForm((form) => ({
        ...form,
        title: "",
        description: "",
        userIds: [],
      }));
      await load();
    } catch (sendError) {
      setError(
        sendError.response?.data?.error || "Notification could not be sent.",
      );
    }
  };

  const createAdministrator = async (event) => {
    event.preventDefault();
    setError("");
    setNotice("");
    try {
      await adminStore.api.post("/admin/administrators", adminForm);
      setNotice("Administrator account created.");
      setAdminForm({
        name: "",
        email: "",
        password: "",
        adminRole: "operations_admin",
      });
      await load();
    } catch (createError) {
      setError(
        createError.response?.data?.error ||
          "Administrator account could not be created.",
      );
    }
  };

  if (!page)
    return (
      <p className="rounded-lg bg-white p-6">
        This admin page is not available.
      </p>
    );

  return (
    <div className="mx-auto max-w-[1500px] space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase text-emerald-800">
            Argent Your · Operations
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight">{page[0]}</h1>
          <p className="mt-1 text-sm text-slate-500">{page[1]}</p>
        </div>
        <button
          onClick={load}
          title="Refresh data"
          className="rounded-lg border border-slate-300 bg-white p-2.5 text-slate-700 hover:bg-slate-50"
        >
          <RefreshCw size={17} />
        </button>
      </header>

      {error && (
        <p
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800"
        >
          {error}
        </p>
      )}
      {notice && (
        <p
          role="status"
          className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900"
        >
          {notice}
        </p>
      )}
      {notConfigured[section] ? (
        <section className="rounded-xl border border-slate-200 bg-white p-6 text-sm leading-relaxed text-slate-600">
          {notConfigured[section]}
        </section>
      ) : loading ? (
        <p className="rounded-xl border border-slate-200 bg-white p-8 text-sm text-slate-500">
          Loading current records...
        </p>
      ) : section === "dashboard" ? (
        <>
          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            {dashboardMetrics.map(([label, key]) => (
              <article
                key={key}
                className="rounded-xl border border-slate-200 bg-white p-4"
              >
                <p className="text-xs font-medium text-slate-500">{label}</p>
                <p className="mt-2 text-2xl font-bold">
                  {formatValue(data?.counts?.[key])}
                </p>
              </article>
            ))}
            <article className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-medium text-slate-500">Revenue</p>
              <p className="mt-2 text-lg font-bold">Not tracked</p>
              <p className="mt-1 text-xs text-slate-500">
                No payment ledger exists yet.
              </p>
            </article>
            <article className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-medium text-slate-500">Complaints</p>
              <p className="mt-2 text-lg font-bold">Not tracked</p>
              <p className="mt-1 text-xs text-slate-500">
                No support-ticket records exist yet.
              </p>
            </article>
          </section>
          <section className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="font-semibold">Recent bookings</h2>
            <DataTable
              rows={data?.recentBookings}
              section="bookings"
              onAction={handleAction}
            />
          </section>
          <section className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="font-semibold">Bookings over the last 30 days</h2>
            {!data?.bookingTrend?.length ? (
              <p className="mt-4 text-sm text-slate-500">
                No booking activity recorded for this period.
              </p>
            ) : (
              <div
                className="mt-5 flex h-40 items-end gap-1 overflow-x-auto"
                aria-label="Daily booking counts"
              >
                {data.bookingTrend.map((day) => {
                  const maximum = Math.max(
                    ...data.bookingTrend.map((item) => item.bookings),
                    1,
                  );
                  return (
                    <div
                      key={day.period}
                      title={`${day.period}: ${day.bookings} bookings`}
                      className="min-w-2 flex-1 rounded-t bg-emerald-600"
                      style={{
                        height: `${Math.max((day.bookings / maximum) * 100, 4)}%`,
                      }}
                    />
                  );
                })}
              </div>
            )}
          </section>
        </>
      ) : section === "dispatch" ? (
        <>
          <section className="rounded-xl border border-slate-200 bg-white p-4">
            <EmergencyMap
              center={[28.6315, 77.2167]}
              allTechnicians={[
                ...new Map(
                  (data?.rows || [])
                    .flatMap((booking) => booking.candidates || [])
                    .map((technician) => [technician.id, technician]),
                ).values(),
              ]}
              allRequests={data?.rows || []}
              height="420px"
            />
          </section>
          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <div className="border-b border-slate-100 px-5 py-4">
              <h2 className="font-semibold">
                {formatValue(data?.total)} active dispatch requests
              </h2>
            </div>
            <DataTable
              rows={data?.rows}
              section={section}
              onAction={handleAction}
              onAssign={handleAssign}
            />
          </section>
        </>
      ) : section === "analytics" ? (
        <>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              load();
            }}
            className="flex flex-wrap items-end gap-3 rounded-xl border border-slate-200 bg-white p-4"
          >
            <label className="text-xs font-semibold text-slate-600">
              Date range
              <select
                value={analyticsRange}
                onChange={(event) => setAnalyticsRange(event.target.value)}
                className="mt-1 block rounded-lg border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="today">Today</option>
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="custom">Custom range</option>
              </select>
            </label>
            {analyticsRange === "custom" && (
              <>
                <label className="text-xs font-semibold text-slate-600">
                  From
                  <input
                    type="date"
                    value={customStart}
                    onChange={(event) => setCustomStart(event.target.value)}
                    required
                    className="mt-1 block rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </label>
                <label className="text-xs font-semibold text-slate-600">
                  To
                  <input
                    type="date"
                    value={customEnd}
                    onChange={(event) => setCustomEnd(event.target.value)}
                    required
                    className="mt-1 block rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </label>
              </>
            )}
            <button className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800">
              Apply range
            </button>
          </form>
          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <div className="border-b border-slate-100 px-5 py-4">
              <h2 className="font-semibold">
                {formatValue(data?.total)} dates with activity
              </h2>
            </div>
            <DataTable
              rows={data?.rows}
              section={section}
              onAction={handleAction}
            />
          </section>
        </>
      ) : section === "payments" ? (
        <section className="rounded-xl border border-slate-200 bg-white p-6 text-sm leading-relaxed text-slate-600">
          {data?.message || "No payment transaction records are available."}
        </section>
      ) : section === "notifications" ? (
        <>
          {["super_admin", "operations_admin"].includes(
            adminStore.getUser()?.adminRole,
          ) && (
            <form
              onSubmit={sendNotification}
              className="grid gap-3 rounded-xl border border-slate-200 bg-white p-5 md:grid-cols-2"
            >
              <label className="text-xs font-semibold text-slate-600">
                Recipients
                <select
                  value={notificationForm.audience}
                  onChange={(event) =>
                    setNotificationForm((form) => ({
                      ...form,
                      audience: event.target.value,
                    }))
                  }
                  className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                >
                  <option value="all">
                    All active customers and professionals
                  </option>
                  <option value="customers">Active customers</option>
                  <option value="professionals">Active professionals</option>
                  <option value="selected">Selected users</option>
                </select>
              </label>
              <label className="text-xs font-semibold text-slate-600">
                Type
                <select
                  value={notificationForm.type}
                  onChange={(event) =>
                    setNotificationForm((form) => ({
                      ...form,
                      type: event.target.value,
                    }))
                  }
                  className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                >
                  {[
                    "booking",
                    "payment",
                    "service",
                    "emergency",
                    "announcement",
                    "verification",
                    "promotion",
                  ].map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </label>
              {notificationForm.audience === "selected" && (
                <label className="text-xs font-semibold text-slate-600 md:col-span-2">
                  Select recipients
                  <select
                    multiple
                    value={notificationForm.userIds}
                    onChange={(event) =>
                      setNotificationForm((form) => ({
                        ...form,
                        userIds: Array.from(
                          event.target.selectedOptions,
                          (option) => option.value,
                        ),
                      }))
                    }
                    required
                    className="mt-1 block min-h-32 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  >
                    {notificationRecipients.map((recipient) => (
                      <option key={recipient.id} value={recipient.id}>
                        {recipient.name} · {recipient.role} · {recipient.email}
                      </option>
                    ))}
                  </select>
                </label>
              )}
              <label className="text-xs font-semibold text-slate-600 md:col-span-2">
                Title
                <input
                  required
                  maxLength={120}
                  value={notificationForm.title}
                  onChange={(event) =>
                    setNotificationForm((form) => ({
                      ...form,
                      title: event.target.value,
                    }))
                  }
                  className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </label>
              <label className="text-xs font-semibold text-slate-600 md:col-span-2">
                Message
                <textarea
                  required
                  maxLength={1000}
                  rows={3}
                  value={notificationForm.description}
                  onChange={(event) =>
                    setNotificationForm((form) => ({
                      ...form,
                      description: event.target.value,
                    }))
                  }
                  className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </label>
              <button className="rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 md:col-span-2 md:justify-self-end">
                Send notification
              </button>
            </form>
          )}
          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <div className="border-b border-slate-100 px-5 py-4">
              <h2 className="font-semibold">
                {formatValue(data?.total)} sent notifications
              </h2>
            </div>
            <DataTable
              rows={data?.rows}
              section={section}
              onAction={handleAction}
            />
          </section>
        </>
      ) : section === "settings" ? (
        <>
          <form
            onSubmit={createAdministrator}
            className="grid gap-3 rounded-xl border border-slate-200 bg-white p-5 md:grid-cols-2"
          >
            <label className="text-xs font-semibold text-slate-600">
              Name
              <input
                required
                value={adminForm.name}
                onChange={(event) =>
                  setAdminForm((form) => ({
                    ...form,
                    name: event.target.value,
                  }))
                }
                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </label>
            <label className="text-xs font-semibold text-slate-600">
              Email
              <input
                required
                type="email"
                value={adminForm.email}
                onChange={(event) =>
                  setAdminForm((form) => ({
                    ...form,
                    email: event.target.value,
                  }))
                }
                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </label>
            <label className="text-xs font-semibold text-slate-600">
              Temporary password (12+ characters)
              <input
                required
                minLength={12}
                type="password"
                value={adminForm.password}
                onChange={(event) =>
                  setAdminForm((form) => ({
                    ...form,
                    password: event.target.value,
                  }))
                }
                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </label>
            <label className="text-xs font-semibold text-slate-600">
              Role
              <select
                value={adminForm.adminRole}
                onChange={(event) =>
                  setAdminForm((form) => ({
                    ...form,
                    adminRole: event.target.value,
                  }))
                }
                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              >
                {(data?.roles || []).map((role) => (
                  <option key={role} value={role}>
                    {role.replaceAll("_", " ")}
                  </option>
                ))}
              </select>
            </label>
            <p className="text-xs text-slate-500 md:col-span-2">
              Only a Super Admin can create accounts. Share temporary
              credentials through a secure channel.
            </p>
            <button className="rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 md:col-span-2 md:justify-self-end">
              Create administrator
            </button>
          </form>
          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <div className="border-b border-slate-100 px-5 py-4">
              <h2 className="font-semibold">
                {formatValue(data?.administrators?.length)} administrator
                accounts
              </h2>
            </div>
            <DataTable
              rows={data?.administrators}
              section={section}
              onAction={handleAction}
            />
          </section>
        </>
      ) : (
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="font-semibold">
              {formatValue(data?.total)} records
            </h2>
          </div>
          <DataTable
            rows={data?.rows}
            section={section}
            onAction={handleAction}
            onAssign={handleAssign}
          />
        </section>
      )}
    </div>
  );
}
