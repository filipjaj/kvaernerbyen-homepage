<script lang="ts">
  import type { StopPlace } from './types';
  import { situationText, sortedCalls } from './utils';
  import DepartureRow from './DepartureRow.svelte';

  let { stop, now, lang = 'no', limit = 8 } = $props<{
    stop: StopPlace;
    now: Date;
    lang?: string;
    limit?: number;
  }>();
</script>

<section class="rounded-2xl border border-neutral-200/60 p-4 bg-white/60 dark:bg-neutral-900/60 dark:border-neutral-800/80 backdrop-blur-md shadow-lg" role="listitem" aria-label={`Departures for ${stop.name}`}>
  <div class="flex items-center gap-2 font-bold text-lg">
    <span>{stop.name}</span>
  </div>

  <div class="space-y-1">
    {#each sortedCalls(stop.estimatedCalls).slice(0, limit) as call (call.serviceJourney.id + call.expectedDepartureTime)}
      <DepartureRow {call} {now} {lang} />
    {/each}
  </div>

  <!-- {#if stop.situations?.length}
    <div class="mt-2 grid gap-1" aria-label="Stop notices">
      {#each situationText(stop.situations, lang) as txt}
        <details class="px-2.5 py-1.5 rounded-md bg-neutral-100/50 dark:bg-neutral-800/50"><summary>ℹ️ {txt}</summary></details>
      {/each}
    </div>
  {/if} -->
</section>
