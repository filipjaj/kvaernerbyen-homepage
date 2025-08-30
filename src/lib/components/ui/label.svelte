<script lang="ts">
  /**
   * Label.svelte
   * shadcn-style label component using Tailwind tokens and Svelte runes.
   */
  import type { HTMLLabelAttributes } from "svelte/elements";
  import { cn, type WithElementRef } from "$lib/utils.js";

  let {
    ref = $bindable<HTMLLabelElement | null>(null),
    class: className,
    children,
    ...restProps
  }: WithElementRef<HTMLLabelAttributes> = $props();
</script>

<label
  bind:this={ref}
  class={cn(
    "text-sm font-medium leading-none",
    "peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
    className
  )}
  {...restProps}
>
  {@render children?.()}
</label>
