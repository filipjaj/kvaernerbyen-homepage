// src/lib/ai/tools.ts
import { z } from "zod";
import { tool } from "ai";
import { rankParking } from "$lib/parking-calculator";
import { normalizeRawParking } from "$lib/parking-normalize";
import parking from "../../../data/parking";
export const rankParkingTool = tool({
  description:
    "Rank parking options by cost and walking time for a given start, duration, vehicle, and destination. Returns top N.",
  inputSchema: z.object({
    startISO: z
      .string()
      .describe("ISO time with timezone, e.g. 2025-09-02T10:00:00+02:00")
      .optional(),
    durationMinutes: z.number().int().positive().default(60),
    vehicle: z.enum(["ev", "standard"]).default("standard"),
    destination: z.object({ lat: z.number(), lng: z.number() }).optional(),
    limit: z.number().int().min(1).max(25).default(5),
    weights: z
      .object({ price: z.number(), walking: z.number() })
      .default({ price: 0.75, walking: 0.25 }),
    eligiblePromotions: z.array(z.string()).default([]),
  }),
  outputSchema: z.object({
    currency: z.literal("NOK"),
    results: z.array(
      z.object({
        id: z.number(),
        name: z.string(),
        provider: z.string(),
        address: z.string(),
        price: z.number(),
        distanceMeters: z.number().nullable(),
        walkingMinutes: z.number().nullable(),
        sessionMinutes: z.number(),
        pricedMinutes: z.number(),
        pricedCoveragePercent: z.number(),
        firstChargedWindow: z
          .object({
            startISO: z.string(),
            endISO: z.string(),
            minutes: z.number(),
          })
          .optional(),
      })
    ),
    meta: z.object({
      startISO: z.string(),
      durationMinutes: z.number(),
      vehicle: z.string(),
      usedPromos: z.array(z.string()).optional(),
    }),
  }),
  execute: async ({
    startISO,
    durationMinutes,
    vehicle,
    destination,
    limit,
    weights,
    eligiblePromotions,
  }) => {
    const start = startISO ? new Date(startISO) : new Date();
    const spots = normalizeRawParking(parking);
    const ranked = rankParking(spots, {
      start,
      durationMinutes,
      vehicle,
      destination,
      weights,
      eligiblePromotions,
    });

    console.log(
      "rankParkingTool",
      "startISO",
      startISO,
      "durationMinutes",
      durationMinutes,
      "vehicle",
      vehicle,
      "destination",
      destination,
      "limit",
      limit,
      "weights",
      weights,
      "eligiblePromotions",
      eligiblePromotions
    );

    return {
      currency: "NOK" as const,
      results: ranked.map((r) => {
        const items = r.breakdown.items ?? [];
        const pricedMinutes = Math.round(
          items.reduce((sum, it) => sum + (it.minutes || 0), 0)
        );
        const sessionMinutes = durationMinutes;
        const pricedCoveragePercent = sessionMinutes
          ? Math.round((pricedMinutes / sessionMinutes) * 100)
          : 0;
        const first = [...items]
          .sort((a, b) => a.start.getTime() - b.start.getTime())[0];
        const firstChargedWindow = first
          ? {
              startISO: first.start.toISOString(),
              endISO: first.end.toISOString(),
              minutes: first.minutes,
            }
          : undefined;

        return {
          id: r.spot.id,
          name: r.spot.name,
          provider: r.spot.provider,
          address: r.spot.address,
          price: Math.round(r.cost),
          distanceMeters:
            r.distanceMeters != null ? Math.round(r.distanceMeters) : null,
          walkingMinutes:
            r.walkingMinutes != null ? Math.round(r.walkingMinutes) : null,
          sessionMinutes,
          pricedMinutes,
          pricedCoveragePercent,
          firstChargedWindow,
        };
      }),
      meta: {
        startISO: start.toISOString(),
        durationMinutes,
        vehicle,
        usedPromos: eligiblePromotions.length ? eligiblePromotions : undefined,
      },
    };
  },
});

// client-side interactive tool (no execute -> must return with addToolResult from UI)
export const confirmPromoTool = {
  description:
    "Ask the user to confirm “Kiwi 1h free” eligibility before applying it.",
  inputSchema: z.object({
    promoKey: z.literal("kiwi"),
    question: z
      .string()
      .default(
        "Are you a Kiwi customer and can register your plate for 1 hour free?"
      ),
  }),
  // optionally document expected output shape so you return consistent JSON in addToolResult:
  outputSchema: z.object({
    promoKey: z.literal("kiwi"),
    confirmed: z.boolean(),
  }),
} as const;

export const getGeolocationTool = {
  description:
    "Get the user's geolocation (latitude and longitude) from text (address). Returns null if not found. Remember to add city Oslo.",
  inputSchema: z.object({ address: z.string() }),
  outputSchema: z.object({
    lat: z.number().nullable(),
    lng: z.number().nullable(),
  }),
  async execute({ address }: { address: string }) {
    // Normalize address to include city context to improve hit rate
    let query = address.trim();
    if (!/oslo/i.test(query)) {
      query = `${query}, Oslo, Norway`;
    }
    try {
      const geocoded = await geocode(query);
      return { lat: geocoded.lat, lng: geocoded.lng };
    } catch (e) {
      // Gracefully degrade to nulls if not found
      return { lat: null, lng: null };
    }
  },
} as const;

async function geocode(address: string) {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
      address
    )}&format=json&limit=1`
  );
  const data = await res.json();
  if (!data[0]) throw new Error("Geocoding failed");
  return { lat: Number(data[0]?.lat), lng: Number(data[0]?.lon) };
}

export const toolset = {
  getGeolocation: getGeolocationTool,
  rankParking: rankParkingTool,
  confirmPromo: confirmPromoTool,
};
