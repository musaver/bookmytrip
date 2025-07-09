export interface Attraction {
  id: string;
  name: string;
  distance: {
    km: number;
    miles: number;
  };
  category?: 'historical' | 'natural' | 'cultural' | 'religious' | 'museum' | 'transportation' | 'entertainment' | 'shopping' | 'healthcare' | 'education' | 'recreation' | 'landmark' | 'beach' | 'park' | 'other';
  type?: string;
  description?: string;
}

export interface AttractionGroup {
  category: string;
  attractions: Attraction[];
  count: number;
}

export interface DistanceSummary {
  within1km: number;
  within1to5km: number;
  beyond5km: number;
} 