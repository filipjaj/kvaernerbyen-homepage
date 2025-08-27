export type SiteConfig = {
  name: string;
  shortName?: string;
  tagline: string;
  logo: string; // path under /static
  location: {
    lat: number;
    lon: number;
    altitude?: number | null;
  };
  placeName: string; // human-readable locality name
};

export const site: SiteConfig = {
  name: "Kværnerbyen",
  shortName: "Kv.byen",
  tagline: "Tett på byen, nærmere naturen.",
  logo: "/KVB-logo.svg",
  location: {
    lat: 59.90439224446623,
    lon: 10.787901879453372,
    altitude: null,
  },
  placeName: "Kværnerbyen",
};
