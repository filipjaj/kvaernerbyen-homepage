// parking-calculator.ts

// ---------- Types ----------
export type Dow = 1 | 2 | 3 | 4 | 5 | 6 | 7;
export type VehicleType = "standard" | "ev" | "any";
type Currency = "NOK";

export interface TimeWindow {
  startM: number; // minutes since 00:00 local day
  endM: number; // minutes since 00:00 local day
  overnight: boolean; // true when start > end (e.g., 17:00–07:00)
}

// Overloads maintained for backward-compat with older callers/tests
export function rankParking(opts: RankOptions): RankedResult[];
export function rankParking(
  spots: NormalizedSpot[],
  opts: RankOptions
): RankedResult[];
export function rankParking(
  arg1: RankOptions | NormalizedSpot[],
  arg2?: RankOptions
): RankedResult[] {
  if (Array.isArray(arg1)) {
    return _rankParkingImpl(arg1 as NormalizedSpot[], arg2 as RankOptions);
  }
  // No global dataset is wired here to avoid tight coupling; enforce explicit usage
  throw new Error(
    "rankParking(spots, opts) is required. Provide an explicit spots array."
  );
}

export type PricingKind = "interval" | "tiered";

export interface Tier {
  thresholdMins: number; // e.g., 60, 120, ... 1440
  price: number; // inclusive cumulative price up to threshold
}

export interface PricingRule {
  kind: PricingKind;
  vehicle: VehicleType; // 'ev' for Elbil, 'standard' otherwise, or 'any'
  days: Dow[]; // which days this rule applies
  windows: TimeWindow[]; // one or more windows per day
  // For kind: 'interval'
  intervalMins?: number; // e.g., 30 for 'per commenced 30 minutes'
  pricePerInterval?: number; // kr per interval
  maxPricePerWindow?: number | null; // cap within a single window instance (e.g., nightly cap)
  // For kind: 'tiered'
  roundingMins?: number; // typically 60 (round up to hour)
  tiers?: Tier[]; // e.g., [{60,69},{120,136},...,{1440,333}]
  notes?: string;
}

export interface Promotion {
  key: string; // 'kiwi' etc.
  type: "freeMinutes";
  minutes: number; // e.g., 60
  notes?: string;
}

export interface Cap {
  kind: "rolling"; // rolling windows anchored at check-in
  windowMinutes: number; // 1440 for 24h
  price: number; // e.g., 380
}

export interface NormalizedSpot {
  id: number;
  provider: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  postalCode?: string;
  city?: string;
  zoneCode?: string;
  rules: PricingRule[];
  promotions?: Promotion[]; // e.g., Kiwi free hour
  caps?: Cap[]; // e.g., 24h max 380
  metadata?: {
    activatedAt?: string;
    version?: number;
    disabled?: boolean | null;
  };
}

export interface CostLineItem {
  ruleIdx: number;
  windowIndex: number; // index within rule.windows
  start: Date;
  end: Date;
  minutes: number; // overlap minutes within this window instance
  chargedIntervals?: number; // for 'interval' rules
  roundedMinutes?: number; // for 'tiered' rules
  subtotal: number; // cost for this item after rule rounding/caps, before global 24h cap
  capApplied?: number; // if a per-window cap was applied (e.g., 150 night)
}

export interface CostBreakdown {
  total: number;
  currency: Currency;
  items: CostLineItem[];
  applied24hCap?: number; // summed reductions due to 24h cap
  appliedPromotions?: { promotion: string; minutesUsed: number }[];
}

export interface RankOptions {
  start: Date;
  durationMinutes: number;
  vehicle: VehicleType; // 'standard' or 'ev'
  destination?: { lat: number; lng: number };
  walkingSpeedKmh?: number; // default 4.8
  weights?: { price: number; walking: number }; // default { price: 0.75, walking: 0.25 }
  eligiblePromotions?: string[]; // e.g., ['kiwi']
}

export interface RankedResult {
  spot: NormalizedSpot;
  cost: number;
  currency: Currency;
  distanceMeters?: number;
  walkingMinutes?: number;
  score: number; // lower is better
  breakdown: CostBreakdown;
}

// ---------- Utils ----------
const MIN = Math.min;
const MAX = Math.max;
const ceilDiv = (a: number, b: number) => Math.ceil(a / b);

const parseHHMM = (hhmm: string): number => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

const setMinutesOfDay = (d: Date, minutes: number) =>
  new Date(
    d.getFullYear(),
    d.getMonth(),
    d.getDate(),
    Math.floor(minutes / 60),
    minutes % 60,
    0,
    0
  );

