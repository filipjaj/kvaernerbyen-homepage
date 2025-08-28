import type { PageLoad } from "./$types";
import parking from "../../data/parking";

export const load: PageLoad = async () => {
  const activeParking = parking.filter((p) => !p.deaktivert);
  return {
    parking: activeParking,
  };
};
