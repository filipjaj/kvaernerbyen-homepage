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
  const p = data.entry;

  const dayNames: Record<number, string> = {
    1: 'Mandag',
    2: 'Tirsdag',
    3: 'Onsdag',
    4: 'Torsdag',
    5: 'Fredag',
    6: 'Lørdag',
    7: 'Søndag'
  };

  function formatTime(t: string) {
    return t;
  }

  function formatDays(days?: number[]) {
    if (!days || days.length === 0) return '—';
    return days.map((d) => dayNames[d] ?? d).join(', ');
  }

  function formatCurrency(n?: number | null) {
    if (n === undefined || n === null) return '—';
    return `${n} kr`;
  }
</script>

<svelte:head>
  <title>{p.navn} – Parkering</title>
  <meta name="description" content={`Detaljer for parkering: ${p.navn}`} />
</svelte:head>

<nav aria-label="Brødsmulesti" class="mb-4">
  <a href="/parkering">← Tilbake til oversikt</a>
</nav>

<article aria-labelledby="parking-title">
  <h1 id="parking-title">{p.navn}</h1>
  <p>
    <strong>Adresse:</strong> {p.adresse}<br />
    <strong>Tilbyder:</strong> {p.parkeringstilbyderNavn}<br />
    <strong>Postnummer/Sted:</strong> {p.postnummer} {p.poststed}
  </p>

  <Table>
    <TableCaption>Detaljinformasjon</TableCaption>
    <TableBody>
      <TableRow>
        <TableHead scope="row">Parkerings-ID</TableHead>
        <TableCell>{p.id}</TableCell>
      </TableRow>
      <TableRow>
        <TableHead scope="row">Versjonsnummer</TableHead>
        <TableCell>{p.versjonsnummer}</TableCell>
      </TableRow>
      <TableRow>
        <TableHead scope="row">Koordinater</TableHead>
        <TableCell>{p.breddegrad}, {p.lengdegrad}</TableCell>
      </TableRow>
      {#if p.easyparkSone}
        <TableRow>
          <TableHead scope="row">EasyPark-sone</TableHead>
          <TableCell>{p.easyparkSone}</TableCell>
        </TableRow>
      {/if}
      {#if p.kiwi_customer_free_minutes}
        <TableRow>
          <TableHead scope="row">Kiwi-gratisminutter</TableHead>
          <TableCell>{p.kiwi_customer_free_minutes} min</TableCell>
        </TableRow>
      {/if}
      {#if p.daily_max_price}
        <TableRow>
          <TableHead scope="row">Døgnmakspris</TableHead>
          <TableCell>{formatCurrency(p.daily_max_price)}</TableCell>
        </TableRow>
      {/if}
      <TableRow>
        <TableHead scope="row">Aktiveringstidspunkt</TableHead>
        <TableCell>{p.aktiveringstidspunkt}</TableCell>
      </TableRow>
      <TableRow>
        <TableHead scope="row">Status</TableHead>
        <TableCell>{p.deaktivert ? `Deaktivert (${p.deaktivert.deaktivertTidspunkt})` : 'Aktiv'}</TableCell>
      </TableRow>
    </TableBody>
  </Table>

  {#if p.daily_max_price}
    <p><strong>Døgnmakspris:</strong> {p.daily_max_price} kr</p>
  {/if}

  {#if p.custom_prices && p.custom_prices.length}
    <section aria-labelledby="custom-prices-heading">
      <h2 id="custom-prices-heading">Tilpassede priser</h2>
      {#each p.custom_prices as rule}
        <div class="mb-4">
          <h3>{rule.label}</h3>
          {#if rule.notes}
            <p>{rule.notes}</p>
          {/if}
          {#if rule.free_minutes}
            <p><strong>Gratis minutter:</strong> {rule.free_minutes} min</p>
          {/if}
          {#if rule.applies_time}
            <p><strong>Tid:</strong> {rule.applies_time.start}–{rule.applies_time.end}</p>
          {/if}
          {#if rule.applies_days}
            <p><strong>Dager:</strong> {formatDays(rule.applies_days)}</p>
          {/if}
          {#if rule.discount_percent}
            <p><strong>Rabatt:</strong> {rule.discount_percent}%</p>
          {/if}
          {#if rule.discount_amount}
            <p><strong>Rabattbeløp:</strong> {formatCurrency(rule.discount_amount)}</p>
          {/if}

          {#if rule.tiers}
            <Table>
              <TableCaption>Pris per varighet</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead scope="col">Varighet</TableHead>
                  <TableHead scope="col">Pris</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {#each rule.tiers as tier}
                  <TableRow>
                    <TableCell>{tier.duration_hours} t</TableCell>
                    <TableCell>{tier.price} kr</TableCell>
                  </TableRow>
                {/each}
              </TableBody>
            </Table>
          {/if}
        </div>
      {/each}
    </section>
  {/if}

  {#if p.priser}
    <section aria-labelledby="base-prices-heading">
      <h2 id="base-prices-heading">Grunnpriser</h2>
      {#each p.priser as dp}
        <div class="mb-4">
          <h3>{dp.name}</h3>
          <Table>
            <TableCaption>Priser for {dp.name}</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead scope="col">Tidsrom</TableHead>
                <TableHead scope="col">Periode</TableHead>
                <TableHead scope="col">Pris</TableHead>
                <TableHead scope="col">Makspris</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {#each dp.price_list as item}
                <TableRow>
                  <TableCell>{formatTime(item.start)}–{formatTime(item.end)}</TableCell>
                  <TableCell>{item.duration_minutes} min</TableCell>
                  <TableCell>{item.price} kr</TableCell>
                  <TableCell>{item.max_price ?? '—'}</TableCell>
                </TableRow>
              {/each}
            </TableBody>
          </Table>
        </div>
      {/each}
    </section>
  {/if}
</article>
