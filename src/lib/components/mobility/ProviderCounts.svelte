<script lang="ts">
  /**
   * ProviderCounts
   * Shows micromobility provider availability as brand logo + "N stk i {placeName}".
   * Fetches data from /api/entur/mobility?counts=true and re-fetches every 15s.
   * Props:
   *  - placeName?: string (default: "Kværnerbyen")
   */
  import { createQuery } from '@tanstack/svelte-query';
  import { browser } from '$app/environment';
  import { getBrandFor } from './brands';
  import { site } from '$lib/config';

  let { placeName = site.placeName } = $props<{ placeName?: string }>();

  type CountsMap = Record<string, number>;

  const countsQuery = createQuery<CountsMap, Error>({
    queryKey: ['mobility-counts'],
    queryFn: async () => {
      const res = await fetch('/api/entur/mobility?counts=true');
      if (!res.ok) throw new Error(`Failed to fetch counts: ${res.status}`);
      return res.json();
    },
    enabled: browser,
    refetchInterval: 15_000,
    refetchOnWindowFocus: true
  });

  type Item = { key: string; count: number; display: string; logo: string };
  const items = $derived(
    Object.entries($countsQuery.data ?? {})
      .map(([key, count]) => {
        const brand = getBrandFor(key);
        return { key, count, display: brand.display, logo: brand.logo } as Item;
      })
      .sort((a, b) => b.count - a.count)
  );
</script>

<section
  class="rounded-2xl border border-neutral-200/60 p-4 bg-white/60 dark:bg-neutral-900/60 dark:border-neutral-800/80 backdrop-blur-md shadow-lg"
  aria-label="Micromobility provider availability"
>
  {#if $countsQuery.isLoading}
    <div class="grid gap-4" role="status" aria-live="polite">
      {#each Array(3) as _, i}
        <div class="flex items-center gap-4 py-3">
          <div class="h-8 w-20 bg-neutral-200/70 dark:bg-neutral-800/70 rounded animate-pulse" aria-hidden="true"></div>
          <div class="h-6 w-56 bg-neutral-200/70 dark:bg-neutral-800/70 rounded animate-pulse" aria-hidden="true"></div>
        </div>
      {/each}
    </div>
  {:else if $countsQuery.error}
    <div class="text-sm text-red-600">Feil ved henting av mikromobilitet: {$countsQuery.error.message}</div>
  {:else if items.length === 0}
    <div class="text-sm opacity-80">Ingen tilgjengelige kjøretøy akkurat nå.</div>
  {:else}
    <ul class="divide-y divide-neutral-200/60 dark:divide-neutral-800/80" role="list">
      {#each items as item (item.key)}
        <li class="flex items-center justify-between py-3 gap-3" role="listitem" aria-label={`${item.display}: ${item.count} i ${placeName}`}>
          <div class="flex items-center gap-4 min-w-0">
            {#if item.logo}
              <img src={item.logo} alt={`${item.display} logo`} class="w-10 h-auto object-contain" />
            {/if}
            <span class="sr-only">{item.display}</span>
          </div>
          <div class="text-base sm:text-lg">
            <span class="font-semibold tabular-nums">{item.count} stk</span>
            <span class="font-normal"> i {placeName}</span>
          </div>
        </li>
      {/each}
    </ul>
  {/if}
</section>
