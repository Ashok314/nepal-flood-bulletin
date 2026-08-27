/**
 * Static geography for the flood map. The DHM feed carries no coordinates, so
 * we map each gauge (by name) to an approximate known location, and trace the
 * Trishuli -> Narayani corridor as a polyline. These are APPROXIMATE (market /
 * bridge points), not exact channel geometry — the map disclaimer says so.
 */

export type LatLng = [number, number];

export const GAUGE_COORDS: { match: string; latlng: LatLng }[] = [
  { match: "dhunche", latlng: [28.111, 85.297] },
  { match: "betrawati", latlng: [27.963, 85.183] },
  { match: "malekhu", latlng: [27.807, 84.897] },
  { match: "furke", latlng: [27.807, 84.897] },
  { match: "kali khola", latlng: [27.842, 84.76] },
  { match: "devghat", latlng: [27.716, 84.428] },
  { match: "narayani", latlng: [27.716, 84.428] },
];

export function gaugeCoords(name: string): LatLng | null {
  const n = name.toLowerCase();
  const hit = GAUGE_COORDS.find((g) => n.includes(g.match));
  return hit ? hit.latlng : null;
}

/** Confirmed corridor: Rasuwagadhi/Timure -> Trishuli -> Devghat. */
export const CORRIDOR_CONFIRMED: LatLng[] = [
  [28.271, 85.379], // Rasuwagadhi / Timure (border)
  [28.162, 85.372], // Syafrubesi
  [28.111, 85.297], // Dhunche
  [28.0, 85.24],
  [27.963, 85.183], // Betrawati
  [27.918, 85.152], // Bidur / Trishuli
  [27.86, 85.05],
  [27.83, 84.98],
  [27.807, 84.897], // Malekhu
  [27.78, 84.72],
  [27.852, 84.552], // Mugling
  [27.716, 84.428], // Devghat
];

/** Estimated / at-risk downstream: Devghat -> Narayani south (Chitwan / Susta). */
export const CORRIDOR_ESTIMATED: LatLng[] = [
  [27.716, 84.428], // Devghat
  [27.6, 84.35],
  [27.53, 84.28],
  [27.45, 84.22], // toward Tribeni / Susta
];

/** Upstream entry point (origin of the surge). */
export const ENTRY_POINT: { latlng: LatLng; label: string } = {
  latlng: [28.271, 85.379],
  label: "Rasuwagadhi / Timure",
};

/** Kathmandu, for orientation. */
export const KATHMANDU: LatLng = [27.7172, 85.324];
