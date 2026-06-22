/**
 * Travel Mode — Pure utility functions
 * No side effects. Easily testable. Isolated from the rest of Plannora.
 */

/** Feature flag — set NEXT_PUBLIC_TRAVEL_MODE_ENABLED="false" to hide Travel Mode */
export const TRAVEL_MODE_ENABLED =
  process.env.NEXT_PUBLIC_TRAVEL_MODE_ENABLED !== "false";

/**
 * Haversine distance between two lat/lng points.
 * @returns distance in kilometres
 */
export function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth radius in km
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Estimate travel time based on straight-line distance.
 * Walking ≈ 5 km/h, Driving ≈ 40 km/h (urban avg with traffic).
 */
export function estimateETA(
  distanceKm: number,
  mode: "walk" | "drive"
): string {
  const speed = mode === "walk" ? 5 : 40; // km/h
  const hours = distanceKm / speed;
  const totalMinutes = Math.round(hours * 60);

  if (totalMinutes < 1) return "< 1 min";
  if (totalMinutes < 60) return `${totalMinutes} min`;
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

/** Format distance for display */
export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  if (km < 10) return `${km.toFixed(1)} km`;
  return `${Math.round(km)} km`;
}

/** Build a Google Maps directions URL (opens in new tab) */
export function buildGoogleMapsUrl(
  originLat: number,
  originLng: number,
  destLat: number,
  destLng: number,
  travelMode: "driving" | "walking" = "driving"
): string {
  return `https://www.google.com/maps/dir/?api=1&origin=${originLat},${originLng}&destination=${destLat},${destLng}&travelmode=${travelMode}`;
}
