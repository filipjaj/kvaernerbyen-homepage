// src/lib/parking/utils.ts
// Utilities for parking routes: slugging, formatting, helpers

import type { ParkingEntry } from "../../data/parking";

/**
 * Normalize a string to a URL-friendly slug.
 * - Lowercase, remove diacritics, replace non-alphanumerics with '-'
 */
export function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Build a human-readable unique slug for a parking entry */
export function slugForEntry(p: ParkingEntry): string {
  const baseA = slugify(p.navn || "");
  const baseB = slugify(p.adresse || "");
  const parts = [baseA, baseB].filter(Boolean);
  const base = parts.length ? parts.join("-") : `parkering-${p.id}`;
  return `${base}-${p.id}`;
}

/** Try to parse an ID from the trailing end of a slug */
export function idFromSlug(slug: string): number | null {
  const m = slug.match(/-(\d+)$/);
  if (!m) return null;
  const id = Number(m[1]);
  return Number.isFinite(id) ? id : null;
}

export function formatPriceNOK(amount: number | null | undefined): string {
  if (amount == null) return "–";
  return new Intl.NumberFormat("nb-NO", {
    style: "currency",
    currency: "NOK",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatMinutes(mins: number): string {
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m ? `${h} t ${m} min` : `${h} t`;
}

export function providerLabel(p: ParkingEntry): string {
  return p.parkeringstilbyderNavn;
}

export function entryIsActive(p: ParkingEntry): boolean {
  return !p.deaktivert || !("deaktivertTidspunkt" in p.deaktivert) || p.deaktivert == null;
}

export type EntryWithSlug = ParkingEntry & { slug: string };
export function withSlugs(list: ParkingEntry[]): EntryWithSlug[] {
  return list.map((p) => ({ ...p, slug: slugForEntry(p) }));
}
