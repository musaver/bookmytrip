import { NextRequest, NextResponse } from 'next/server';
import { fetchStaticHotels, extractUniqueCities } from '@/lib/tripjack-api';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || '';
    
    console.log('Fetching cities with search:', search);
    
    // Get hotels from TripJack static API
    const staticHotelsResponse = await fetchStaticHotels();
    
    if (!staticHotelsResponse.status.success) {
      throw new Error('Failed to fetch hotels from TripJack API');
    }
    
    // Extract unique cities from hotel data
    const uniqueCities = extractUniqueCities(staticHotelsResponse);
    
    // Transform to expected format and count hotels per city
    const cityHotelCounts = new Map<string, number>();
    staticHotelsResponse.hotelOpInfos.forEach(hotel => {
      if (!hotel.isDeleted) {
        const cityName = hotel.cityName || hotel.address?.city?.name;
        if (cityName) {
          cityHotelCounts.set(cityName, (cityHotelCounts.get(cityName) || 0) + 1);
        }
      }
    });
    
    const transformedCities = uniqueCities.map(city => ({
      name: city.name,
      code: city.code || city.name.toLowerCase().replace(/\s+/g, '-'),
      country: getCountryName(city.countryCode) || 'Unknown Country',
      countryCode: city.countryCode,
      hotelCount: cityHotelCounts.get(city.name) || 0
    }));
    
    // Filter cities based on search query if provided
    let filteredCities = transformedCities;
    if (search && search.length > 0) {
      const searchLower = search.toLowerCase();
      filteredCities = transformedCities.filter(city => 
        city.name.toLowerCase().includes(searchLower) ||
        city.country.toLowerCase().includes(searchLower) ||
        city.code.toLowerCase().includes(searchLower)
      );
    }
    
    // Sort cities: exact matches first, then by hotel count, then by name
    filteredCities.sort((a, b) => {
      if (search) {
        const searchLower = search.toLowerCase();
        const aExact = a.name.toLowerCase() === searchLower;
        const bExact = b.name.toLowerCase() === searchLower;
        const aStarts = a.name.toLowerCase().startsWith(searchLower);
        const bStarts = b.name.toLowerCase().startsWith(searchLower);
        
        if (aExact && !bExact) return -1;
        if (!aExact && bExact) return 1;
        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;
      }
      
      // Sort by hotel count (descending), then by name
      if (b.hotelCount !== a.hotelCount) {
        return b.hotelCount - a.hotelCount;
      }
      return a.name.localeCompare(b.name);
    });
    
    // Limit results to 15 for better performance
    filteredCities = filteredCities.slice(0, 15);
    
    console.log(`Found ${filteredCities.length} cities from TripJack API`);
    
    return NextResponse.json({
      success: true,
      cities: filteredCities,
      total: filteredCities.length,
      source: 'TripJack API'
    });
    
  } catch (error) {
    console.error('Error in cities API via TripJack:', error);
    
    // Return fallback cities instead of error
    const fallbackCities = [
      { name: 'Chennai', code: 'chennai', country: 'India', countryCode: 'IN', hotelCount: 0 },
      { name: 'Mumbai', code: 'mumbai', country: 'India', countryCode: 'IN', hotelCount: 0 },
      { name: 'Delhi', code: 'delhi', country: 'India', countryCode: 'IN', hotelCount: 0 },
      { name: 'Bangalore', code: 'bangalore', country: 'India', countryCode: 'IN', hotelCount: 0 },
      { name: 'Dubai', code: 'dubai', country: 'United Arab Emirates', countryCode: 'AE', hotelCount: 0 }
    ];
    
    return NextResponse.json({
      success: true,
      cities: fallbackCities,
      total: fallbackCities.length,
      source: 'TripJack API',
      error: error instanceof Error ? error.message : 'Unknown error',
      fallback: true
    });
  }
}

// Helper function to get country name from code
function getCountryName(countryCode: string): string {
  const countryNames: { [key: string]: string } = {
    'AE': 'United Arab Emirates',
    'IN': 'India',
    'US': 'United States',
    'GB': 'United Kingdom',
    'FR': 'France',
    'DE': 'Germany',
    'IT': 'Italy',
    'ES': 'Spain',
    'JP': 'Japan',
    'CN': 'China',
    'AU': 'Australia',
    'CA': 'Canada',
    'BR': 'Brazil',
    'MX': 'Mexico',
    'TH': 'Thailand',
    'SG': 'Singapore',
    'MY': 'Malaysia',
    'ID': 'Indonesia',
    'PH': 'Philippines'
  };
  
  return countryNames[countryCode] || countryCode;
} 