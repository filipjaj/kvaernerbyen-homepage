<script lang="ts">
  import { site } from '$lib/config';
  const displayName = site.shortName ?? site.name;
  const alt = `Logo for ${site.name}`;
  const logo = site.logo;
  const tagline = site.tagline;
  // Header uses global site config to avoid hardcoded branding strings
</script>

<header class="flex flex-row      justify-between  items-center gap-2 sticky top-0 z-50 shadow-lg bg-white  p-4 font-switzer">
    <a href="/" class="flex flex-row items-center gap-2 font-extrabold text-lg"><img src={logo} alt={alt} class="h-10 w-10" />{displayName}</a>
    <p class="text-sm font-normal">{tagline}</p>
</header>