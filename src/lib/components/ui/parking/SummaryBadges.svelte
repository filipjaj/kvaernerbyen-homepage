<script lang="ts">
  import type { ParkingEntry } from "../../../../data/parking";
  import { formatPriceNOK } from "$lib/parking/utils";

  export let entry: ParkingEntry;

  $: badges = (() => {
    const b: { label: string }[] = [];
    if (entry.daily_max_price) b.push({ label: `Dagsmaks ${formatPriceNOK(entry.daily_max_price)}` });
    if (entry.easyparkSone) b.push({ label: `EasyPark sone ${entry.easyparkSone}` });

    const free = entry.kiwi_customer_free_minutes ?? entry.custom_prices?.find((r) => r.free_minutes)?.free_minutes;
    if (free) b.push({ label: `${free} min gratis for Kiwi-kunder` });

    if (entry.deaktivert) b.push({ label: "Midlertidig deaktivert" });
    return b;
  })();
</script>

<div class="flex flex-wrap gap-2">
  {#each badges as b}
    <span class="inline-flex items-center rounded-md bg-muted px-2 py-1 text-xs font-medium text-muted-foreground ring-1 ring-inset ring-border">
      {b.label}
    </span>
  {/each}
</div>
