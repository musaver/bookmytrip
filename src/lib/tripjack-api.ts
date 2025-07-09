// TripJack API Configuration and Helper Functions

const TRIPJACK_API_KEY = '512659b4c4bebe-c990-40a3-b6c5-cef5dbfd2017';
const TRIPJACK_BASE_URL = 'https://apitest.tripjack.com/hms/v1';

// API Headers
const getHeaders = () => ({
  'Content-Type': 'application/json',
  'apikey': TRIPJACK_API_KEY
});

// Types based on TripJack API documentation
export interface TripJackHotelSearchRequest {
  searchQuery: {
    checkinDate: string;
    checkoutDate: string;
    roomInfo: Array<{
      numberOfAdults: number;
      numberOfChild: number;
      childAge: number[];
    }>;
    searchCriteria: {
      nationality: string;
      currency: string;
      cityId?: string;
      hotelIds?: string[];
    };
    searchPreferences: {
      ratings: number[];
      hids: string[];
      fsc: boolean;
    };
  };
  sync: boolean;
}

export interface TripJackHotelSearchResponse {
  searchResult: {
    his: Array<{
      id: string;
      name: string;
      rt: number;
      ad: {
        adr: string;
        adr2?: string;
        postalCode: string;
        ctn: string;
        cn: string;
      };
      pt: string;
      ops: Array<{
        ris: Array<{
          id: string;
          rc: string;
          mb: string;
          tp: number;
        }>;
        id: string;
        tp: number;
      }>;
      uid: string;
      ifca?: boolean;
      // Add optional fields that may be present in the response
      images?: Array<{
        url: string;
        sz: string;
      }>;
      facilities?: Array<{
        name: string;
        type?: string;
      }>;
      reviewCount?: number;
    }>;
    size: number;
  };
  status: {
    success: boolean;
    httpStatus: number;
  };
}

export interface TripJackHotelDetailRequest {
  id: string;
}

export interface TripJackStaticHotelsResponse {
  hotelOpInfos: Array<{
    name: string;
    description: string;
    rating: number;
    geolocation: {
      ln: string;
      lt: string;
    };
    address: {
      adr: string;
      postalCode: string;
      city: {
        code: string;
        name: string;
      };
      state: {
        code: string;
        name: string;
      };
      country: {
        code: string;
        name: string;
      };
    };
    cityName: string;
    countryName: string;
    images: Array<{
      url: string;
      sz: string;
    }>;
    facilities: Array<{
      name: string;
      type?: string;
    }>;
    propertyType: string;
    contact: {
      ph: string;
      em: string[];
      fax: string;
      wb: string;
    };
    hotelId: string;
    isDeleted: boolean;
    reviewCount?: number;
  }>;
  next?: string;
  status: {
    success: boolean;
    httpStatus: number;
  };
}

// API Functions
export const searchHotels = async (searchParams: TripJackHotelSearchRequest): Promise<TripJackHotelSearchResponse> => {
  try {
    const response = await fetch(`${TRIPJACK_BASE_URL}/hotel-searchquery-list`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(searchParams)
    });

          if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
      }

      const data = await response.json();
      return data;
  } catch (error) {
    console.error('Error searching hotels:', error);
    throw error;
  }
};

export const getHotelDetails = async (hotelId: string): Promise<any> => {
  try {
    console.log(`Calling TripJack hotel detail search for ID: ${hotelId}`);
    
    const response = await fetch(`${TRIPJACK_BASE_URL}/hotelDetail-search`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ id: hotelId })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.log(`TripJack API returned ${response.status}: ${errorText}`);
      throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
    }

    const data = await response.json();
    
    // Check if the response indicates the hotel is not available
    if (!data.status?.success) {
      const errorMessage = data.errors?.[0]?.message || 'Unknown error';
      const errorCode = data.errors?.[0]?.errCode || 'UNKNOWN';
      console.log(`TripJack API error for hotel ${hotelId}: ${errorCode} - ${errorMessage}`);
      
      // Throw a more descriptive error for specific error codes
      if (errorCode === '6003') {
        throw new Error(`Hotel ${hotelId} is no longer available according to TripJack API`);
      }
      
      throw new Error(`TripJack API error: ${errorMessage} (Code: ${errorCode})`);
    }
    
    console.log(`Successfully retrieved hotel details for ${hotelId} from TripJack API`);
    return data;
  } catch (error) {
    console.error(`Error fetching hotel details for ${hotelId}:`, error);
    throw error;
  }
};

