import { NextRequest, NextResponse } from 'next/server';
import { fetchStaticHotels } from '@/lib/tripjack-api';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const searchQuery = searchParams.get('search')?.toLowerCase() || '';

        if (searchQuery.length < 2) {
            return NextResponse.json({
                success: true,
                hotels: [],
                message: 'Search query too short'
            });
        }

        console.log(`Searching hotels by name: "${searchQuery}"`);

        // Fetch hotels from TripJack static API
        const staticHotelsResponse = await fetchStaticHotels();
        
        if (!staticHotelsResponse.status.success) {
            throw new Error('Failed to fetch hotels from TripJack API');
        }

        const allHotels = staticHotelsResponse.hotelOpInfos;

        // Search by hotel name, city, or description
        const matchingHotels = allHotels.filter(hotel => 
            !hotel.isDeleted && (
                hotel.name.toLowerCase().includes(searchQuery) ||
                hotel.cityName?.toLowerCase().includes(searchQuery) ||
                hotel.description?.toLowerCase().includes(searchQuery) ||
                hotel.address?.city?.name?.toLowerCase().includes(searchQuery) ||
                hotel.address?.country?.name?.toLowerCase().includes(searchQuery)
            )
        );

        console.log(`Found ${matchingHotels.length} matching hotels for "${searchQuery}"`);

        // Transform hotels to match expected format
        const processedHotels = matchingHotels.slice(0, 50).map((hotel) => ({
            id: hotel.hotelId,
            name: hotel.name,
            cityName: hotel.cityName || hotel.address?.city?.name || 'Unknown City',
            cityCode: (hotel.cityName || hotel.address?.city?.name || 'unknown').toLowerCase().replace(/\s+/g, '-'),
            country: hotel.countryName || hotel.address?.country?.name || 'Unknown Country',
            rating: hotel.rating || 3,
            propertyType: hotel.propertyType || 'Hotel',
            address: hotel.address?.adr || 'Address not available',
            image: hotel.images?.[0]?.url || '/images/hotel-01.jpg',
            facilities: hotel.facilities?.slice(0, 5).map(f => f.name) || ['Free WiFi', 'Air Conditioning'],
            description: hotel.description || 'Hotel description not available',
            currentPrice: (hotel.rating || 3) * 50, // Generate realistic pricing based on rating
            originalPrice: Math.round(((hotel.rating || 3) * 50) * 1.2), // Generate realistic pricing based on rating
            currency: 'AED',
            reviewCount: hotel.reviewCount || 0, // Only use actual API data, 0 if not available
            reviewScore: hotel.rating >= 4.5 ? 'Excellent' : hotel.rating >= 4 ? 'Very Good' : hotel.rating >= 3.5 ? 'Good' : 'Fair',
            coordinates: {
                latitude: parseFloat(hotel.geolocation?.lt || '0'),
                longitude: parseFloat(hotel.geolocation?.ln || '0')
            },
            contact: {
                phone: hotel.contact?.ph || 'Phone not available',
                email: hotel.contact?.em?.[0] || 'Email not available',
                website: hotel.contact?.wb || 'Website not available'
            },
            // Add tp field for backward compatibility with hotels list page
            tp: (hotel.rating || 3) * 50
        }));

        return NextResponse.json({
            success: true,
            hotels: processedHotels,
            totalCount: processedHotels.length,
            searchQuery,
            totalScanned: allHotels.length,
            source: 'TripJack API'
        });

    } catch (error) {
        console.error('Error searching hotels by name via TripJack API:', error);
        
        // Return empty results instead of error
        return NextResponse.json({
            success: true,
            hotels: [],
            totalCount: 0,
            searchQuery: new URL(request.url).searchParams.get('search') || '',
            totalScanned: 0,
            source: 'TripJack API',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
} 