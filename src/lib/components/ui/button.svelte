<script lang="ts">
  import type { HTMLButtonAttributes } from "svelte/elements";
  import { cn, type WithElementRef } from "$lib/utils.js";

  type Variant = "default" | "outline" | "ghost" | "secondary" | "destructive";
  type Size = "sm" | "md" | "lg" | "icon";

  interface $$Props extends HTMLButtonAttributes {
    variant?: Variant;
    size?: Size;
  }

  interface $$Events {
    click: MouseEvent;
  }

  let {
    class: className,
    variant = "default" as Variant,
    size = "md" as Size,
    type = "button",
    disabled = false,
    ref = $bindable<HTMLButtonElement | null>(null),
    children,
    ...restProps
  }: WithElementRef<$$Props, HTMLButtonElement> = $props();


  const base =
    "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background";

  const variants: Record<Variant, string> = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90",
    outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
    ghost: "hover:bg-accent hover:text-accent-foreground",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
  };

  const sizes: Record<Size, string> = {
    sm: "h-8 px-3",
    md: "h-9 px-4",
    lg: "h-10 px-6",
    icon: "h-9 w-9",
  };
</script>

<button
  bind:this={ref}
  {type}
  class={cn(base, variants[variant as Variant], sizes[size as Size], className)}
  {disabled}
  {...restProps}
>
  {@render children?.()}
</button>
