import type { PageLoad } from "./$types";
import parking from "../../data/parking";
import { entryIsActive, withSlugs } from "$lib/parking/utils";

export const load = (async () => {
  const entries = withSlugs(parking).filter(entryIsActive);
  return { entries };
}) satisfies PageLoad;
