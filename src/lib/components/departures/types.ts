export interface SituationText {
  value: string;
  language: string;
}
export interface Situation {
  id: string;
  description?: SituationText[];
  summary?: SituationText[];
}
export interface LinePresentation {
  textColour?: string; // e.g. "FFFFFF"
  colour?: string; // e.g. "E60000"
}
export interface Line {
  id: string;
  publicCode?: string; // "54"
  presentation?: LinePresentation;
}
export interface ServiceJourney {
  id: string;
  transportMode: string; // "bus"
  transportSubmode?: string;
  line: Line;
}
export interface Quay { publicCode?: string | null; name?: string | null }
export interface DestinationDisplay { frontText: string; via?: string[] }

export interface EstimatedCall {
  quay: Quay;
  destinationDisplay: DestinationDisplay;
  aimedDepartureTime: string; // ISO
  expectedDepartureTime: string; // ISO
  expectedArrivalTime?: string; // ISO
  serviceJourney: ServiceJourney;
  cancellation: boolean;
  realtime: boolean;
  situations?: Situation[];
}

export interface StopPlace {
  name: string;
  transportMode: string[];
  estimatedCalls: EstimatedCall[];
  situations?: Situation[];
}

export interface StopWrapper { stopPlace: StopPlace }
