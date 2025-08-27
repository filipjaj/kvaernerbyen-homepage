import { kiwi } from "./kiwi";
import { extra } from "./extra";
import { vitus } from "./vitus";
import { apentbakeri } from "./apentbakeri";
import type { Store } from "./schema";

const stores = {
  kiwi,
  extra,
  vitus,
  apentbakeri,
} as const;

const isValidStore = (store: string): store is keyof typeof stores => {
  return Object.keys(stores).includes(store);
};

const getStore = (store: string): Store | null => {
  if (!isValidStore(store)) {
    return null;
  }

  return stores[store];
};

const getStores = (): Store[] => {
  return Object.values(stores);
};

export { getStore, getStores };
