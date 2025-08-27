import type { EstimatedCall, Situation, SituationText } from './types';

export function parseISO(s: string) { return new Date(s); }

// ceil to the next minute
export function minutesDiff(a: Date, b: Date) {
  const ms = a.getTime() - b.getTime();
  return Math.ceil(ms / 60000);
}

export function safeHex(h?: string) {
  if (!h) return undefined;
  const v = h.startsWith('#') ? h : `#${h}`;
  return /^#?[0-9a-fA-F]{6}$/.test(h) ? v : undefined;
}

export function situationText(sits: Situation[] | undefined, lang: string): string[] {
  if (!sits || sits.length === 0) return [];
  const pick = (arr?: SituationText[]) =>
    (arr || [])
      .map(x => ({ ...x, score: x.language === lang ? 2 : x.language?.startsWith(lang.split('-')[0]) ? 1 : 0 }))
      .sort((a, b) => b.score - a.score)
      .map(x => x.value)[0];
  const out: string[] = [];
  for (const s of sits) {
    const t = pick(s.summary) || pick(s.description);
    if (t) out.push(t);
  }
  return out;
}

export function cleanName(name?: string | null) {
  return name && name.trim().length ? name : '—';
}

export function sortedCalls(calls: EstimatedCall[]) {
  return [...calls].sort((a, b) => new Date(a.expectedDepartureTime).getTime() - new Date(b.expectedDepartureTime).getTime());
}

export function delayMin(call: EstimatedCall) {
  const aimed = parseISO(call.aimedDepartureTime);
  const exp = parseISO(call.expectedDepartureTime);
  const d = Math.round((exp.getTime() - aimed.getTime()) / 60000);
  return d;
}
