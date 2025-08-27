import type { RequestHandler } from "@sveltejs/kit";
import { site } from "$lib/config";

// Minimal types for MET compact response
interface MetTimeseriesInstantDetails {
  air_temperature?: number;
  wind_speed?: number;
  wind_from_direction?: number;
  wind_speed_of_gust?: number;
}
interface MetTimeseriesNextDetails {
  precipitation_amount?: number;
}
interface MetTimeseries {
  time: string;
  data: {
    instant: { details: MetTimeseriesInstantDetails };
    next_1_hours?: {
      summary?: { symbol_code?: string };
      details?: MetTimeseriesNextDetails;
    };
    next_6_hours?: {
      summary?: { symbol_code?: string };
      details?: MetTimeseriesNextDetails;
    };
    next_12_hours?: { summary?: { symbol_code?: string } };
  };
}

interface MetCompactResponse {
  properties: {
    meta: { updated_at: string };
    timeseries: MetTimeseries[];
  };
}

export const GET: RequestHandler = async ({
  url,
  fetch,
  request,
  platform,
}) => {
  // Cloudflare edge cache: cache by full URL (includes query params)
  const cache = (platform as any)?.caches?.default;
  const cacheKey = new Request(url.toString(), request);
  const cached = cache ? await cache.match(cacheKey) : null;
  if (cached) return cached;
  const lat = url.searchParams.get("lat");
  const lon = url.searchParams.get("lon");
  const alt = url.searchParams.get("altitude") ?? undefined;

  if (!lat || !lon) {
    return new Response(
      JSON.stringify({ error: "Missing required query params lat and lon" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  const qs = new URLSearchParams({ lat, lon });
  if (alt) qs.set("altitude", alt);

  const endpoint = `https://api.met.no/weatherapi/locationforecast/2.0/compact?${qs.toString()}`;

  // Build headers. MET policy: include descriptive User-Agent.
  // Prefer MET_USER_AGENT from env; if missing, we omit it (development).
  const headers: Record<string, string> = { Accept: "application/json" };
  if (site.met.user_agent) headers["User-Agent"] = site.met.user_agent;

  const res = await fetch(endpoint, { headers });

  if (!res.ok) {
    return new Response(
      JSON.stringify({
        error: "Failed to fetch MET weather",
        status: res.status,
      }),
      { status: res.status, headers: { "Content-Type": "application/json" } }
    );
  }

  const body = (await res.json()) as MetCompactResponse;
  const ts = body.properties.timeseries?.[0];

  if (!ts) {
    return new Response(JSON.stringify({ error: "No timeseries available" }), {
      status: 502,
      headers: { "Content-Type": "application/json" },
    });
  }

  const details = ts.data.instant.details;
  const next1 = ts.data.next_1_hours;
  const next6 = ts.data.next_6_hours;
  const symbol =
    next1?.summary?.symbol_code ||
    next6?.summary?.symbol_code ||
    ts.data.next_12_hours?.summary?.symbol_code ||
    null;

  // Build 6-hour forecast periods (next four with next_6_hours present)
  const periods = body.properties.timeseries
    .filter((row) => !!row.data.next_6_hours)
    .slice(0, 4)
    .map((row) => {
      const start = new Date(row.time);
      const end = new Date(start.getTime() + 6 * 60 * 60 * 1000);
      const pad = (n: number) => String(n).padStart(2, "0");
      const startHH = pad(start.getHours());
      const endHH = pad(end.getHours());
      return {
        start: row.time,
        end: end.toISOString(),
        label: `${startHH}–${endHH}`,
        temperature: row.data.instant.details.air_temperature ?? null,
        symbol_code: row.data.next_6_hours?.summary?.symbol_code ?? null,
        precipitation_mm:
          row.data.next_6_hours?.details?.precipitation_amount ?? null,
        wind_speed: row.data.instant.details.wind_speed ?? null,
        wind_gust: row.data.instant.details.wind_speed_of_gust ?? null,
        wind_dir: row.data.instant.details.wind_from_direction ?? null,
      };
    });

  const simplified = {
    updatedAt: body.properties.meta.updated_at,
    time: ts.time,
    coords: {
      lat: Number(lat),
      lon: Number(lon),
      altitude: alt ? Number(alt) : null,
    },
    current: {
      temperature: details.air_temperature ?? null,
      feels_like: details.air_temperature ?? null,
      symbol_code: symbol,
      precipitation_mm_1h: next1?.details?.precipitation_amount ?? null,
      precipitation_mm_6h: next6?.details?.precipitation_amount ?? null,
      wind_speed: details.wind_speed ?? null,
      wind_gust: details.wind_speed_of_gust ?? null,
      wind_dir: details.wind_from_direction ?? null,
    },
    forecast6h: periods,
  };

  const response = new Response(JSON.stringify(simplified), {
    headers: {
      "Content-Type": "application/json",
      // Cache for 5 minutes and allow 1 minute stale-while-revalidate
      "Cache-Control": "public, max-age=300, stale-while-revalidate=60",
    },
  });

  // Store in Cloudflare edge cache
  if (cache) {
    await cache.put(cacheKey, response.clone());
  }

  return response;
};
