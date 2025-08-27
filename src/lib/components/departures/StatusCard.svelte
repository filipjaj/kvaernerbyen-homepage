<script lang="ts">
  let { label, children } = $props<{ label: string; children?: () => any }>();
</script>

<section
  class="rounded-2xl border border-neutral-200/60 p-4 bg-white/60 dark:bg-neutral-900/60 dark:border-neutral-800/80 backdrop-blur-md shadow-lg"
  role="listitem"
  aria-label={label}
>
  {@render children?.()}
</section>
