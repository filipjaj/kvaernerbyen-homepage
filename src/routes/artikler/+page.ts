import type { PageLoad } from "./$types";

// Collect raw contents of all article pages under this directory
const files = import.meta.glob("./**/+page.svx", { as: "raw", eager: true }) as Record<string, string>;

export type ArticleItem = {
  slug: string;
  href: string;
  title: string;
  description?: string;
  image?: string;
  date?: string;
};

function extractTitle(src: string): string | undefined {
  const m = src.match(/^#\s+(.+?)\s*$/m);
  return m?.[1]?.trim();
}

function extractFirstImage(src: string): string | undefined {
  const m = src.match(/!\[[^\]]*\]\(([^)]+)\)/);
  return m?.[1];
}

function extractDescription(src: string): string | undefined {
  const lines = src.split(/\r?\n/);
  // Find first non-empty paragraph line after the H1, skipping images, headings, and hr
  let afterH1 = false;
  for (const raw of lines) {
    const line = raw.trim();
    if (!afterH1) {
      if (/^#\s+/.test(line)) afterH1 = true;
      continue;
    }
    if (!line) continue; // skip empty
    if (/^!\[/.test(line)) continue; // skip images
    if (/^##\s+/.test(line)) continue; // skip headings
    if (/^---+$/.test(line)) continue; // skip hr
    // Strip markdown emphasis/backticks
    const clean = line.replace(/[*_`~]/g, "");
    return clean.length > 220 ? clean.slice(0, 217) + "…" : clean;
  }
  return undefined;
}

function toSlug(path: string): string {
  // path example: './historie/+page.svx' -> 'historie'
  const m = path.match(/^\.\/(.+?)\//);
  return m?.[1] ?? path.replace(/[^a-z0-9]+/gi, "-").toLowerCase();
}

export const load: PageLoad = async () => {
  const items: ArticleItem[] = Object.entries(files).map(([path, src]) => {
    const slug = toSlug(path);
    const title = extractTitle(src) ?? slug.replace(/-/g, " ");
    const description = extractDescription(src);
    const image = extractFirstImage(src);
    return {
      slug,
      href: `/artikler/${slug}`,
      title,
      description,
      image,
      date: undefined,
    } satisfies ArticleItem;
  });

  // Optional: sort by title for now (no date present)
  items.sort((a, b) => a.title.localeCompare(b.title, "nb-NO"));

  return { articles: items };
};
