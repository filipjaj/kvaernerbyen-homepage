<script lang="ts">
  /**
   * WeatherWidget
   * Displays current weather for given coordinates using /api/weather proxy to MET Locationforecast.
   * Props:
   *  - lat: number (required)
   *  - lon: number (required)
   *  - altitude?: number
   *  - placeName?: string (for labeling, e.g. "Kværnerbyen")
   */
  import { createQuery } from '@tanstack/svelte-query';
  import { browser } from '$app/environment';
  import { Table, TableBody, TableRow, TableCell } from '$lib/components/ui/table';
  import { Cloud, CloudRain, CloudDrizzle, CloudSnow, CloudFog, Sun, CloudSun, Thermometer, Droplets, Wind, ArrowUp } from 'lucide-svelte';

  let { lat, lon, altitude, placeName = 'Kværnerbyen' } = $props<{
    lat: number;
    lon: number;
    altitude?: number;
    placeName?: string;
  }>();

  type Weather = {
    updatedAt: string;
    time: string;
    coords: { lat: number; lon: number; altitude: number | null };
    current: {
      temperature: number | null;
      feels_like: number | null;
      symbol_code: string | null;
      precipitation_mm_1h: number | null;
      precipitation_mm_6h: number | null;
      wind_speed: number | null;
      wind_gust: number | null;
      wind_dir: number | null;
    };
    forecast6h: Array<{
      start: string;
      end: string;
      label: string; // e.g. "19–00"
      temperature: number | null;
      symbol_code: string | null;
      precipitation_mm: number | null;
      wind_speed: number | null;
      wind_gust: number | null;
      wind_dir: number | null;
    }>;
  };

  function directionToCompass(dir?: number | null): string {
    if (dir == null || Number.isNaN(dir)) return '';
    const dirs = ['N', 'NØ', 'Ø', 'SØ', 'S', 'SV', 'V', 'NV'];
    const idx = Math.round(((dir % 360) / 45)) % 8;
    return dirs[idx];
  }

  function fmtTempDeg(t?: number | null): string {
    if (t == null) return '—';
    return `${Math.round(t)}°`;
  }

  function fmtMmNb(v?: number | null): string {
    if (v == null) return '—';
    const use0 = v >= 10;
    const nf = new Intl.NumberFormat('nb-NO', {
      minimumFractionDigits: use0 ? 0 : 1,
      maximumFractionDigits: use0 ? 0 : 1
    });
    return `${nf.format(v)} mm`;
  }

  function fmtMsNb(v?: number | null): string {
    if (v == null) return '—';
    const nf = new Intl.NumberFormat('nb-NO', { maximumFractionDigits: 1 });
    return `${nf.format(v)} m/s`;
  }

  function symbolToIcon(code?: string | null): { comp: any; label: string } {
    const c = (code ?? '').toLowerCase();
    if (!c) return { comp: Cloud, label: 'Ukjent vær' };
    if (c.includes('clearsky')) return { comp: Sun, label: 'Klarvær' };
    if (c.includes('fair') || c.includes('partlycloudy')) return { comp: CloudSun, label: 'Lettskyet' };
    if (c.includes('cloudy')) return { comp: Cloud, label: 'Skyet' };
    if (c.includes('fog')) return { comp: CloudFog, label: 'Tåke' };
    if (c.includes('snow')) return { comp: CloudSnow, label: 'Snø' };
    if (c.includes('rain')) return { comp: CloudRain, label: 'Regn' };
    if (c.includes('drizzle') || c.includes('showers')) return { comp: CloudDrizzle, label: 'Yr' };
    return { comp: Cloud, label: code ?? 'Vær' };
  }

  const weatherQuery = createQuery<Weather, Error>({
    queryKey: ['weather', lat, lon, altitude ?? null],
    queryFn: async () => {
      const params = new URLSearchParams({ lat: String(lat), lon: String(lon) });
      if (altitude != null) params.set('altitude', String(altitude));
      const res = await fetch(`/api/weather?${params.toString()}`);
      if (!res.ok) throw new Error(`Failed to fetch weather: ${res.status}`);
      return res.json();
    },
    enabled: browser && typeof lat === 'number' && typeof lon === 'number',
    refetchInterval: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: true
  });

  const data = $derived($weatherQuery.data);
  const curr = $derived(data?.current);
  const tempBig = $derived(fmtTempDeg(curr?.temperature));
  const feelsLike = $derived(fmtTempDeg(curr?.feels_like));
  const windSpeed = $derived(curr?.wind_speed ?? null);
  const windGust = $derived(curr?.wind_gust ?? null);
  const windDirDeg = $derived(curr?.wind_dir ?? null);
  const windDirText = $derived(directionToCompass(windDirDeg));
  const precip1h = $derived(fmtMmNb(curr?.precipitation_mm_1h ?? null));
  const symbol = $derived(curr?.symbol_code ?? '');
