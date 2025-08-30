<script lang="ts">
  import type { PageData } from "./$types";
  import ArticleCard from "$lib/components/ui/article/card.svelte";

  let { data } = $props<{ data: PageData }>();
  const { articles } = data;

  const pageTitle = $derived("Artikler – Kværnerbyen");
  const pageDescription = $derived(
    "Utforsk artikler om Kværnerbyen – historie, transformasjon og livet i nabolaget."
  );
</script>

<svelte:head>
  <title>{pageTitle}</title>
  <meta name="description" content={pageDescription} />
  <meta property="og:title" content={pageTitle} />
  <meta property="og:description" content={pageDescription} />
  <meta name="twitter:title" content={pageTitle} />
  <meta name="twitter:description" content={pageDescription} />
</svelte:head>

<main class="container mx-auto px-4 py-8">
  <h1 class="text-3xl font-bold tracking-tight">Artikler</h1>
  <p class="mt-2 text-muted-foreground max-w-2xl">
    {pageDescription}
  </p>

  {#if articles.length === 0}
    <p class="mt-8 text-muted-foreground">Ingen artikler publisert enda.</p>
  {:else}
    <ul class="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3" role="list">
      {#each articles as a}
        <li role="listitem">
          <ArticleCard
            href={a.href}
            title={a.title}
            description={a.description}
            image={a.image}
            date={a.date}
          />
        </li>
      {/each}
    </ul>
  {/if}
</main>
