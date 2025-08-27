<script lang="ts">
  import type { EstimatedCall } from './types';
  import { delayMin, minutesDiff, parseISO, safeHex, situationText } from './utils';

  let { call, now, lang = 'no' } = $props<{ call: EstimatedCall; now: Date; lang?: string }>();

  const fmt = new Intl.DateTimeFormat('nb-NO', {
    hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Oslo'
  });
</script>

<div class="grid grid-cols-[auto_1fr_auto_auto] gap-3 items-center py-2 px-1 rounded-xl hover:bg-neutral-100/60 dark:hover:bg-neutral-800/60">
  {#if call.serviceJourney?.line}
    {@const bg = safeHex(call.serviceJourney.line.presentation?.colour)}
    {@const fg = safeHex(call.serviceJourney.line.presentation?.textColour) || '#FFFFFF'}
    <span class="inline-flex items-center justify-center min-w-[2.25rem]  rounded-sm px-2 py-1 font-extrabold tracking-wide" style={`background:${bg ?? 'var(--line, #222)'}; color:${fg}`}
      aria-label={`Line ${call.serviceJourney.line.publicCode ?? ''}`}>
      {call.serviceJourney.line.publicCode ?? '—'}
    </span>
  {/if}

  <div>
    <div class="font-semibold">{call.destinationDisplay?.frontText}</div>
    <div class="text-sm opacity-70">
      {call.quay?.name && call.quay.name.trim().length ? call.quay.name : '—'}
      {#if call.destinationDisplay?.via?.length}
        · via {call.destinationDisplay.via.join(', ')}
      {/if}
    </div>

    <!-- {#if call.situations && call.situations.length}
      <div class="mt-2 grid gap-1">
        {#each situationText(call.situations, lang) as txt}
          <details class="px-2.5 py-1.5 rounded-md bg-neutral-100/50 dark:bg-neutral-800/50">
            <summary>⚠️ {txt}</summary>
          </details>
        {/each}
      </div>
    {/if} -->
  </div>

  <div class="tabular-nums font-semibold" aria-label="Expected time">
    {fmt.format(parseISO(call.expectedDepartureTime))}
    {#if call.realtime}
    <span class="inline-block w-2 h-2 rounded-full animate-pulse ml-1.5  bg-green-600"></span>
    {/if}
  </div>

  <div class="text-right">
    {#if !call.cancellation}
      {@const mins = minutesDiff(parseISO(call.expectedDepartureTime), now)}
      <div class="tabular-nums font-bold" aria-live="polite">{mins <= 0 ? 'now' : `${mins} min`}</div>
      {@const d = delayMin(call)}
      {#if d !== 0}
        <div class="text-sm opacity-70" aria-label="Delay">{d > 0 ? `+${d}` : d} min</div>
      {/if}
    {:else}
      <div class="text-xs px-1.5 py-0.5 rounded-md border" title="Cancelled">Cancelled</div>
    {/if}
  </div>
</div>
