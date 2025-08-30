// parking-normalize.ts

import type {
  TimeWindow,
  NormalizedSpot,
  PricingRule,
  Dow,
  Tier,
} from "./parking-calculator";

// Helpers
const hhmm = (s: string) => {
  const [h, m] = s.split(":").map(Number);
  return h * 60 + m;
};
const tw = (start: string, end: string): TimeWindow => {
  const s = hhmm(start);
  const e = hhmm(end);
  return { startM: s, endM: e, overnight: s > e };
};

// Vehicle mapping from labels
const vehicleFromLabel = (label: string) => {
  const lower = label.toLowerCase();
  if (lower.includes("elbil")) return "ev" as const;
  return "standard" as const;
};

export function normalizeRawParking(raw: any[]): NormalizedSpot[] {
  const out: NormalizedSpot[] = [];

  for (const entry of raw) {
    const base = {
      id: entry.id as number,
      provider: String(entry.parkeringstilbyderNavn ?? ""),
      name: String(entry.navn ?? ""),
      address: String(entry.adresse ?? ""),
      lat: Number(entry.breddegrad),
      lng: Number(entry.lengdegrad),
      postalCode: entry.postnummer ? String(entry.postnummer) : undefined,
      city: entry.poststed ? String(entry.poststed) : undefined,
      zoneCode: entry.easyparkSone ? String(entry.easyparkSone) : undefined,
      metadata: {
        activatedAt: entry.aktiveringstidspunkt
          ? String(entry.aktiveringstidspunkt)
          : undefined,
        version: entry.versjonsnummer
          ? Number(entry.versjonsnummer)
          : undefined,
        disabled: entry.deaktivert ?? null,
      },
    };

    const rules: PricingRule[] = [];
    const promotions: NormalizedSpot["promotions"] = [];
    const caps: NormalizedSpot["caps"] = [];

    if (entry.custom_prices && Array.isArray(entry.custom_prices)) {
      // Oslo kommune style (and Kiwi promo in OnePark P-hus)
      for (const cp of entry.custom_prices) {
        // Promotion (Kiwi free hour)
        if (typeof cp.free_minutes === "number") {
          promotions!.push({
            key: "kiwi",
            type: "freeMinutes",
            minutes: cp.free_minutes,
            notes: cp.notes ? String(cp.notes) : undefined,
          });
          continue;
        }

        // Tiered rules (Oslo kommune)
        if (cp.applies_time && cp.tiers) {
          const rule: PricingRule = {
            kind: "tiered",
            vehicle: vehicleFromLabel(String(cp.label ?? "")),
            days: (cp.applies_days as number[]).map(Number) as Dow[],
            windows: [tw(cp.applies_time.start, cp.applies_time.end)],
            roundingMins: 60,
            tiers: (cp.tiers as any[]).map((t) => ({
              thresholdMins: Number(t.duration_hours) * 60,
              price: Number(t.price),
            })) as Tier[],
            notes: cp.notes ? String(cp.notes) : undefined,
          };
          rules.push(rule);
        }
      }
    }

    if (entry.priser && Array.isArray(entry.priser)) {
      // OnePark style per-day price lists with per-interval pricing
      for (const dayEntry of entry.priser) {
        const day: Dow = Number(dayEntry.day) as Dow;
        for (const p of dayEntry.price_list) {
          const rule: PricingRule = {
            kind: "interval",
            vehicle: "any",
            days: [day],
            windows: [tw(p.start, p.end)],
            intervalMins: Number(p.duration_minutes),
            pricePerInterval: Number(p.price),
            maxPricePerWindow: p.max_price != null ? Number(p.max_price) : null,
            notes: undefined,
          };
          rules.push(rule);
        }
      }
    }

    if (typeof entry.daily_max_price === "number") {
      caps!.push({
        kind: "rolling",
        windowMinutes: 24 * 60,
        price: Number(entry.daily_max_price),
      });
    }

    out.push({
      ...base,
      rules,
      promotions: promotions!.length ? promotions : undefined,
      caps: caps!.length ? caps : undefined,
    });
  }

  return out;
}
