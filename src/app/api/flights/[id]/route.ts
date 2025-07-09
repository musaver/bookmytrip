import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: flightId } = await params;
    
    if (!flightId) {
      return NextResponse.json(
        { error: 'Flight ID is required' },
        { status: 400 }
      );
    }

    // For now, we'll generate detailed flight information
    // In a real implementation, you would fetch from TripJack API using the flight ID
    const flightDetails = generateFlightDetails(flightId);

    return NextResponse.json({
      success: true,
      flight: flightDetails
    });

  } catch (error) {
    console.error('Error fetching flight details:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to generate detailed flight information
function generateFlightDetails(flightId: string) {
  // Extract basic info from flight ID (format: origin-destination-date-flightNumber)
  const [origin, destination, date, flightNumber] = flightId.split('-');
  
  const airlines = [
    { code: 'EK', name: 'Emirates', logo: '/images/flight-company-01.svg' },
    { code: 'QR', name: 'Qatar Airways', logo: '/images/flight-company-02.svg' },
    { code: 'TK', name: 'Turkish Airlines', logo: '/images/flight-company-03.svg' },
    { code: 'EY', name: 'Etihad Airways', logo: '/images/flight-company-05.svg' }
  ];
  
  const randomAirline = airlines[Math.floor(Math.random() * airlines.length)];
  
  // Generate flight segments
  const segments = generateFlightSegments(origin || 'DXB', destination || 'LHR', date || '2024-12-15');
  
  const basePrice = Math.floor(Math.random() * 2000) + 500;
  
  return {
    id: flightId,
    bookingReference: generateBookingReference(),
    
    // Flight information
    airline: randomAirline,
    flightNumber: flightNumber || `${randomAirline.code}${Math.floor(Math.random() * 9000) + 1000}`,
    aircraft: getRandomAircraft(),
    
    // Route information
    segments: segments,
    
    // Timing
    totalDuration: segments.reduce((total, segment) => total + segment.duration, 0),
    stops: segments.length - 1,
    
    // Pricing
    pricing: {
      economy: {
        adult: basePrice,
        child: Math.floor(basePrice * 0.75),
        infant: Math.floor(basePrice * 0.1),
        currency: 'AED'
      },
      business: {
        adult: Math.floor(basePrice * 3.5),
        child: Math.floor(basePrice * 3.5 * 0.75),
        infant: Math.floor(basePrice * 3.5 * 0.1),
        currency: 'AED'
      },
      first: {
        adult: Math.floor(basePrice * 6),
        child: Math.floor(basePrice * 6 * 0.75),
        infant: Math.floor(basePrice * 6 * 0.1),
        currency: 'AED'
      }
    },
    
    // Baggage information
    baggage: {
      economy: {
        carryOn: { weight: '7kg', dimensions: '55x40x20cm' },
        checked: { weight: '23kg', pieces: 1 }
      },
      business: {
        carryOn: { weight: '10kg', dimensions: '55x40x20cm' },
        checked: { weight: '32kg', pieces: 2 }
      },
      first: {
        carryOn: { weight: '15kg', dimensions: '55x40x20cm' },
        checked: { weight: '32kg', pieces: 2 }
      }
    },
    
    // Amenities
    amenities: {
      economy: ['Seat Selection', 'Meal Service', 'Entertainment System', 'WiFi (Paid)'],
      business: ['Flat Bed Seats', 'Premium Meals', 'Priority Boarding', 'Lounge Access', 'Free WiFi'],
      first: ['Private Suites', 'Gourmet Dining', 'Chauffeur Service', 'Spa Services', 'Free WiFi']
    },
    
    // Policies
    policies: {
      cancellation: {
        economy: 'Cancellation fee applies',
        business: 'Free cancellation up to 24 hours',
        first: 'Free cancellation up to 24 hours'
      },
      changes: {
        economy: 'Change fee applies',
        business: 'Free changes up to 24 hours',
        first: 'Free changes anytime'
      },
      refund: {
        economy: 'Non-refundable',
        business: 'Partially refundable',
        first: 'Fully refundable'
      }
    },
    
    // Seat map (simplified)
    seatMap: generateSeatMap(),
    
    // Additional services
    additionalServices: [
      { id: 'meal', name: 'Special Meal', price: 25, currency: 'AED' },
      { id: 'seat', name: 'Seat Selection', price: 50, currency: 'AED' },
      { id: 'baggage', name: 'Extra Baggage (23kg)', price: 150, currency: 'AED' },
      { id: 'insurance', name: 'Travel Insurance', price: 75, currency: 'AED' },
      { id: 'lounge', name: 'Airport Lounge Access', price: 100, currency: 'AED' }
    ]
  };
}

// Helper function to generate flight segments
function generateFlightSegments(origin: string, destination: string, date: string) {
  const airports = {
    DXB: { name: 'Dubai International Airport', city: 'Dubai', country: 'UAE', terminal: 'T3' },
    LHR: { name: 'London Heathrow Airport', city: 'London', country: 'UK', terminal: 'T2' },
    JFK: { name: 'John F. Kennedy International Airport', city: 'New York', country: 'USA', terminal: 'T4' },
    CDG: { name: 'Charles de Gaulle Airport', city: 'Paris', country: 'France', terminal: 'T1' },
    FRA: { name: 'Frankfurt Airport', city: 'Frankfurt', country: 'Germany', terminal: 'T1' },
    IST: { name: 'Istanbul Airport', city: 'Istanbul', country: 'Turkey', terminal: 'T1' },
    DOH: { name: 'Hamad International Airport', city: 'Doha', country: 'Qatar', terminal: 'T1' }
  };
  
  const originAirport = airports[origin as keyof typeof airports] || airports.DXB;
  const destinationAirport = airports[destination as keyof typeof airports] || airports.LHR;
  
  // Generate departure and arrival times
  const departureTime = new Date(date + 'T' + generateRandomTime());
  const flightDuration = Math.floor(Math.random() * 480) + 120; // 2-10 hours
  const arrivalTime = new Date(departureTime.getTime() + flightDuration * 60000);
  
  return [
    {
      id: 'segment-1',
      departure: {
        airport: {
          code: origin,
          name: originAirport.name,
          city: originAirport.city,
          country: originAirport.country,
          terminal: originAirport.terminal
        },
        time: departureTime.toISOString(),
        localTime: departureTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      },
      arrival: {
        airport: {
          code: destination,
          name: destinationAirport.name,
          city: destinationAirport.city,
          country: destinationAirport.country,
          terminal: destinationAirport.terminal
        },
        time: arrivalTime.toISOString(),
        localTime: arrivalTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      },
      duration: flightDuration,
      aircraft: getRandomAircraft(),
      cabinClasses: ['Economy', 'Business', 'First']
    }
  ];
}

// Helper function to generate random time
function generateRandomTime(): string {
  const hours = Math.floor(Math.random() * 24).toString().padStart(2, '0');
  const minutes = Math.floor(Math.random() * 60).toString().padStart(2, '0');
  return `${hours}:${minutes}:00`;
}

// Helper function to get random aircraft
function getRandomAircraft(): string {
  const aircraft = ['Boeing 777-300ER', 'Airbus A380-800', 'Boeing 787-9', 'Airbus A350-900', 'Boeing 737-800'];
  return aircraft[Math.floor(Math.random() * aircraft.length)];
}

// Helper function to generate booking reference
function generateBookingReference(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Helper function to generate seat map
function generateSeatMap() {
  return {
    economy: {
      rows: 30,
      seatsPerRow: 6,
      configuration: '3-3',
      availableSeats: Math.floor(Math.random() * 50) + 20
    },
    business: {
      rows: 8,
      seatsPerRow: 4,
      configuration: '2-2',
      availableSeats: Math.floor(Math.random() * 15) + 5
    },
    first: {
      rows: 3,
      seatsPerRow: 4,
      configuration: '1-2-1',
      availableSeats: Math.floor(Math.random() * 5) + 1
    }
  };
} 