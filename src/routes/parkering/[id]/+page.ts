import type { PageLoad } from "./$types";
import { error } from "@sveltejs/kit";
import parking from "../../../data/parking";

export const load: PageLoad = async ({ params }) => {
  const id = Number(params.id);
  const entry = parking.find((p) => p.id === id);

  if (!entry) {
    throw error(404, "Parkeringsplass ikke funnet");
  }

  return { entry };
};
