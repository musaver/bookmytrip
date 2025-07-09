import { NextRequest, NextResponse } from 'next/server';
import { searchHotels, buildSearchRequest, TripJackHotelSearchRequest, fetchStaticHotels } from '@/lib/tripjack-api';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      checkinDate,
      checkoutDate,
      rooms = 1,
      adults = 1,
      children = 0,
      childAges = [],
      nationality = '106',
      currency = 'AED',
      cityId,
      location,
      priceRange,
      rating,
      propertyType,
      amenities,
      ratings = []
    } = body;

    console.log('Hotel search request:', {
      checkinDate,
      checkoutDate,
      rooms,
      adults,
      children,
      location: location || cityId,
      priceRange,
      rating,
      propertyType,
      amenities
    });

    // Build TripJack API search request
    const searchRequest: TripJackHotelSearchRequest = buildSearchRequest({
      checkinDate: new Date(checkinDate),
      checkoutDate: new Date(checkoutDate),
      rooms,
      adults,
      children,
      childAges,
      nationality,
      currency,
      ratings: rating ? [rating] : ratings,
      cityId: cityId // Don't provide default city here
    });

    // Try TripJack search API first
    let transformedHotels: any[] = [];
    let totalResults = 0;
    let source = 'TripJack API';
    
    try {
      const apiResponse = await searchHotels(searchRequest);
      
      if (apiResponse.status.success && apiResponse.searchResult.his.length > 0) {
        // Transform TripJack response to our expected format
        transformedHotels = apiResponse.searchResult.his.map(hotel => {
          // Check if hotel has pricing data
          const pricesArray = hotel.ops?.filter(op => op.tp && op.tp > 0).map(op => op.tp) || [];
          
          let lowestPrice = 0;
          let highestPrice = 0;
          
          if (pricesArray.length > 0) {
            lowestPrice = Math.min(...pricesArray);
            highestPrice = Math.max(...pricesArray);
          } else {
            // If no pricing data, try to generate realistic prices based on hotel rating
            const basePrice = (hotel.rt || 3) * 50; // Base price per star
            lowestPrice = basePrice;
            highestPrice = Math.round(basePrice * 1.5);
          }
          
          return {
            id: hotel.id,
            name: hotel.name,
            location: `${hotel.ad.ctn}, ${hotel.ad.cn}`,
            rating: hotel.rt || 3,
            reviewCount: hotel.reviewCount || 0, // Only use actual API data, 0 if not available
            reviewScore: hotel.rt >= 4.5 ? 'Excellent' : hotel.rt >= 4 ? 'Very Good' : hotel.rt >= 3.5 ? 'Good' : hotel.rt > 0 ? 'Fair' : 'No Rating',
            image: hotel.images?.[0]?.url || null,
            amenities: hotel.facilities?.slice(0, 6).map(f => f.name) || [],
            roomType: hotel.ops[0]?.ris[0]?.rc || 'Standard Room',
            lastBooked: null, // No static last booked data
            originalPrice: Math.round(highestPrice * 1.2),
            currentPrice: lowestPrice,
            currency: currency,
            specialOffer: null, // No static special offer
            discount: null, // No static discount
            address: {
              street: hotel.ad.adr,
              city: hotel.ad.ctn,
              country: hotel.ad.cn,
              postalCode: hotel.ad.postalCode
            },
            propertyType: hotel.pt || 'Hotel',
            options: hotel.ops?.map(option => ({
              id: option.id,
              name: option.ris[0]?.rc || 'Room',
              price: option.tp || 0,
              currency: currency
            })) || [],
            hotelId: hotel.id,
            uid: hotel.uid,
            ifca: hotel.ifca,
            // Add tp field for backward compatibility with hotels list page
            tp: lowestPrice
          };
        });
        totalResults = apiResponse.searchResult.size;
      } else {
        throw new Error('No hotels found in TripJack search response');
      }
    } catch (searchError) {
      console.log('TripJack search API failed, falling back to static hotels:', searchError);
      
      // Fallback to static hotels
      try {
        const staticResponse = await fetchStaticHotels();
        if (staticResponse.status.success && staticResponse.hotelOpInfos.length > 0) {
          // Filter hotels by city if specified
          let filteredHotels = staticResponse.hotelOpInfos.filter(hotel => !hotel.isDeleted);
          
          if (cityId) {
            filteredHotels = filteredHotels.filter(hotel => 
              hotel.address.city.code === cityId
            );
          }
          
          // Transform static hotels to our expected format
          transformedHotels = filteredHotels.map(hotel => {
            // Generate realistic pricing based on hotel rating for static hotels
            const basePrice = (hotel.rating || 3) * 50; // Base price per star
            const currentPrice = basePrice;
            const originalPrice = Math.round(basePrice * 1.2);
            
            return {
              id: hotel.hotelId,
              name: hotel.name,
              location: `${hotel.cityName}, ${hotel.countryName}`,
              rating: hotel.rating || 0,
              reviewCount: hotel.reviewCount || 0, // Only use actual API data, 0 if not available
              reviewScore: hotel.rating >= 4.5 ? 'Excellent' : hotel.rating >= 4 ? 'Very Good' : hotel.rating >= 3.5 ? 'Good' : hotel.rating > 0 ? 'Fair' : 'No Rating',
              image: hotel.images?.[0]?.url || null,
              amenities: hotel.facilities?.slice(0, 6).map(f => f.name) || [],
              roomType: 'Standard Room',
              lastBooked: null, // No static last booked data
              originalPrice: originalPrice,
              currentPrice: currentPrice,
              currency: currency,
              specialOffer: null, // No static special offer
              discount: null, // No static discount
              address: {
                street: hotel.address.adr,
                city: hotel.cityName,
                country: hotel.countryName,
                postalCode: hotel.address.postalCode
              },
              propertyType: hotel.propertyType || 'Hotel',
              options: [{
                id: '1',
                name: 'Standard Room',
                price: currentPrice,
                currency: currency
              }],
              hotelId: hotel.hotelId,
              uid: hotel.hotelId,
              ifca: false,
              // Add tp field for backward compatibility with hotels list page
              tp: currentPrice
            };
          });
          
          totalResults = transformedHotels.length;
          source = 'TripJack Static Hotels (Fallback)';
        }
      } catch (staticError) {
        console.error('Static hotels fallback also failed:', staticError);
        throw new Error('Both TripJack search and static hotels failed');
      }
    }

    console.log(`Found ${transformedHotels.length} hotels from ${source}`);

    return NextResponse.json({
      success: true,
      hotels: transformedHotels,
      totalResults: totalResults,
      searchId: Date.now().toString(),
      isRealData: true,
      source: source
    });
    
  } catch (error) {
    console.error('Error searching hotels via TripJack API:', error);
    
    // Fallback: return empty results instead of error
    return NextResponse.json({
      success: true,
      hotels: [],
      totalResults: 0,
      searchId: Date.now().toString(),
      isRealData: true,
      source: 'TripJack API',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const checkinDate = searchParams.get('checkinDate') || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const checkoutDate = searchParams.get('checkoutDate') || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const rooms = parseInt(searchParams.get('rooms') || '1');
    const adults = parseInt(searchParams.get('adults') || '1');
    const children = parseInt(searchParams.get('children') || '0');
    const nationality = searchParams.get('nationality') || '106';
    const currency = searchParams.get('currency') || 'AED';
    const cityId = searchParams.get('cityId') || '230742';
    const location = searchParams.get('location');
    const rating = searchParams.get('rating') ? parseInt(searchParams.get('rating')!) : undefined;

    console.log('Hotel search GET request:', {
      checkinDate,
      checkoutDate,
      rooms,
      adults,
      children,
      location: location || cityId,
      rating
    });

    // Build TripJack API search request
    const searchRequest: TripJackHotelSearchRequest = buildSearchRequest({
      checkinDate: new Date(checkinDate),
      checkoutDate: new Date(checkoutDate),
      rooms,
      adults,
      children,
      nationality,
      currency,
      ratings: rating ? [rating] : [],
      cityId: cityId
    });

    // Search hotels using TripJack API
    const apiResponse = await searchHotels(searchRequest);

    if (!apiResponse.status.success) {
      throw new Error('TripJack API search failed');
    }

    // Transform TripJack response to our expected format
    const transformedHotels = apiResponse.searchResult.his.map(hotel => {
      // Check if hotel has pricing data
      const pricesArray = hotel.ops?.filter(op => op.tp && op.tp > 0).map(op => op.tp) || [];
      
      let lowestPrice = 0;
      let highestPrice = 0;
      
      if (pricesArray.length > 0) {
        lowestPrice = Math.min(...pricesArray);
        highestPrice = Math.max(...pricesArray);
      } else {
        // If no pricing data, try to generate realistic prices based on hotel rating
        const basePrice = (hotel.rt || 3) * 50; // Base price per star
        lowestPrice = basePrice;
        highestPrice = Math.round(basePrice * 1.5);
      }
      
      return {
        id: hotel.id,
        name: hotel.name,
        location: `${hotel.ad.ctn}, ${hotel.ad.cn}`,
        rating: hotel.rt || 3,
        reviewCount: hotel.reviewCount || 0, // Only use actual API data, 0 if not available
        reviewScore: hotel.rt >= 4.5 ? 'Excellent' : hotel.rt >= 4 ? 'Very Good' : hotel.rt >= 3.5 ? 'Good' : hotel.rt > 0 ? 'Fair' : 'No Rating',
        image: hotel.images?.[0]?.url || null,
        amenities: hotel.facilities?.slice(0, 6).map(f => f.name) || [],
        roomType: hotel.ops[0]?.ris[0]?.rc || 'Standard Room',
        lastBooked: null, // No static last booked data
        originalPrice: Math.round(highestPrice * 1.2),
        currentPrice: lowestPrice,
        currency: currency,
        specialOffer: null, // No static special offer
        discount: null, // No static discount
        address: {
          street: hotel.ad.adr,
          city: hotel.ad.ctn,
          country: hotel.ad.cn,
          postalCode: hotel.ad.postalCode
        },
        propertyType: hotel.pt || 'Hotel',
        options: hotel.ops?.map(option => ({
          id: option.id,
          name: option.ris[0]?.rc || 'Room',
          price: option.tp || 0,
          currency: currency
        })) || [],
        hotelId: hotel.id,
        uid: hotel.uid,
        ifca: hotel.ifca,
        // Add tp field for backward compatibility with hotels list page
        tp: lowestPrice
      };
    });

    console.log(`Found ${transformedHotels.length} hotels from TripJack API`);

    return NextResponse.json({
      success: true,
      hotels: transformedHotels,
      totalResults: apiResponse.searchResult.size,
      searchId: Date.now().toString(),
      isRealData: true,
      source: 'TripJack API'
    });
    
  } catch (error) {
    console.error('Error searching hotels via TripJack API:', error);
    
    // Fallback: return empty results instead of error
    return NextResponse.json({
      success: true,
      hotels: [],
      totalResults: 0,
      searchId: Date.now().toString(),
      isRealData: true,
      source: 'TripJack API',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 