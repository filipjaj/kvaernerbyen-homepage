<script lang="ts">
  /**
   * BestParking.svelte
   *
   * Accessible UI to compare prices across spots.
   * - No destination/weights. No promotions toggle.
   * - Computes both Standard and Elbil prices and sorts by cheapest.
   * - Uses existing table UI components in src/lib/components/ui/table.
   */
  import type { EntryWithSlug } from "$lib/parking/utils";
  import { formatPriceNOK } from "$lib/parking/utils";
  import { normalizeRawParking } from "$lib/parking-normalize";
  import { computeSpotCost } from "$lib/parking-calculator";

  // Table UI components
  import Table from "$lib/components/ui/table/table.svelte";
  import TableHeader from "$lib/components/ui/table/table-header.svelte";
  import TableHead from "$lib/components/ui/table/table-head.svelte";
  import TableBody from "$lib/components/ui/table/table-body.svelte";
  import TableRow from "$lib/components/ui/table/table-row.svelte";
  import TableCell from "$lib/components/ui/table/table-cell.svelte";
  import Input from "$lib/components/ui/input.svelte";
  import Label from "$lib/components/ui/label.svelte";

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
  let mode = $state<"duration" | "end">("duration");
  let durationHours = $state(1);
  const initialEndLocal = (() => {
    const d = new Date(nowLocal);
    d.setMinutes(d.getMinutes() + 60);
    const pad = (n: number) => String(n).padStart(2, "0");
    const y = d.getFullYear();
    const m = pad(d.getMonth() + 1);
    const day = pad(d.getDate());
    const hh = pad(d.getHours());
    const mm = pad(d.getMinutes());
    return `${y}-${m}-${day}T${hh}:${mm}`;
  })();
  let endISO = $state(initialEndLocal);

  let normalizedSpots = $state<any[]>([]);
  let results = $state<{ spot: any; standard: number; ev: number; currency: string; isPromo?: boolean }[]>([]);
  let error = $state<string | null>(null);
  let currentMinutes = $state<number | null>(60);

  function parseStart(): Date {
    const d = new Date(startISO);
    if (Number.isNaN(d.getTime())) throw new Error("Ugyldig startdato");
    return d;
  }
  function parseEndAndDurationMinutes(): { end: Date; minutes: number } {
    const start = parseStart();
    let end: Date;
    if (mode === "duration") {
      end = new Date(start.getTime() + Math.max(1, Number(durationHours)) * 60 * 60000);
    } else {
      end = new Date(endISO as unknown as string);
    }
    if (Number.isNaN(end.getTime())) throw new Error("Ugyldig sluttid");
    const diffM = Math.max(1, Math.round((end.getTime() - start.getTime()) / 60000));
    if (diffM <= 0) throw new Error("Sluttid må være etter starttid");
    return { end, minutes: diffM };
  }

  // Normalize once when entries change
  $effect(() => {
    normalizedSpots = normalizeRawParking(entries as any[]);
  });

  // Auto-calc on input changes
  $effect(() => {
    try {
      error = null;
      const start = parseStart();
      const { minutes } = parseEndAndDurationMinutes();
      currentMinutes = minutes;
      const free = minutes === 60;
      const rows = normalizedSpots.map((spot) => {
        const standard = computeSpotCost(spot, start, minutes, "standard", free ? ["kiwi"] : []).total;
        const ev = computeSpotCost(spot, start, minutes, "ev", free ? ["kiwi"] : []).total;
        return { spot, standard, ev, currency: "NOK", isPromo: spot.promotions?.length > 0 };
      });
      // Sort by cheapest of the two
      rows.sort((a, b) => Math.min(a.standard, a.ev) - Math.min(b.standard, b.ev));
      results = rows;
    } catch (err: any) {
      error = err?.message ?? String(err);
      results = [];
    }
  });
</script>

<section aria-labelledby="best-parking-title" class="space-y-3">
  <h2 id="best-parking-title" class="text-xl font-semibold tracking-tight">Finn billigste parkering</h2>
  <p class="text-muted-foreground text-sm">Sammenlign priser for Standard og Elbil. Beregning skjer automatisk.</p>

  <form class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
    <div class="sm:col-span-1">
      <Label for="bp-start">Start (lokal tid)</Label>
      <Input id="bp-start" type="datetime-local" bind:value={startISO} required />
    </div>

    <fieldset class="sm:col-span-2 lg:col-span-2">
      <legend class="block text-sm font-medium">Varighet</legend>
      <div class="flex items-center gap-6 mt-2">
        <div class="inline-flex items-center gap-2 text-sm">
          <input id="mode-duration" type="radio" name="mode" value="duration" bind:group={mode} />
          <Label for="mode-duration">Timer</Label>
        </div>
        <div class="inline-flex items-center gap-2 text-sm">
          <input id="mode-end" type="radio" name="mode" value="end" bind:group={mode} />
          <Label for="mode-end">Sluttid</Label>
        </div>
      </div>
      {#if mode === 'duration'}
        <div class="mt-2 max-w-xs">
          <Label for="bp-hours" class="block">Antall timer</Label>
          <Input id="bp-hours" type="number" min={1} step={1} bind:value={durationHours} />
        </div>
      {:else}
        <div class="mt-2 max-w-xs">
          <Label for="bp-end" class="block">Slutt (lokal tid)</Label>
          <Input id="bp-end" type="datetime-local" bind:value={endISO} />
        </div>
      {/if}
    </fieldset>
  </form>

  <div aria-live="polite" class="text-sm space-y-1">
    {#if error}
      <p class="text-red-700">{error}</p>
    {/if}
   
  </div>

  {#if results.length}
    <Table class="mt-2">
      <TableHeader>
        <TableRow>
          <TableHead class="w-[45%]">Plass</TableHead>
          <TableHead>Tilbyder</TableHead>
          <TableHead>Standard</TableHead>
          <TableHead>Elbil</TableHead>
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {#each results as r}
          <TableRow>
            <TableCell>
              <div class="font-medium">{r.spot.name}</div>
              <div class="text-xs text-gray-600">{r.spot.address}</div>
              {#if r.isPromo && currentMinutes === 60}
                <div class="text-xs text-green-600">Gratis om du handler på KIWI (1 time)</div>
              {/if}
            </TableCell>
            <TableCell>{r.spot.provider}</TableCell>
            <TableCell>{formatPriceNOK(Math.round(r.standard))}</TableCell>
            <TableCell>{formatPriceNOK(Math.round(r.ev))}</TableCell>
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
