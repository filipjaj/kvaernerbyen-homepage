<script lang="ts">
  import ParkingTester from "$lib/components/ui/ParkingTester.svelte";
</script>

<svelte:head>
  <title>Parking Ranking Tester</title>
  <meta name="robots" content="noindex" />
</svelte:head>

<div class="container">
  <h1 class="title">Parking Ranking Tester</h1>
  <p class="lead">Interactive UI to try <code>rankParking()</code> with different inputs.</p>
  <ParkingTester />
</div>

<style>
  .container { max-width: 56rem; margin: 2rem auto; padding: 0 1rem; }
  .title { font-size: 1.5rem; font-weight: 600; }
  .lead { color: #4b5563; margin-bottom: 1rem; }
</style>
