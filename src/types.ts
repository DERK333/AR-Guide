export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface LandmarkSpecs {
  built: string;
  height: string;
  style: string;
  designer: string;
}

export interface TimelineEvent {
  year: string;
  event: string;
}

export interface LandmarkHotspot {
  x: number; // relative visually on the photo canvas, 0-100
  y: number; // 0-100
  type: 'architecture' | 'history' | 'trivia' | 'vibe';
  title: string;
  description: string;
}

export interface LandmarkDetails {
  isLandmark: boolean;
  name: string;
  city: string;
  country: string;
  coordinates: Coordinates;
  specs: LandmarkSpecs;
  historyOverview: string;
  timeline: TimelineEvent[];
  hotspots: LandmarkHotspot[];
  audioNarrationScript: string[];
  travelTip: string;
}

export interface Citation {
  title: string;
  url: string;
}

export interface ScanHistoryItem {
  id: string;
  timestamp: string;
  imageUri: string;
  details: LandmarkDetails;
  citations?: Citation[];
  familyMemoryNotes?: string;
  userRating?: number; // 1-5 stars
  companions?: string; // "Family", "Couple", "Friends", "Solo"
  weather?: string; // "Sunny", "Cloudy", "Rainy", "Windy", "Snowy"
  originalDetails?: LandmarkDetails; // pristine English original details backup
}

export interface PresetTouristDestination {
  id: string;
  name: string;
  city: string;
  country: string;
  thumbnailUrl: string; // generated or standard high resolution picture
}
