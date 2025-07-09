import { NextRequest, NextResponse } from 'next/server';
import { getHotelDetails, fetchStaticHotels } from '@/lib/tripjack-api';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: hotelId } = await params;

    console.log(`Fetching hotel details for ID: ${hotelId}`);

    // Try to get hotel details from TripJack API first
    let hotelDetails;
    let usingFallback = false;
    
    try {
      console.log(`Attempting TripJack hotel detail search for ID: ${hotelId}`);
      hotelDetails = await getHotelDetails(hotelId);
      
      if (!hotelDetails || !hotelDetails.status?.success) {
        throw new Error(`TripJack detail search failed: ${hotelDetails?.errors?.[0]?.message || 'Unknown error'}`);
      }
      
      console.log(`Successfully fetched hotel details from TripJack API for ID: ${hotelId}`);
    } catch (error) {
      console.log(`Hotel detail search failed for ID ${hotelId}:`, error instanceof Error ? error.message : error);
      console.log('Falling back to static hotels API...');
      
      // Fallback: try to find hotel in static hotels
      const staticHotels = await fetchStaticHotels();
      
      if (!staticHotels?.status?.success || !staticHotels.hotelOpInfos) {
        throw new Error('Both TripJack detail search and static hotels API failed');
      }
      
      // Try to find the hotel in static data
      const staticHotel = staticHotels.hotelOpInfos.find(h => 
        h.hotelId === hotelId && !h.isDeleted
      );
      
      if (!staticHotel) {
        // Try alternative matching strategies
        const alternativeHotel = staticHotels.hotelOpInfos.find(h => 
          !h.isDeleted && (
            h.hotelId?.toString() === hotelId?.toString() ||
            h.hotelId?.includes(hotelId) ||
            hotelId?.includes(h.hotelId)
          )
        );
        
        if (!alternativeHotel) {
          console.log(`Hotel ID ${hotelId} not found in static hotels either`);
          return NextResponse.json(
            { 
              success: false, 
              error: `Hotel with ID ${hotelId} not found. This hotel may no longer be available or the ID may be incorrect.`,
              availableHotels: staticHotels.hotelOpInfos.slice(0, 5).map(h => ({
                id: h.hotelId,
                name: h.name,
                city: h.cityName
              }))
            },
            { status: 404 }
          );
        }
        
        console.log(`Found hotel ${hotelId} using alternative matching: ${alternativeHotel.name}`);
        // Convert static hotel data to details format
        hotelDetails = {
          hotelOpInfo: alternativeHotel,
          status: { success: true, httpStatus: 200 }
        };
      } else {
        console.log(`Found hotel ${hotelId} in static data: ${staticHotel.name}`);
        // Convert static hotel data to details format
        hotelDetails = {
          hotelOpInfo: staticHotel,
          status: { success: true, httpStatus: 200 }
        };
      }
      
      usingFallback = true;
    }

    // Extract hotel info (handle both detail and static responses)
    const hotel = hotelDetails.hotelOpInfo || hotelDetails.hotelDetails?.hotelOpInfo;
    
    if (!hotel) {
      console.error(`Invalid hotel data structure for ID ${hotelId}:`, hotelDetails);
      return NextResponse.json(
        { success: false, error: 'Invalid hotel data structure received from API' },
        { status: 500 }
      );
    }

    // Transform TripJack hotel data to our expected format
    const transformedHotel = {
      id: hotel.hotelId || hotelId,
      name: hotel.name || 'Hotel Name Not Available',
      description: hotel.description || 'Hotel description not available.',
      rating: hotel.rating || 0,
      reviewScore: hotel.rating >= 4.5 ? 'Excellent' : hotel.rating >= 4 ? 'Very Good' : hotel.rating >= 3.5 ? 'Good' : hotel.rating > 0 ? 'Fair' : 'No Rating',
      propertyType: hotel.propertyType || 'Hotel',
      location: {
        address: hotel.address?.adr || 'Address not available',
        city: hotel.address?.city?.name || hotel.cityName || 'City not available',
        state: hotel.address?.state?.name || 'State not available',
        country: hotel.address?.country?.name || hotel.countryName || 'Country not available',
        postalCode: hotel.address?.postalCode || '00000',
        coordinates: {
          latitude: parseFloat(hotel.geolocation?.lt || '0'),
          longitude: parseFloat(hotel.geolocation?.ln || '0')
        }
      },
      contact: {
        phone: hotel.contact?.ph || 'Phone not available',
        email: hotel.contact?.em?.[0] || 'Email not available',
        website: hotel.contact?.wb || 'Website not available'
      },
      // Use only actual images from API, no fallbacks
      images: hotel.images?.length > 0 ? hotel.images.map((img: any) => ({
        url: img.url,
        size: img.sz || 'Standard',
        caption: hotel.name || 'Hotel Image'
      })) : [],
      // Use only actual facilities from API, no fallbacks
      facilities: hotel.facilities?.map((facility: any) => ({
        name: facility.name,
        type: facility.type || 'amenity',
        icon: getFacilityIcon(facility.name)
      })) || [],
      // Get room types from actual hotel data if available
      roomTypes: generateRoomTypesFromHotel(hotel),
      policies: {
        checkIn: hotel.policies?.checkIn || 'Contact hotel for check-in time',
        checkOut: hotel.policies?.checkOut || 'Contact hotel for check-out time',
        cancellation: hotel.policies?.cancellation || 'Contact hotel for cancellation policy',
        children: hotel.policies?.children || 'Contact hotel for children policy',
        pets: hotel.policies?.pets || 'Contact hotel for pet policy',
        smoking: hotel.policies?.smoking || 'Contact hotel for smoking policy',
        extraBed: hotel.policies?.extraBed || 'Contact hotel for extra bed policy'
      },
      // Get nearby attractions from hotel data
      nearbyAttractions: generateNearbyAttractions(hotel),
      reviewsSummary: {
        overall: hotel.rating || 0,
        categories: {
          cleanliness: hotel.rating || 0,
          comfort: hotel.rating || 0,
          location: hotel.rating || 0,
          service: hotel.rating || 0,
          value: hotel.rating || 0,
          wifi: hotel.rating || 0
        }
      }
    };

    console.log(`Successfully transformed hotel details for: ${transformedHotel.name} (using ${usingFallback ? 'static fallback' : 'TripJack API'})`);

    return NextResponse.json({
      success: true,
      hotel: transformedHotel,
      source: usingFallback ? 'TripJack Static Hotels (Fallback)' : 'TripJack API',
      note: usingFallback ? 'Hotel details loaded from static data due to API limitations' : undefined
    });

  } catch (error) {
    console.error('Error fetching hotel details:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred while fetching hotel details',
      hotel: null,
      troubleshooting: {
        message: 'If you are seeing this error, the hotel ID may not exist or the hotel may no longer be available.',
        suggestion: 'Please try searching for hotels in your desired city to find available options.'
      }
    }, { status: 500 });
  }
}

