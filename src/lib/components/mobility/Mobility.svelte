<script lang="ts">
  import { createQuery } from '@tanstack/svelte-query';
  import { browser } from '$app/environment';
  import StatusCard from '../departures/StatusCard.svelte';
  import LoadingSkeleton from '../departures/LoadingSkeleton.svelte';
  import VehicleRow from './VehicleRow.svelte';
  import type { Vehicle, VehicleResponse } from './types';

  let { lang = 'no', limit = 20 } = $props<{ lang?: string; limit?: number }>();

  const vehiclesQuery = createQuery<VehicleResponse[], Error>({
    queryKey: ['mobility'],
    queryFn: async () => {
      const res = await fetch('/api/entur/mobility');
      if (!res.ok) throw new Error(`Failed to fetch mobility: ${res.status}`);
      return res.json();
    },
    enabled: browser,
    refetchInterval: 15_000,
    refetchOnWindowFocus: true
  });

  const vehicles = $derived($vehiclesQuery.data);
</script>

<div class="grid gap-4" role="list">
  {#if $vehiclesQuery.isLoading}
    <StatusCard label="Laster mikromobilitet">
      <LoadingSkeleton sections={1} rows={limit} />
    </StatusCard>
  {:else if $vehiclesQuery.error}
    <StatusCard label="Feil ved henting av mikromobilitet">Failed to load vehicles: {$vehiclesQuery.error.message}</StatusCard>
  {/if}

  {#if !$vehiclesQuery.isLoading && !$vehiclesQuery.error && vehicles?.length === 0}
    <StatusCard label="Ingen tilgjengelige">Ingen tilgjengelige kjøretøy akkurat nå.</StatusCard>
  {/if}

  {#if vehicles && vehicles?.length}
    <section class="rounded-2xl border border-neutral-200/60 p-4 bg-white/60 dark:bg-neutral-900/60 dark:border-neutral-800/80 backdrop-blur-md shadow-lg" role="listitem" aria-label="Micromobility">
      <header class="mb-2">
        <h3 class="font-semibold">Elsparkesykler i nærheten</h3>
      </header>
      <ul class="divide-y divide-neutral-200/60 dark:divide-neutral-800/80">
        {#each vehicles as v (v.id)}
          <VehicleRow vehicle={v} {lang} />
        {/each}
      </ul>
    </section>
  {/if}
</div>