const startOfDay = (d: Date) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
const addDays = (d: Date, n: number) =>
  new Date(
    d.getFullYear(),
    d.getMonth(),
    d.getDate() + n,
    d.getHours(),
    d.getMinutes(),
    d.getSeconds(),
    d.getMilliseconds()
  );
const addMinutes = (d: Date, m: number) => new Date(d.getTime() + m * 60000);

const overlapMinutes = (
  aStart: Date,
  aEnd: Date,
  bStart: Date,
  bEnd: Date
): number => {
  const s = MAX(aStart.getTime(), bStart.getTime());
  const e = MIN(aEnd.getTime(), bEnd.getTime());
  return e > s ? Math.round((e - s) / 60000) : 0;
};

const getDow = (d: Date): Dow => {
  const js = d.getDay(); // 0=Sun..6=Sat
  return (js === 0 ? 7 : js) as Dow;
};

const haversineMeters = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) => {
  const toRad = (x: number) => (x * Math.PI) / 180;
  const R = 6371000; // meters
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
};

// ---------- Core pricing helpers ----------
function ruleMatchesVehicle(rule: PricingRule, vehicle: VehicleType) {
  return rule.vehicle === "any" || rule.vehicle === vehicle;
}

/**
 * Generate concrete window instances (Date ranges) across the session
 * for a rule. Overnight windows (start> end) are anchored to the day they start,
 * spanning into the next day.
 */
function generateWindowInstances(
  rule: PricingRule,
  sessionStart: Date,
  sessionEnd: Date
): { ruleIdx: number; windowIndex: number; winStart: Date; winEnd: Date }[] {
  const instances: {
    ruleIdx: number;
    windowIndex: number;
    winStart: Date;
    winEnd: Date;
  }[] = [];

  // Iterate days from (start-1 day) to (end+1 day) to safely catch overnights touching edges
  for (
    let cursor = startOfDay(addDays(sessionStart, -1));
    cursor <= addDays(startOfDay(sessionEnd), 1);
    cursor = addDays(cursor, 1)
  ) {
    const dow = getDow(cursor);
    if (!rule.days.includes(dow)) continue;

    rule.windows.forEach((w, windowIndex) => {
      const baseStart = setMinutesOfDay(cursor, w.startM);
      const winStart = baseStart;
      const winEnd = w.overnight
        ? setMinutesOfDay(addDays(cursor, 1), w.endM)
        : setMinutesOfDay(cursor, w.endM);

      // Only keep if it has any overlap with the full session envelope (+1/-1 day range is already conservative)
      if (overlapMinutes(winStart, winEnd, sessionStart, sessionEnd) > 0) {
        instances.push({
          ruleIdx: -1 /* to be filled by caller if needed */,
          windowIndex,
          winStart,
          winEnd,
        });
      }
    });
  }
  return instances;
}

function priceIntervalWindow(
  minutes: number,
  intervalMins: number,
  pricePerInterval: number,
  cap: number | null | undefined
) {
  const intervals = ceilDiv(minutes, intervalMins);
  let subtotal = intervals * pricePerInterval;
  let capApplied: number | undefined;
  if (cap != null) {
    const before = subtotal;
    subtotal = Math.min(subtotal, cap);
    if (subtotal < before) capApplied = cap;
  }
  return { subtotal, intervals, capApplied };
}

function priceTieredWindow(
  minutes: number,
  roundingMins: number,
  tiers: Tier[]
) {
  const rounded = ceilDiv(minutes, roundingMins) * roundingMins;
  // tiers are cumulative inclusive thresholds
  const sorted = [...tiers].sort((a, b) => a.thresholdMins - b.thresholdMins);
  let price = sorted[sorted.length - 1].price; // default to last as cap
  for (const t of sorted) {
    if (rounded <= t.thresholdMins) {
      price = t.price;
      break;
    }
  }
  return { subtotal: price, roundedMinutes: rounded };
}

