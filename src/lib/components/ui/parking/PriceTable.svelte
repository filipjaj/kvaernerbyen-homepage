<script lang="ts">
  import type { ParkingEntry, DayPricing, PriceListItem, CustomPriceRule } from "../../../../data/parking";
  import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "$lib/components/ui/table";
  import { formatPriceNOK } from "$lib/parking/utils";

  export let entry: ParkingEntry;

  const days: Record<number, string> = {
    1: "Mandag",
    2: "Tirsdag",
    3: "Onsdag",
    4: "Torsdag",
    5: "Fredag",
    6: "Lørdag",
    7: "Søndag",
  };
</script>

{#if entry.priser && entry.priser.length}
  <div class="space-y-3">
    <h3 class="text-base font-semibold tracking-tight">Tidsbaserte priser</h3>
    <Table>
      <TableCaption>Priser kan endres. Sjekk alltid skilt og app på stedet.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead class="w-[120px]">Dag</TableHead>
          <TableHead>Tidsrom</TableHead>
          <TableHead>Varighet</TableHead>
          <TableHead class="text-right">Pris</TableHead>
          <TableHead class="text-right">Makspris</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {#each entry.priser as d}
          {#each d.price_list as pl}
            <TableRow>
              <TableCell class="font-medium">{d.name ?? days[d.day]}</TableCell>
              <TableCell>{pl.start}–{pl.end}</TableCell>
              <TableCell>{pl.duration_minutes} min</TableCell>
              <TableCell class="text-right">{formatPriceNOK(pl.price)}</TableCell>
              <TableCell class="text-right">{pl.max_price == null ? "–" : formatPriceNOK(pl.max_price)}</TableCell>
            </TableRow>
          {/each}
        {/each}
      </TableBody>
    </Table>
  </div>
{/if}

{#if entry.custom_prices && entry.custom_prices.length}
  <div class="space-y-3 mt-6">
    <h3 class="text-base font-semibold tracking-tight">Særpriser og satser</h3>
    {#each entry.custom_prices as rule}
      <div class="rounded-lg ring-1 ring-border p-4 bg-card text-card-foreground">
        <div class="flex items-center justify-between gap-3">
          <div>
            <p class="font-medium">{rule.label}</p>
            {#if rule.applies_time}
              <p class="text-sm text-muted-foreground">Gjelder {rule.applies_time.start}–{rule.applies_time.end}</p>
            {/if}
          </div>
          {#if rule.free_minutes}
            <span class="inline-flex items-center rounded-md bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground ring-1 ring-inset ring-border">{rule.free_minutes} min gratis</span>
          {/if}
        </div>

        {#if rule.tiers && rule.tiers.length}
          <div class="mt-3 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Varighet</TableHead>
                  <TableHead class="text-right">Totalpris</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {#each rule.tiers as tier}
                  <TableRow>
                    <TableCell>{tier.duration_hours} t</TableCell>
                    <TableCell class="text-right">{formatPriceNOK(tier.price)}</TableCell>
                  </TableRow>
                {/each}
              </TableBody>
            </Table>
          </div>
        {/if}

        {#if rule.notes}
          <p class="mt-2 text-sm text-muted-foreground">{rule.notes}</p>
        {/if}
      </div>
    {/each}
  </div>
{/if}
