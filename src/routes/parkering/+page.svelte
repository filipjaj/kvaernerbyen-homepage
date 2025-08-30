
<script lang="ts">
  import { Chat } from '@ai-sdk/svelte';
  import { lastAssistantMessageIsCompleteWithToolCalls } from 'ai';
  import ParkingCard from '$lib/components/ui/parking/Card.svelte';
  import BestParking from '$lib/components/ui/parking/BestParking.svelte';
  import { site } from '$lib/config';
  import type { PageData } from './$types';
  import { page } from '$app/state';

  let { data } = $props<{ data: PageData }>();
  const entries = $derived(data.entries);

  let input = $state('');

  // Chat uses /api/chat by default. Configure auto-send when all tool results are present.
  const chat = new Chat({
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls
  });

  function send(e: SubmitEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    const currentTime = new Date().toISOString();
    chat.sendMessage({ text: input + " (current time: " + currentTime + ")", metadata: { currentTime } });
    input = '';
  }

  // Helper to feed result for client-side tools
  function confirmKiwi(toolCallId: string, confirmed: boolean) {
    // Important: do NOT await addToolResult (avoids deadlocks). :contentReference[oaicite:4]{index=4}
    chat.addToolResult({
      tool: 'confirmPromo',
      toolCallId,
      output: { promoKey: 'kiwi', confirmed }
    });
  }

  const title = $derived(`Parkering i ${site.placeName} | ${site.shortName ?? site.name}`);
  const description = $derived('Oversikt over aktive parkeringsplasser, priser og regler i Kværnerbyen.');
  const canonical = $derived(`https://kvbyen.no${page.url.pathname}`);
</script>

<svelte:head>
  <title>{title}</title>
  <meta name="description" content={description} />
  <link rel="canonical" href={canonical} />
  <meta property="og:title" content={title} />
  <meta property="og:description" content={description} />
  <meta property="og:url" content={canonical} />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content={site.name} />
  <meta name="twitter:card" content="summary_large_image" />
</svelte:head>

<main class="container mx-auto px-4 py-8 space-y-10">
  <section class="space-y-4">
    <h1 class="text-2xl font-semibold tracking-tight">Parkering i {site.placeName}</h1>
    <p class="text-muted-foreground">Utforsk aktive parkeringsplasser, priser og regler.</p>
    
    <BestParking entries={entries} />
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <h2 id="other-parking-title" class="text-xl font-semibold tracking-tight mb-2 col-span-3">Alle parkeringsplasser i {site.placeName}</h2>
      {#each entries as e (e.id)}
        <ParkingCard entry={e} />
      {/each}
    </div>
  </section>


</main>
