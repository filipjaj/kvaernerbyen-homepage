<script lang="ts">
  import { page } from '$app/state';
  import { site } from '$lib/config';
  import SummaryBadges from '$lib/components/ui/parking/SummaryBadges.svelte';
  import Meta from '$lib/components/ui/parking/Meta.svelte';
  import PriceTable from '$lib/components/ui/parking/PriceTable.svelte';
  import PriceCalculator from '$lib/components/ui/parking/PriceCalculator.svelte';
  import type { ParkingEntry } from '../../../data/parking';

  type Data = { entry: ParkingEntry; slug: string };
  let { data } = $props<{ data: Data }>();
  const entry = $derived(data.entry);

  const title = $derived(`${entry.navn} – ${entry.adresse} | ${site.shortName ?? site.name}`);
  const description = $derived(`Priser, regler og informasjon for parkering ved ${entry.navn} (${entry.adresse}).`);
  const canonical = $derived(`https://kvbyen.no${page.url.pathname}`);
</script>

<svelte:head>
  <title>{title}</title>
  <meta name="description" content={description} />
  <link rel="canonical" href={canonical} />
  <meta property="og:title" content={title} />
  <meta property="og:description" content={description} />
  <meta property="og:url" content={canonical} />
  <meta property="og:type" content="article" />
  <meta property="og:site_name" content={site.name} />
  <meta name="twitter:card" content="summary_large_image" />
</svelte:head>

<main class="container mx-auto px-4 py-8">
  <header class="mb-6">
    <h1 class="text-2xl font-semibold tracking-tight">{entry.navn}</h1>
    <p class="text-muted-foreground">{entry.adresse}</p>
    <div class="mt-4">
      <PriceCalculator {entry} />
    </div>
    <div class="mt-3">
      <SummaryBadges {entry} />
    </div>
  </header>

  <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <section class="lg:col-span-2 space-y-6">
      <PriceTable {entry} />
    </section>
    <aside class="lg:col-span-1 space-y-4">
      <Meta {entry} />
    </aside>
  </div>
</main>
