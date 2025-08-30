import type { PageLoad } from "./$types";
import { error, redirect } from "@sveltejs/kit";
import parking from "../../../data/parking";
import { idFromSlug, withSlugs, slugForEntry } from "$lib/parking/utils";

export const load = (async ({ params }) => {
  const param = params.slug;
  const entries = withSlugs(parking);

  // Support legacy numeric-only URLs like /parkering/12345
  if (/^\d+$/.test(param)) {
    const numericId = Number(param);
    const e = entries.find((p) => p.id === numericId);
    if (e) {
      throw redirect(301, `/parkering/${slugForEntry(e)}`);
    }
    throw error(404, "Parkeringsplass ikke funnet");
  }

  // Support canonical slug or any slug that ends with -<id>
  const id = idFromSlug(param);
  let entry = id != null ? entries.find((p) => p.id === id) : undefined;
  if (!entry) {
    entry = entries.find((p) => p.slug === param);
  }

  if (!entry) {
    throw error(404, "Parkeringsplass ikke funnet");
  }

  const canonicalSlug = slugForEntry(entry);
  if (param !== canonicalSlug) {
    throw redirect(301, `/parkering/${canonicalSlug}`);
  }

  return { entry, slug: canonicalSlug };
}) satisfies PageLoad;