// Apply a single "free minutes" promotion across chronological items
function applyFreeMinutes(
  items: CostLineItem[],
  rules: PricingRule[],
  freeMinutes: number
) {
  if (freeMinutes <= 0) return { items, used: 0 };
  const sorted = [...items].sort(
    (a, b) => a.start.getTime() - b.start.getTime()
  );
  let remaining = freeMinutes;
  const out: CostLineItem[] = [];

  for (const item of sorted) {
    const rule = rules[item.ruleIdx];
    let billableMins = item.minutes;

    const freeHere = Math.min(remaining, billableMins);
    billableMins -= freeHere;
    remaining -= freeHere;

    let updated: CostLineItem = {
      ...item,
      subtotal: 0,
      capApplied: undefined,
      chargedIntervals: undefined,
      roundedMinutes: undefined,
    };

    if (billableMins <= 0) {
      // Entire item becomes free
      out.push(updated);
      if (remaining <= 0) {
        // Push the rest unchanged
        out.push(...sorted.slice(sorted.indexOf(item) + 1));
        break;
      }
      continue;
    }

    if (rule.kind === "interval") {
      const { subtotal, intervals, capApplied } = priceIntervalWindow(
        billableMins,
        rule.intervalMins!,
        rule.pricePerInterval!,
        rule.maxPricePerWindow
      );
      updated.subtotal = subtotal;
      updated.chargedIntervals = intervals;
      updated.capApplied = capApplied;
    } else {
      const { subtotal, roundedMinutes } = priceTieredWindow(
        billableMins,
        rule.roundingMins!,
        rule.tiers!
      );
      updated.subtotal = subtotal;
      updated.roundedMinutes = roundedMinutes;
    }

    out.push(updated);
    if (remaining <= 0) {
      // Push the rest unchanged
      out.push(...sorted.slice(sorted.indexOf(item) + 1));
      break;
    }
  }

  // If we didn't early break, add any tail items not yet added
  if (out.length < sorted.length) {
    const seen = new Set(
      out.map(
        (x) =>
          x.start.getTime() +
          "|" +
          x.end.getTime() +
          "|" +
          x.ruleIdx +
          "|" +
          x.windowIndex
      )
    );
    for (const x of sorted) {
      const key =
        x.start.getTime() +
        "|" +
        x.end.getTime() +
        "|" +
        x.ruleIdx +
        "|" +
        x.windowIndex;
      if (!seen.has(key)) out.push(x);
    }
  }

  // Restore original order
  out.sort((a, b) => a.start.getTime() - b.start.getTime());

  return { items: out, used: freeMinutes - remaining };
}

// Compute cost for a given spot and exact [start,end] window.
// - Promotions: pass freeMinutesBudget for this call (e.g., Kiwi 60 for the first 24h block only)
// - Caps: set applyCaps=false when doing per-block recomputation for 24h caps to avoid recursion
function computeSpotCostForPeriod(
  spot: NormalizedSpot,
  start: Date,
  end: Date,
  vehicle: VehicleType,
  freeMinutesBudget: number,
  applyCaps: boolean
): CostBreakdown {
  // Defensive: handle spots with missing or invalid rules arrays
  const rulesArr: PricingRule[] = Array.isArray(spot.rules) ? spot.rules : [];
  const eligibleRules: { rule: PricingRule; idx: number }[] = rulesArr
    .map((rule, idx) => ({ rule, idx }))
    .filter(({ rule }) => ruleMatchesVehicle(rule, vehicle));

  const items: CostLineItem[] = [];

  for (const { rule, idx } of eligibleRules) {
    const instances = generateWindowInstances(rule, start, end);
    instances.forEach((inst) => {
      const minutes = overlapMinutes(inst.winStart, inst.winEnd, start, end);
      if (minutes <= 0) return;

      // Price the overlapped minutes for this single window instance
      let subtotal = 0;
      let chargedIntervals: number | undefined;
      let roundedMinutes: number | undefined;
      let capApplied: number | undefined;

      if (rule.kind === "interval") {
        const r = priceIntervalWindow(
          minutes,
          rule.intervalMins!,
          rule.pricePerInterval!,
          rule.maxPricePerWindow
        );
        subtotal = r.subtotal;
        chargedIntervals = r.intervals;
        capApplied = r.capApplied;
      } else {
        const r = priceTieredWindow(minutes, rule.roundingMins!, rule.tiers!);
        subtotal = r.subtotal;
        roundedMinutes = r.roundedMinutes;
      }

      items.push({
        ruleIdx: idx,
        windowIndex: inst.windowIndex,
        start: new Date(Math.max(start.getTime(), inst.winStart.getTime())),
        end: new Date(Math.min(end.getTime(), inst.winEnd.getTime())),
        minutes,
        chargedIntervals,
        roundedMinutes,
        subtotal,
        capApplied,
      });
    });
  }

  // Apply promotions (e.g., Kiwi free hour) once per period
  let appliedPromotions:
    | { promotion: string; minutesUsed: number }[]
    | undefined;
  if (freeMinutesBudget > 0) {
    const before = items.map((i) => ({ ...i }));
    const res = applyFreeMinutes(items, spot.rules, freeMinutesBudget);
    appliedPromotions =
      res.used > 0
        ? [{ promotion: "freeMinutes", minutesUsed: res.used }]
        : undefined;
    // Replace items with discounted ones
    items.length = 0;
    items.push(...res.items);
  }

  let total = items.reduce((sum, i) => sum + i.subtotal, 0);
  let applied24hCap = 0;

  // Apply rolling caps (e.g., 24h=380) by splitting the overall period into consecutive windows.
  if (applyCaps && spot.caps && spot.caps.length > 0) {
    for (const cap of spot.caps) {
      if (cap.kind !== "rolling") continue;
      let blockStart = new Date(start);
      let capAdjustedTotal = 0;
      let remainingFree = freeMinutesBudget; // promotions only apply in the first block

      while (blockStart < end) {
        const blockEnd = new Date(
          Math.min(
            end.getTime(),
            addMinutes(blockStart, cap.windowMinutes).getTime()
          )
        );
        // Recompute cost for this block WITHOUT reapplying caps (avoid recursion) and with remainingFree only for the first block
        const blockRes = computeSpotCostForPeriod(
          spot,
          blockStart,
          blockEnd,
          vehicle,
          remainingFree,
          /*applyCaps*/ false
        );
        remainingFree = 0; // consumed only in the first applicable block

        const capped = Math.min(blockRes.total, cap.price);
        capAdjustedTotal += capped;
        applied24hCap += Math.max(0, blockRes.total - capped);
        blockStart = blockEnd;
      }

      total = Math.min(total, capAdjustedTotal); // in case of multiple caps, keep the tightest
    }
  }

  return {
    total,
    currency: "NOK",
    items,
    applied24hCap: applied24hCap > 0 ? applied24hCap : undefined,
    appliedPromotions,
  };
}

