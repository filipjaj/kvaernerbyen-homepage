<script lang="ts">
  /**
   * PriceCalculator
   * Enkel pris-kalkulator for en spesifikk parkeringsplass.
   * - Inputs: start (standard = nå), enten varighet (timer) eller sluttid.
   * - Output: estimert totalpris for Standard og Elbil.
   *
   * Merk: Dette er et estimat basert på oppførte satser/regler. Sjekk alltid skilt/app på stedet.
   */
  import type { ParkingEntry } from '../../../../data/parking';
  import { normalizeRawParking } from '$lib/parking-normalize';
  import { computeSpotCost } from '$lib/parking-calculator';
  import { formatPriceNOK, formatMinutes } from '$lib/parking/utils';

  let { entry } = $props<{ entry: ParkingEntry }>();

  const spot = $derived(normalizeRawParking([entry])[0]);

  type Mode = 'duration' | 'end';
  let mode = $state<Mode>('duration');

  function toLocalInputValue(date: Date) {
    const pad = (n: number) => String(n).padStart(2, '0');
    const y = date.getFullYear();
    const m = pad(date.getMonth() + 1);
    const d = pad(date.getDate());
    const hh = pad(date.getHours());
    const mm = pad(date.getMinutes());
    return `${y}-${m}-${d}T${hh}:${mm}`;
  }

  function parseLocal(iso: string): Date {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) throw new Error('Ugyldig dato/tid');
    return d;
  }

  // Form state
  let startISO = $state<string>(toLocalInputValue(new Date()));
  let durationHours = $state<number>(1); // i timer
  let endISO = $state<string>(toLocalInputValue(new Date(Date.now() + 60 * 60000)));

  // Derived state
  let error = $state<string | null>(null);
  let durationMinutes = $state<number>(60);
  let standardTotal = $state<number | null>(null);
  let evTotal = $state<number | null>(null);

  $effect(() => {
    try {
      error = null;
      const start = parseLocal(startISO);

      let mins = 0;
      if (mode === 'duration') {
        const h = Number(durationHours);
        mins = Math.max(0, Math.ceil(h * 60));
      } else {
        const end = parseLocal(endISO);
        mins = Math.max(0, Math.ceil((end.getTime() - start.getTime()) / 60000));
        if (mins <= 0) {
          error = 'Sluttid må være etter starttid';
        }
      }

      durationMinutes = mins;

      if (spot && mins > 0) {
        const std = computeSpotCost(spot, start, mins, 'standard', []);
        const ev = computeSpotCost(spot, start, mins, 'ev', []);
        standardTotal = Math.round(std.total);
        evTotal = Math.round(ev.total);
      } else {
        standardTotal = null;
        evTotal = null;
      }
    } catch (e: any) {
      error = e?.message ?? 'Ukjent feil';
      standardTotal = null;
      evTotal = null;
    }
  });
</script>

<div class="rounded-lg ring-1 ring-border p-4 bg-card text-card-foreground space-y-4">
  <h2 class="text-base font-semibold tracking-tight">Pris-kalkulator</h2>

  <form class="grid gap-4 md:grid-cols-3" onsubmit={(e) => e.preventDefault()}>
    <div class="md:col-span-1">
      <label for="start" class="block text-sm font-medium">Start</label>
      <input
        id="start"
        class="w-full rounded-md border border-border bg-background px-3 py-2 text-foreground"
        type="datetime-local"
        bind:value={startISO}
        required
      />
    </div>

    <fieldset class="md:col-span-2">
      <legend class="block text-sm font-medium">Varighet</legend>
      <div class="mt-1 flex flex-wrap items-center gap-4">
        <label class="inline-flex items-center gap-2">
          <input type="radio" name="mode" value="duration" bind:group={mode} />
          <span>Timer</span>
        </label>
        <label class="inline-flex items-center gap-2">
          <input type="radio" name="mode" value="end" bind:group={mode} />
          <span>Sluttid</span>
        </label>
      </div>

      {#if mode === 'duration'}
        <div class="mt-2 grid grid-cols-[auto_1fr] items-center gap-2">
          <label for="hours" class="text-sm text-muted-foreground">Antall timer</label>
          <input
            id="hours"
            class="w-full rounded-md border border-border bg-background px-3 py-2 text-foreground"
            type="number"
            min="0.25"
            step="0.25"
            bind:value={durationHours}
            aria-describedby="hours-help"
          />
          <p id="hours-help" class="col-span-2 text-xs text-muted-foreground">Du kan bruke desimaler (f.eks. 1.5 = 1 time 30 min).</p>
        </div>
      {:else}
        <div class="mt-2 grid grid-cols-[auto_1fr] items-center gap-2">
          <label for="end" class="text-sm text-muted-foreground">Slutt</label>
          <input
            id="end"
            class="w-full rounded-md border border-border bg-background px-3 py-2 text-foreground"
            type="datetime-local"
            bind:value={endISO}
            required
          />
        </div>
      {/if}
    </fieldset>
  </form>

  <div class="text-xs text-muted-foreground">Estimat. Sjekk alltid skilt/app for gjeldende priser.</div>

  <div aria-live="polite" class="space-y-3">
    {#if error}
      <p role="alert" class="text-sm text-destructive">{error}</p>
    {/if}

    {#if !error && durationMinutes > 0}
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div class="rounded-md ring-1 ring-border p-3 flex items-center justify-between">
          <div>
            <div class="text-sm text-muted-foreground">Standard</div>
            <div class="text-xs text-muted-foreground">for {formatMinutes(durationMinutes)}</div>
          </div>
          <div class="text-lg font-semibold">{standardTotal != null ? formatPriceNOK(standardTotal) : '–'}</div>
        </div>
        <div class="rounded-md ring-1 ring-border p-3 flex items-center justify-between">
          <div>
            <div class="text-sm text-muted-foreground">Elbil</div>
            <div class="text-xs text-muted-foreground">for {formatMinutes(durationMinutes)}</div>
          </div>
          <div class="text-lg font-semibold">{evTotal != null ? formatPriceNOK(evTotal) : '–'}</div>
        </div>
      </div>
    {/if}
  </div>
</div>
