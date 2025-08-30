<script lang="ts">
  /**
   * BestParking.svelte
   *
   * Accessible UI to rank and display the best parking spots without AI.
   * - Reuses normalizeRawParking() and rankParking(spots, opts)
   * - Uses existing table UI components in src/lib/components/ui/table
   * - Designed for integration on the /parkering listing page
   */
  import type { EntryWithSlug } from "$lib/parking/utils";
  import { formatPriceNOK } from "$lib/parking/utils";
  import { normalizeRawParking } from "$lib/parking-normalize";
  import { rankParking, type RankOptions } from "$lib/parking-calculator";
  import { site } from "$lib/config";

  // Table UI components
  import Table from "$lib/components/ui/table/table.svelte";
  import TableHeader from "$lib/components/ui/table/table-header.svelte";
  import TableHead from "$lib/components/ui/table/table-head.svelte";
  import TableBody from "$lib/components/ui/table/table-body.svelte";
  import TableRow from "$lib/components/ui/table/table-row.svelte";
  import TableCell from "$lib/components/ui/table/table-cell.svelte";

  let { entries } = $props<{ entries: EntryWithSlug[] }>();

  // Build a mapping id -> slug to link to details pages
  let slugById = $state<Map<number, string>>(new Map());
  $effect(() => {
    slugById = new Map(entries.map((e: EntryWithSlug) => [e.id, e.slug]));
  });

  // Form state
  const nowLocal = (() => {
    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    const y = d.getFullYear();
    const m = pad(d.getMonth() + 1);
    const day = pad(d.getDate());
    const hh = pad(d.getHours());
    const mm = pad(d.getMinutes());
    return `${y}-${m}-${day}T${hh}:${mm}`;
  })();

  let startISO = $state(nowLocal);
  let durationMinutes = $state(60);
  let vehicle: RankOptions["vehicle"] = $state("standard");
  let destLat: number | "" = $state(site.location.lat);
  let destLng: number | "" = $state(site.location.lon);
  let priceWeight = $state(0.75);
  let walkingWeight = $state(0.25);
  let eligiblePromotions = $state<string[]>([]);
  let limit = $state(5);

  type Result = ReturnType<typeof rankParking>[number];
  let results = $state<Result[]>([]);
  let error = $state<string | null>(null);

  function parseStart(): Date {
    const d = new Date(startISO);
    if (Number.isNaN(d.getTime())) throw new Error("Ugyldig startdato");
    return d;
  }

  function buildOptions(): RankOptions {
    const destination =
      destLat !== "" && destLng !== ""
        ? { lat: Number(destLat), lng: Number(destLng) }
        : undefined;
    return {
      start: parseStart(),
      durationMinutes: Number(durationMinutes),
      vehicle,
      destination,
      weights: { price: Number(priceWeight), walking: Number(walkingWeight) },
      eligiblePromotions,
    };
  }

  function onSubmit(e: Event) {
    e.preventDefault();
    error = null;
    try {
      const spots = normalizeRawParking(entries as any[]);
      const opts = buildOptions();
      const ranked = rankParking(spots, opts);
      results = ranked.slice(0, Math.max(1, Math.min(25, Number(limit))));
    } catch (err: any) {
      error = err?.message ?? String(err);
      results = [];
    }
  }
</script>

