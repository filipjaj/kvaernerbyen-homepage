// TypeScript (works in plain JS too — just remove the types)

/** Bounding box with lon/lat in WGS84 (EPSG:4326). */
type Bounds = {
  minLon: number;
  minLat: number;
  maxLon: number;
  maxLat: number;
};

/** Your item shape: breddegrad = latitude, lengdegrad = longitude. */
type ItemWithCoords = {
  breddegrad: number | string;
  lengdegrad: number | string;
  [key: string]: unknown;
};

/** Convert "59,9" or "59.9" or 59.9 to a number, else NaN. */
const toNum = (v: number | string): number =>
  typeof v === "number" ? v : Number(String(v).replace(",", "."));

/** Check if a lon is within [minLon, maxLon], allowing antimeridian boxes. */
const lonInRange = (lon: number, minLon: number, maxLon: number): boolean =>
  minLon <= maxLon
    ? lon >= minLon && lon <= maxLon
    : lon >= minLon || lon <= maxLon; // crosses 180°

/** Filter items to only those inside the bounds (inclusive). */
function filterByBounds<T extends ItemWithCoords>(
  list: T[],
  bounds: Bounds
): T[] {
  const { minLat, maxLat, minLon, maxLon } = bounds;

  return list
    .filter((item) => {
      const lat = toNum(item.breddegrad);
      const lon = toNum(item.lengdegrad);
      if (!Number.isFinite(lat) || !Number.isFinite(lon)) return false;

      const latOK = lat >= minLat && lat <= maxLat;
      const lonOK = lonInRange(lon, minLon, maxLon);
      return latOK && lonOK;
    })
    .filter((item) => !item.deaktivertTidspunkt);
}

const data = await fetch(
  "https://parkreg-open.atlas.vegvesen.no/ws/no/vegvesen/veg/parkeringsomraade/parkeringsregisteret/v1/parkeringsomraade/"
);
const json = await data.json();

const filtered = filterByBounds(json, {
  minLon: 10.785531413861975,
  minLat: 59.90201124539607,
  maxLon: 10.792392246737961,
  maxLat: 59.905164954221334,
});

// create file based on filtered
import fs from "fs";
const file = "./data/parking/parking.json";

fs.writeFileSync(file, JSON.stringify(filtered));
