import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q') || '';
    
    // Comprehensive airport database as fallback (and primary source)
    const airports = [
      // UAE
      { code: 'DXB', name: 'Dubai International', city: 'Dubai', country: 'UAE' },
      { code: 'AUH', name: 'Abu Dhabi International', city: 'Abu Dhabi', country: 'UAE' },
      { code: 'SHJ', name: 'Sharjah International', city: 'Sharjah', country: 'UAE' },
      { code: 'RAK', name: 'Ras Al Khaimah International', city: 'Ras Al Khaimah', country: 'UAE' },
      { code: 'AAN', name: 'Al Ain International', city: 'Al Ain', country: 'UAE' },
      
      // UK
      { code: 'LHR', name: 'London Heathrow', city: 'London', country: 'UK' },
      { code: 'LGW', name: 'London Gatwick', city: 'London', country: 'UK' },
      { code: 'STN', name: 'London Stansted', city: 'London', country: 'UK' },
      { code: 'LTN', name: 'London Luton', city: 'London', country: 'UK' },
      { code: 'MAN', name: 'Manchester Airport', city: 'Manchester', country: 'UK' },
      { code: 'EDI', name: 'Edinburgh Airport', city: 'Edinburgh', country: 'UK' },
      { code: 'GLA', name: 'Glasgow Airport', city: 'Glasgow', country: 'UK' },
      { code: 'BHX', name: 'Birmingham Airport', city: 'Birmingham', country: 'UK' },
      
      // USA
      { code: 'JFK', name: 'John F. Kennedy International', city: 'New York', country: 'USA' },
      { code: 'LAX', name: 'Los Angeles International', city: 'Los Angeles', country: 'USA' },
      { code: 'ORD', name: 'Chicago O\'Hare International', city: 'Chicago', country: 'USA' },
      { code: 'MIA', name: 'Miami International', city: 'Miami', country: 'USA' },
      { code: 'LAS', name: 'McCarran International', city: 'Las Vegas', country: 'USA' },
      { code: 'SFO', name: 'San Francisco International', city: 'San Francisco', country: 'USA' },
      { code: 'SEA', name: 'Seattle-Tacoma International', city: 'Seattle', country: 'USA' },
      { code: 'DEN', name: 'Denver International', city: 'Denver', country: 'USA' },
      { code: 'ATL', name: 'Hartsfield-Jackson Atlanta International', city: 'Atlanta', country: 'USA' },
      { code: 'DFW', name: 'Dallas/Fort Worth International', city: 'Dallas', country: 'USA' },
      
      // Europe
      { code: 'CDG', name: 'Charles de Gaulle', city: 'Paris', country: 'France' },
      { code: 'ORY', name: 'Paris Orly', city: 'Paris', country: 'France' },
      { code: 'FRA', name: 'Frankfurt Airport', city: 'Frankfurt', country: 'Germany' },
      { code: 'MUC', name: 'Munich Airport', city: 'Munich', country: 'Germany' },
      { code: 'BCN', name: 'Barcelona Airport', city: 'Barcelona', country: 'Spain' },
      { code: 'MAD', name: 'Madrid-Barajas Airport', city: 'Madrid', country: 'Spain' },
      { code: 'FCO', name: 'Leonardo da Vinci International', city: 'Rome', country: 'Italy' },
      { code: 'MXP', name: 'Milan Malpensa', city: 'Milan', country: 'Italy' },
      { code: 'AMS', name: 'Amsterdam Airport Schiphol', city: 'Amsterdam', country: 'Netherlands' },
      { code: 'ZUR', name: 'Zurich Airport', city: 'Zurich', country: 'Switzerland' },
      { code: 'VIE', name: 'Vienna International Airport', city: 'Vienna', country: 'Austria' },
      { code: 'ARN', name: 'Stockholm Arlanda Airport', city: 'Stockholm', country: 'Sweden' },
      { code: 'CPH', name: 'Copenhagen Airport', city: 'Copenhagen', country: 'Denmark' },
      { code: 'OSL', name: 'Oslo Airport', city: 'Oslo', country: 'Norway' },
      
      // Middle East
      { code: 'IST', name: 'Istanbul Airport', city: 'Istanbul', country: 'Turkey' },
      { code: 'DOH', name: 'Hamad International', city: 'Doha', country: 'Qatar' },
      { code: 'KWI', name: 'Kuwait International', city: 'Kuwait City', country: 'Kuwait' },
      { code: 'BAH', name: 'Bahrain International', city: 'Manama', country: 'Bahrain' },
      { code: 'MCT', name: 'Muscat International', city: 'Muscat', country: 'Oman' },
      
      // Saudi Arabia
      { code: 'RUH', name: 'King Khalid International', city: 'Riyadh', country: 'Saudi Arabia' },
      { code: 'JED', name: 'King Abdulaziz International', city: 'Jeddah', country: 'Saudi Arabia' },
      { code: 'DMM', name: 'King Fahd International', city: 'Dammam', country: 'Saudi Arabia' },
      
      // Egypt
      { code: 'CAI', name: 'Cairo International', city: 'Cairo', country: 'Egypt' },
      { code: 'HRG', name: 'Hurghada International', city: 'Hurghada', country: 'Egypt' },
      { code: 'SSH', name: 'Sharm el-Sheikh International', city: 'Sharm el-Sheikh', country: 'Egypt' },
      
      // India
      { code: 'BOM', name: 'Chhatrapati Shivaji Maharaj International', city: 'Mumbai', country: 'India' },
      { code: 'DEL', name: 'Indira Gandhi International', city: 'Delhi', country: 'India' },
      { code: 'BLR', name: 'Kempegowda International', city: 'Bangalore', country: 'India' },
      { code: 'MAA', name: 'Chennai International', city: 'Chennai', country: 'India' },
      { code: 'HYD', name: 'Rajiv Gandhi International', city: 'Hyderabad', country: 'India' },
      { code: 'CCU', name: 'Netaji Subhas Chandra Bose International', city: 'Kolkata', country: 'India' },
      { code: 'GOI', name: 'Goa International', city: 'Goa', country: 'India' },
      { code: 'COK', name: 'Cochin International', city: 'Kochi', country: 'India' },
      
      // Southeast Asia
      { code: 'SIN', name: 'Singapore Changi', city: 'Singapore', country: 'Singapore' },
      { code: 'BKK', name: 'Suvarnabhumi Airport', city: 'Bangkok', country: 'Thailand' },
      { code: 'DMK', name: 'Don Mueang International', city: 'Bangkok', country: 'Thailand' },
      { code: 'KUL', name: 'Kuala Lumpur International', city: 'Kuala Lumpur', country: 'Malaysia' },
      { code: 'CGK', name: 'Soekarno-Hatta International', city: 'Jakarta', country: 'Indonesia' },
      { code: 'DPS', name: 'Ngurah Rai International', city: 'Denpasar', country: 'Indonesia' },
      { code: 'MNL', name: 'Ninoy Aquino International', city: 'Manila', country: 'Philippines' },
      { code: 'HAN', name: 'Noi Bai International', city: 'Hanoi', country: 'Vietnam' },
      { code: 'SGN', name: 'Tan Son Nhat International', city: 'Ho Chi Minh City', country: 'Vietnam' },
      
      // East Asia
      { code: 'NRT', name: 'Narita International', city: 'Tokyo', country: 'Japan' },
      { code: 'HND', name: 'Haneda Airport', city: 'Tokyo', country: 'Japan' },
      { code: 'KIX', name: 'Kansai International', city: 'Osaka', country: 'Japan' },
      { code: 'ICN', name: 'Incheon International', city: 'Seoul', country: 'South Korea' },
      { code: 'GMP', name: 'Gimpo International', city: 'Seoul', country: 'South Korea' },
      { code: 'PEK', name: 'Beijing Capital International', city: 'Beijing', country: 'China' },
      { code: 'PVG', name: 'Shanghai Pudong International', city: 'Shanghai', country: 'China' },
      { code: 'CAN', name: 'Guangzhou Baiyun International', city: 'Guangzhou', country: 'China' },
      { code: 'HKG', name: 'Hong Kong International', city: 'Hong Kong', country: 'Hong Kong' },
      { code: 'TPE', name: 'Taiwan Taoyuan International', city: 'Taipei', country: 'Taiwan' },
      
      // Australia & New Zealand
      { code: 'SYD', name: 'Sydney Kingsford Smith', city: 'Sydney', country: 'Australia' },
      { code: 'MEL', name: 'Melbourne Airport', city: 'Melbourne', country: 'Australia' },
      { code: 'BNE', name: 'Brisbane Airport', city: 'Brisbane', country: 'Australia' },
      { code: 'PER', name: 'Perth Airport', city: 'Perth', country: 'Australia' },
      { code: 'AKL', name: 'Auckland Airport', city: 'Auckland', country: 'New Zealand' },
      { code: 'CHC', name: 'Christchurch Airport', city: 'Christchurch', country: 'New Zealand' },
      
      // Africa
      { code: 'JNB', name: 'O.R. Tambo International', city: 'Johannesburg', country: 'South Africa' },
      { code: 'CPT', name: 'Cape Town International', city: 'Cape Town', country: 'South Africa' },
      { code: 'ADD', name: 'Addis Ababa Bole International', city: 'Addis Ababa', country: 'Ethiopia' },
      { code: 'LOS', name: 'Murtala Muhammed International', city: 'Lagos', country: 'Nigeria' },
      { code: 'CMN', name: 'Mohammed V International', city: 'Casablanca', country: 'Morocco' },
      
      // Canada
      { code: 'YYZ', name: 'Toronto Pearson International', city: 'Toronto', country: 'Canada' },
      { code: 'YVR', name: 'Vancouver International', city: 'Vancouver', country: 'Canada' },
      { code: 'YUL', name: 'Montreal-Pierre Elliott Trudeau International', city: 'Montreal', country: 'Canada' },
      { code: 'YYC', name: 'Calgary International', city: 'Calgary', country: 'Canada' },
      
      // South America
      { code: 'GRU', name: 'São Paulo-Guarulhos International', city: 'São Paulo', country: 'Brazil' },
      { code: 'GIG', name: 'Rio de Janeiro-Galeão International', city: 'Rio de Janeiro', country: 'Brazil' },
      { code: 'EZE', name: 'Ezeiza International', city: 'Buenos Aires', country: 'Argentina' },
      { code: 'SCL', name: 'Santiago International', city: 'Santiago', country: 'Chile' },
      { code: 'LIM', name: 'Jorge Chávez International', city: 'Lima', country: 'Peru' },
      { code: 'BOG', name: 'El Dorado International', city: 'Bogotá', country: 'Colombia' }
    ];
    
    // Filter airports based on query
    const filteredAirports = query 
      ? airports.filter(airport => 
          airport.name.toLowerCase().includes(query.toLowerCase()) ||
          airport.city.toLowerCase().includes(query.toLowerCase()) ||
          airport.code.toLowerCase().includes(query.toLowerCase()) ||
          airport.country.toLowerCase().includes(query.toLowerCase())
        )
      : airports;
    
    // Sort by relevance (exact matches first, then partial matches)
    const sortedAirports = filteredAirports.sort((a, b) => {
      if (!query) return 0;
      
      const queryLower = query.toLowerCase();
      const aExactMatch = a.code.toLowerCase() === queryLower || a.city.toLowerCase() === queryLower;
      const bExactMatch = b.code.toLowerCase() === queryLower || b.city.toLowerCase() === queryLower;
      
      if (aExactMatch && !bExactMatch) return -1;
      if (!aExactMatch && bExactMatch) return 1;
      
      // Sort by city name alphabetically
      return a.city.localeCompare(b.city);
    });
    
    // Limit results to 20 for performance
    const limitedResults = sortedAirports.slice(0, 20);
    
    return NextResponse.json({
      airports: limitedResults,
      fallback: false,
      total: filteredAirports.length
    });
    
  } catch (error: any) {
    console.error('Airport search error:', error?.message);
    return NextResponse.json(
      { message: 'Error searching airports', error: error?.message },
      { status: 500 }
    );
  }
} 