export interface PriceListItem {
  start: string; // HH:MM
  end: string; // HH:MM
  duration_minutes: number; // e.g., 30
  price: number; // NOK per duration
  max_price: number | null; // cap within the time range
}

export interface DayPricing {
  day: number; // 1-7 (Mon-Sun)
  name: string; // localized day name
  price_list: PriceListItem[];
}

export interface CustomPriceRule {
  label: string; // f.eks. "Kiwi-kunder"
  free_minutes?: number; // minutes free
  discount_percent?: number; // e.g., 20 for 20%
  discount_amount?: number; // NOK off per duration
  applies_time?: { start: string; end: string } | null; // optional time window
  applies_days?: number[]; // 1-7 (Mon-Sun)
  tiers?: { duration_hours: number; price: number }[]; // total price by duration
  notes?: string;
}

export type Deaktivert = { deaktivertTidspunkt: string } | null;

export interface ParkingEntry {
  id: number;
  parkeringstilbyderNavn: string;
  breddegrad: number;
  lengdegrad: number;
  deaktivert: Deaktivert;
  versjonsnummer: number;
  navn: string;
  adresse: string;
  easyparkSone?: string;
  priser?: DayPricing[];
  kiwi_customer_free_minutes?: number; // minutes of free parking for Kiwi customers
  daily_max_price?: number; // NOK max per 24h
  custom_prices?: CustomPriceRule[]; // flexible rules for store/customer-specific pricing
  postnummer: string;
  poststed: string;
  aktiveringstidspunkt: string; // ISO timestamp
}

