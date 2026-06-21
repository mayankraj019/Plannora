import * as maptilersdk from "@maptiler/sdk";

const MAPTILER_KEY = process.env.NEXT_PUBLIC_MAPTILER_API_KEY ?? "";

if (MAPTILER_KEY) {
  maptilersdk.config.apiKey = MAPTILER_KEY;
}

// Disable SDK-level projection migration to fix migrateProjection crash
// @ts-ignore
maptilersdk.config.projection = null;

export { maptilersdk };

// Use plain string style URLs instead of the SDK enum objects.
// The SDK enum objects trigger a migrateProjection crash in MapLibre-GL
// because they expose a projection field that MapLibre can't parse directly.
export const MAP_STYLES = {
  streets:   `https://api.maptiler.com/maps/streets/style.json?key=${MAPTILER_KEY}`,
  satellite: `https://api.maptiler.com/maps/satellite/style.json?key=${MAPTILER_KEY}`,
  outdoor:   `https://api.maptiler.com/maps/outdoor/style.json?key=${MAPTILER_KEY}`,
  topo:      `https://api.maptiler.com/maps/topo/style.json?key=${MAPTILER_KEY}`,
  dark:      `https://api.maptiler.com/maps/darkmatter/style.json?key=${MAPTILER_KEY}`,
  pastel:    `https://api.maptiler.com/maps/pastel/style.json?key=${MAPTILER_KEY}`,
};