<section aria-labelledby="best-parking-title" class="space-y-3">
  <h2 id="best-parking-title" class="text-xl font-semibold tracking-tight">Finn beste parkering</h2>
  <p class="text-muted-foreground text-sm">Ranger plassene etter pris og gangavstand. Ingen AI – kun åpne regler og data.</p>

  <form class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" onsubmit={onSubmit}>
    <div class="sm:col-span-1">
      <label for="bp-start" class="block text-sm font-medium">Start (lokal tid)</label>
      <input id="bp-start" class="border rounded px-3 py-2 w-full" type="datetime-local" bind:value={startISO} required />
    </div>

    <div class="sm:col-span-1">
      <label for="bp-duration" class="block text-sm font-medium">Varighet (min)</label>
      <input id="bp-duration" class="border rounded px-3 py-2 w-full" type="number" min="1" step="1" bind:value={durationMinutes} />
    </div>

    <fieldset class="sm:col-span-1">
      <legend class="block text-sm font-medium">Kjøretøy</legend>
      <div class="flex items-center gap-4 mt-2">
        <label class="inline-flex items-center gap-2 text-sm">
          <input type="radio" name="vehicle" value="standard" bind:group={vehicle} />
          <span>Standard</span>
        </label>
        <label class="inline-flex items-center gap-2 text-sm">
          <input type="radio" name="vehicle" value="ev" bind:group={vehicle} />
          <span>Elbil</span>
        </label>
      </div>
    </fieldset>

    <div>
      <label for="bp-lat" class="block text-sm font-medium">Destinasjon lat (valgfritt)</label>
      <input id="bp-lat" class="border rounded px-3 py-2 w-full" type="number" step="any" bind:value={destLat} />
    </div>
    <div>
      <label for="bp-lng" class="block text-sm font-medium">Destinasjon lon (valgfritt)</label>
      <input id="bp-lng" class="border rounded px-3 py-2 w-full" type="number" step="any" bind:value={destLng} />
    </div>

    <fieldset class="sm:col-span-2 lg:col-span-3">
      <legend class="block text-sm font-medium">Vekter</legend>
      <div class="text-xs text-gray-600">Pris: {priceWeight.toFixed(2)} | Gange: {walkingWeight.toFixed(2)}</div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
        <input type="range" min="0" max="1" step="0.05" bind:value={priceWeight} oninput={() => (walkingWeight = 1 - priceWeight)} aria-label="Vekt pris" />
        <input type="range" min="0" max="1" step="0.05" bind:value={walkingWeight} oninput={() => (priceWeight = 1 - walkingWeight)} aria-label="Vekt gange" />
      </div>
      <p class="text-xs text-muted-foreground">Summen av vekter er 1.</p>
    </fieldset>

    <fieldset>
      <legend class="block text-sm font-medium">Fordeler</legend>
      <label class="inline-flex items-center gap-2 text-sm">
        <input type="checkbox" value="kiwi" onchange={(e: Event) => {
          const target = e.target as HTMLInputElement;
          eligiblePromotions = target.checked
            ? Array.from(new Set([...eligiblePromotions, 'kiwi']))
            : eligiblePromotions.filter((p) => p !== 'kiwi');
        }} />
        <span>Kiwi 1t gratis</span>
      </label>
    </fieldset>

    <div>
      <label for="bp-limit" class="block text-sm font-medium">Antall</label>
      <input id="bp-limit" class="border rounded px-3 py-2 w-full" type="number" min="1" max="25" bind:value={limit} />
    </div>

    <div class="sm:col-span-2 lg:col-span-3">
      <button class="px-3 py-2 border rounded" type="submit">Ranger plasser</button>
    </div>
  </form>

  <div aria-live="polite" class="text-sm">
    {#if error}
      <p class="text-red-700">{error}</p>
    {/if}
    {#if results.length}
      <p class="text-muted-foreground">Fant {results.length} beste alternativer.</p>
    {/if}
  </div>

  {#if results.length}
    <Table class="mt-2">
      <TableHeader>
        <TableRow>
          <TableHead class="w-[45%]">Plass</TableHead>
          <TableHead>Tilbyder</TableHead>
          <TableHead>Pris</TableHead>
          <TableHead>Gange</TableHead>
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {#each results as r}
          <TableRow>
            <TableCell>
              <div class="font-medium">{r.spot.name}</div>
              <div class="text-xs text-gray-600">{r.spot.address}</div>
            </TableCell>
            <TableCell>{r.spot.provider}</TableCell>
            <TableCell>{formatPriceNOK(Math.round(r.cost))}</TableCell>
            <TableCell>{r.walkingMinutes != null ? `~${Math.round(r.walkingMinutes)} min` : '–'}</TableCell>
            <TableCell>
              {#if slugById.get(r.spot.id)}
                <a class="text-sm underline" href={`/parkering/${slugById.get(r.spot.id)}`}>Detaljer</a>
              {/if}
            </TableCell>
          </TableRow>
        {/each}
      </TableBody>
    </Table>
  {/if}
</section>
