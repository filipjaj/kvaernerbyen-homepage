<script lang="ts">
import Departures from '$lib/components/Departures.svelte';
import Mobility from '$lib/components/mobility/Mobility.svelte';
import ProviderCounts from '$lib/components/mobility/ProviderCounts.svelte';
import WeatherWidget from '$lib/components/weather/WeatherWidget.svelte';
import StoresWidget from '$lib/components/stores/StoresWidget.svelte';
</script>

<main class="font-switzer px-5 mt-4 ">




<div class="flex md:flex-row flex-col gap-4  flex-wrap">
  

   <div class="md:w-auto">
    <h2 >Busser</h2>
   <Departures />
   </div>

   <div class="md:w-auto">
    <h2>Sparkesykkler</h2>
    <ProviderCounts placeName="Kværnerbyen" />
   
   </div>
   <div class=" md:w-auto">
    <WeatherWidget lat={59.91} lon={10.75} placeName="Kværnerbyen" />
   </div>   
   <div class="md:w-auto">
    <StoresWidget />
   </div>
</div>
</main>
