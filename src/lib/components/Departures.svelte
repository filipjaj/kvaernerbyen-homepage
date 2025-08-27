<!-- Types moved to ./departures/types.ts -->


<script lang="ts">
  import { createQuery } from '@tanstack/svelte-query';
  import { browser } from '$app/environment';
  import StatusCard from './departures/StatusCard.svelte';
  import StopSection from './departures/StopSection.svelte';
  import type { StopWrapper } from './departures/types';
  import LoadingSkeleton from './departures/LoadingSkeleton.svelte';

  /**
   * Svelte component to render upcoming departures for one or more stop places.
   * If `stops` is not provided, the component will self-fetch from `/api/entur`
   * using TanStack Query and keep data fresh via `refetchInterval`.
   */

 
  // Live clock for "in X min" calculations
  let now = $state(new Date());
  


  // Self-fetch when no `stops` are passed
  const departuresQuery = createQuery<StopWrapper[], Error>({
    queryKey: ['entur'],
    queryFn: async () => {
      const res = await fetch('/api/entur');
      if (!res.ok) throw new Error(`Failed to fetch departures: ${res.status}`);
      return res.json();
    },
    enabled: browser,
    refetchInterval: 15_000,
    refetchOnWindowFocus: true
  });


  // Choose data source: prop > fetched > empty
  const dataStops: StopWrapper[] = $derived(
    ((($departuresQuery.data as StopWrapper[] | undefined) ?? []) as StopWrapper[])
  );

  // UI and domain helpers moved to ./departures/*. Use StopSection/DepartureRow.
</script>


<div class="grid gap-4" role="list">
    {#if $departuresQuery.isLoading}
      <StatusCard label="Loading departures">
        <LoadingSkeleton sections={2} />
      </StatusCard>
    {:else if $departuresQuery.error}
      <StatusCard label="Failed to load departures">Failed to load departures: {$departuresQuery.error.message}</StatusCard>
    {/if}

  {#if !$departuresQuery.isLoading && !$departuresQuery.error && dataStops.length === 0}
    <StatusCard label="No departures">Ingen avganger akkurat nå.</StatusCard>
  {/if}

  {#each dataStops as s (s.stopPlace.name)}
    {#if s?.stopPlace?.estimatedCalls?.length}
      <StopSection stop={s.stopPlace} {now} lang="no" limit={8} />
    {/if}
  {/each}
</div>
