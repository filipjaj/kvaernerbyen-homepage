<script lang="ts">
  import type { PageData } from './$types';
  import Table from '$lib/components/ui/table/table.svelte';
  import TableHeader from '$lib/components/ui/table/table-header.svelte';
  import TableHead from '$lib/components/ui/table/table-head.svelte';
  import TableBody from '$lib/components/ui/table/table-body.svelte';
  import TableRow from '$lib/components/ui/table/table-row.svelte';
  import TableCell from '$lib/components/ui/table/table-cell.svelte';
  import TableCaption from '$lib/components/ui/table/table-caption.svelte';

  export let data: PageData;
  const list = data.parking;

  function getFromPrice(p: any): number | null {
    let prices: number[] = [];
    // Fra tiers i custom_prices
    if (p.custom_prices) {
      for (const rule of p.custom_prices) {
        if (rule.tiers) {
          for (const t of rule.tiers) {
            if (typeof t.price === 'number') prices.push(t.price);
          }
        }
      }
    }
    // Fra grunnpriser (per periode)
    if (p.priser) {
      for (const dp of p.priser) {
        for (const item of dp.price_list) {
          if (typeof item.price === 'number') prices.push(item.price);
        }
      }
    }
    if (prices.length === 0) return null;
    return Math.min(...prices);
  }

  function formatCurrency(n: number | null): string {
    if (n === null) return '—';
    return `${n} kr`;
  }
</script>

<svelte:head>
  <title>Parkering</title>
  <meta name="description" content="Oversikt over parkeringsplasser i Kværnerbyen" />
</svelte:head>

<section aria-labelledby="parkering-heading">
  <h1 id="parkering-heading">Parkering</h1>

  <Table>
    <TableCaption>Oversikt over tilgjengelige parkeringsplasser</TableCaption>
    <TableHeader>
      <TableRow>
        <TableHead scope="col">Navn</TableHead>
        <TableHead scope="col">Adresse</TableHead>
        <TableHead scope="col">Tilbyder</TableHead>
        <TableHead scope="col">Fra</TableHead>
        <TableHead scope="col">Døgnmaks</TableHead>
        <TableHead scope="col">Detaljer</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {#each list as p}
        <TableRow>
          <TableCell>{p.navn}</TableCell>
          <TableCell>{p.adresse}</TableCell>
          <TableCell>{p.parkeringstilbyderNavn}</TableCell>
          <TableCell>{formatCurrency(getFromPrice(p))}</TableCell>
          <TableCell>{p.daily_max_price ? `${p.daily_max_price} kr` : '—'}</TableCell>
          <TableCell>
            <a href={`/parkering/${p.id}`} aria-label={`Se detaljer for ${p.navn}`} data-sveltekit-preload-data>
              Se detaljer
            </a>
          </TableCell>
        </TableRow>
      {/each}
    </TableBody>
  </Table>
</section>
