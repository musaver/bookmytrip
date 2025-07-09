import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: flightId } = await params;
    const body = await request.json();
    const { bookingId, seatSelections } = body;

    if (!bookingId || !seatSelections || !Array.isArray(seatSelections)) {
      return NextResponse.json(
        { error: 'Booking ID and seat selections are required' },
        { status: 400 }
      );
    }

    // TripJack API configuration
    const apiKey = '512659b4c4bebe-c990-40a3-b6c5-cef5dbfd2017';
    const url = 'https://apitest.tripjack.com/oms/v1/air/amendment/add/ssr';

    const results = [];
    let totalAmount = 0;

    // Process each seat selection
    for (const selection of seatSelections) {
      const { segmentId, travelerId, seatCode, amount } = selection;

      if (!segmentId || !travelerId || !seatCode) {
        continue; // Skip invalid selections
      }

      const payload = {
        bookingId,
        paymentInfos: [
          { amount: amount || 0 }
        ],
        sI: [
          {
            id: segmentId,
            bI: {
              tI: [
                {
                  id: travelerId,
                  ssi: { code: seatCode }
                }
              ]
            }
          }
        ]
      };

      try {
        const response = await axios.post(
          url,
          payload,
          {
            headers: {
              'apikey': apiKey,
              'Content-Type': 'application/json'
            }
          }
        );

        if (response.data && response.data.status && response.data.status.success) {
          results.push({
            success: true,
            seatCode,
            travelerId,
            segmentId,
            response: response.data
          });
          totalAmount += amount || 0;
        } else {
          results.push({
            success: false,
            seatCode,
            travelerId,
            segmentId,
            error: response.data?.errors || 'Seat selection failed'
          });
        }
      } catch (error: any) {
        console.error(`Error selecting seat ${seatCode}:`, error);
        results.push({
          success: false,
          seatCode,
          travelerId,
          segmentId,
          error: error.response?.data || error.message
        });
      }
    }

    // For development/testing, return mock success if TripJack fails
    if (results.every(r => !r.success)) {
      return NextResponse.json({
        success: true,
        flightId,
        bookingId,
        seatSelections: seatSelections.map(selection => ({
          ...selection,
          success: true,
          mockData: true
        })),
        totalAmount: seatSelections.reduce((sum, s) => sum + (s.amount || 0), 0),
        currency: 'AED',
        message: 'Seats selected successfully (mock data)',
        isMockData: true
      });
    }

    return NextResponse.json({
      success: true,
      flightId,
      bookingId,
      results,
      totalAmount,
      currency: 'AED',
      successfulSelections: results.filter(r => r.success).length,
      failedSelections: results.filter(r => !r.success).length
    });

  } catch (error: any) {
    console.error('Error in seat selection:', error);
    
    // Get flightId from params for error handling
    const { id: flightId } = await params;
    
    return NextResponse.json(
      { 
        error: 'Seat selection failed',
        details: error.message,
        flightId
      },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve current seat selections for a booking
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: flightId } = await params;
    const searchParams = request.nextUrl.searchParams;
    const bookingId = searchParams.get('bookingId');

    if (!bookingId) {
      return NextResponse.json(
        { error: 'Booking ID is required' },
        { status: 400 }
      );
    }

    // For now, return mock selected seats
    // In a real implementation, you would fetch this from TripJack or your database
    const mockSelectedSeats = [
      {
        segmentId: 'seg-1',
        travelerId: 'traveler-1',
        seatCode: '15A',
        amount: 50,
        currency: 'AED',
        passengerName: 'John Doe',
        features: ['Window', 'Extra Legroom']
      }
    ];

    return NextResponse.json({
      success: true,
      flightId,
      bookingId,
      selectedSeats: mockSelectedSeats,
      totalAmount: mockSelectedSeats.reduce((sum, seat) => sum + seat.amount, 0),
      currency: 'AED'
    });

  } catch (error: any) {
    console.error('Error fetching seat selections:', error);
    return NextResponse.json(
      { error: 'Failed to fetch seat selections' },
      { status: 500 }
    );
  }
} 