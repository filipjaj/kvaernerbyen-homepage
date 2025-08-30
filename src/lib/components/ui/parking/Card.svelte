<script lang="ts">
  /**
   * ParkingCard
   * Accessible card for linking to a parking detail page.
   *
   * Props:
   * - entry: EntryWithSlug (required)
   */
  import type { EntryWithSlug } from "$lib/parking/utils";
  import SummaryBadges from "$lib/components/ui/parking/SummaryBadges.svelte";

  export let entry: EntryWithSlug;

  const href = `/parkering/${entry.slug}`;
</script>

<a
  class="group block overflow-hidden rounded-lg ring-1 ring-border bg-card text-card-foreground hover:ring-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
  href={href}
  aria-label={`Se detaljer for ${entry.navn}`}
>
  <div class="p-4">
    <h3 class="text-lg font-semibold tracking-tight line-clamp-2 group-hover:underline underline-offset-4">
      {entry.navn}
    </h3>
    <p class="mt-1 text-sm text-muted-foreground">
      {entry.adresse}
    </p>
    <p class="mt-1 text-xs text-muted-foreground">
      {entry.parkeringstilbyderNavn}
    </p>
    <div class="mt-3">
      <SummaryBadges {entry} />
    </div>
  </div>
</a>
