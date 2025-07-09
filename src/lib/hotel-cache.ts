// Hotel data cache to ensure consistency between search and details
import { fetchStaticHotels } from './tripjack-api';

interface CachedHotel {
  id: string;
  originalData: any;
  transformedData: any;
  source: 'static' | 'tripjack';
  timestamp: number;
}

class HotelCache {
  private cache = new Map<string, CachedHotel>();
  private staticHotelsCache: any = null;
  private staticHotelsCacheTime = 0;
  private readonly CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

  // Get static hotels with caching
  async getStaticHotels() {
    const now = Date.now();
    
    // Return cached data if still valid
    if (this.staticHotelsCache && (now - this.staticHotelsCacheTime) < this.CACHE_DURATION) {
      return this.staticHotelsCache;
    }

    try {
      // Fetch fresh data
      const hotelData = await fetchStaticHotels();
      if (hotelData.status.success) {
        this.staticHotelsCache = hotelData;
        this.staticHotelsCacheTime = now;
      }
      return hotelData;
    } catch (error) {
      console.error('Error fetching static hotels:', error);
      // Return cached data even if expired, if available
      return this.staticHotelsCache;
    }
  }

  // Store hotel data in cache
  storeHotel(id: string, originalData: any, transformedData: any, source: 'static' | 'tripjack') {
    this.cache.set(id, {
      id,
      originalData,
      transformedData,
      source,
      timestamp: Date.now()
    });
  }

  // Get hotel from cache
  getHotel(id: string): CachedHotel | null {
    const cached = this.cache.get(id);
    if (!cached) return null;

    // Check if cache is still valid
    const now = Date.now();
    if ((now - cached.timestamp) > this.CACHE_DURATION) {
      this.cache.delete(id);
      return null;
    }

    return cached;
  }

  // Find hotel by ID with flexible matching
  async findHotelById(id: string): Promise<any> {
    // First check cache
    const cached = this.getHotel(id);
    if (cached) {
      console.log(`Found hotel ${id} in cache`);
      return cached.originalData;
    }

    // Get static hotels
    const staticHotels = await this.getStaticHotels();
    if (!staticHotels?.status?.success || !staticHotels.hotelOpInfos) {
      return null;
    }

    // Try different matching strategies
    let hotel = null;

    // 1. Exact match
    hotel = staticHotels.hotelOpInfos.find((h: any) => h.hotelId === id);
    if (hotel) {
      console.log(`Found hotel ${id} by exact match`);
      this.storeHotel(id, hotel, null, 'static');
      return hotel;
    }

    // 2. String comparison
    hotel = staticHotels.hotelOpInfos.find((h: any) => 
      h.hotelId?.toString() === id?.toString()
    );
    if (hotel) {
      console.log(`Found hotel ${id} by string match`);
      this.storeHotel(id, hotel, null, 'static');
      return hotel;
    }

    // 3. Partial match
    hotel = staticHotels.hotelOpInfos.find((h: any) => 
      h.hotelId?.includes(id) || id?.includes(h.hotelId)
    );
    if (hotel) {
      console.log(`Found hotel ${id} by partial match`);
      this.storeHotel(id, hotel, null, 'static');
      return hotel;
    }

    // 4. If ID is numeric, try index-based lookup
    if (!isNaN(Number(id))) {
      const index = parseInt(id) - 1;
      if (index >= 0 && index < staticHotels.hotelOpInfos.length) {
        hotel = staticHotels.hotelOpInfos[index];
        console.log(`Found hotel ${id} by index ${index}`);
        this.storeHotel(id, hotel, null, 'static');
        return hotel;
      }
    }

    return null;
  }

  // Create consistent hotel data for search results
  createSearchHotel(originalHotel: any, source: 'static' | 'tripjack') {
    const hotelId = originalHotel.hotelId || originalHotel.id || `hotel_${Date.now()}_${Math.random()}`;
    
    const transformedHotel = {
      id: hotelId,
      name: originalHotel.name,
      location: source === 'static' 
        ? `${originalHotel.cityName}, ${originalHotel.countryName}`
        : `${originalHotel.ad?.ctn}, ${originalHotel.ad?.cn}`,
      rating: originalHotel.rating || originalHotel.rt || 0,
      reviewCount: 0, // No static review count
      reviewScore: (originalHotel.rating || originalHotel.rt || 0) >= 4 ? 'Excellent' : (originalHotel.rating || originalHotel.rt || 0) > 0 ? 'Good' : 'No Rating',
      image: originalHotel.images?.[0]?.url || null,
      amenities: source === 'static'
        ? (originalHotel.facilities?.slice(0, 6).map((f: any) => f.name) || [])
        : [],
      roomType: 'Standard Room',
      lastBooked: null, // No static last booked data
      originalPrice: 0, // No static pricing
      currentPrice: 0, // No static pricing
      currency: 'AED',
      specialOffer: null, // No static special offer
      discount: null, // No static discount
      address: source === 'static' ? {
        street: originalHotel.address?.adr || '',
        city: originalHotel.cityName || '',
        country: originalHotel.countryName || '',
        postalCode: originalHotel.address?.postalCode || ''
      } : {
        street: originalHotel.ad?.adr || '',
        city: originalHotel.ad?.ctn || '',
        country: originalHotel.ad?.cn || '',
        postalCode: originalHotel.ad?.postalCode || ''
      },
      propertyType: originalHotel.propertyType || originalHotel.pt || 'Hotel',
      options: originalHotel.options || originalHotel.ops || []
    };

    // Store in cache for consistency
    this.storeHotel(hotelId, originalHotel, transformedHotel, source);
    
    return transformedHotel;
  }

  // Clear expired cache entries
  clearExpiredCache() {
    const now = Date.now();
    for (const [id, cached] of this.cache.entries()) {
      if ((now - cached.timestamp) > this.CACHE_DURATION) {
        this.cache.delete(id);
      }
    }
  }
}

// Export singleton instance
export const hotelCache = new HotelCache();

// Clear expired cache every 10 minutes
setInterval(() => {
  hotelCache.clearExpiredCache();
}, 10 * 60 * 1000); 