</script>

<section
  class="rounded-2xl border border-neutral-200/60 p-4 bg-white/60 dark:bg-neutral-900/60 dark:border-neutral-800/80 backdrop-blur-md shadow-lg"
  aria-label={`Vær nå i ${placeName}`}
>
  {#if $weatherQuery.isLoading}
    <div class="flex items-center justify-between">
      <div class="h-10 w-24 bg-neutral-200/70 dark:bg-neutral-800/70 rounded animate-pulse" aria-hidden="true"></div>
      <div class="h-6 w-48 bg-neutral-200/70 dark:bg-neutral-800/70 rounded animate-pulse" aria-hidden="true"></div>
    </div>
  {:else if $weatherQuery.error}
    <div class="text-sm text-red-600">Feil ved henting av vær: {$weatherQuery.error.message}</div>
  {:else if !data}
    <div class="text-sm opacity-80">Ingen værdata tilgjengelig akkurat nå.</div>
  {:else}
    <div class="text-lg font-medium mb-2">{placeName}</div>
    <div class="flex items-start justify-between gap-4">
      <div class="flex items-center gap-4">
        {#if symbol}
          {@const IconCurrent = symbolToIcon(symbol).comp}
          <IconCurrent aria-hidden="true" class="h-14 w-14 text-neutral-500" />
        {/if}
        <div class="text-5xl font-semibold tabular-nums text-red-600">{tempBig}</div>
      </div>
      <div class="text-sm text-right flex-1">
        <div class="flex items-center justify-end gap-2">
          <Thermometer class="h-4 w-4 text-neutral-500" aria-hidden="true" />
          <span class="opacity-80">Føles som</span>
          <span class="font-medium text-red-600">{feelsLike}</span>
        </div>
        <div class="flex items-center justify-end gap-2 mt-1">
          <Droplets class="h-4 w-4 text-neutral-500" aria-hidden="true" />
          <span class="text-sky-600">{precip1h}</span>
        </div>
        <div class="flex items-center justify-end gap-2 mt-1">
          <Wind class="h-4 w-4 text-neutral-500" aria-hidden="true" />
          <span>{fmtMsNb(windSpeed)}{#if windGust != null} (<span class="tabular-nums">{new Intl.NumberFormat('nb-NO', { maximumFractionDigits: 1 }).format(windGust)}</span> m/s){/if}</span>
          {#if windDirDeg != null}
            <ArrowUp class="h-4 w-4 text-neutral-700" aria-label={`Vindretning ${windDirText}`} style={`transform: rotate(${Math.round(windDirDeg)}deg);`} />
          {/if}
        </div>
      </div>
    </div>

    <!-- 6-hour forecast table -->
    {#if data.forecast6h?.length}
      <div class="mt-4">
        <Table class="border-separate border-spacing-y-2">
          <TableBody>
            {#each data.forecast6h as p}
              <TableRow class="border-t border-neutral-200/70 dark:border-neutral-800/70">
                <TableCell class="w-20 text-neutral-500">{p.label}</TableCell>
                <TableCell class="w-8">
                  {@const RowIcon = symbolToIcon(p.symbol_code).comp}
                  <RowIcon aria-hidden="true" class="h-5 w-5 text-neutral-500" />
                </TableCell>
                <TableCell class="text-red-600 font-medium tabular-nums">{fmtTempDeg(p.temperature)}</TableCell>
                <TableCell class="text-sky-600 tabular-nums">{fmtMmNb(p.precipitation_mm)}</TableCell>
                <TableCell class="tabular-nums">
                  {#if p.wind_speed != null}
                    {new Intl.NumberFormat('nb-NO', { maximumFractionDigits: 0 }).format(p.wind_speed)}
                    {#if p.wind_gust != null}
                      (<span class="tabular-nums">{new Intl.NumberFormat('nb-NO', { maximumFractionDigits: 0 }).format(p.wind_gust)}</span>)
                    {/if}
                  {:else}
                    —
                  {/if}
                </TableCell>
                <TableCell class="w-6">
                  {#if p.wind_dir != null}
                    <ArrowUp class="h-4 w-4 text-neutral-700" aria-label={`Vindretning ${directionToCompass(p.wind_dir)}`} style={`transform: rotate(${Math.round(p.wind_dir)}deg);`} />
                  {/if}
                </TableCell>
              </TableRow>
            {/each}
          </TableBody>
        </Table>
      </div>
    {/if}
  {/if}
</section>
