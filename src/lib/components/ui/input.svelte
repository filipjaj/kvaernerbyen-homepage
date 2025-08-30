<script lang="ts">
  /**
   * Input.svelte
   * Minimal shadcn-style input using Tailwind tokens.
   * - Svelte runes: $props, $bindable for value and ref.
   * - Forwards all standard input attributes.
   */
  import type { HTMLInputAttributes } from "svelte/elements";
  import { cn, type WithElementRef } from "$lib/utils.js";

  let {
    ref = $bindable<HTMLInputElement | null>(null),
    class: className,
    value = $bindable<string | number | undefined>(undefined),
    type = "text",
    // children not used for input; keep for API symmetry if passed
    children,
    ...restProps
  }: WithElementRef<HTMLInputAttributes> = $props();
</script>

<input
  bind:this={ref}
  class={cn(
    "flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm",
    "ring-offset-background placeholder:text-muted-foreground",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
    "disabled:cursor-not-allowed disabled:opacity-50",
    className
  )}
  bind:value
  type={type}
  {...restProps}
/>
