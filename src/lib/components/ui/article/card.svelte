<script lang="ts">
  /**
   * ArticleCard
   * Accessible card for linking to an article.
   *
   * Props:
   * - href: string (required) – destination route
   * - title: string (required)
   * - description?: string
   * - image?: string (absolute or relative URL)
   * - date?: string (ISO 8601)
   */
  export let href: string;
  export let title: string;
  export let description: string | undefined = undefined;
  export let image: string | undefined = undefined;
  export let date: string | undefined = undefined;
</script>

<a
  class="group block overflow-hidden rounded-lg ring-1 ring-border bg-card text-card-foreground hover:ring-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
  href={href}
  aria-label={title}
>
  <div class="relative aspect-[16/9] bg-muted">
    {#if image}
      <img
        src={image}
        alt={title}
        class="absolute inset-0 h-full w-full object-cover"
        loading="lazy"
        decoding="async"
      />
    {/if}
  </div>
  <div class="p-4">
    <h3 class="text-lg font-semibold tracking-tight line-clamp-2 group-hover:underline underline-offset-4">
      {title}
    </h3>
    {#if description}
      <p class="mt-2 text-sm text-muted-foreground line-clamp-3">{description}</p>
    {/if}
    {#if date}
      <time class="mt-3 block text-xs text-muted-foreground" datetime={date}>
        {new Date(date).toLocaleDateString('nb-NO', { year: 'numeric', month: 'long', day: 'numeric' })}
      </time>
    {/if}
  </div>
</a>
