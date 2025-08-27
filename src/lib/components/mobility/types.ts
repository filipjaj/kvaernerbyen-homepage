export interface Translation {
  language: string;
  value: string;
}

export interface LocalizedName {
  translation: Translation[];
}

export interface SystemInfo {
  name: LocalizedName;
  operator: { id: string };
  openingHours?: string | null;
}

export interface VehicleAssets {
  iconUrl?: string | null;
  iconLastModified?: string | null;
}

export interface VehicleType {
  name: LocalizedName;
  vehicleAssets?: VehicleAssets | null;
  vehicleImage?: string | null;
  model?: string | null;
}

export interface RentalUris {
  web?: string | null;
  ios?: string | null;
}

export interface Vehicle {
  id: string;
  lat: number;
  lon: number;
  system: SystemInfo;
  currentRangeMeters?: number | null;
  currentFuelPercent?: number | null;
  vehicleType: VehicleType;
  rentalUris: RentalUris;
}

export interface VehicleResponse {
  id: string;
  lat: number;
  lon: number;
  system: string;
  name: string;
  operator: string;
  currentRangeMeters: number;
  iconUrl: string;
}
