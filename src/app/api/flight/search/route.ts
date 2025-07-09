import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('Flight search request body:', JSON.stringify(body, null, 2));
    
    // Hardcoded API Key
    const apiKey = '512659b4c4bebe-c990-40a3-b6c5-cef5dbfd2017';
    
    // Send request to Tripjack's flight search API
    const tripjackRes = await axios.post(
      'https://apitest.tripjack.com/fms/v1/air-search-all',
      body,
      {
        headers: {
          'Content-Type': 'application/json',
          apikey: apiKey,
        },
      }
    );
    
    console.log('Tripjack response status:', tripjackRes.status);
    console.log('Tripjack response data:', JSON.stringify(tripjackRes.data, null, 2));
    
    return NextResponse.json(tripjackRes.data);
  } catch (error: any) {
    console.error('Flight search API error:');
    console.error('Error message:', error.message);
    console.error('Error response data:', error?.response?.data);
    console.error('Error response status:', error?.response?.status);
    console.error('Full error:', error);
    
    return NextResponse.json(
      { 
        message: 'Error contacting Tripjack API', 
        error: error?.response?.data || error.message,
        status: error?.response?.status || 500
      },
      { status: 500 }
    );
  }
} 