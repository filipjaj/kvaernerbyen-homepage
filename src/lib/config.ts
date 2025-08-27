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
  entur: {
    clientName: string;
    stopPlaces: Record<string, string>;
  };
  mobility: {
    bounds: {
      minLat: number;
      minLon: number;
      maxLat: number;
      maxLon: number;
    };
  };
  met: {
    user_agent: string;
  };
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
  entur: {
    clientName: "filipjohansen-kvaernerbyen",
    stopPlaces: {
      kvaernerbyen: "NSR:StopPlace:6552",
      kvaerner: "NSR:StopPlace:6555",
    },
  },
  met: {
    user_agent: "filipjohansen-kvaernerbyen",
  },
  mobility: {
    bounds: {
      minLon: 10.785531413861975,
      minLat: 59.90201124539607,
      maxLon: 10.792392246737961,
      maxLat: 59.905164954221334,
    },
  },
};
