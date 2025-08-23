import type { Store } from "./schema";

export const extra: Store = {
  name: "Coop Extra Kværnerbyen",
  openingHours: [
    {
      day: "Mandag",
      open: "07:00",
      close: "23:00",
      closed: false,
    },
    {
      day: "Tirsdag",
      open: "07:00",
      close: "23:00",
      closed: false,
    },
    {
      day: "Onsdag",
      open: "07:00",
      close: "23:00",
      closed: false,
    },
    {
      day: "Torsdag",
      open: "07:00",
      close: "23:00",
      closed: false,
    },
    {
      day: "Fredag",
      open: "07:00",
      close: "23:00",
      closed: false,
    },
    {
      day: "Lørdag",
      open: "07:00",
      close: "23:00",
      closed: false,
    },
    {
      day: "Søndag",
      closed: true,
    },
  ],
  services: [
    {
      name: "postal",
      type: "Posten pakkeboks ute",
    },
  ],
  address: {
    street: "Turbinveien 4 B",
    zip: "0195",
    city: "Oslo",
  },
  contact: {
    phone: "22678701",
    email: "kiwi.kvaernerbyen@kiwi.no",
    url: "https://kiwi.no/finn-butikk/kiwi-315-kvarnerbyen",
  },
};
