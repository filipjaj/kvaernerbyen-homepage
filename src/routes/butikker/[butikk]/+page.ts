import { error } from "@sveltejs/kit";
import { getStore } from "../../../data/stores";

export const load = ({
  params,
}: {
  params: {
    butikk: string;
  };
}) => {
  const { butikk } = params;

  const storeData = getStore(butikk);

  if (!storeData) {
    error(404, "Store not found");
  }

  return {
    storeData,
  };
};
