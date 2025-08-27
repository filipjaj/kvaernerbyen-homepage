<script lang="ts">
	import '../app.css';
	import Header from '../lib/components/Header.svelte';
	import favicon from '$lib/assets/favicon.svg';
	import { QueryClient, QueryClientProvider } from '@tanstack/svelte-query';
  import { browser } from '$app/environment';
	  import { SvelteQueryDevtools } from '@tanstack/svelte-query-devtools'
	let { children } = $props();
const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        enabled: browser,
      },
    },
  })
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
  <meta name="description" content="Kværnerbyen - Busser, sparkesykkler og vær" />
  <meta name="keywords" content="Kværnerbyen, busser, sparkesykkler, vær" />
  <meta name="author" content="Kværnerbyen" />
  <meta name="robots" content="index, follow" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Kv.byen - din portal til kværnerbyen</title>
</svelte:head>

<Header />
<QueryClientProvider client={queryClient}>
  {@render children?.()}
  <SvelteQueryDevtools />
</QueryClientProvider>

