import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: flightId } = await params;
    const body = await request.json();
    const { bookingId } = body;

    if (!bookingId) {
      return NextResponse.json(
        { error: 'Booking ID is required' },
        { status: 400 }
      );
    }

    // TripJack API configuration
    const apiKey = '512659b4c4bebe-c990-40a3-b6c5-cef5dbfd2017';
    const url = 'https://apitest.tripjack.com/fms/v1/ancillaries/fetch/seat';

    // Fetch seat map from TripJack API
    const response = await axios.post(
      url,
      { bookingId },
      {
        headers: {
          'apikey': apiKey,
          'Content-Type': 'application/json'
        }
      }
    );

    // If TripJack API is successful, return the seat map data
    if (response.data && response.data.status && response.data.status.success) {
      return NextResponse.json({
        success: true,
        seatMap: response.data,
        flightId
      });
    } else {
      // If TripJack API fails, return mock seat map for development
      const mockSeatMap = generateMockSeatMap(flightId);
      return NextResponse.json({
        success: true,
        seatMap: mockSeatMap,
        flightId,
        isMockData: true
      });
    }

  } catch (error: any) {
    console.error('Error fetching seat map:', error);
    
    // Get flightId from params for error handling
    const { id: flightId } = await params;
    
    // Return mock seat map on error for development
    const mockSeatMap = generateMockSeatMap(flightId);
    return NextResponse.json({
      success: true,
      seatMap: mockSeatMap,
      flightId,
      isMockData: true,
      error: error.message
    });
  }
}

// Generate mock seat map for development/testing
function generateMockSeatMap(flightId: string) {
  const seatTypes = {
    'economy': { price: 0, color: '#e5e7eb' },
    'premium': { price: 50, color: '#fbbf24' },
    'business': { price: 150, color: '#3b82f6' },
    'first': { price: 300, color: '#8b5cf6' }
  };

  const segments = [
    {
      segmentId: 'seg-1',
      aircraft: 'Boeing 777-300ER',
      departure: 'DXB',
      arrival: 'LHR',
      seatMap: {
        cabins: [
          {
            cabinClass: 'first',
            name: 'First Class',
            rows: generateSeats(1, 3, 4, '1-2-1', 'first', seatTypes),
            configuration: '1-2-1'
          },
          {
            cabinClass: 'business',
            name: 'Business Class',
            rows: generateSeats(4, 8, 4, '2-2', 'business', seatTypes),
            configuration: '2-2'
          },
          {
            cabinClass: 'premium',
            name: 'Premium Economy',
            rows: generateSeats(9, 12, 6, '3-3', 'premium', seatTypes),
            configuration: '3-3'
          },
          {
            cabinClass: 'economy',
            name: 'Economy Class',
            rows: generateSeats(13, 42, 6, '3-3', 'economy', seatTypes),
            configuration: '3-3'
          }
        ]
      }
    }
  ];

  return {
    bookingId: 'MOCK_BOOKING_' + Date.now(),
    segments,
    currency: 'AED',
    status: {
      success: true,
      httpStatus: 200
    }
  };
}

function generateSeats(startRow: number, endRow: number, seatsPerRow: number, config: string, cabinClass: string, seatTypes: any) {
  const rows = [];
  const seatLabels = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K'];
  
  for (let row = startRow; row <= endRow; row++) {
    const seats = [];
    
    for (let seatIndex = 0; seatIndex < seatsPerRow; seatIndex++) {
      const seatLabel = seatLabels[seatIndex];
      const seatNumber = `${row}${seatLabel}`;
      
      // Randomly assign some seats as occupied, blocked, or available
      const random = Math.random();
      let status = 'available';
      if (random < 0.15) status = 'occupied';
      else if (random < 0.2) status = 'blocked';
      
      // Determine seat type based on position
      let seatType = cabinClass;
      if (cabinClass === 'economy') {
        // Exit rows and front rows are premium in economy
        if (row === 13 || row === 14 || row === 25 || row === 26) {
          seatType = 'premium';
        }
      }
      
      seats.push({
        seatNumber,
        seatLabel,
        status,
        seatType,
        price: seatTypes[seatType].price,
        currency: 'AED',
        isWindow: seatIndex === 0 || seatIndex === seatsPerRow - 1,
        isAisle: (config === '3-3' && (seatIndex === 2 || seatIndex === 3)) ||
                 (config === '2-2' && (seatIndex === 1 || seatIndex === 2)) ||
                 (config === '1-2-1' && (seatIndex === 0 || seatIndex === 3)),
        features: getSeatFeatures(seatType, row, seatIndex, seatsPerRow)
      });
    }
    
    rows.push({
      rowNumber: row,
      seats,
      isExitRow: row === 25 || row === 26,
      hasExtraLegroom: row === 13 || row === 14 || row === 25 || row === 26
    });
  }
  
  return rows;
}

function getSeatFeatures(seatType: string, row: number, seatIndex: number, seatsPerRow: number) {
  const features = [];
  
  if (seatIndex === 0 || seatIndex === seatsPerRow - 1) {
    features.push('Window');
  }
  
  if (seatType === 'premium' || row === 13 || row === 14 || row === 25 || row === 26) {
    features.push('Extra Legroom');
  }
  
  if (row === 25 || row === 26) {
    features.push('Exit Row');
  }
  
  if (seatType === 'business' || seatType === 'first') {
    features.push('Lie-flat Seat');
    features.push('Priority Boarding');
  }
  
  if (seatType === 'first') {
    features.push('Private Suite');
    features.push('Chauffeur Service');
  }
  
  return features;
} 