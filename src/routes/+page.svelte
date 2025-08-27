<script lang="ts">
import Departures from '$lib/components/Departures.svelte';
import ProviderCounts from '$lib/components/mobility/ProviderCounts.svelte';
import WeatherWidget from '$lib/components/weather/WeatherWidget.svelte';
import StoresWidget from '$lib/components/stores/StoresWidget.svelte';
import { site } from '$lib/config';
</script>

<main class="font-switzer px-4 sm:px-6 md:px-8 py-6">
  <div class="max-w-7xl mx-auto">
    <div class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      <section>
        <h2 class="text-base font-semibold mb-2">Busser</h2>
        <Departures />
      </section>

      <section>
        <h2 class="text-base font-semibold mb-2">Sparkesykkler</h2>
        <ProviderCounts placeName={site.placeName} />
      </section>

     <section>
        <h2 class="text-base font-semibold mb-2">Vær</h2>
        <WeatherWidget lat={site.location.lat} lon={site.location.lon} placeName={site.placeName} />
      </section>

      <section>
        <h2 class="text-base font-semibold mb-2">Butikker, restauranter og caféer</h2>
        <StoresWidget />
      </section>
    </div>
  </div>
</main>
