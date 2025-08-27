// Velkommen til en levende og lun møteplass, med deilig håndverksbakst, kaffe fra vårt eget brenneri og frokost - og lunsjmat fra våre dyktige kokker.

// Øyvind Lofthus og arktitekt Darrell Shrubb har vært både miljøbevisste og kreative i jobben med designet av dette bakeriutsalget. Interiøret er sammensatt av gjenbrukte møbler og pyntegjenstander fra avdelinger som Parkveien, Barcode, Paleet og Lille Tøyen kolonial. Veggpanelet er laget av resirkulert trevare i teak og palisander fra møbler som ikke lenger kunne brukes.

// Helhehetlig har disse elementene gitt en lun, elegant og hjemlig atmosfære.

// Åpningstider
// Mandag - Fredag: 07.30 - 17.00

// Lørdag: 09.00 - 16.00

// Søndag: 09.00 - 16.00

// her holder vi til
// Smeltedigelen 4 , 0196 Oslo

// kontakt
// (+47) 45614125

// post@apentbakeri.no

//https://www.apentbakeri.no/kvaernerbyen

import type { Store } from "./schema";

export const apentbakeri: Store = {
  name: "Apent bakeri Kværnerbyen",
  openingHours: [
    { day: "Mandag", open: "07:30", close: "17:00", closed: false },
    { day: "Tirsdag", open: "07:30", close: "17:00", closed: false },
    { day: "Onsdag", open: "07:30", close: "17:00", closed: false },
    { day: "Torsdag", open: "07:30", close: "17:00", closed: false },
    { day: "Fredag", open: "07:30", close: "17:00", closed: false },
    { day: "Lørdag", open: "09:00", close: "16:00", closed: false },
    { day: "Søndag", open: "09:00", close: "16:00", closed: false },
  ],
  services: [],
  address: {
    street: "Smeltedigelen 4",
    zip: "0196",
    city: "Oslo",
  },
  contact: {
    phone: "45614125",
    email: "post@apentbakeri.no",
    url: "https://www.apentbakeri.no/kvaernerbyen",
  },
};
