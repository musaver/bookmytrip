import { NextRequest, NextResponse } from 'next/server';
import { getSampleHotelIds } from '@/lib/tripjack-api';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const city = searchParams.get('city');

    console.log(`Fetching available hotel IDs (limit: ${limit}, city: ${city || 'all'})`);

    const sampleHotels = await getSampleHotelIds(Math.min(limit, 50)); // Cap at 50

    let filteredHotels = sampleHotels;
    
    // Filter by city if specified
    if (city) {
      filteredHotels = sampleHotels.filter(hotel => 
        hotel.city.toLowerCase().includes(city.toLowerCase())
      );
    }

    return NextResponse.json({
      success: true,
      hotels: filteredHotels,
      totalCount: filteredHotels.length,
      message: filteredHotels.length > 0 
        ? `Found ${filteredHotels.length} available hotels` 
        : city 
          ? `No hotels found for city "${city}". Try searching without city filter.`
          : 'No hotels available at the moment',
      source: 'TripJack Static Hotels'
    });

  } catch (error) {
    console.error('Error fetching available hotel IDs:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch available hotels',
      hotels: [],
      totalCount: 0
    }, { status: 500 });
  }
} 