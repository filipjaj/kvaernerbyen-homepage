
<script lang="ts">
  import { Chat } from '@ai-sdk/svelte';
  import { lastAssistantMessageIsCompleteWithToolCalls } from 'ai';
  import ParkingCard from '$lib/components/ui/parking/Card.svelte';
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
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {#each entries as e (e.id)}
        <ParkingCard entry={e} />
      {/each}
    </div>
  </section>

  <section class="max-w-screen-sm space-y-4">
    <h2 class="text-xl font-semibold">Parking assistant</h2>

    <!-- Messages -->
    {#each chat.messages as message, mi (message.id)}
      <div class="rounded border p-3">
        <div class="text-xs text-gray-500 mb-1">{message.role}</div>

        {#each message.parts as part, pi (`${message.id}-${pi}`)}
          {#if part.type === 'text'}
            <div class="whitespace-pre-wrap">{part.text}</div>
          {/if}

          {#if part.type === 'tool-confirmPromo'}
            {#if part.state === 'input-streaming'}
              <div>Checking promotion…</div>
            {:else if part.state === 'input-available'}
              {@const input = part.input as { question: string }}
              <div class="flex items-center gap-2">
                <div>{input.question}</div>
                <button class="px-2 py-1 border rounded" onclick={() => confirmKiwi(part.toolCallId, true)}>Yes</button>
                <button class="px-2 py-1 border rounded" onclick={() => confirmKiwi(part.toolCallId, false)}>No</button>
              </div>
            {:else if part.state === 'output-available'}
              {@const output = part.output as { promoKey: string, confirmed: boolean }}
              <div>Promotion {output.promoKey}: {output.confirmed ? 'confirmed' : 'declined'}</div>
            {:else if part.state === 'output-error'}
              <div class="text-red-600">Promo error: {part.errorText}</div>
            {/if}
          {/if}

          {#if part.type === 'tool-rankParking'}
            {#if part.state === 'input-streaming'}
              <div>Computing the best parking…</div>
            {:else if part.state === 'input-available'}
              {@const input = part.input as { durationMinutes: number, vehicle: string }}
              <div class="text-xs text-gray-600">
                ⏱️ {input.durationMinutes} min · 🚗 {input.vehicle}
              </div>
            {:else if part.state === 'output-available'}
              {@const out = part.output as { meta: { startISO: string, durationMinutes: number, vehicle: string, usedPromos?: string[] } }}
              <div class="text-xs text-gray-600 mb-2">
                Start: {new Date(out.meta.startISO).toLocaleString()} · Duration: {out.meta.durationMinutes} min · Vehicle: {out.meta.vehicle}
                {#if out.meta.usedPromos?.length} · Promos: {out.meta.usedPromos.join(', ')}{/if}
              </div>
              <div class="overflow-x-auto">
                <table class="w-full text-sm border-collapse">
                  <thead>
                    <tr class="text-left border-b">
                      <th class="py-1">Spot</th>
                      <th class="py-1">Provider</th>
                      <th class="py-1">Price</th>
                      <th class="py-1">Walk</th>
                    </tr>
                  </thead>
                  <tbody>
                    {#each (part.output as { results: { id: string, name: string, address: string, provider: string, price: number, walkingMinutes: number | null }[] }).results as r (r.id)}
                      <tr class="border-b last:border-b-0">
                        <td class="py-1">
                          <div class="font-medium">{r.name}</div>
                          <div class="text-xs text-gray-600">{r.address}</div>
                        </td>
                        <td class="py-1">{r.provider}</td>
                        <td class="py-1">{r.price.toLocaleString('no-NO')} NOK</td>
                        <td class="py-1">{r.walkingMinutes != null ? Math.round(r.walkingMinutes) + ' min' : '—'}</td>
                      </tr>
                    {/each}
                  </tbody>
                </table>
              </div>
            {:else if part.state === 'output-error'}
              <div class="text-red-600">Error ranking parking: {part.errorText}</div>
            {/if}
          {/if}
        {/each}
      </div>
    {/each}

    <!-- Input -->
    <form class="flex gap-2" onsubmit={send}>
      <input
        class="flex-1 border rounded px-3 py-2"
        placeholder="e.g. EV, 120 min, today 10:00 near 59.9049, 10.7870"
        bind:value={input}
      />
      <button class="px-3 py-2 border rounded" type="submit">Send</button>
    </form>
  </section>
</main>
