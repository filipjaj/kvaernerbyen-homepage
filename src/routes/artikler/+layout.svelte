<script lang="ts">
  import type { Snippet } from 'svelte';
  import { page } from '$app/state';

  // mdsvex passes frontmatter as props to this layout
  let { children, frontmatter } = $props<{
    children?: Snippet;
    frontmatter?: {
      title?: string;
      description?: string;
      image?: string;
      datePublished?: string; // ISO 8601
      dateModified?: string; // ISO 8601
      authorName?: string;
    };
  }>();

  const siteName = 'Kværnerbyen';

  function absoluteUrl(path: string | undefined): string | undefined {
    if (!path) return undefined;
    try {
      const u = new URL(path, "https://kvbyen.no");
      return u.toString();
    } catch {
      return undefined;
    }
  }

  const canonical = $derived(`https://kvbyen.no${page.url.pathname}`);
  const title = $derived(frontmatter?.title ?? siteName);
  const description = $derived(frontmatter?.description ?? '');
  const ogImage = $derived(absoluteUrl(frontmatter?.image));

  const jsonLd = $derived({
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description: description,
    datePublished: frontmatter?.datePublished,
    dateModified: frontmatter?.dateModified ?? frontmatter?.datePublished,
    image: ogImage ? [ogImage] : undefined,
    mainEntityOfPage: canonical,
    url: canonical,
    author: frontmatter?.authorName
      ? { '@type': 'Person', name: frontmatter?.authorName }
      : undefined,
    publisher: {
      '@type': 'Organization',
      name: siteName
    }
  });

  function json(obj: unknown): string {
    return JSON.stringify(obj, null, 2);
  }

 
</script>

<svelte:head>
  {#if title}
    <title>{title}</title>
    <meta property="og:title" content={title} />
    <meta name="twitter:title" content={title} />
  {/if}
  {#if description}
    <meta name="description" content={description} />
    <meta property="og:description" content={description} />
    <meta name="twitter:description" content={description} />
  {/if}
  <link rel="canonical" href={canonical} />
  <meta property="og:url" content={canonical} />
  <meta property="og:type" content="article" />
  <meta property="og:site_name" content={siteName} />
  <meta name="twitter:card" content="summary_large_image" />
  {#if ogImage}
    <meta property="og:image" content={ogImage} />
    <meta name="twitter:image" content={ogImage} />
  {/if}

  
</svelte:head>

<main class="container mx-auto px-4 py-8">
  <article class="prose prose-zinc max-w-none dark:prose-invert bg-white rounded-lg p-6">
    {@render children?.()}
  </article>
  <!-- Optional: article nav / breadcrumbs slot could go here later -->
  <!-- TODO: extract to src/lib/components/ui/article if reused -->
  <!-- Follows user rule to keep UI in components dir when reusable -->
  
</main>