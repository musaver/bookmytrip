import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { hotelBookings } from '@/lib/schema';
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
      hotelId,
      hotelName,
      roomType,
      checkInDate,
      checkOutDate,
      nights,
      guestDetails,
      primaryGuest,
      totalPrice,
      currency,
      specialRequests
    } = body;

    // Validate required fields
    if (!hotelId || !hotelName || !roomType || !checkInDate || !checkOutDate || !totalPrice) {
      return NextResponse.json(
        { error: 'Missing required booking information' },
        { status: 400 }
      );
    }

    // Generate booking reference
    const bookingReference = generateBookingReference('HTL');
    const bookingId = `hotel_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create booking record
    const bookingData = {
      id: bookingId,
      userId: session.user.id,
      hotelId,
      bookingReference,
      hotelName,
      roomType,
      checkInDate: new Date(checkInDate),
      checkOutDate: new Date(checkOutDate),
      nights: nights || calculateNights(checkInDate, checkOutDate),
      guestDetails: JSON.stringify(guestDetails),
      primaryGuest: JSON.stringify(primaryGuest),
      totalPrice: totalPrice.toString(),
      currency: currency || 'AED',
      status: 'reserved',
      paymentStatus: 'pending',
      specialRequests: specialRequests || null,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Insert into database
    await db.insert(hotelBookings).values(bookingData);

    // Send confirmation email (implement later)
    // await sendBookingConfirmationEmail(session.user.email, bookingData);

    return NextResponse.json({
      success: true,
      bookingId,
      bookingReference,
      message: 'Hotel booking created successfully'
    });

  } catch (error) {
    console.error('Error creating hotel booking:', error);
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

    // Get user's hotel bookings
    const userBookings = await db
      .select()
      .from(hotelBookings)
      .where(eq(hotelBookings.userId, session.user.id))
      .orderBy(desc(hotelBookings.createdAt));

    return NextResponse.json({
      success: true,
      bookings: userBookings
    });

  } catch (error) {
    console.error('Error fetching hotel bookings:', error);
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

// Helper function to calculate nights
function calculateNights(checkInDate: string, checkOutDate: string): number {
  const checkIn = new Date(checkInDate);
  const checkOut = new Date(checkOutDate);
  return Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
} 