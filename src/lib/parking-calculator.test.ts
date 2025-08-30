import { describe, it, expect } from "vitest";
import {
  computeSpotCost,
  rankParking,
  type NormalizedSpot,
  type PricingRule,
} from "./parking-calculator";

// Helper: all-day window for all days
const allDays: number[] = [1, 2, 3, 4, 5, 6, 7];
const allDayWindow = [{ startM: 0, endM: 1440, overnight: false }];

// Common start time for tests
const start = new Date("2025-08-29T10:00:00+02:00");

function makeTieredSpot(id: number, price60: number): NormalizedSpot {
  const rule: PricingRule = {
    kind: "tiered",
    vehicle: "standard",
    days: allDays as any,
    windows: allDayWindow as any,
    roundingMins: 60,
    tiers: [
      { thresholdMins: 60, price: price60 },
      { thresholdMins: 120, price: price60 * 1.8 }, // arbitrary higher tier to avoid being chosen
      { thresholdMins: 1440, price: price60 * 1.8 },
    ],
    notes: "Test tiered rule",
  };
  return {
    id,
    provider: "TEST",
    name: `Tiered Spot ${id}`,
    address: "Somewhere",
    lat: 59.9 + id * 0.001,
    lng: 10.78 + id * 0.001,
    rules: [rule],
  };
}

function makeIntervalSpot(
  id: number,
  pricePerInterval: number,
  cap: number | null = null
): NormalizedSpot {
  const rule: PricingRule = {
    kind: "interval",
    vehicle: "any",
    days: allDays as any,
    windows: allDayWindow as any,
    intervalMins: 30,
    pricePerInterval,
    maxPricePerWindow: cap,
    notes: "Test interval rule",
  };
  return {
    id,
    provider: "TEST",
    name: `Interval Spot ${id}`,
    address: "Somewhere",
    lat: 59.9 + id * 0.001,
    lng: 10.78 + id * 0.001,
    rules: [rule],
  };
}

describe("computeSpotCost - tiered rounding", () => {
  it("rounds up to next hour and uses correct tier price", () => {
    const spot = makeTieredSpot(1, 100);
    const res = computeSpotCost(spot, start, 90, "standard");
    expect(res.currency).toBe("NOK");
    // 90 minutes rounds to 120 => price 180 based on our tiers
    expect(res.total).toBe(180);
  });
});

describe("computeSpotCost - interval with per-window cap", () => {
  it("applies maxPricePerWindow cap", () => {
    const spot = makeIntervalSpot(2, 20, 150);
    // 300 minutes => 10 intervals * 20 = 200, capped to 150
    const res = computeSpotCost(spot, start, 300, "standard");
    expect(res.total).toBe(150);
  });
});

describe("computeSpotCost - promotions (free minutes)", () => {
  it("applies free minutes once across the period", () => {
    const spot: NormalizedSpot = {
      ...makeIntervalSpot(3, 30),
      promotions: [{ key: "kiwi", type: "freeMinutes", minutes: 60 }],
    };
    // 90 minutes => without promo: 3 intervals * 30 = 90
    // with 60 free minutes => 30 minutes billable => 1 interval => 30
    const res = computeSpotCost(spot, start, 90, "standard", ["kiwi"]);
    expect(res.total).toBe(30);
    expect(res.appliedPromotions?.[0]?.promotion).toBe("freeMinutes");
  });
});

describe("computeSpotCost - rolling 24h cap", () => {
  it("caps total within 24h window", () => {
    const spot: NormalizedSpot = {
      ...makeIntervalSpot(4, 50), // expensive per-interval
      caps: [{ kind: "rolling", windowMinutes: 1440, price: 100 }],
    };
    // 600 minutes => 20 intervals * 50 = 1000, but 24h rolling cap should cap to 100
    const res = computeSpotCost(spot, start, 600, "standard");
    expect(res.total).toBe(100);
    expect(res.applied24hCap).toBeGreaterThan(0);
  });
});

describe("rankParking - ordering by price only (no destination)", () => {
  it("ranks cheaper spot first when walking is equal", () => {
    const cheap = makeTieredSpot(10, 90);
    const pricey = makeTieredSpot(11, 120);
    const ranked = rankParking([cheap, pricey], {
      start,
      durationMinutes: 60,
      vehicle: "standard",
      weights: { price: 0.5, walking: 0.5 },
    });
    expect(ranked[0].spot.id).toBe(10);
    expect(ranked[1].spot.id).toBe(11);
  });
});

describe("rankParking - weighting walking vs price", () => {
  it("prefers closer spot when walking weight dominates", () => {
    // Near but slightly pricier
    const near: NormalizedSpot = {
      ...makeTieredSpot(20, 110),
      lat: 59.9,
      lng: 10.78,
    };
    // Far but cheaper
    const far: NormalizedSpot = {
      ...makeTieredSpot(21, 100),
      lat: 60.0, // ~11 km north
      lng: 10.78,
    };
    const destination = { lat: 59.9, lng: 10.78 };
    const ranked = rankParking([near, far], {
      start,
      durationMinutes: 60,
      vehicle: "standard",
      destination,
      weights: { price: 0.25, walking: 0.75 },
    });
    expect(ranked[0].spot.id).toBe(20); // near should win with heavy walking weight
  });
});

describe("rankParking - promotions", () => {
  it("applies promotions", () => {
    const promo: NormalizedSpot = {
      ...makeIntervalSpot(30, 30),
      promotions: [{ key: "kiwi", type: "freeMinutes", minutes: 60 }],
    };
    const other: NormalizedSpot = makeIntervalSpot(31, 40);
    const ranked = rankParking([promo, other], {
      start,
      durationMinutes: 90,
      vehicle: "standard",
      eligiblePromotions: ["kiwi"],
    });
    expect(ranked[0].spot.id).toBe(30);
  });
});

describe("rankParking - given payload values (no destination, equal weights)", () => {
  it("handles ISO with seconds and equal weights", () => {
    const startPayload = new Date("2025-08-29T14:15:11.171Z");
    const weights = { price: 0.5, walking: 0.5 } as const;

    const spots: NormalizedSpot[] = [
      makeTieredSpot(40, 100),
      makeTieredSpot(41, 110),
      makeTieredSpot(42, 120),
      makeTieredSpot(43, 130),
    ];

    const ranked = rankParking(spots, {
      start: startPayload,
      durationMinutes: 60,
      vehicle: "standard",
      weights,
      eligiblePromotions: [],
    });

    expect(ranked.length).toBe(4);
    expect(ranked[0].spot.id).toBe(40);
    expect(ranked[1].spot.id).toBe(41);
    expect(ranked[2].spot.id).toBe(42);
    expect(ranked[3].spot.id).toBe(43);
    expect(ranked[0].currency).toBe("NOK");
  });
});
