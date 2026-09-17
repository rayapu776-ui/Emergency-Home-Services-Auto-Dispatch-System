import React, { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";

// Helper to auto-center / fit bounds when points change
function MapBoundsUpdater({ points }) {
  const map = useMap();
  useEffect(() => {
    if (!points || points.length === 0) return;
    if (points.length === 1 && points[0].lat && points[0].lon) {
      map.setView([points[0].lat, points[0].lon], 14, { animate: true });
    } else {
      const validPoints = points.filter((p) => p && p.lat && p.lon);
      if (validPoints.length > 1) {
        const bounds = L.latLngBounds(validPoints.map((p) => [p.lat, p.lon]));
        map.fitBounds(bounds, { padding: [50, 50], animate: true });
      }
    }
  }, [points, map]);
  return null;
}

// Click listener for interactive location picking
function LocationPickerEvents({ onLocationSelect }) {
  useMapEvents({
    click(e) {
      if (onLocationSelect) {
        onLocationSelect({
          latitude: Number(e.latlng.lat.toFixed(6)),
          longitude: Number(e.latlng.lng.toFixed(6)),
        });
      }
    },
  });
  return null;
}

// Custom DivIcons for crisp SVG rendering without missing asset issues
const createCustomerIcon = (isPulsing = true) => {
  return L.divIcon({
    className: "custom-customer-icon",
    html: `
      <div style="position: relative; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;">
        ${isPulsing ? '<div class="pin-pulse-beacon" style="position: absolute; width: 44px; height: 44px; border-radius: 50%; background: rgba(225,29,72,0.35); animation: pulseBeacon 1.5s infinite ease-out;"></div>' : ""}
        <div style="width: 32px; height: 32px; background: #e11d48; border: 3px solid #ffffff; border-radius: 50%; box-shadow: 0 4px 10px rgba(0,0,0,0.35); display: flex; align-items: center; justify-content: center; z-index: 10;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
        </div>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18],
  });
};

const createTechnicianIcon = (vehicle = "Van", isBusy = false) => {
  const bgColor = isBusy ? "#ea580c" : "#16a34a";
  return L.divIcon({
    className: "custom-tech-icon",
    html: `
      <div style="position: relative; width: 38px; height: 38px; display: flex; align-items: center; justify-content: center;">
        <div style="width: 34px; height: 34px; background: ${bgColor}; border: 3px solid #ffffff; border-radius: 50%; box-shadow: 0 4px 12px rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 10;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <rect x="1" y="3" width="15" height="13"></rect>
            <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
            <circle cx="5.5" cy="18.5" r="2.5"></circle>
            <circle cx="18.5" cy="18.5" r="2.5"></circle>
          </svg>
        </div>
        <div style="position: absolute; bottom: -2px; right: -2px; width: 12px; height: 12px; border-radius: 50%; background: ${isBusy ? "#f97316" : "#22c55e"}; border: 2px solid white; z-index: 11;"></div>
      </div>
    `,
    iconSize: [38, 38],
    iconAnchor: [19, 19],
    popupAnchor: [0, -19],
  });
};

export default function EmergencyMap({
  center = [28.6315, 77.2167],
  zoom = 13,
  customerLocation, // { lat, lon, title, address }
  technicianLocation, // { lat, lon, name, vehicle, isBusy }
  allTechnicians = [], // Array for admin overview
  allRequests = [], // Array for admin overview
  showRoute = true,
  isInteractive = false,
  onLocationSelect,
  height = "420px",
}) {
  const points = [];
  if (customerLocation?.lat && customerLocation?.lon) {
    points.push({ lat: customerLocation.lat, lon: customerLocation.lon });
  }
  if (technicianLocation?.lat && technicianLocation?.lon) {
    points.push({ lat: technicianLocation.lat, lon: technicianLocation.lon });
  }
  if (allTechnicians.length > 0) {
    allTechnicians.forEach((t) => {
      if (t.latitude && t.longitude)
        points.push({ lat: t.latitude, lon: t.longitude });
    });
  }

  const routeCoordinates =
    customerLocation?.lat && technicianLocation?.lat
      ? [
          [technicianLocation.lat, technicianLocation.lon],
          [customerLocation.lat, customerLocation.lon],
        ]
      : [];

  return (
    <div
      style={{ height, width: "100%" }}
      className="relative rounded-2xl overflow-hidden shadow-inner border border-slate-200"
    >
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {isInteractive && (
          <LocationPickerEvents onLocationSelect={onLocationSelect} />
        )}

        <MapBoundsUpdater points={points} />

        {/* Customer Emergency Marker */}
        {customerLocation?.lat && customerLocation?.lon && (
          <Marker
            position={[customerLocation.lat, customerLocation.lon]}
            icon={createCustomerIcon(true)}
          >
            <Popup>
              <div className="text-xs p-1">
                <span className="font-bold text-red-600 block">
                  🚨 Emergency Incident
                </span>
                <p className="font-semibold text-slate-800">
                  {customerLocation.title || "Customer Location"}
                </p>
                <p className="text-slate-500 text-[11px]">
                  {customerLocation.address}
                </p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Active Technician Marker */}
        {technicianLocation?.lat && technicianLocation?.lon && (
          <Marker
            position={[technicianLocation.lat, technicianLocation.lon]}
            icon={createTechnicianIcon(
              technicianLocation.vehicle,
              technicianLocation.isBusy,
            )}
          >
            <Popup>
              <div className="text-xs p-1">
                <span className="font-bold text-emerald-700 block">
                  🛠️ Assigned Technician
                </span>
                <p className="font-semibold text-slate-800">
                  {technicianLocation.name}
                </p>
                <p className="text-slate-500 text-[11px]">
                  {technicianLocation.vehicle || "Rapid Response Van"}
                </p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Route Polyline */}
        {showRoute && routeCoordinates.length === 2 && (
          <Polyline
            positions={routeCoordinates}
            color="#e11d48"
            weight={4}
            opacity={0.8}
            dashArray="8, 8"
          />
        )}

        {/* Admin Multi-Technician Overlay */}
        {allTechnicians.map((t) => (
          <Marker
            key={`tech-${t.id}`}
            position={[t.latitude, t.longitude]}
            icon={createTechnicianIcon(t.vehicle_type, t.is_busy === 1)}
          >
            <Popup>
              <div className="text-xs p-1 min-w-[140px]">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-900">{t.name}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${t.is_busy ? "bg-orange-100 text-orange-700" : "bg-green-100 text-green-700"}`}
                  >
                    {t.is_busy ? "ON JOB" : "AVAILABLE"}
                  </span>
                </div>
                <p className="text-slate-600 text-[11px]">
                  Skill: <span className="font-semibold">{t.category}</span>
                </p>
                <p className="text-slate-600 text-[11px]">
                  Rating: <span className="font-semibold">⭐ {t.rating}</span> (
                  {t.total_jobs} jobs)
                </p>
                <p className="text-slate-500 text-[10px] mt-1">
                  {t.vehicle_type}
                </p>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Admin Multi-Emergency Overlay */}
        {allRequests.map((r) => (
          <Marker
            key={`req-${r.id}`}
            position={[r.latitude, r.longitude]}
            icon={createCustomerIcon(r.status !== "COMPLETED")}
          >
            <Popup>
              <div className="text-xs p-1 min-w-[150px]">
                <span className="font-bold text-red-600 block">
                  🚨 {r.category} ({r.priority})
                </span>
                <p className="text-slate-800 font-semibold">
                  {r.customer_name || "Emergency Call"}
                </p>
                <p className="text-slate-500 text-[11px] truncate">
                  {r.address}
                </p>
                <p className="text-slate-600 text-[10px] mt-1">
                  Status:{" "}
                  <span className="font-bold uppercase">{r.status}</span>
                </p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
