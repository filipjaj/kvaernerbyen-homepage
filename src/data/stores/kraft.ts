// https://restaurant-kraft.no/
// Restaurant Kraft

import type { Store } from "./schema";

// Åpningstider
// Mandag: stengt
// Tir – Fre 1630 – 23:00 Lør – Søn 1300 – 2300

// Adresse
// Turbinveien 26
// 0195 Oslo

// Kontakt oss
// 91921342

// kontakt@restaurant-kraft.no

export const kraft: Store = {
  name: "Restaurant Kraft",
  slug: "restaurant-kraft",
  openingHours: [
    { day: "Mandag", closed: true },
    { day: "Tirsdag", open: "16:30", close: "23:00", closed: false },
    { day: "Onsdag", open: "16:30", close: "23:00", closed: false },
    { day: "Torsdag", open: "16:30", close: "23:00", closed: false },
    { day: "Fredag", open: "16:30", close: "23:00", closed: false },
    { day: "Lørdag", open: "13:00", close: "23:00", closed: false },
    { day: "Søndag", open: "13:00", close: "23:00", closed: false },
  ],
  services: [],
  address: {
    street: "Turbinveien 26",
    zip: "0195",
    city: "Oslo",
  },
  contact: {
    phone: "91921342",
    email: "kontakt@restaurant-kraft.no",
    url: "https://restaurant-kraft.no/",
  },
};

export default kraft;
