import { NextRequest, NextResponse } from 'next/server';

const TRIPJACK_API_KEY = '512659b4c4bebe-c990-40a3-b6c5-cef5dbfd2017';
const TRIPJACK_BASE_URL = 'https://apitest.tripjack.com/hms/v1';

export async function GET(request: NextRequest) {
    try {
        console.log('Starting hotels export...');
        
        let allHotels: any[] = [];
        let nextToken: string | null = null;
        let pageCount = 0;
        const maxPages = 50; // Limit to prevent infinite loops

        do {
            pageCount++;
            console.log(`Fetching hotels page ${pageCount}...`);

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

        console.log(`Export completed. Total hotels: ${allHotels.length}`);

        // Process and clean the data
        const processedHotels = allHotels.map((hotel, index) => ({
            id: hotel.hotelId || `hotel_${index}`,
            name: hotel.name || 'Unknown Hotel',
            description: hotel.description || '',
            rating: hotel.rating || 0,
            propertyType: hotel.propertyType || 'Hotel',
            cityName: hotel.cityName || hotel.address?.city?.name || '',
            cityCode: hotel.address?.city?.code || '',
            countryName: hotel.countryName || hotel.address?.country?.name || '',
            countryCode: hotel.address?.country?.code || '',
            address: {
                street: hotel.address?.adr || '',
                postalCode: hotel.address?.postalCode || '',
                city: hotel.address?.city?.name || '',
                state: hotel.address?.state?.name || '',
                country: hotel.address?.country?.name || ''
            },
            geolocation: {
                latitude: hotel.geolocation?.lt || '',
                longitude: hotel.geolocation?.ln || ''
            },
            contact: {
                phone: hotel.contact?.ph || '',
                email: hotel.contact?.em || '',
                fax: hotel.contact?.fax || '',
                website: hotel.contact?.wb || ''
            },
            facilities: hotel.facilities || [],
            images: hotel.images || [],
            isDeleted: hotel.isDeleted || false,
            exportedAt: new Date().toISOString()
        }));

        return NextResponse.json({
            success: true,
            hotels: processedHotels,
            totalCount: processedHotels.length,
            pagesProcessed: pageCount,
            exportedAt: new Date().toISOString()
        });

    } catch (error) {
        console.error('Error exporting hotels:', error);
        return NextResponse.json(
            { 
                success: false, 
                error: 'Failed to export hotels data',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
} 