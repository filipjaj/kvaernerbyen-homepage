<script lang="ts">
  /**
   * BikeStation
   * Shows city bike availability for the configured station.
   * Fetches from /api/entur/mobility/bikes and re-fetches every 15s.
   */
  import { createQuery } from '@tanstack/svelte-query';
  import { browser } from '$app/environment';
  import { site } from '$lib/config';

  type BikeRentalStation = {
    id: string;
    spacesAvailable: number;
    realtimeOccupancyAvailable: boolean;
    bikesAvailable: number;
    name: string;
  };
  type ApiResponse = { bikeRentalStation: BikeRentalStation };

  const bikesQuery = createQuery<ApiResponse, Error>({
    queryKey: ['bysykkel', site.mobility.bysykkel.id],
    queryFn: async () => {
      const res = await fetch('/api/entur/mobility/bikes');
      if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
      return res.json();
    },
    enabled: browser,
    refetchInterval: 15_000,
    refetchOnWindowFocus: true
  });

  const station = $derived($bikesQuery.data?.bikeRentalStation);
</script>

<section
  class="rounded-2xl border border-neutral-200/60 p-4 bg-white/60 dark:bg-neutral-900/60 dark:border-neutral-800/80 backdrop-blur-md shadow-lg"
  aria-label="Bysykkel availability"
>
  {#if $bikesQuery.isLoading}
    <div class="flex items-center justify-between gap-4 py-2" role="status" aria-live="polite">
      <div class="h-8 w-40 bg-neutral-200/70 dark:bg-neutral-800/70 rounded animate-pulse" aria-hidden="true"></div>
      <div class="h-8 w-24 bg-neutral-200/70 dark:bg-neutral-800/70 rounded animate-pulse" aria-hidden="true"></div>
    </div>
  {:else if $bikesQuery.error}
    <div class="text-sm text-red-600">Feil ved henting av bysykkel: {$bikesQuery.error.message}</div>
  {:else if !station}
    <div class="text-sm opacity-80">Ingen data tilgjengelig.</div>
  {:else}
    <div class="flex items-center justify-between gap-4">
      <div class="min-w-0">
        <div class="text-sm opacity-80">Stasjon</div>
        <div class="font-medium truncate">{station.name}</div>
        <!-- <div class="text-xs opacity-60 mt-1">
          {station.realtimeOccupancyAvailable ? 'Sanntid' : 'Ikke sanntid'}
        </div> -->
      </div>
      <div class="flex items-center gap-6">
        <div class="text-right">
          <div class="text-xs opacity-70">Sykler ledig</div>
          <div class="text-xl font-semibold tabular-nums">{station.bikesAvailable}</div>
        </div>
        <div class="text-right">
          <div class="text-xs opacity-70">Plasser ledig</div>
          <div class="text-xl font-semibold tabular-nums">{station.spacesAvailable}</div>
        </div>
      </div>
    </div>
  {/if}
</section>
