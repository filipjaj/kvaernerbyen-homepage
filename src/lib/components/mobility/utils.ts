import type { LocalizedName } from './types';

export function pickTranslation(loc: LocalizedName | undefined, lang = 'no'): string {
  const list = loc?.translation ?? [];
  if (!list.length) return '';
  const base = lang.split('-')[0];
  const [best] = [...list]
    .map((x) => ({ ...x, score: x.language === lang ? 2 : x.language?.startsWith(base) ? 1 : 0 }))
    .sort((a, b) => b.score - a.score);
  return best?.value ?? list[0]?.value ?? '';
}

export function formatKm(meters?: number | null): string {
  if (meters == null) return '';
  if (meters < 1000) return `${meters} m`;
  const km = meters / 1000;
  return `${km.toFixed(km >= 10 ? 0 : 1)} km`;
}

export function formatPercent(p?: number | null): string {
  if (p == null) return '';
  const pct = Math.round(p * 100);
  return `${pct}%`;
}
