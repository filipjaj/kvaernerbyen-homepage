// https://www.vitusapotek.no/apotek/NO/Oslo/Oslo/Vitusapotek-Kv%C3%A6rnerbyen

import type { Store } from "./schema";

// Vitusapotek Kværnerbyen

// Åpningstider
// mandag-fredag: 10:00-18:00
// lørdag: 10:00-14:00
// Kontaktinformasjon
// Turbinveien 3
// 0195 Oslo
// Telefon: 22756534

// Fax: 22756535

// E-post: kvaernerbyen@vitusapotek.no

export const vitus: Store = {
  name: "Vitusapotek Kværnerbyen",
  slug: "vitusapotek-kvaernerbyen",
  openingHours: [
    {
      day: "Mandag",
      open: "10:00",
      close: "18:00",
      closed: false,
    },
    {
      day: "Tirsdag",
      open: "10:00",
      close: "18:00",
      closed: false,
    },
    {
      day: "Onsdag",
      open: "10:00",
      close: "18:00",
      closed: false,
    },
    {
      day: "Torsdag",
      open: "10:00",
      close: "18:00",
      closed: false,
    },
    {
      day: "Fredag",
      open: "10:00",
      close: "18:00",
      closed: false,
    },
    {
      day: "Lørdag",
      open: "10:00",
      close: "14:00",
      closed: false,
    },
    {
      day: "Søndag",
      closed: true,
    },
  ],
  services: [
    {
      name: "vaccine",
      type: "Tilbyr vaksinasjon",
    },
  ],
  address: {
    street: "Turbinveien 3",
    zip: "0195",
    city: "Oslo",
  },
  contact: {
    phone: "22756534",
    email: "kvaernerbyen@vitusapotek.no",
    url: "https://www.vitusapotek.no/apotek/NO/Oslo/Oslo/Vitusapotek-Kv%C3%A6rnerbyen",
  },
};
