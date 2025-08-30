import { kiwi } from "./kiwi";
import { extra } from "./extra";
import { vitus } from "./vitus";
import { apentbakeri } from "./apentbakeri";
import { kraft } from "./kraft";
import type { Store } from "./schema";

const stores = {
  kiwi,
  extra,
  vitus,
  apentbakeri,
  kraft,
} as const;

const getStore = (store: string) => {
  return Object.values(stores).find((s) => s.slug === store);
};

const getStores = (): Store[] => {
  return Object.values(stores);
};

export { getStore, getStores };
