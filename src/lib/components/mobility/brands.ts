// Brand assets for micromobility providers
// Keys should match the friendly names returned by the API counts endpoint
// i.e. /api/entur/mobility?counts=true returns keys like "Bolt", "Ryde", "VOI"
export type BrandKey = "Bolt" | "Ryde" | "VOI" | string;

export interface BrandMeta {
  display: string; // Human friendly display name
  logo: string; // Brand logo URL
}

export const BRANDS: Record<string, BrandMeta> = {
  Bolt: {
    display: "Bolt",
    logo: "https://pub-8880548ea82e4e66913439824e2f4be4.r2.dev/Bolt%20Logo.svg",
  },
  Ryde: {
    display: "ryde",
    logo: "https://pub-8880548ea82e4e66913439824e2f4be4.r2.dev/Ryde%20Technology%20Logo.svg",
  },
  VOI: {
    display: "voi.",
    logo: "https://pub-8880548ea82e4e66913439824e2f4be4.r2.dev/VOI%20Technology%20Logo.svg",
  },
};

export function getBrandFor(key: string): BrandMeta {
  // Prefer direct match on friendly name
  const direct = BRANDS[key];
  if (direct) return direct;

  // Try case-insensitive match on display
  const lower = key.toLowerCase();
  const byDisplay = Object.values(BRANDS).find((b) => b.display.toLowerCase() === lower);
  if (byDisplay) return byDisplay;

  // Fallback: show key as-is with a generic scooter icon
  return {
    display: key,
    logo: "https://pub-8880548ea82e4e66913439824e2f4be4.r2.dev/Scooter%20Icon.png",
  };
}
