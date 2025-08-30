<script lang="ts">
  import type { ParkingEntry } from "../../../../data/parking";

  export let entry: ParkingEntry;

  const mapHref = `https://www.google.com/maps/search/?api=1&query=${entry.breddegrad},${entry.lengdegrad}`;
</script>

<div class="rounded-lg ring-1 ring-border p-4 bg-card text-card-foreground">
  <dl class="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
    <div>
      <dt class="text-sm text-muted-foreground">Tilbyder</dt>
      <dd class="font-medium">{entry.parkeringstilbyderNavn}</dd>
    </div>
    <div>
      <dt class="text-sm text-muted-foreground">Adresse</dt>
      <dd class="font-medium">{entry.adresse}</dd>
    </div>
    {#if entry.easyparkSone}
      <div>
        <dt class="text-sm text-muted-foreground">EasyPark sone</dt>
        <dd class="font-medium">{entry.easyparkSone}</dd>
      </div>
    {/if}
    <div>
      <dt class="text-sm text-muted-foreground">Poststed</dt>
      <dd class="font-medium">{entry.postnummer} {entry.poststed}</dd>
    </div>
    <div>
      <dt class="text-sm text-muted-foreground">Aktivert</dt>
      <dd class="font-medium">{new Date(entry.aktiveringstidspunkt).toLocaleDateString('nb-NO')}</dd>
    </div>
  </dl>
  <div class="mt-4">
    <a
      href={mapHref}
      target="_blank"
      rel="noopener noreferrer"
      class="inline-flex items-center rounded-md bg-secondary px-3 py-1.5 text-sm font-medium text-secondary-foreground ring-1 ring-inset ring-border hover:ring-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      aria-label="Åpne i kart"
    >
      Åpne i kart
    </a>
  </div>
</div>