// Helper function to get appropriate icon for facility
function getFacilityIcon(facilityName: string): string {
  const name = facilityName.toLowerCase();
  if (name.includes('wifi') || name.includes('internet')) return 'fas fa-wifi';
  if (name.includes('air') || name.includes('conditioning')) return 'fas fa-snowflake';
  if (name.includes('pool') || name.includes('swimming')) return 'fas fa-swimming-pool';
  if (name.includes('gym') || name.includes('fitness')) return 'fas fa-dumbbell';
  if (name.includes('restaurant') || name.includes('dining')) return 'fas fa-utensils';
  if (name.includes('bar') || name.includes('lounge')) return 'fas fa-cocktail';
  if (name.includes('spa') || name.includes('wellness')) return 'fas fa-spa';
  if (name.includes('parking')) return 'fas fa-parking';
  if (name.includes('business') || name.includes('meeting')) return 'fas fa-briefcase';
  if (name.includes('laundry')) return 'fas fa-tshirt';
  if (name.includes('concierge')) return 'fas fa-concierge-bell';
  if (name.includes('elevator')) return 'fas fa-elevator';
  if (name.includes('room service')) return 'fas fa-room-service';
  return 'fas fa-check';
}

// Helper function to get room types from hotel data
function generateRoomTypesFromHotel(hotel: any): any[] {
  // Only return actual room types from API if they exist
  if (hotel?.roomTypes && Array.isArray(hotel.roomTypes)) {
    return hotel.roomTypes;
  }
  
  // If hotel has ops (options) data from TripJack, use that
  if (hotel?.ops && Array.isArray(hotel.ops)) {
    return hotel.ops.map((op: any, index: number) => {
      const roomPrice = op.tp || ((hotel.rating || 3) * 50); // Fallback pricing based on rating
      return {
        id: op.id || `room-${index}`,
        name: op.ris?.[0]?.rc || 'Room',
        description: op.ris?.[0]?.des || 'Room details not available',
        size: op.ris?.[0]?.radi?.ar ? `${op.ris[0].radi.ar.asm} sqm` : 'Size not available',
        maxOccupancy: (op.ris?.[0]?.adt || 0) + (op.ris?.[0]?.chd || 0),
        bedType: op.ris?.[0]?.radi?.bds?.[0] ? `${op.ris[0].radi.bds[0].bc} ${op.ris[0].radi.bds[0].bt}` : 'Bed type not available',
        price: {
          current: roomPrice,
          original: Math.round(roomPrice * 1.1),
          currency: 'AED'
        },
        amenities: op.ris?.[0]?.fcs || [],
        images: op.ris?.[0]?.imgs?.map((img: any) => img.url) || hotel.images?.slice(0, 1).map((img: any) => img.url) || ['/images/hotel-01.jpg'],
        availability: Math.floor(Math.random() * 10) + 1
      };
    });
  }
  
  // If we have basic hotel data but no room options, create a basic room with realistic pricing
  if (hotel?.name) {
    const basePrice = (hotel.rating || 3) * 50; // Base price per star
    return [{
      id: 'standard-room',
      name: 'Standard Room',
      description: 'Room details will be available upon booking',
      size: 'Contact hotel for room size',
      maxOccupancy: 2,
      bedType: 'Contact hotel for bed type',
      price: {
        current: basePrice,
        original: Math.round(basePrice * 1.2),
        currency: 'AED'
      },
      amenities: hotel.facilities?.slice(0, 3).map((f: any) => f.name) || [],
      images: hotel.images?.slice(0, 1).map((img: any) => img.url) || ['/images/hotel-01.jpg'],
      availability: 1
    }];
  }
  
  // Return empty array if no hotel data available
  return [];
}