export const fetchStaticHotels = async (next?: string): Promise<TripJackStaticHotelsResponse> => {
  try {
    const body = next ? { next } : {};
    const response = await fetch(`${TRIPJACK_BASE_URL}/fetch-static-hotels`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching static hotels:', error);
    throw error;
  }
};

// Helper function to format dates for API
export const formatDateForAPI = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

// Helper function to extract unique cities from static hotels
export const extractUniqueCities = (hotelData: TripJackStaticHotelsResponse): Array<{
  name: string;
  code: string;
  country: string;
  countryCode: string;
}> => {
  const cities = new Map();
  
  hotelData.hotelOpInfos.forEach(hotel => {
    const cityKey = `${hotel.address.city.name}-${hotel.address.country.code}`;
    if (!cities.has(cityKey)) {
      cities.set(cityKey, {
        name: hotel.address.city.name,
        code: hotel.address.city.code,
        country: hotel.address.country.name,
        countryCode: hotel.address.country.code
      });
    }
  });
  
  return Array.from(cities.values()).sort((a, b) => a.name.localeCompare(b.name));
};

// Helper function to validate if a hotel ID exists in static data
export const validateHotelId = async (hotelId: string): Promise<{
  exists: boolean;
  hotel?: any;
  source: 'static' | 'not_found';
}> => {
  try {
    const staticHotels = await fetchStaticHotels();
    
    if (!staticHotels?.status?.success || !staticHotels.hotelOpInfos) {
      return { exists: false, source: 'not_found' };
    }
    
    // Try exact match first
    let hotel = staticHotels.hotelOpInfos.find(h => 
      h.hotelId === hotelId && !h.isDeleted
    );
    
    if (hotel) {
      return { exists: true, hotel, source: 'static' };
    }
    
    // Try alternative matching
    hotel = staticHotels.hotelOpInfos.find(h => 
      !h.isDeleted && (
        h.hotelId?.toString() === hotelId?.toString() ||
        h.hotelId?.includes(hotelId) ||
        hotelId?.includes(h.hotelId)
      )
    );
    
    if (hotel) {
      return { exists: true, hotel, source: 'static' };
    }
    
    return { exists: false, source: 'not_found' };
  } catch (error) {
    console.error('Error validating hotel ID:', error);
    return { exists: false, source: 'not_found' };
  }
};

// Helper function to get sample available hotel IDs
export const getSampleHotelIds = async (limit: number = 5): Promise<Array<{
  id: string;
  name: string;
  city: string;
}>> => {
  try {
    const staticHotels = await fetchStaticHotels();
    
    if (!staticHotels?.status?.success || !staticHotels.hotelOpInfos) {
      return [];
    }
    
    return staticHotels.hotelOpInfos
      .filter(h => !h.isDeleted)
      .slice(0, limit)
      .map(h => ({
        id: h.hotelId,
        name: h.name,
        city: h.cityName || h.address?.city?.name || 'Unknown City'
      }));
  } catch (error) {
    console.error('Error getting sample hotel IDs:', error);
    return [];
  }
};

// Helper function to build search request
export const buildSearchRequest = (params: {
  checkinDate: Date;
  checkoutDate: Date;
  rooms: number;
  adults: number;
  children: number;
  childAges?: number[];
  nationality?: string;
  currency?: string;
  ratings?: number[];
  cityId?: string;
  hotelIds?: string[];
}): TripJackHotelSearchRequest => {
  const roomInfo = [];
  
  // Generate child ages if not provided (default to ages 5-12)
  const childAges = params.childAges || [];
  while (childAges.length < params.children) {
    childAges.push(Math.floor(Math.random() * 8) + 5); // Ages 5-12
  }
  
  // For now, we'll distribute guests evenly across rooms
  const adultsPerRoom = Math.ceil(params.adults / params.rooms);
  const childrenPerRoom = Math.ceil(params.children / params.rooms);
  
  for (let i = 0; i < params.rooms; i++) {
    const adults = i === params.rooms - 1 ? 
      params.adults - (adultsPerRoom * (params.rooms - 1)) : 
      adultsPerRoom;
    
    const children = i === params.rooms - 1 ? 
      params.children - (childrenPerRoom * (params.rooms - 1)) : 
      childrenPerRoom;
    
    // Get child ages for this room
    const roomChildAges = childAges.slice(i * childrenPerRoom, (i + 1) * childrenPerRoom);
    
    roomInfo.push({
      numberOfAdults: Math.max(1, adults),
      numberOfChild: Math.max(0, children),
      childAge: roomChildAges.slice(0, children) // Ensure array length matches numberOfChild
    });
  }
  
  // Ensure we have either cityId or hotelIds for the search criteria
  const searchCriteria: any = {
    nationality: params.nationality || '106',
    currency: params.currency || 'INR'
  };
  
  if (params.cityId) {
    searchCriteria.cityId = params.cityId;
  } else if (params.hotelIds && params.hotelIds.length > 0) {
    searchCriteria.hotelIds = params.hotelIds;
  } else {
    // If no cityId or hotelIds provided, use a default city (Chennai)
    searchCriteria.cityId = '230742';
  }
  
  return {
    searchQuery: {
      checkinDate: formatDateForAPI(params.checkinDate),
      checkoutDate: formatDateForAPI(params.checkoutDate),
      roomInfo,
      searchCriteria,
      searchPreferences: {
        ratings: params.ratings || [1, 2, 3, 4, 5],
        hids: params.hotelIds || [],
        fsc: true
      }
    },
    sync: true
  };
}; 