// Public API: compute full-session cost for a spot, handling promotions and caps as defined on the spot
export function computeSpotCost(
  spot: NormalizedSpot,
  start: Date,
  durationMinutes: number,
  vehicle: VehicleType,
  eligiblePromotions: string[] = []
): CostBreakdown {
  const end = addMinutes(start, durationMinutes);
  const freeBudget =
    spot.promotions
      ?.filter(
        (p) => p.type === "freeMinutes" && eligiblePromotions.includes(p.key)
      )
      .reduce((acc, p) => acc + p.minutes, 0) ?? 0;

  return computeSpotCostForPeriod(
    spot,
    start,
    end,
    vehicle,
    freeBudget,
    /*applyCaps*/ true
  );
}

// Rank by weighted price + walking distance
function _rankParkingImpl(
  spots: NormalizedSpot[],
  opts: RankOptions
): RankedResult[] {
  const {
    start = new Date(),
    durationMinutes = 60,
    vehicle = "standard",
    destination = undefined,
    walkingSpeedKmh = 4.8,
    weights = { price: 0.75, walking: 0.25 },
    eligiblePromotions = [],
  } = opts;

  const raw = spots.map((spot) => {
    const breakdown = computeSpotCost(
      spot,
      start,
      durationMinutes,
      vehicle,
      eligiblePromotions
    );
    const cost = breakdown.total;
    let distanceMeters: number | undefined;
    let walkingMinutes: number | undefined;

    if (destination) {
      distanceMeters = haversineMeters(
        spot.lat,
        spot.lng,
        destination.lat,
        destination.lng
      );
      const km = distanceMeters / 1000;
      walkingMinutes = (km / walkingSpeedKmh) * 60;
    }

    return {
      spot,
      cost,
      currency: breakdown.currency,
      distanceMeters,
      walkingMinutes,
      breakdown,
    };
  });

  // Normalize for scoring
  const costs = raw.map((r) => r.cost);
  const walks = raw.map((r) => r.walkingMinutes ?? 0);
  const minCost = Math.min(...costs);
  const maxCost = Math.max(...costs);
  const minWalk = walks.length ? Math.min(...walks) : 0;
  const maxWalk = walks.length ? Math.max(...walks) : 0;

  const norm = (v: number, min: number, max: number) =>
    max > min ? (v - min) / (max - min) : 0;

  const scored = raw.map((r) => {
    const np = norm(r.cost, minCost, maxCost);
    const nw =
      r.walkingMinutes != null ? norm(r.walkingMinutes, minWalk, maxWalk) : 0;
    const score = weights.price * np + weights.walking * nw;
    return { ...r, score };
  });

  return scored.sort((a, b) => a.score - b.score);
}