// Helper function to get nearby attractions from hotel data
function generateNearbyAttractions(hotel: any): any[] {
  // Only return actual nearby attractions from API if they exist
  if (hotel?.nearbyAttractions && Array.isArray(hotel.nearbyAttractions)) {
    return hotel.nearbyAttractions;
  }
  
  // If hotel has location data that includes nearby places, use that
  if (hotel?.locationInfo?.nearbyPlaces && Array.isArray(hotel.locationInfo.nearbyPlaces)) {
    return hotel.locationInfo.nearbyPlaces.map((place: any) => ({
      name: place.name,
      distance: place.distance,
      type: place.type || 'Attraction',
      description: place.description,
      category: place.category || 'other'
    }));
  }
  
  // Parse attractions from description if it contains attraction text
  if (hotel?.description && typeof hotel.description === 'string') {
    const attractionsText = extractAttractionsFromDescription(hotel.description);
    if (attractionsText) {
      return parseAttractionTextToStructured(attractionsText);
    }
  }
  
  // Return empty array if no nearby attractions data available
  return [];
}

// Helper function to extract attractions text from description
function extractAttractionsFromDescription(description: string): string | null {
  // Look for attractions section in description
  const attractionsMatch = description.match(/Distances are displayed to the nearest[\s\S]*?(?=\n\n|\n[A-Z]|$)/);
  return attractionsMatch ? attractionsMatch[0] : null;
}

// Helper function to parse attraction text into structured data
function parseAttractionTextToStructured(text: string): any[] {
  if (!text || typeof text !== 'string') return [];

  // Remove the header text
  const cleanText = text.replace(/^Distances are displayed to the nearest 0\.1 mile and kilometer\.\s*/, '');
  
  // Split by common patterns and extract attractions
  const attractionPattern = /([^-]+?)\s*-\s*([0-9.]+)\s*km\s*\/\s*([0-9.]+)\s*mi/g;
  const attractions: any[] = [];
  let match;

  while ((match = attractionPattern.exec(cleanText)) !== null) {
    const name = match[1].trim();
    const km = parseFloat(match[2]);
    const miles = parseFloat(match[3]);

    if (name && !isNaN(km) && !isNaN(miles)) {
      attractions.push({
        id: name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        name,
        distance: { km, miles },
        category: categorizeAttractionName(name),
        type: name.includes('Museum') ? 'Museum' : 
              name.includes('Lake') ? 'Lake' : 
              name.includes('Park') ? 'Park' : 
              name.includes('Fort') ? 'Fort' : 
              name.includes('Mosque') ? 'Mosque' : 
              name.includes('Relief') || name.includes('Ruins') ? 'Archaeological Site' : 
              'Attraction'
      });
    }
  }

  return attractions;
}

// Helper function to categorize attraction based on name
function categorizeAttractionName(name: string): 'historical' | 'natural' | 'cultural' | 'religious' | 'museum' | 'transportation' | 'entertainment' | 'shopping' | 'healthcare' | 'education' | 'recreation' | 'landmark' | 'beach' | 'park' | 'other' {
  const lowerName = name.toLowerCase();
  
  if (lowerName.includes('museum')) return 'museum';
  if (lowerName.includes('fort') || lowerName.includes('relief') || lowerName.includes('ruins')) return 'historical';
  if (lowerName.includes('lake') || lowerName.includes('national')) return 'natural';
  if (lowerName.includes('park')) return 'park';
  if (lowerName.includes('mosque') || lowerName.includes('temple') || lowerName.includes('church')) return 'religious';
  if (lowerName.includes('buddha') || lowerName.includes('cultural')) return 'cultural';
  if (lowerName.includes('beach')) return 'beach';
  if (lowerName.includes('mall') || lowerName.includes('market') || lowerName.includes('shopping')) return 'shopping';
  if (lowerName.includes('hospital') || lowerName.includes('clinic')) return 'healthcare';
  if (lowerName.includes('university') || lowerName.includes('school') || lowerName.includes('college')) return 'education';
  if (lowerName.includes('stadium') || lowerName.includes('sports') || lowerName.includes('gym')) return 'recreation';
  if (lowerName.includes('station') || lowerName.includes('airport') || lowerName.includes('terminal')) return 'transportation';
  if (lowerName.includes('cinema') || lowerName.includes('theater') || lowerName.includes('entertainment')) return 'entertainment';
  if (lowerName.includes('monument') || lowerName.includes('landmark')) return 'landmark';
  
  return 'other';
} 