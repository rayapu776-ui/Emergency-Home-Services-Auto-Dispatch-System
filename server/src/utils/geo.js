/**
 * Geographic utility functions for emergency dispatching
 */

// Calculate great-circle distance between two coordinates using the Haversine formula (in kilometers)
export function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return Math.round(d * 100) / 100; // 2 decimal places
}

function toRad(degrees) {
  return (degrees * Math.PI) / 180;
}

// Calculate estimated arrival time in minutes based on distance and priority
export function calculateETA(distanceKm, priority = "High") {
  // Base driving speed in city conditions with emergency lights/nav (approx 25 - 35 km/h)
  const speedKmh = priority === "Critical" ? 35 : 28;
  const travelTimeMinutes = (distanceKm / speedKmh) * 60;
  // Add 2-3 minutes for dispatch prep / equipment load
  const prepMinutes = priority === "Critical" ? 1.5 : 3.0;
  const totalETA = Math.ceil(travelTimeMinutes + prepMinutes);
  return Math.max(totalETA, 3); // Minimum 3 minutes ETA
}

// Generate intermediate waypoints between start and end for smooth GPS simulation
export function generateWaypoints(
  startLat,
  startLon,
  endLat,
  endLon,
  steps = 20,
) {
  const waypoints = [];
  for (let i = 0; i <= steps; i++) {
    const fraction = i / steps;
    // Add small realistic road curvature jitter
    const jitterLat =
      Math.sin(fraction * Math.PI) * 0.0008 * (Math.random() - 0.5);
    const jitterLon =
      Math.sin(fraction * Math.PI) * 0.0008 * (Math.random() - 0.5);

    const lat = startLat + (endLat - startLat) * fraction + jitterLat;
    const lon = startLon + (endLon - startLon) * fraction + jitterLon;
    waypoints.push({
      lat: Number(lat.toFixed(6)),
      lon: Number(lon.toFixed(6)),
    });
  }
  return waypoints;
}
