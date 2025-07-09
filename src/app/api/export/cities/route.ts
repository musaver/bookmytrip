import { NextRequest, NextResponse } from 'next/server';

const TRIPJACK_API_KEY = '512659b4c4bebe-c990-40a3-b6c5-cef5dbfd2017';
const TRIPJACK_BASE_URL = 'https://apitest.tripjack.com/hms/v1';

export async function GET(request: NextRequest) {
    try {
        console.log('Starting cities export...');
        
        let allHotels: any[] = [];
        let nextToken: string | null = null;
        let pageCount = 0;
        const maxPages = 50; // Limit to prevent infinite loops

        // First, fetch all hotels to extract city data
        do {
            pageCount++;
            console.log(`Fetching hotels page ${pageCount} for cities extraction...`);

            const requestBody: any = {};
            if (nextToken) {
                requestBody.next = nextToken;
            }

            const response = await fetch(`${TRIPJACK_BASE_URL}/fetch-static-hotels`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': TRIPJACK_API_KEY
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`TripJack API error on page ${pageCount}:`, errorText);
                break;
            }

            const data = await response.json();
            
            if (data.status?.success && data.hotelOpInfos) {
                console.log(`Retrieved ${data.hotelOpInfos.length} hotels from page ${pageCount}`);
                allHotels.push(...data.hotelOpInfos);
                nextToken = data.next;
            } else {
                console.log('No more hotels data available');
                break;
            }

            // Safety check to prevent infinite loops
            if (pageCount >= maxPages) {
                console.log(`Reached maximum pages limit (${maxPages})`);
                break;
            }

        } while (nextToken);

        console.log(`Hotels fetch completed. Total hotels: ${allHotels.length}`);

        // Extract unique cities from hotels data
        const citiesMap = new Map<string, any>();

        allHotels.forEach((hotel) => {
            const cityCode = hotel.address?.city?.code;
            const cityName = hotel.cityName || hotel.address?.city?.name;
            const countryName = hotel.countryName || hotel.address?.country?.name;
            const countryCode = hotel.address?.country?.code;
            const stateName = hotel.address?.state?.name;
            const stateCode = hotel.address?.state?.code;

            if (cityCode && cityName) {
                if (!citiesMap.has(cityCode)) {
                    citiesMap.set(cityCode, {
                        code: cityCode,
                        name: cityName,
                        country: countryName || '',
                        countryCode: countryCode || '',
                        state: stateName || '',
                        stateCode: stateCode || '',
                        hotelCount: 0,
                        sampleHotels: []
                    });
                }

                const city = citiesMap.get(cityCode);
                city.hotelCount++;
                
                // Add sample hotel names (max 5)
                if (city.sampleHotels.length < 5) {
                    city.sampleHotels.push(hotel.name);
                }
            }
        });

        const processedCities = Array.from(citiesMap.values()).map((city) => ({
            ...city,
            exportedAt: new Date().toISOString()
        }));

        // Sort cities by hotel count (descending) and then by name
        processedCities.sort((a, b) => {
            if (b.hotelCount !== a.hotelCount) {
                return b.hotelCount - a.hotelCount;
            }
            return a.name.localeCompare(b.name);
        });

        console.log(`Cities export completed. Total unique cities: ${processedCities.length}`);

        return NextResponse.json({
            success: true,
            cities: processedCities,
            totalCount: processedCities.length,
            totalHotelsProcessed: allHotels.length,
            pagesProcessed: pageCount,
            exportedAt: new Date().toISOString()
        });

    } catch (error) {
        console.error('Error exporting cities:', error);
        return NextResponse.json(
            { 
                success: false, 
                error: 'Failed to export cities data',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
} 