<script lang="ts">
  import type { VehicleResponse } from './types';
  import { pickTranslation, formatKm, formatPercent } from './utils';

  let { vehicle, lang = 'no' } = $props<{ vehicle: VehicleResponse; lang?: string }>();

  
  const typeName = $derived(pickTranslation(vehicle.vehicleType, lang) || '');
  const percent = $derived(formatPercent(vehicle.currentFuelPercent));
  const rangeText = $derived(formatKm(vehicle.currentRangeMeters));
  const iconUrl = $derived(vehicle.iconUrl ?? '');
  const deeplink = $derived(vehicle.rentalUris?.web ?? vehicle.rentalUris?.ios ?? '');
</script>

<li class="flex items-center justify-between py-2" role="listitem" aria-label={`Vehicle ${vehicle.operator} ${typeName}`}>
  <div class="flex items-center gap-3 min-w-0">
    {#if iconUrl}
      <img src={iconUrl} alt="" class="h-6 w-6 object-contain" aria-hidden="true" />
    {/if}
    <div class="truncate">
      <div class="font-medium truncate">{vehicle.name || '—'}</div>
     
    </div>
  </div>

  <div class="flex items-center gap-4 whitespace-nowrap">
    {#if percent}
      <div class="text-sm tabular-nums" aria-label="Battery level">{percent}</div>
    {/if}
    {#if rangeText}
      <div class="text-sm tabular-nums opacity-80" aria-label="Range">{rangeText}</div>
    {/if}
    {#if deeplink}
      <a class="text-sm font-medium text-blue-600 hover:underline" href={deeplink} rel="noopener noreferrer">Åpne</a>
    {/if}
  </div>
</li>
