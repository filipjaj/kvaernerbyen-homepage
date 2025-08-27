<script lang="ts">
  /**
   * StoresWidget
   * Renders a list of stores and whether they are open right now.
   * Data source: `src/data/stores/`. Uses local time (browser) for status.
   */
  import { onMount } from 'svelte';
  import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '$lib/components/ui/table';
  import { CheckCircle, XCircle, Clock } from 'lucide-svelte';
  import { getStores } from '../../../data/stores';
  import type { Store } from '../../../data/stores/schema';

  let { title = 'Butikker' } = $props<{ title?: string }>();

  const stores: Store[] = getStores();

  // Keep current time for comparisons (reactive in Svelte 5 runes mode)
  let now = $state(new Date());
  onMount(() => {
    const id = setInterval(() => {
      now = new Date();
    }, 60_000);
    return () => clearInterval(id);
  });

  const dayNames = ['Søndag', 'Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lørdag'] as const;

  function parseHHMM(t?: string): number | null {
    if (!t) return null;
    const [hh, mm] = t.split(':').map(Number);
    if (Number.isNaN(hh) || Number.isNaN(mm)) return null;
    return hh * 60 + mm;
  }

  function minutesSinceMidnight(d: Date): number {
    return d.getHours() * 60 + d.getMinutes();
  }

  function todayName(d: Date): string {
    return dayNames[d.getDay()];
  }

  type OpenInfo = { openNow: boolean; open?: string; close?: string; closedToday: boolean };

  function getOpenInfo(store: Store, at: Date): OpenInfo {
    const today = todayName(at);
    const entry = store.openingHours.find((e) => e.day === today);
    if (!entry) return { openNow: false, closedToday: true };
    if (entry.closed) return { openNow: false, closedToday: true };

    const openMin = parseHHMM(entry.open);
    const closeMin = parseHHMM(entry.close);
    if (openMin == null || closeMin == null) return { openNow: false, closedToday: true };

    const nowMin = minutesSinceMidnight(at);
    const openNow = nowMin >= openMin && nowMin < closeMin;
    return { openNow, open: entry.open, close: entry.close, closedToday: false };
  }
</script>

<section aria-labelledby="stores-title" class="w-full max-w-md">
  <h2 id="stores-title" class="text-base font-semibold mb-2">{title}</h2>
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead class="w-2/3">Butikk</TableHead>
        <TableHead class="w-1/3 text-right">Status</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {#each stores as s}
        {@const info = getOpenInfo(s, now)}
        <TableRow>
          <TableCell>
            <div class="flex flex-col">
              <span class="font-medium">{s.name}</span>
              <span class="text-xs text-neutral-500 flex items-center gap-1 mt-0.5">
                <Clock class="h-3.5 w-3.5 text-neutral-500" aria-hidden="true" />
                {#if info.closedToday}
                  Stengt i dag
                {:else}
                  {info.open}–{info.close}
                {/if}
              </span>
            </div>
          </TableCell>
          <TableCell class="text-right">
            {#if info.openNow}
              <span class="inline-flex items-center gap-1 text-emerald-600 font-medium">
                <CheckCircle class="h-4 w-4" aria-hidden="true" />
                Åpent nå
              </span>
            {:else}
              <span class="inline-flex items-center gap-1 text-red-600 font-medium">
                <XCircle class="h-4 w-4" aria-hidden="true" />
                Stengt
              </span>
            {/if}
          </TableCell>
        </TableRow>
      {/each}
    </TableBody>
  </Table>
</section>
