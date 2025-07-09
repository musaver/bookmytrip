import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { flightBookings } from '@/lib/schema';
import { eq, desc } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    const {
      flightId,
      airline,
      flightNumber,
      origin,
      destination,
      departureDate,
      arrivalDate,
      cabinClass,
      passengers,
      contactDetails,
      totalPrice,
      currency,
      additionalServices,
      specialRequests
    } = body;

    // Validate required fields
    if (!flightId || !airline || !flightNumber || !origin || !destination || !departureDate || !totalPrice) {
      return NextResponse.json(
        { error: 'Missing required booking information' },
        { status: 400 }
      );
    }

    // Validate passengers
    if (!passengers || !Array.isArray(passengers) || passengers.length === 0) {
      return NextResponse.json(
        { error: 'At least one passenger is required' },
        { status: 400 }
      );
    }

    // Generate booking reference
    const bookingReference = generateBookingReference('FLT');
    const bookingId = `flight_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create booking record
    const bookingData = {
      id: bookingId,
      userId: session.user.id,
      flightId,
      bookingReference,
      airline,
      flightNumber,
      origin,
      destination,
      departureDate: new Date(departureDate),
      arrivalDate: new Date(arrivalDate),
      cabinClass: cabinClass || 'economy',
      passengers: JSON.stringify(passengers),
      totalPrice: totalPrice.toString(),
      currency: currency || 'AED',
      status: 'reserved',
      paymentStatus: 'pending',
      additionalServices: additionalServices ? JSON.stringify(additionalServices) : null,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Insert into database
    await db.insert(flightBookings).values(bookingData);

    // Send confirmation email (implement later)
    // await sendFlightBookingConfirmationEmail(session.user.email, bookingData);

    return NextResponse.json({
      success: true,
      bookingId,
      bookingReference,
      message: 'Flight booking created successfully'
    });

  } catch (error) {
    console.error('Error creating flight booking:', error);
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get user's flight bookings
    const userBookings = await db
      .select()
      .from(flightBookings)
      .where(eq(flightBookings.userId, session.user.id))
      .orderBy(desc(flightBookings.createdAt));

    return NextResponse.json({
      success: true,
      bookings: userBookings
    });

  } catch (error) {
    console.error('Error fetching flight bookings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}

// Helper function to generate booking reference
function generateBookingReference(prefix: string): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = prefix;
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
} 