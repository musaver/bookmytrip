// Flight Search Types for Tripjack API

export interface FlightSearchRequest {
  searchQuery: {
    cabinClass: string;
    paxInfo: {
      ADULT: number;
      CHILD: number;
      INFANT: number;
    };
    routeInfos: Array<{
      fromCityOrAirport: {
        code: string;
        name?: string;
        cityCode?: string;
        countryCode?: string;
      };
      toCityOrAirport: {
        code: string;
        name?: string;
        cityCode?: string;
        countryCode?: string;
      };
      travelDate: string; // YYYY-MM-DD format
    }>;
    searchModifiers: {
      isDirectFlight: boolean;
      isConnectingFlight: boolean;
    };
  };
}

export interface FlightSearchResponse {
  searchResult: {
    tripInfos: Array<{
      ONWARD?: FlightInfo[];
      RETURN?: FlightInfo[];
    }>;
    totalPriceList: Array<{
      id: string;
      fareIdentifier: string;
      fd: {
        ADULT?: {
          fC: {
            BF: number; // Base fare
            TAF: number; // Total after fare
            NF: number; // Net fare
          };
          afC: {
            TAF: number; // Total after fare with markup
          };
        };
        CHILD?: {
          fC: {
            BF: number;
            TAF: number;
            NF: number;
          };
          afC: {
            TAF: number;
          };
        };
        INFANT?: {
          fC: {
            BF: number;
            TAF: number;
            NF: number;
          };
          afC: {
            TAF: number;
          };
        };
      };
    }>;
  };
}

export interface FlightInfo {
  sI: Array<{
    fD: string; // Flight date
    id: string;
    stops: number;
    so: number; // Stop over
    duration: number; // in minutes
    da: {
      code: string; // Destination airport code
      name: string;
      cityCode: string;
      terminal?: string;
      countryCode: string;
    };
    aa: {
      code: string; // Arrival airport code
      name: string;
      cityCode: string;
      terminal?: string;
      countryCode: string;
    };
    dt: string; // Departure time
    at: string; // Arrival time
    al: {
      code: string; // Airline code
      name: string;
    };
    fN: string; // Flight number
    eT: string; // Equipment type
    cc: string; // Cabin class
  }>;
  totalPriceList: Array<{
    fareIdentifier: string;
    fd: {
      ADULT?: {
        fC: {
          BF: number;
          TAF: number;
          NF: number;
        };
        afC: {
          TAF: number;
        };
      };
    };
  }>;
}

// UI State Types
export interface FlightSearchParams {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  adults: number;
  children: number;
  infants: number;
  cabinClass: 'ECONOMY' | 'PREMIUM_ECONOMY' | 'BUSINESS' | 'FIRST';
  isRoundTrip: boolean;
  isDirectFlight?: boolean;
}

export interface FlightResult {
  id: string;
  airline: {
    code: string;
    name: string;
    logo?: string;
  };
  flightNumber: string;
  aircraft?: string;
  departure: {
    airport: {
      code: string;
      name: string;
      city: string;
    };
    time: string;
    date: string;
    terminal?: string;
  };
  arrival: {
    airport: {
      code: string;
      name: string;
      city: string;
    };
    time: string;
    date: string;
    terminal?: string;
  };
  duration: {
    total: number; // in minutes
    formatted: string; // e.g., "2h 30m"
  };
  stops: number;
  price: {
    total: number;
    currency: string;
    breakdown?: {
      baseFare: number;
      taxes: number;
      fees: number;
    };
  };
  cabinClass: string;
  seatsLeft?: number;
  baggage?: {
    checkedBags: number;
    carryOn: boolean;
  };
  amenities?: string[];
  refundable?: boolean;
  changeable?: boolean;
}

export interface FlightFilters {
  priceRange?: {
    min: number;
    max: number;
  };
  durationRange?: {
    min: number;
    max: number;
  };
  airlines?: string[];
  stops?: number;
  departureTime?: string;
  arrivalTime?: string;
  departureAirports?: string[];
  arrivalAirports?: string[];
  refundable?: boolean;
  changeable?: boolean;
}

export interface FlightSearchState {
  loading: boolean;
  error: string | null;
  results: FlightResult[];
  filters: FlightFilters;
  searchParams: FlightSearchParams | null;
  totalResults: number;
  currentPage: number;
  resultsPerPage: number;
  sortBy: 'price' | 'duration' | 'departure' | 'arrival' | 'stops';
  sortOrder: 'asc' | 'desc';
} 