export const parking: ParkingEntry[] = [
  {
    id: 99562,
    parkeringstilbyderNavn: "OSLO KOMMUNE BYMILJØETATEN",
    breddegrad: 59.904087,
    lengdegrad: 10.791689,
    deaktivert: { deaktivertTidspunkt: "2025-04-01T13:57:15Z" },
    versjonsnummer: 1,
    navn: "Midlertidige vedtak for Enebakkveien mellom Arnljot Gellines vei og Ingeniørveien",
    adresse: "Enebakkveien mellom Arnljot Gellines vei og Ingeniørveien",
    custom_prices: [
      {
        label: "Standard (bensin/diesel/hybrid/ladbar hybrid)",
        applies_time: { start: "09:00", end: "20:00" },
        applies_days: [1, 2, 3, 4, 5, 6],
        tiers: [
          { duration_hours: 1, price: 69 },
          { duration_hours: 2, price: 136 },
          { duration_hours: 3, price: 201 },
          { duration_hours: 4, price: 268 },
          { duration_hours: 24, price: 333 },
        ],
        notes: "Avgiftstid man–lør 09:00–20:00. Maks tid: ubegrenset.",
      },
      {
        label: "Elbil",
        applies_time: { start: "09:00", end: "20:00" },
        applies_days: [1, 2, 3, 4, 5, 6],
        tiers: [
          { duration_hours: 1, price: 35 },
          { duration_hours: 2, price: 68 },
          { duration_hours: 3, price: 101 },
          { duration_hours: 4, price: 134 },
          { duration_hours: 24, price: 167 },
        ],
        notes: "Avgiftstid man–lør 09:00–20:00. Maks tid: ubegrenset.",
      },
    ],
    postnummer: "0196",
    poststed: "OSLO",
    aktiveringstidspunkt: "2025-03-30T13:37:18Z",
  },
  {
    id: 100137,
    parkeringstilbyderNavn: "OSLO KOMMUNE BYMILJØETATEN",
    breddegrad: 59.902348,
    lengdegrad: 10.792075,
    deaktivert: { deaktivertTidspunkt: "2025-04-07T13:51:26Z" },
    versjonsnummer: 1,
    navn: "Midlertidige vedtak for Enebakkveien mellom Eirik Raudes vei og Konows gate",
    adresse: "Enebakkveien mellom Eirik Raudes vei og Konows gate",
    custom_prices: [
      {
        label: "Standard (bensin/diesel/hybrid/ladbar hybrid)",
        applies_time: { start: "09:00", end: "20:00" },
        applies_days: [1, 2, 3, 4, 5, 6],
        tiers: [
          { duration_hours: 1, price: 69 },
          { duration_hours: 2, price: 136 },
          { duration_hours: 3, price: 201 },
          { duration_hours: 4, price: 268 },
          { duration_hours: 24, price: 333 },
        ],
        notes: "Avgiftstid man–lør 09:00–20:00. Maks tid: ubegrenset.",
      },
      {
        label: "Elbil",
        applies_time: { start: "09:00", end: "20:00" },
        applies_days: [1, 2, 3, 4, 5, 6],
        tiers: [
          { duration_hours: 1, price: 35 },
          { duration_hours: 2, price: 68 },
          { duration_hours: 3, price: 101 },
          { duration_hours: 4, price: 134 },
          { duration_hours: 24, price: 167 },
        ],
        notes: "Avgiftstid man–lør 09:00–20:00. Maks tid: ubegrenset.",
      },
    ],
    postnummer: "0196",
    poststed: "OSLO",
    aktiveringstidspunkt: "2025-04-06T13:46:22Z",
  },
  {
    id: 100216,
    parkeringstilbyderNavn: "OSLO KOMMUNE BYMILJØETATEN",
    breddegrad: 59.902863,
    lengdegrad: 10.787046,
    deaktivert: { deaktivertTidspunkt: "2025-04-07T13:56:34Z" },
    versjonsnummer: 1,
    navn: "Midlertidige vedtak for Freserveien mellom Turbinveien og Smeltedigelen",
    adresse: "Freserveien mellom Turbinveien og Smeltedigelen",
    custom_prices: [
      {
        label: "Standard (bensin/diesel/hybrid/ladbar hybrid)",
        applies_time: { start: "09:00", end: "20:00" },
        applies_days: [1, 2, 3, 4, 5, 6],
        tiers: [
          { duration_hours: 1, price: 69 },
          { duration_hours: 2, price: 136 },
          { duration_hours: 3, price: 201 },
          { duration_hours: 4, price: 268 },
          { duration_hours: 24, price: 333 },
        ],
        notes: "Avgiftstid man–lør 09:00–20:00. Maks tid: ubegrenset.",
      },
      {
        label: "Elbil",
        applies_time: { start: "09:00", end: "20:00" },
        applies_days: [1, 2, 3, 4, 5, 6],
        tiers: [
          { duration_hours: 1, price: 35 },
          { duration_hours: 2, price: 68 },
          { duration_hours: 3, price: 101 },
          { duration_hours: 4, price: 134 },
          { duration_hours: 24, price: 167 },
        ],
        notes: "Avgiftstid man–lør 09:00–20:00. Maks tid: ubegrenset.",
      },
    ],
    postnummer: "0195",
    poststed: "OSLO",
    aktiveringstidspunkt: "2025-04-06T13:50:15Z",
  },
  {
    id: 100220,
    parkeringstilbyderNavn: "OSLO KOMMUNE BYMILJØETATEN",
    breddegrad: 59.902878,
    lengdegrad: 10.78704,
    deaktivert: { deaktivertTidspunkt: "2025-04-07T13:56:37Z" },
    versjonsnummer: 1,
    navn: "Midlertidige vedtak for Freserveien mellom Smeltedigelen og enden",
    adresse: "Freserveien mellom Smeltedigelen og enden",
    custom_prices: [
      {
        label: "Standard (bensin/diesel/hybrid/ladbar hybrid)",
        applies_time: { start: "09:00", end: "20:00" },
        applies_days: [1, 2, 3, 4, 5, 6],
        tiers: [
          { duration_hours: 1, price: 69 },
          { duration_hours: 2, price: 136 },
          { duration_hours: 3, price: 201 },
          { duration_hours: 4, price: 268 },
          { duration_hours: 24, price: 333 },
        ],
        notes: "Avgiftstid man–lør 09:00–20:00. Maks tid: ubegrenset.",
      },
      {
        label: "Elbil",
        applies_time: { start: "09:00", end: "20:00" },
        applies_days: [1, 2, 3, 4, 5, 6],
        tiers: [
          { duration_hours: 1, price: 35 },
          { duration_hours: 2, price: 68 },
          { duration_hours: 3, price: 101 },
          { duration_hours: 4, price: 134 },
          { duration_hours: 24, price: 167 },
        ],
        notes: "Avgiftstid man–lør 09:00–20:00. Maks tid: ubegrenset.",
      },
    ],
    postnummer: "0195",
    poststed: "OSLO",
    aktiveringstidspunkt: "2025-04-06T13:50:24Z",
  },
  {
    id: 4162,
    parkeringstilbyderNavn: "AIMO PARK NORWAY AS",
    breddegrad: 59.904707,
    lengdegrad: 10.78566,
    deaktivert: { deaktivertTidspunkt: "2023-01-11T19:43:18Z" },
    versjonsnummer: 20,
    navn: "Kværnerbyen Næringspark",
    adresse: "Turbinveien 2",
    postnummer: "0195",
    poststed: "OSLO",
    aktiveringstidspunkt: "2022-10-14T12:45:06Z",
  },
  {
    id: 106034,
    parkeringstilbyderNavn: "OSLO KOMMUNE BYMILJØETATEN",
    breddegrad: 59.904648,
    lengdegrad: 10.786067,
    deaktivert: null,
    versjonsnummer: 1,
    navn: "Turbinveien mellom Freserveien og Smeltedigelen",
    adresse: "Turbinveien mellom Freserveien og Smeltedigelen",
    custom_prices: [
      {
        label: "Standard (bensin/diesel/hybrid/ladbar hybrid)",
        applies_time: { start: "09:00", end: "20:00" },
        applies_days: [1, 2, 3, 4, 5, 6],
        tiers: [
          { duration_hours: 1, price: 69 },
          { duration_hours: 2, price: 136 },
          { duration_hours: 3, price: 201 },
          { duration_hours: 4, price: 268 },
          { duration_hours: 24, price: 333 },
        ],
        notes: "Avgiftstid man–lør 09:00–20:00. Maks tid: ubegrenset.",
      },
      {
        label: "Elbil",
        applies_time: { start: "09:00", end: "20:00" },
        applies_days: [1, 2, 3, 4, 5, 6],
        tiers: [
          { duration_hours: 1, price: 35 },
          { duration_hours: 2, price: 68 },
          { duration_hours: 3, price: 101 },
          { duration_hours: 4, price: 134 },
          { duration_hours: 24, price: 167 },
        ],
        notes: "Avgiftstid man–lør 09:00–20:00. Maks tid: ubegrenset.",
      },
    ],
    postnummer: "0195",
    poststed: "OSLO",
    aktiveringstidspunkt: "2025-08-26T14:34:03Z",
  },
  {
    id: 106429,
    parkeringstilbyderNavn: "OSLO KOMMUNE BYMILJØETATEN",
    breddegrad: 59.903156,
    lengdegrad: 10.785579,
    deaktivert: null,
    versjonsnummer: 1,
    navn: "Smeltedigelen mellom Freserveien og Turbinveien",
    adresse: "Smeltedigelen mellom Freserveien og Turbinveien",
    custom_prices: [
      {
        label: "Standard (bensin/diesel/hybrid/ladbar hybrid)",
        applies_time: { start: "09:00", end: "20:00" },
        applies_days: [1, 2, 3, 4, 5, 6],
        tiers: [
          { duration_hours: 1, price: 69 },
          { duration_hours: 2, price: 136 },
          { duration_hours: 3, price: 201 },
          { duration_hours: 4, price: 268 },
          { duration_hours: 24, price: 333 },
        ],
        notes: "Avgiftstid man–lør 09:00–20:00. Maks tid: ubegrenset.",
      },
      {
        label: "Elbil",
        applies_time: { start: "09:00", end: "20:00" },
        applies_days: [1, 2, 3, 4, 5, 6],
        tiers: [
          { duration_hours: 1, price: 35 },
          { duration_hours: 2, price: 68 },
          { duration_hours: 3, price: 101 },
          { duration_hours: 4, price: 134 },
          { duration_hours: 24, price: 167 },
        ],
        notes: "Avgiftstid man–lør 09:00–20:00. Maks tid: ubegrenset.",
      },
    ],
    postnummer: "0195",
    poststed: "OSLO",
    aktiveringstidspunkt: "2025-08-26T14:51:05Z",
  },
  {
    id: 8671,
    parkeringstilbyderNavn: "OSLO KOMMUNE BYMILJØETATEN",
    breddegrad: 59.903962,
    lengdegrad: 10.791787,
    deaktivert: { deaktivertTidspunkt: "2023-10-09T13:27:35Z" },
    versjonsnummer: 4,
    navn: "Enebakkveien mellom Eirik Raudes Vei og Arnljot Gellines Vei",
    adresse: "Enebakkveien mellom Eirik Raudes Vei og Arnljot Gellines Vei",
    custom_prices: [
      {
        label: "Standard (bensin/diesel/hybrid/ladbar hybrid)",
        applies_time: { start: "09:00", end: "20:00" },
        applies_days: [1, 2, 3, 4, 5, 6],
        tiers: [
          { duration_hours: 1, price: 69 },
          { duration_hours: 2, price: 136 },
          { duration_hours: 3, price: 201 },
          { duration_hours: 4, price: 268 },
          { duration_hours: 24, price: 333 },
        ],
        notes: "Avgiftstid man–lør 09:00–20:00. Maks tid: ubegrenset.",
      },
      {
        label: "Elbil",
        applies_time: { start: "09:00", end: "20:00" },
        applies_days: [1, 2, 3, 4, 5, 6],
        tiers: [
          { duration_hours: 1, price: 35 },
          { duration_hours: 2, price: 68 },
          { duration_hours: 3, price: 101 },
          { duration_hours: 4, price: 134 },
          { duration_hours: 24, price: 167 },
        ],
        notes: "Avgiftstid man–lør 09:00–20:00. Maks tid: ubegrenset.",
      },
    ],
    postnummer: "0196",
    poststed: "OSLO",
    aktiveringstidspunkt: "2023-05-15T09:23:14Z",
  },
  {
    id: 90838,
    parkeringstilbyderNavn: "OSLO KOMMUNE BYMILJØETATEN",
    breddegrad: 59.904656,
    lengdegrad: 10.786025,
    deaktivert: { deaktivertTidspunkt: "2025-08-26T13:33:38Z" },
    versjonsnummer: 12,
    navn: "Turbinveien mellom Smeltedigelen og Freserveien",
    adresse: "Turbinveien mellom Smeltedigelen og Freserveien",
    custom_prices: [
      {
        label: "Standard (bensin/diesel/hybrid/ladbar hybrid)",
        applies_time: { start: "09:00", end: "20:00" },
        applies_days: [1, 2, 3, 4, 5, 6],
        tiers: [
          { duration_hours: 1, price: 69 },
          { duration_hours: 2, price: 136 },
          { duration_hours: 3, price: 201 },
          { duration_hours: 4, price: 268 },
          { duration_hours: 24, price: 333 },
        ],
        notes: "Avgiftstid man–lør 09:00–20:00. Maks tid: ubegrenset.",
      },
      {
        label: "Elbil",
        applies_time: { start: "09:00", end: "20:00" },
        applies_days: [1, 2, 3, 4, 5, 6],
        tiers: [
          { duration_hours: 1, price: 35 },
          { duration_hours: 2, price: 68 },
          { duration_hours: 3, price: 101 },
          { duration_hours: 4, price: 134 },
          { duration_hours: 24, price: 167 },
        ],
        notes: "Avgiftstid man–lør 09:00–20:00. Maks tid: ubegrenset.",
      },
    ],
    postnummer: "0195",
    poststed: "OSLO",
    aktiveringstidspunkt: "2025-06-04T13:34:07Z",
  },
  {
    id: 90879,
    parkeringstilbyderNavn: "OSLO KOMMUNE BYMILJØETATEN",
    breddegrad: 59.903835,
    lengdegrad: 10.786011,
    deaktivert: { deaktivertTidspunkt: "2025-08-26T13:33:54Z" },
    versjonsnummer: 12,
    navn: "Smeltedigelen mellom Turbinveien og Freserveien",
    adresse: "Smeltedigelen mellom Turbinveien og Freserveien",
    custom_prices: [
      {
        label: "Standard (bensin/diesel/hybrid/ladbar hybrid)",
        applies_time: { start: "09:00", end: "20:00" },
        applies_days: [1, 2, 3, 4, 5, 6],
        tiers: [
          { duration_hours: 1, price: 69 },
          { duration_hours: 2, price: 136 },
          { duration_hours: 3, price: 201 },
          { duration_hours: 4, price: 268 },
          { duration_hours: 24, price: 333 },
        ],
        notes: "Avgiftstid man–lør 09:00–20:00. Maks tid: ubegrenset.",
      },
      {
        label: "Elbil",
        applies_time: { start: "09:00", end: "20:00" },
        applies_days: [1, 2, 3, 4, 5, 6],
        tiers: [
          { duration_hours: 1, price: 35 },
          { duration_hours: 2, price: 68 },
          { duration_hours: 3, price: 101 },
          { duration_hours: 4, price: 134 },
          { duration_hours: 24, price: 167 },
        ],
        notes: "Avgiftstid man–lør 09:00–20:00. Maks tid: ubegrenset.",
      },
    ],
    postnummer: "0195",
    poststed: "OSLO",
    aktiveringstidspunkt: "2025-06-04T13:34:09Z",
  },
  {
    id: 61568,
    parkeringstilbyderNavn: "ONEPARK AS AVD HOVEDKONTOR",
    breddegrad: 59.90462,
    lengdegrad: 10.787207,
    deaktivert: null,
    versjonsnummer: 5,
    navn: "Kværnerbyen P-hus",
    adresse: "Turbinveien 4B",
    //     Paid parking applies every day, 24 hours (00:00 - 24:00)
    // Kiwi customers: 1 hour free by entering the vehicle number on the screen at Kiwi.
    // 0 kr
    // All days 07:00 - 17:00, per commenced 30 minutes.
    // 35 kr
    // All days 17:00 - 07:00, per commenced 30 minutes.
    // 20 kr
    // Maximum price for continuous parking within 12 hours (Mon-Fri 17:00-07:00 and Fri 17:00 to Mon 07:00)
    // 150 kr
    // Maximum price per continuous parking within 24 hours
    // 380 kr
    // Payment methods

    daily_max_price: 380,
    custom_prices: [
      {
        label: "Kiwi-kunder",
        free_minutes: 60,
        applies_time: null,
        notes: "Oppgi bilnummer på skjermen hos Kiwi.",
      },
    ],

    priser: [
      {
        day: 1,
        name: "Mandag",
        price_list: [
          {
            start: "07:00",
            end: "17:00",
            duration_minutes: 30,
            price: 35,
            max_price: null,
          },
          {
            start: "17:00",
            end: "07:00",
            duration_minutes: 30,
            price: 20,
            max_price: 150,
          },
        ],
      },
      {
        day: 2,
        name: "Tirsdag",
        price_list: [
          {
            start: "07:00",
            end: "17:00",
            duration_minutes: 30,
            price: 35,
            max_price: null,
          },
          {
            start: "17:00",
            end: "07:00",
            duration_minutes: 30,
            price: 20,
            max_price: 150,
          },
        ],
      },
      {
        day: 3,
        name: "Onsdag",
        price_list: [
          {
            start: "07:00",
            end: "17:00",
            duration_minutes: 30,
            price: 35,
            max_price: null,
          },
          {
            start: "17:00",
            end: "07:00",
            duration_minutes: 30,
            price: 20,
            max_price: 150,
          },
        ],
      },
      {
        day: 4,
        name: "Torsdag",
        price_list: [
          {
            start: "07:00",
            end: "17:00",
            duration_minutes: 30,
            price: 35,
            max_price: null,
          },
          {
            start: "17:00",
            end: "07:00",
            duration_minutes: 30,
            price: 20,
            max_price: 150,
          },
        ],
      },
      {
        day: 5,
        name: "Fredag",
        price_list: [
          {
            start: "07:00",
            end: "17:00",
            duration_minutes: 30,
            price: 35,
            max_price: null,
          },
          {
            start: "17:00",
            end: "07:00",
            duration_minutes: 30,
            price: 20,
            max_price: 150,
          },
        ],
      },
      {
        day: 6,
        name: "Lørdag",
        price_list: [
          {
            start: "07:00",
            end: "17:00",
            duration_minutes: 30,
            price: 35,
            max_price: null,
          },
          {
            start: "17:00",
            end: "07:00",
            duration_minutes: 30,
            price: 20,
            max_price: 150,
          },
        ],
      },
      {
        day: 7,
        name: "Søndag",
        price_list: [
          {
            start: "07:00",
            end: "17:00",
            duration_minutes: 30,
            price: 35,
            max_price: null,
          },
          {
            start: "17:00",
            end: "07:00",
            duration_minutes: 30,
            price: 20,
            max_price: 150,
          },
        ],
      },
    ],

    postnummer: "0195",
    poststed: "OSLO",
    aktiveringstidspunkt: "2023-09-04T10:00:41Z",
  },
  {
    id: 62431,
    parkeringstilbyderNavn: "ONEPARK AS AVD HOVEDKONTOR",
    breddegrad: 59.90434,
    lengdegrad: 10.788072,
    deaktivert: null,
    versjonsnummer: 17,
    navn: "Turbinveien-Ingeniørvn",
    adresse: "Turbinveien 9",
    easyparkSone: "0045",

    priser: [
      {
        day: 1,
        name: "Mandag",
        price_list: [
          {
            start: "08:00",
            end: "17:00",
            duration_minutes: 30,
            price: 30,
            max_price: null,
          },
          {
            start: "17:00",
            end: "08:00",
            duration_minutes: 30,
            price: 10,
            max_price: 75,
          },
        ],
      },
      {
        day: 2,
        name: "Tirsdag",
        price_list: [
          {
            start: "08:00",
            end: "17:00",
            duration_minutes: 30,
            price: 30,
            max_price: null,
          },
          {
            start: "17:00",
            end: "08:00",
            duration_minutes: 30,
            price: 10,
            max_price: 75,
          },
        ],
      },
      {
        day: 3,
        name: "Onsdag",
        price_list: [
          {
            start: "08:00",
            end: "17:00",
            duration_minutes: 30,
            price: 30,
            max_price: null,
          },
          {
            start: "17:00",
            end: "08:00",
            duration_minutes: 30,
            price: 10,
            max_price: 75,
          },
        ],
      },
      {
        day: 4,
        name: "Torsdag",
        price_list: [
          {
            start: "08:00",
            end: "17:00",
            duration_minutes: 30,
            price: 30,
            max_price: null,
          },
          {
            start: "17:00",
            end: "08:00",
            duration_minutes: 30,
            price: 10,
            max_price: 75,
          },
        ],
      },
      {
        day: 5,
        name: "Fredag",
        price_list: [
          {
            start: "08:00",
            end: "17:00",
            duration_minutes: 30,
            price: 30,
            max_price: null,
          },
          {
            start: "17:00",
            end: "08:00",
            duration_minutes: 30,
            price: 10,
            max_price: 75,
          },
        ],
      },
      {
        day: 6,
        name: "Lørdag",
        price_list: [
          {
            start: "08:00",
            end: "17:00",
            duration_minutes: 30,
            price: 10,
            max_price: 75,
          },
        ],
      },
      {
        day: 7,
        name: "Søndag",
        price_list: [
          {
            start: "08:00",
            end: "17:00",
            duration_minutes: 30,
            price: 10,
            max_price: 75,
          },
        ],
      },
    ],

    postnummer: "0195",
    poststed: "OSLO",
    aktiveringstidspunkt: "2025-05-16T09:57:50Z",
  },
  {
    id: 62813,
    parkeringstilbyderNavn: "ONEPARK AS AVD HOVEDKONTOR",
    breddegrad: 59.904046,
    lengdegrad: 10.785799,
    deaktivert: { deaktivertTidspunkt: "2024-09-03T09:26:14Z" },
    versjonsnummer: 3,
    navn: "Smeltedigelen 1- Turbinvn 2",
    adresse: "Smeltedigelen 1- Turbinvn 2",
    postnummer: "0195",
    poststed: "OSLO",
    aktiveringstidspunkt: "2023-09-04T09:45:55Z",
  },
];

export default parking;
