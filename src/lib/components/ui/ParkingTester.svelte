<script lang="ts">
  import { rankParking, type RankOptions } from "$lib/parking-calculator";
  import parking from "../../../data/parking";
  import { normalizeRawParking } from "$lib/parking-normalize";

  // Form state
  let startISO: string = new Date().toISOString().slice(0, 16);
  let durationMinutes = 60;
  let vehicle: RankOptions["vehicle"] = "standard";
  let destLat: number | '' = '';
  let destLng: number | '' = '';
  let priceWeight = 0.75;
  let walkingWeight = 0.25;
  let eligiblePromotions: string[] = [];
  let limit = 5;

  type Result = ReturnType<typeof rankParking>[number];
  let results: Result[] = [];
  let error: string | null = null;

  function toLocalInputValue(date: Date) {
    // Returns 'YYYY-MM-DDTHH:mm' in local time for datetime-local
    const pad = (n: number) => String(n).padStart(2, "0");
    const y = date.getFullYear();
    const m = pad(date.getMonth() + 1);
    const d = pad(date.getDate());
    const hh = pad(date.getHours());
    const mm = pad(date.getMinutes());
    return `${y}-${m}-${d}T${hh}:${mm}`;
  }

  // Initialize to local now
  startISO = toLocalInputValue(new Date());

  function parseStart(): Date {
    // datetime-local is local; construct as local time
    const d = new Date(startISO);
    if (Number.isNaN(d.getTime())) throw new Error("Invalid start date");
    return d;
  }

  function buildOptions(): RankOptions {
    const destination =
      destLat !== '' && destLng !== ''
        ? { lat: Number(destLat), lng: Number(destLng) }
        : undefined;
    return {
      start: parseStart(),
      durationMinutes,
      vehicle,
      destination,
      weights: { price: priceWeight, walking: walkingWeight },
      eligiblePromotions,
    };
  }

  function onSubmit(e: Event) {
    e.preventDefault();
    error = null;
    try {
      const opts = buildOptions();
      const spots = normalizeRawParking(parking);
      const ranked = rankParking(spots, opts);
      results = ranked.slice(0, Math.max(1, Math.min(25, limit)));
    } catch (err: any) {
      error = err?.message ?? String(err);
      results = [];
    }
  }
</script>

<!-- Simple, accessible tester UI -->
<section aria-labelledby="parking-tester-title" class="max-w-3xl">
  <h2 id="parking-tester-title" class="text-xl font-semibold">Parking ranking tester</h2>

  <form class="grid gap-4 mt-4" on:submit|preventDefault={onSubmit}>
    <div>
      <label for="start" class="block font-medium">Start (local)</label>
      <input id="start" class="input" type="datetime-local" bind:value={startISO} required />
    </div>

    <div>
      <label for="duration" class="block font-medium">Duration (minutes)</label>
      <input id="duration" class="input" type="number" min="1" step="1" bind:value={durationMinutes} />
    </div>

    <fieldset>
      <legend class="block font-medium">Vehicle</legend>
      <label class="mr-4">
        <input type="radio" name="vehicle" value="standard" bind:group={vehicle} />
        <span class="ml-1">Standard</span>
      </label>
      <label class="mr-4">
        <input type="radio" name="vehicle" value="ev" bind:group={vehicle} />
        <span class="ml-1">EV</span>
      </label>
    </fieldset>

    <div class="grid grid-cols-2 gap-4">
      <div>
        <label for="lat" class="block font-medium">Destination lat (optional)</label>
        <input id="lat" class="input" type="number" step="any" bind:value={destLat} />
      </div>
      <div>
        <label for="lng" class="block font-medium">Destination lng (optional)</label>
        <input id="lng" class="input" type="number" step="any" bind:value={destLng} />
      </div>
    </div>

    <fieldset class="grid gap-2">
      <legend class="block font-medium">Weights</legend>
      <div class="text-sm text-gray-600">Price: {priceWeight.toFixed(2)} | Walking: {walkingWeight.toFixed(2)}</div>
      <input type="range" min="0" max="1" step="0.05" bind:value={priceWeight} on:input={() => (walkingWeight = 1 - priceWeight)} aria-label="Price weight" />
      <input type="range" min="0" max="1" step="0.05" bind:value={walkingWeight} on:input={() => (priceWeight = 1 - walkingWeight)} aria-label="Walking weight" />
      <p class="text-xs text-gray-500">Weights sum to 1.</p>
    </fieldset>

    <fieldset>
      <legend class="block font-medium">Promotions</legend>
      <label>
        <input type="checkbox" value="kiwi" on:change={(e: Event) => {
          const target = e.target as HTMLInputElement;
          eligiblePromotions = target.checked
            ? Array.from(new Set([...eligiblePromotions, 'kiwi']))
            : eligiblePromotions.filter((p) => p !== 'kiwi');
        }} />
        <span class="ml-1">Kiwi 1h free</span>
      </label>
    </fieldset>

    <div>
      <label for="limit" class="block font-medium">Limit</label>
      <input id="limit" class="input" type="number" min="1" max="25" bind:value={limit} />
    </div>

    <button type="submit" class="btn">Rank parking</button>
  </form>

  {#if error}
    <p role="alert" class="mt-4 text-red-700">{error}</p>
  {/if}

  {#if results.length}
    <div class="mt-6">
      <h3 class="text-lg font-semibold">Results</h3>
      <ol class="mt-2 space-y-3">
        {#each results as r, i}
          <li class="p-3 border rounded">
            <div class="font-medium">#{i + 1} — {r.spot.name}</div>
            <div class="text-sm text-gray-700">{r.spot.provider} • {r.spot.address}</div>
            <div class="mt-1">Price: <strong>{Math.round(r.cost)} {r.currency}</strong></div>
            {#if r.walkingMinutes != null}
              <div class="text-sm">Walking: ~{Math.round(r.walkingMinutes)} min ({r.distanceMeters && Math.round(r.distanceMeters)} m)</div>
            {/if}
            {#if r.breakdown.appliedPromotions}
              <div class="text-sm text-emerald-700">Promos: {r.breakdown.appliedPromotions.map(p => `${p.promotion} (${p.minutesUsed}m)`).join(', ')}</div>
            {/if}
            {#if r.breakdown.applied24hCap}
              <div class="text-sm text-blue-700">24h cap applied: {r.breakdown.applied24hCap}</div>
            {/if}
          </li>
        {/each}
      </ol>
    </div>
  {/if}
</section>

<style>
  .input {
    border: 1px solid var(--border, #d1d5db);
    padding: 0.5rem 0.75rem;
    border-radius: 0.375rem;
    width: 100%;
  }
  .btn {
    background: var(--btn-bg, #111827);
    color: white;
    padding: 0.5rem 0.75rem;
    border-radius: 0.375rem;
  }
</style>
