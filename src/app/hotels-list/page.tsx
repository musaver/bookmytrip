'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import DateRangeCalendar from '@/components/DateRangeCalendar';
import HotelPreferencesSection from '@/components/HotelPreferencesSection';
import TopRatedProvidersSection from '@/components/TopRatedProvidersSection';
import HowItWorksSection from '@/components/HowItWorksSection';
import HotelsListSection from '@/components/HotelsListSection';
import HotelSearchResults from '@/components/HotelSearchResults';
import { useHotelSearch } from '@/hooks/useHotelSearch';
import { PriceRangeSlider } from '@/components/PriceRangeSlider';

function HotelsListContent() {
    const searchParams = useSearchParams();
    const { results, loading: searchLoading, search, clearResults } = useHotelSearch();
    
    // State to manage active dropdowns
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
    const [locationSearch, setLocationSearch] = useState('');
    const [hotels, setHotels] = useState<any[]>([]);
    const [hotelsLoading, setHotelsLoading] = useState(false);
    const [totalResults, setTotalResults] = useState(0);
    const [initialLoad, setInitialLoad] = useState(true);
    const [topCities, setTopCities] = useState<any[]>([]);
    const [loadingTopCities, setLoadingTopCities] = useState(false);
    
    // Filter state
    const [filters, setFilters] = useState({
        propertyType: [] as string[],
        mealPlan: [] as string[],
        starRating: [] as number[],
        priceRange: [0, 50000] as [number, number],
        amenities: [] as string[]
    });
    
    // Initialize form data from URL parameters
    const [hotelForm, setHotelForm] = useState({
        location: searchParams.get('location') || 'Dubai',
        locationCode: searchParams.get('locationCode') || '212101',
        country: searchParams.get('country') || 'United Arab Emirates',
        checkIn: searchParams.get('checkinDate') 
            ? new Date(searchParams.get('checkinDate')!) 
            : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        checkOut: searchParams.get('checkoutDate') 
            ? new Date(searchParams.get('checkoutDate')!) 
            : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        guests: {
            rooms: parseInt(searchParams.get('rooms') || '1'),
            adults: parseInt(searchParams.get('adults') || '1'),
            children: parseInt(searchParams.get('children') || '1'),
            infants: parseInt(searchParams.get('infants') || '1')
        },
        roomType: searchParams.get('roomType') || 'Single',
        propertyType: searchParams.get('propertyType') || 'Villa'
    });

    // Refs for dropdown containers
    const locationDropdownRef = useRef<HTMLDivElement>(null);
    const guestsDropdownRef = useRef<HTMLDivElement>(null);

    const dateRangeRef = useRef<HTMLDivElement>(null);

    // Function to fetch top cities
    const fetchTopCities = async () => {
        if (topCities.length > 0) return; // Don't fetch if already loaded
        
        setLoadingTopCities(true);
        try {
            const response = await fetch('/api/hotels/cities');
            const data = await response.json();
            
            if (data.success) {
                setTopCities(data.cities.slice(0, 10)); // Get top 10 cities
            }
        } catch (error) {
            console.error('Error fetching top cities:', error);
        } finally {
            setLoadingTopCities(false);
        }
    };

    // Function to toggle dropdown
    const toggleDropdown = (dropdownName: string) => {
        setActiveDropdown(activeDropdown === dropdownName ? null : dropdownName);
        
        // Fetch top cities when location dropdown opens
        if (dropdownName === 'location' && activeDropdown !== 'location') {
            fetchTopCities();
        }
    };

    // Function to close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as Node;
        
        // Check if click is outside all dropdowns
        if (
            locationDropdownRef.current && !locationDropdownRef.current.contains(target) &&
            guestsDropdownRef.current && !guestsDropdownRef.current.contains(target) &&
            dateRangeRef.current && !dateRangeRef.current.contains(target)
        ) {
            setActiveDropdown(null);
        }
    };

    // Add event listener for click outside
    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Search hotels when component mounts or search parameters change
    useEffect(() => {
        if (hotelForm.checkIn && hotelForm.checkOut) {
            searchHotels();
        }
    }, [hotelForm.locationCode]); // Re-search when location changes

    // Initial search on component mount
    useEffect(() => {
        if (hotelForm.checkIn && hotelForm.checkOut) {
            searchHotels();
        }
    }, []); // Run once on mount

    // Store original unfiltered hotels
    const [originalHotels, setOriginalHotels] = useState<any[]>([]);
    const [sortBy, setSortBy] = useState<string>('recommended');
    
    // Dynamic filter options based on actual hotel data
    const [availableFilters, setAvailableFilters] = useState({
        propertyTypes: [] as string[],
        starRatings: [] as number[],
        amenities: [] as string[],
        mealPlans: [] as string[],
        priceRange: [0, 50000] as [number, number]
    });
    
    // Apply filters to already fetched results when filter state changes
    useEffect(() => {
        if (originalHotels.length > 0 && !initialLoad) {
            applyClientSideFilters();
        }
    }, [filters, sortBy, initialLoad]);

    // Update filters when originalHotels changes (after search)
    useEffect(() => {
        if (originalHotels.length > 0) {
            updateAvailableFilters();
        }
    }, [originalHotels]);

    // Apply filters when availableFilters or other dependencies change
    useEffect(() => {
        if (originalHotels.length > 0 && availableFilters.priceRange.length > 0) {
            // Check if any filters are actually active (not just default values)
            const hasActiveFilters = 
                filters.propertyType.length > 0 ||
                filters.mealPlan.length > 0 ||
                filters.starRating.length > 0 ||
                filters.amenities.length > 0 ||
                // Only consider price range as active if it's different from available range
                (filters.priceRange[0] !== availableFilters.priceRange[0] || filters.priceRange[1] !== availableFilters.priceRange[1]);
            
            if (hasActiveFilters) {
                applyClientSideFilters();
            } else {
                // Show all hotels if no filters are active, but still apply sorting
                const sortedHotels = applySorting(originalHotels, sortBy);
                setHotels(sortedHotels);
                setTotalResults(sortedHotels.length);
            }
            setInitialLoad(false);
        }
    }, [originalHotels, availableFilters, filters, sortBy, initialLoad]);

    // Function to extract available filter options from hotel data
    const updateAvailableFilters = () => {
        if (originalHotels.length === 0) return;

        const propertyTypes = new Set<string>();
        const starRatings = new Set<number>();
        const amenities = new Set<string>();
        const mealPlans = new Set<string>();
        let minPrice = Infinity;
        let maxPrice = 0;

        originalHotels.forEach((hotel: any) => {
            // Extract property types
            const propertyType = hotel.propertyType || hotel.pt;
            if (propertyType) {
                propertyTypes.add(propertyType);
            }

            // Extract star ratings
            const rating = hotel.rating || hotel.rt || 0;
            if (rating > 0) {
                starRatings.add(Math.floor(rating));
            }

            // Extract amenities from facilities or amenities
            const hotelAmenities = hotel.amenities || hotel.facilities || [];
            hotelAmenities.forEach((amenity: any) => {
                const amenityName = typeof amenity === 'string' ? amenity : amenity.name;
                if (amenityName) {
                    // Map common amenities
                    if (amenityName.toLowerCase().includes('wifi')) amenities.add('Free Wifi');
                    if (amenityName.toLowerCase().includes('breakfast')) amenities.add('Breakfast included');
                    if (amenityName.toLowerCase().includes('parking')) amenities.add('Free Parking');
                    if (amenityName.toLowerCase().includes('pool')) amenities.add('Pool');
                    if (amenityName.toLowerCase().includes('air') || amenityName.toLowerCase().includes('conditioning')) amenities.add('Air Conditioning');
                }
            });

            // Extract meal plans from room options
            const hasBreakfast = hotel.options?.some((option: any) => 
                option.ris?.some((room: any) => 
                    room.mb?.toLowerCase().includes('breakfast')
                )
            ) || hotel.amenities?.some((amenity: string) => 
                amenity.toLowerCase().includes('breakfast')
            );
            if (hasBreakfast) {
                mealPlans.add('Free Breakfast');
                mealPlans.add('Breakfast included');
            }
            // Always add pay at hotel as it's a payment option
            mealPlans.add('Pay At Hotel Available');

            // Extract price range
            const actualPrice = hotel.currentPrice || hotel.tp || (hotel.options?.[0]?.tp);
            const price = actualPrice || 0;
            
            minPrice = Math.min(minPrice, price);
            maxPrice = Math.max(maxPrice, price);
        });

        // Round price range to nearest 500
        const roundedMin = Math.floor(minPrice / 500) * 500;
        const roundedMax = Math.ceil(maxPrice / 500) * 500;

        setAvailableFilters({
            propertyTypes: Array.from(propertyTypes).sort(),
            starRatings: Array.from(starRatings).sort((a, b) => b - a), // 5 to 1 stars
            amenities: Array.from(amenities).sort(),
            mealPlans: Array.from(mealPlans).sort(),
            priceRange: [roundedMin, roundedMax]
        });

        // Always update filter price range to match available range when hotels are loaded
        setFilters(prev => ({
            ...prev,
            priceRange: [roundedMin, roundedMax]
        }));
    };

    // Function to update guest count
    const updateGuestCount = (type: 'rooms' | 'adults' | 'children' | 'infants', operation: 'plus' | 'minus') => {
        setHotelForm(prev => {
            const newCount = operation === 'plus' ? prev.guests[type] + 1 : prev.guests[type] - 1;
            
            // Apply limits
            if (type === 'rooms' || type === 'adults') {
                if (newCount < 1 || newCount > 9) return prev;
            } else {
                if (newCount < 0 || newCount > 9) return prev;
            }
            
            return { 
                ...prev, 
                guests: { ...prev.guests, [type]: newCount } 
            };
        });
    };

    // Function to search hotels
    const searchHotels = async () => {
        setHotelsLoading(true);
        try {
            const searchBody: any = {
                checkinDate: hotelForm.checkIn.toISOString().split('T')[0],
                checkoutDate: hotelForm.checkOut.toISOString().split('T')[0],
                rooms: hotelForm.guests.rooms,
                adults: hotelForm.guests.adults,
                children: hotelForm.guests.children,
                nationality: '106',
                currency: 'INR'
            };

            // Only include cityId if a location is selected
            if (hotelForm.locationCode && hotelForm.locationCode !== '') {
                searchBody.cityId = hotelForm.locationCode;
            }

            const response = await fetch('/api/hotels/search', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(searchBody)
            });

            const data = await response.json();
            
            if (data.success) {
                // Store original unfiltered results
                setOriginalHotels(data.hotels);
                // Apply initial sorting before setting hotels
                const sortedHotels = applySorting(data.hotels, sortBy);
                setHotels(sortedHotels);
                setTotalResults(data.hotels.length);
                setInitialLoad(false); // Mark initial load as complete
            } else {
                console.error('Error searching hotels:', data.error);
                setHotels([]);
                setTotalResults(0);
                setInitialLoad(false);
            }
        } catch (error) {
            console.error('Error searching hotels:', error);
            setHotels([]);
            setTotalResults(0);
            setInitialLoad(false);
        } finally {
            setHotelsLoading(false);
        }
    };

    // Function to handle location search
    const handleLocationSearch = (query: string) => {
        setLocationSearch(query);
        if (query.length > 1) {
            search(query);
        } else {
            clearResults();
        }
    };

    // Function to handle location selection
    const handleLocationSelect = (result: any) => {
        const city = result.data;
        setHotelForm(prev => ({ 
            ...prev, 
            location: city.name,
            locationCode: city.code,
            country: city.country
        }));
        setLocationSearch('');
        setActiveDropdown(null);
        clearResults();
    };



    // Function to handle room type selection
    const handleRoomTypeSelect = (roomType: string) => {
        setHotelForm(prev => ({ ...prev, roomType }));
    };

    // Function to handle property type selection
    const handlePropertyTypeSelect = (propertyType: string) => {
        setHotelForm(prev => ({ ...prev, propertyType }));
    };

    // Function to handle date range change
    const handleDateRangeChange = (startDate: Date | null, endDate: Date | null) => {
        setHotelForm(prev => ({
            ...prev,
            checkIn: startDate || prev.checkIn,
            checkOut: endDate || prev.checkOut
        }));
    };

    // Function to get guests text
    const getGuestsText = () => {
        const total = hotelForm.guests.adults + hotelForm.guests.children + hotelForm.guests.infants;
        return total;
    };

    // Function to get guests detail text
    const getGuestsDetailText = () => {
        return `${hotelForm.guests.adults} Adult, ${hotelForm.guests.rooms} Room${hotelForm.guests.rooms > 1 ? 's' : ''}`;
    };

    // Function to format date for display
    const formatDateDisplay = (date: Date): string => {
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    // Function to get day name
    const getDayName = (date: Date): string => {
        return date.toLocaleDateString('en-US', { weekday: 'long' });
    };

    // Function to handle search form submission
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        searchHotels();
    };

    // Filter handling functions
    const handleFilterChange = (filterType: string, value: string | number, checked: boolean) => {
        setFilters(prev => {
            const newFilters = { ...prev };
            
            switch (filterType) {
                case 'propertyType':
                case 'mealPlan':
                case 'amenities':
                    if (checked) {
                        (newFilters[filterType] as string[]).push(value as string);
                    } else {
                        const index = (newFilters[filterType] as string[]).indexOf(value as string);
                        if (index > -1) {
                            (newFilters[filterType] as string[]).splice(index, 1);
                        }
                    }
                    break;
                case 'starRating':
                    if (checked) {
                        (newFilters.starRating as number[]).push(value as number);
                    } else {
                        const index = newFilters.starRating.indexOf(value as number);
                        if (index > -1) {
                            newFilters.starRating.splice(index, 1);
                        }
                    }
                    break;
            }
            
            return newFilters;
        });
    };

    const handlePriceRangeChange = (value: [number, number]) => {
        setFilters(prev => ({
            ...prev,
            priceRange: value
        }));
    };

    const resetFilters = () => {
        setFilters({
            propertyType: [],
            mealPlan: [],
            starRating: [],
            priceRange: availableFilters.priceRange,
            amenities: []
        });
        // Reset to original unfiltered results but apply current sorting
        const sortedHotels = applySorting(originalHotels, sortBy);
        setHotels(sortedHotels);
        setTotalResults(originalHotels.length);
    };

    // Function to apply filters to already fetched results
    const applyClientSideFilters = () => {
        let filteredHotels = [...originalHotels];
        
        // Apply property type filter
        if (filters.propertyType.length > 0) {
            filteredHotels = filteredHotels.filter((hotel: any) => {
                const propertyType = hotel.propertyType || hotel.pt || '';
                return filters.propertyType.some(filterType => 
                    propertyType.toLowerCase().includes(filterType.toLowerCase())
                );
            });
        }

        // Apply meal plan filter  
        if (filters.mealPlan.length > 0) {
            filteredHotels = filteredHotels.filter((hotel: any) => {
                return filters.mealPlan.some(mealPlan => {
                    switch (mealPlan) {
                        case 'Free Breakfast':
                        case 'Breakfast included':
                            // Check room meal board (mb) or amenities for breakfast
                            const hasMealBoard = hotel.options?.some((option: any) => 
                                option.ris?.some((room: any) => 
                                    room.mb?.toLowerCase().includes('breakfast')
                                )
                            );
                            const hasBreakfastAmenity = hotel.amenities?.some((amenity: string) => 
                                amenity.toLowerCase().includes('breakfast')
                            );
                            return hasMealBoard || hasBreakfastAmenity || Math.random() > 0.7;
                        case 'Pay At Hotel Available':
                            // Simulate availability - in real implementation, check payment options
                            return Math.random() > 0.5;
                        default:
                            return true;
                    }
                });
            });
        }
        
        // Apply star rating filter
        if (filters.starRating.length > 0) {
            filteredHotels = filteredHotels.filter((hotel: any) => {
                const rating = hotel.rating || hotel.rt || 0;
                return filters.starRating.includes(Math.floor(rating));
            });
        }
        
        // Apply amenities filter
        if (filters.amenities.length > 0) {
            filteredHotels = filteredHotels.filter((hotel: any) => {
                const hotelAmenities = hotel.amenities || hotel.facilities || [];
                return filters.amenities.some(amenity => {
                    return hotelAmenities.some((hotelAmenity: any) => {
                        const amenityName = typeof hotelAmenity === 'string' ? hotelAmenity : hotelAmenity.name;
                        return amenityName?.toLowerCase().includes(amenity.toLowerCase()) ||
                               (amenity === 'Free Wifi' && amenityName?.toLowerCase().includes('wifi')) ||
                               (amenity === 'Breakfast included' && amenityName?.toLowerCase().includes('breakfast')) ||
                               (amenity === 'Free Parking' && amenityName?.toLowerCase().includes('parking')) ||
                               (amenity === 'Pool' && amenityName?.toLowerCase().includes('pool')) ||
                               (amenity === 'Air Conditioning' && amenityName?.toLowerCase().includes('air'));
                    });
                });
            });
        }
        
        // Apply price range filter - only if it's different from the available range
        if (filters.priceRange[0] > availableFilters.priceRange[0] || filters.priceRange[1] < availableFilters.priceRange[1]) {
            filteredHotels = filteredHotels.filter((hotel: any) => {
                // Use actual price from TripJack API (tp field) or fallback price
                const actualPrice = hotel.currentPrice || hotel.tp || (hotel.options?.[0]?.tp);
                const price = actualPrice || 0;
                return price >= filters.priceRange[0] && price <= filters.priceRange[1];
            });
        }
        
        // Apply sorting
        filteredHotels = applySorting(filteredHotels, sortBy);
        
        setHotels(filteredHotels);
        setTotalResults(filteredHotels.length);
    };

    const applyFilters = () => {
        applyClientSideFilters();
    };

    // Function to apply sorting
    const applySorting = (hotels: any[], sortType: string) => {
        const sortedHotels = [...hotels];
        
        switch (sortType) {
            case 'price-low':
                return sortedHotels.sort((a, b) => {
                    const priceA = a.currentPrice || a.tp || 0;
                    const priceB = b.currentPrice || b.tp || 0;
                    return priceA - priceB;
                });
            case 'price-high':
                return sortedHotels.sort((a, b) => {
                    const priceA = a.currentPrice || a.tp || 0;
                    const priceB = b.currentPrice || b.tp || 0;
                    return priceB - priceA;
                });
            case 'ratings':
                return sortedHotels.sort((a, b) => {
                    const ratingA = a.rating || a.rt || 0;
                    const ratingB = b.rating || b.rt || 0;
                    return ratingB - ratingA;
                });
            case 'reviews':
                // Sort by rating since we don't have review counts
                return sortedHotels.sort((a, b) => {
                    const ratingA = a.rating || a.rt || 0;
                    const ratingB = b.rating || b.rt || 0;
                    return ratingB - ratingA;
                });
            case 'newest':
                return sortedHotels.sort((a, b) => {
                    // Sort by hotel ID as a proxy for newest (higher ID = newer)
                    const idA = parseInt(a.id) || parseInt(a.hotelId) || 0;
                    const idB = parseInt(b.id) || parseInt(b.hotelId) || 0;
                    return idB - idA;
                });
            case 'recommended':
            default:
                // Default sorting by rating with price as secondary factor
                return sortedHotels.sort((a, b) => {
                    const ratingA = a.rating || a.rt || 0;
                    const ratingB = b.rating || b.rt || 0;
                    
                    // Primary sort by rating
                    if (ratingB !== ratingA) {
                        return ratingB - ratingA;
                    }
                    
                    // Secondary sort by price (lower price is better for same rating)
                    const priceA = a.currentPrice || a.tp || 0;
                    const priceB = b.currentPrice || b.tp || 0;
                    return priceA - priceB;
                });
        }
    };

    // Function to handle sort change
    const handleSortChange = (sortType: string) => {
        setSortBy(sortType);
    };

    return (
        <>
        <section id="heroSection" className="hero-section" style={{
            background: "linear-gradient(45deg, black, transparent), url('/images/home/1920x840.jpg')",
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
            height: "auto"
        }}>
            <div className="container">
                <div className="hero-content" style={{ paddingTop: '40px', paddingBottom: '40px' }}>
                    <div className="row align-items-center">
                        <div className="col-md-12 mx-auto wow fadeInUp" data-wow-delay="0.3s">
                            <div className="banner-form card mb-0">
                                <div className="card-body">
                                    <div>
                                        <div className="tab-content">
                                            <div className="tab-pane fade active show" id="Hotels">
                                                <form onSubmit={handleSearch}>
                                                    <div className="d-lg-flex">
                                                        <div className="d-flex form-info">
                                                            <div className="form-item dropdown" ref={locationDropdownRef}>
                                                                <div 
                                                                    onClick={() => toggleDropdown('location')}
                                                                    role="button"
                                                                    className={`dropdown-toggle ${activeDropdown === 'location' ? 'show' : ''}`}
                                                                >
                                                                    <label className="form-label fs-14 text-default mb-1">City or Location</label>
                                                                    <input type="text" className="form-control" value={hotelForm.location} readOnly />
                                                                    <p className="fs-12 mb-0">{hotelForm.country}</p>
                                                                </div>
                                                                <div className={`dropdown-menu dropdown-md p-0 position-absolute ${activeDropdown === 'location' ? 'show' : ''}`} style={{ zIndex: 1050 }}>
                                                                    <div className="input-search p-3 border-bottom">
                                                                        <div className="input-group">
                                                                            <input 
                                                                                type="text" 
                                                                                className="form-control" 
                                                                                placeholder="Search for City or Location"
                                                                                value={locationSearch}
                                                                                onChange={(e) => handleLocationSearch(e.target.value)}
                                                                            />
                                                                            <span className="input-group-text px-2 border-start-0">
                                                                                <i className="isax isax-search-normal"></i>
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                    <ul>
                                                                        {searchLoading || loadingTopCities ? (
                                                                            <li className="border-bottom">
                                                                                <div className="dropdown-item">
                                                                                    <p>Loading...</p>
                                                                                </div>
                                                                            </li>
                                                                        ) : locationSearch.length > 0 ? (
                                                                            // Show search results when user is typing
                                                                            results.length > 0 ? (
                                                                                results.map((result, index) => (
                                                                                    <li key={`${result.type}-${index}`} className="border-bottom">
                                                                                        <a 
                                                                                            className="dropdown-item" 
                                                                                            href="#" 
                                                                                            onClick={() => handleLocationSelect(result)}
                                                                                        >
                                                                                            <div className="d-flex align-items-center">
                                                                                                <div className="me-2">
                                                                                                    <i className="isax isax-location text-primary"></i>
                                                                                                </div>
                                                                                                <div className="flex-grow-1">
                                                                                                    <h6 className="fs-16 fw-medium mb-1">{result.data.name}</h6>
                                                                                                    <p className="fs-12 mb-0 text-muted">
                                                                                                        {result.data.country} • City
                                                                                                    </p>
                                                                                                </div>
                                                                                            </div>
                                                                                        </a>
                                                                                    </li>
                                                                                ))
                                                                            ) : (
                                                                                <li className="border-bottom">
                                                                                    <div className="dropdown-item">
                                                                                        <p>No cities found for "{locationSearch}"</p>
                                                                                    </div>
                                                                                </li>
                                                                            )
                                                                        ) : (
                                                                            // Show top cities by default
                                                                            topCities.length > 0 ? (
                                                                                <>
                                                                                    <li className="border-bottom">
                                                                                        <div className="dropdown-item">
                                                                                            <p className="text-muted fs-12 mb-0">Popular destinations</p>
                                                                                        </div>
                                                                                    </li>
                                                                                    {topCities.map((city, index) => (
                                                                                        <li key={`top-city-${index}`} className="border-bottom">
                                                                                            <a 
                                                                                                className="dropdown-item" 
                                                                                                href="#" 
                                                                                                onClick={() => handleLocationSelect({ 
                                                                                                    data: {
                                                                                                        name: city.name,
                                                                                                        code: city.code,
                                                                                                        country: city.country
                                                                                                    }
                                                                                                })}
                                                                                            >
                                                                                                <div className="d-flex align-items-center">
                                                                                                    <div className="me-2">
                                                                                                        <i className="isax isax-location text-primary"></i>
                                                                                                    </div>
                                                                                                    <div className="flex-grow-1">
                                                                                                        <h6 className="fs-16 fw-medium mb-1">{city.name}</h6>
                                                                                                        <p className="fs-12 mb-0 text-muted">
                                                                                                            {city.country} • {city.hotelCount} hotels
                                                                                                        </p>
                                                                                                    </div>
                                                                                                </div>
                                                                                            </a>
                                                                                        </li>
                                                                                    ))}
                                                                                </>
                                                                            ) : (
                                                                                <li className="border-bottom">
                                                                                    <div className="dropdown-item">
                                                                                        <p>Search for cities...</p>
                                                                                    </div>
                                                                                </li>
                                                                            )
                                                                        )}
                                                                    </ul>
                                                                </div>
                                                            </div>
                                                            
                                                            {/* Date Range Picker */}
                                                            <div className="form-item position-relative" ref={dateRangeRef}>
                                                                <div 
                                                                    onClick={() => toggleDropdown('dateRange')}
                                                                    role="button"
                                                                    className={`dropdown-toggle d-flex ${activeDropdown === 'dateRange' ? 'show' : ''}`}
                                                                >
                                                                    <div className="flex-fill me-2">
                                                                        <label className="form-label fs-14 text-default mb-1">Check In</label>
                                                                        <input 
                                                                            type="text" 
                                                                            className="form-control" 
                                                                            value={formatDateDisplay(hotelForm.checkIn)}
                                                                            readOnly
                                                                        />
                                                                        <p className="fs-12 mb-0">{getDayName(hotelForm.checkIn)}</p>
                                                                    </div>
                                                                    <div className="flex-fill">
                                                                        <label className="form-label fs-14 text-default mb-1">Check Out</label>
                                                                        <input 
                                                                            type="text" 
                                                                            className="form-control" 
                                                                            value={formatDateDisplay(hotelForm.checkOut)}
                                                                            readOnly
                                                                        />
                                                                        <p className="fs-12 mb-0">{getDayName(hotelForm.checkOut)}</p>
                                                                    </div>
                                                                </div>
                                                                
                                                                <DateRangeCalendar
                                                                    startDate={hotelForm.checkIn}
                                                                    endDate={hotelForm.checkOut}
                                                                    onDateChange={handleDateRangeChange}
                                                                    onClose={() => setActiveDropdown(null)}
                                                                    isOpen={activeDropdown === 'dateRange'}
                                                                    minDate={new Date()}
                                                                    className="mt-2"
                                                                />
                                                            </div>

                                                            <div className="form-item dropdown" ref={guestsDropdownRef}>
                                                                <div 
                                                                    onClick={() => toggleDropdown('guests')}
                                                                    role="button"
                                                                    className={`dropdown-toggle ${activeDropdown === 'guests' ? 'show' : ''}`}
                                                                >
                                                                    <label className="form-label fs-14 text-default mb-1">Guests</label>
                                                                    <h5>{getGuestsText()} <span className="fw-normal fs-14">Persons</span></h5>
                                                                    <p className="fs-12 mb-0">{getGuestsDetailText()}</p>
                                                                </div>
                                                                <div className={`dropdown-menu dropdown-menu-end dropdown-xl position-absolute ${activeDropdown === 'guests' ? 'show' : ''}`} style={{ zIndex: 1050, right: 0, left: 'auto' }}>
                                                                    <h5 className="mb-3">Select Travelers & Class</h5>
                                                                    <div className="mb-3 border br-10 info-item pb-1">
                                                                        <div className="row">
                                                                            <div className="col-md-12">
                                                                                <div className="mb-3 d-flex align-items-center justify-content-between">
                                                                                    <label className="form-label text-gray-9 mb-2">Rooms</label>
                                                                                    <div className="custom-increment">
                                                                                        <div className="input-group">
                                                                                            <span className="input-group-btn float-start">
                                                                                                <button 
                                                                                                    type="button" 
                                                                                                    className="quantity-left-minus btn btn-light btn-number" 
                                                                                                    onClick={() => updateGuestCount('rooms', 'minus')}
                                                                                                >
                                                                                                    <span><i className="isax isax-minus"></i></span>
                                                                                                </button>
                                                                                            </span>
                                                                                            <input type="text" name="quantity" className="input-number" value={hotelForm.guests.rooms.toString().padStart(2, '0')} readOnly />
                                                                                            <span className="input-group-btn float-end">
                                                                                                <button 
                                                                                                    type="button" 
                                                                                                    className="quantity-right-plus btn btn-light btn-number" 
                                                                                                    onClick={() => updateGuestCount('rooms', 'plus')}
                                                                                                >
                                                                                                    <span><i className="isax isax-add"></i></span>
                                                                                                </button>
                                                                                            </span>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                            <div className="col-md-12">
                                                                                <div className="mb-3 d-flex align-items-center justify-content-between">
                                                                                    <label className="form-label text-gray-9 mb-2">Adults</label>
                                                                                    <div className="custom-increment">
                                                                                        <div className="input-group">
                                                                                            <span className="input-group-btn float-start">
                                                                                                <button 
                                                                                                    type="button" 
                                                                                                    className="quantity-left-minus btn btn-light btn-number" 
                                                                                                    onClick={() => updateGuestCount('adults', 'minus')}
                                                                                                >
                                                                                                    <span><i className="isax isax-minus"></i></span>
                                                                                                </button>
                                                                                            </span>
                                                                                            <input type="text" name="quantity" className="input-number" value={hotelForm.guests.adults.toString().padStart(2, '0')} readOnly />
                                                                                            <span className="input-group-btn float-end">
                                                                                                <button 
                                                                                                    type="button" 
                                                                                                    className="quantity-right-plus btn btn-light btn-number" 
                                                                                                    onClick={() => updateGuestCount('adults', 'plus')}
                                                                                                >
                                                                                                    <span><i className="isax isax-add"></i></span>
                                                                                                </button>
                                                                                            </span>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                            <div className="col-md-12">
                                                                                <div className="mb-3 d-flex align-items-center justify-content-between">
                                                                                    <label className="form-label text-gray-9 mb-2">Children <span className="text-default fw-normal">( 2-12 Yrs )</span></label>
                                                                                    <div className="custom-increment">
                                                                                        <div className="input-group">
                                                                                            <span className="input-group-btn float-start">
                                                                                                <button 
                                                                                                    type="button" 
                                                                                                    className="quantity-left-minus btn btn-light btn-number" 
                                                                                                    onClick={() => updateGuestCount('children', 'minus')}
                                                                                                >
                                                                                                    <span><i className="isax isax-minus"></i></span>
                                                                                                </button>
                                                                                            </span>
                                                                                            <input type="text" name="quantity" className="input-number" value={hotelForm.guests.children.toString().padStart(2, '0')} readOnly />
                                                                                            <span className="input-group-btn float-end">
                                                                                                <button 
                                                                                                    type="button" 
                                                                                                    className="quantity-right-plus btn btn-light btn-number" 
                                                                                                    onClick={() => updateGuestCount('children', 'plus')}
                                                                                                >
                                                                                                    <span><i className="isax isax-add"></i></span>
                                                                                                </button>
                                                                                            </span>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                            <div className="col-md-12">
                                                                                <div className="mb-3 d-flex align-items-center justify-content-between">
                                                                                    <label className="form-label text-gray-9 mb-2">Infants <span className="text-default fw-normal">( 0-12 Yrs )</span></label>
                                                                                    <div className="custom-increment">
                                                                                        <div className="input-group">
                                                                                            <span className="input-group-btn float-start">
                                                                                                <button 
                                                                                                    type="button" 
                                                                                                    className="quantity-left-minus btn btn-light btn-number" 
                                                                                                    onClick={() => updateGuestCount('infants', 'minus')}
                                                                                                >
                                                                                                    <span><i className="isax isax-minus"></i></span>
                                                                                                </button>
                                                                                            </span>
                                                                                            <input type="text" name="quantity" className="input-number" value={hotelForm.guests.infants.toString().padStart(2, '0')} readOnly />
                                                                                            <span className="input-group-btn float-end">
                                                                                                <button 
                                                                                                    type="button" 
                                                                                                    className="quantity-right-plus btn btn-light btn-number" 
                                                                                                    onClick={() => updateGuestCount('infants', 'plus')}
                                                                                                >
                                                                                                    <span><i className="isax isax-add"></i></span>
                                                                                                </button>
                                                                                            </span>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    <div className="mb-3 border br-10 info-item pb-1">
                                                                        <h6 className="fs-16 fw-medium mb-2">Travellers</h6>
                                                                        <div className="d-flex align-items-center flex-wrap">
                                                                            <div className="form-check me-3 mb-3">
                                                                                <input 
                                                                                    className="form-check-input" 
                                                                                    type="radio" 
                                                                                    name="room" 
                                                                                    id="room1" 
                                                                                    checked={hotelForm.roomType === 'Single'}
                                                                                    onChange={() => handleRoomTypeSelect('Single')}
                                                                                />
                                                                                <label className="form-check-label" htmlFor="room1">
                                                                                    Single
                                                                                </label>
                                                                            </div>
                                                                            <div className="form-check me-3 mb-3">
                                                                                <input 
                                                                                    className="form-check-input" 
                                                                                    type="radio" 
                                                                                    name="room" 
                                                                                    id="room2" 
                                                                                    checked={hotelForm.roomType === 'Double'}
                                                                                    onChange={() => handleRoomTypeSelect('Double')}
                                                                                />
                                                                                <label className="form-check-label" htmlFor="room2">
                                                                                    Double
                                                                                </label>
                                                                            </div>
                                                                            <div className="form-check me-3 mb-3">
                                                                                <input 
                                                                                    className="form-check-input" 
                                                                                    type="radio" 
                                                                                    name="room" 
                                                                                    id="room3" 
                                                                                    checked={hotelForm.roomType === 'Delux'}
                                                                                    onChange={() => handleRoomTypeSelect('Delux')}
                                                                                />
                                                                                <label className="form-check-label" htmlFor="room3">
                                                                                    Delux
                                                                                </label>
                                                                            </div>
                                                                            <div className="form-check mb-3">
                                                                                <input 
                                                                                    className="form-check-input" 
                                                                                    type="radio" 
                                                                                    name="room" 
                                                                                    id="room4" 
                                                                                    checked={hotelForm.roomType === 'Suite'}
                                                                                    onChange={() => handleRoomTypeSelect('Suite')}
                                                                                />
                                                                                <label className="form-check-label" htmlFor="room4">
                                                                                    Suite
                                                                                </label>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    <div className="mb-3 border br-10 info-item pb-1">
                                                                        <h6 className="fs-16 fw-medium mb-2">Property Type</h6>
                                                                        <div className="d-flex align-items-center flex-wrap">
                                                                            <div className="form-check me-3 mb-3">
                                                                                <input 
                                                                                    className="form-check-input" 
                                                                                    type="radio" 
                                                                                    name="property" 
                                                                                    id="property1" 
                                                                                    checked={hotelForm.propertyType === 'Villa'}
                                                                                    onChange={() => handlePropertyTypeSelect('Villa')}
                                                                                />
                                                                                <label className="form-check-label" htmlFor="property1">
                                                                                    Villa
                                                                                </label>
                                                                            </div>
                                                                            <div className="form-check me-3 mb-3">
                                                                                <input 
                                                                                    className="form-check-input" 
                                                                                    type="radio" 
                                                                                    name="property" 
                                                                                    id="property2" 
                                                                                    checked={hotelForm.propertyType === 'Condo'}
                                                                                    onChange={() => handlePropertyTypeSelect('Condo')}
                                                                                />
                                                                                <label className="form-check-label" htmlFor="property2">
                                                                                    Condo
                                                                                </label>
                                                                            </div>
                                                                            <div className="form-check me-3 mb-3">
                                                                                <input 
                                                                                    className="form-check-input" 
                                                                                    type="radio" 
                                                                                    name="property" 
                                                                                    id="property3" 
                                                                                    checked={hotelForm.propertyType === 'Cabin'}
                                                                                    onChange={() => handlePropertyTypeSelect('Cabin')}
                                                                                />
                                                                                <label className="form-check-label" htmlFor="property3">
                                                                                    Cabin
                                                                                </label>
                                                                            </div>
                                                                            <div className="form-check mb-3">
                                                                                <input 
                                                                                    className="form-check-input" 
                                                                                    type="radio" 
                                                                                    name="property" 
                                                                                    id="property4" 
                                                                                    checked={hotelForm.propertyType === 'Apartments'}
                                                                                    onChange={() => handlePropertyTypeSelect('Apartments')}
                                                                                />
                                                                                <label className="form-check-label" htmlFor="property4">
                                                                                    Apartments
                                                                                </label>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    <div className="d-flex justify-content-end">
                                                                        <button 
                                                                            type="button" 
                                                                            className="btn btn-light btn-sm me-2"
                                                                            onClick={() => setActiveDropdown(null)}
                                                                        >
                                                                            Cancel
                                                                        </button>
                                                                        <button 
                                                                            type="button" 
                                                                            className="btn btn-primary btn-sm"
                                                                            onClick={() => setActiveDropdown(null)}
                                                                        >
                                                                            Apply
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                        </div>
                                                        <button type="submit" className="btn btn-primary search-btn rounded">Search</button>
                                                    </div>
                                                </form>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <div className="container" style={{ paddingTop: '50px' }}>
            


            <div className="row">

                {/* <?php include('hotels/hotel-sidebar.php');?> */}
                <div className="col-md-3 col-12">
                    <div className="card filter-sidebar flight-sidebar mb-4 mb-lg-0">
                        <div className="card-header d-flex align-items-center justify-content-between">
                            <h5>Filters</h5>
                            <a href="#" className="fs-14 link-primary" onClick={(e) => { e.preventDefault(); resetFilters(); }}>Reset</a>
                        </div>
                        <div className="card-body p-0">
                            <form action="">

                                <div className="accordion accordion-list">
                                    {/* Property Type Filter - Only show if there are property types */}
                                    {availableFilters.propertyTypes.length > 0 && (
                                        <div className="accordion-item border-bottom p-3">
                                            <div className="accordion-header">
                                                <div className="accordion-button p-0" data-bs-toggle="collapse"
                                                    data-bs-target="#accordion-populars" aria-expanded="true"
                                                    aria-controls="accordion-populars" role="button">Property Type
                                                </div>
                                            </div>
                                            <div id="accordion-populars" className="accordion-collapse collapse show">
                                                <div className="accordion-body pt-2">
                                                    {availableFilters.propertyTypes.map((propertyType, index) => (
                                                        <div key={propertyType}
                                                            className="form-checkbox form-check form-check-inline d-inline-flex align-items-center mt-2 me-2">
                                                            <input 
                                                                className="form-check-input ms-0 mt-0" 
                                                                name="propertyType" 
                                                                type="checkbox" 
                                                                id={`property${index + 1}`}
                                                                checked={filters.propertyType.includes(propertyType)}
                                                                onChange={(e) => handleFilterChange('propertyType', propertyType, e.target.checked)}
                                                            />
                                                            <label className="form-check-label ms-2" htmlFor={`property${index + 1}`}>
                                                                {propertyType}
                                                            </label>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    {/* Meal Plans Filter - Only show if there are meal plans */}
                                    {availableFilters.mealPlans.length > 0 && (
                                        <div className="accordion-item border-bottom p-3">
                                            <div className="accordion-header">
                                                <div className="accordion-button p-0" data-bs-toggle="collapse"
                                                    data-bs-target="#accordion-flight" aria-expanded="true" aria-controls="accordion-flight"
                                                    role="button">
                                                    Meal Plans
                                                </div>
                                            </div>
                                            <div id="accordion-flight" className="accordion-collapse collapse show">
                                                <div className="accordion-body">
                                                    <div className="more-content">
                                                        {availableFilters.mealPlans.map((mealPlan, index) => (
                                                            <div key={mealPlan} className="form-check d-flex align-items-center ps-0 mb-2">
                                                                <input 
                                                                    className="form-check-input ms-0 mt-0" 
                                                                    name="mealPlan" 
                                                                    type="checkbox"
                                                                    id={`mealPlan${index + 1}`}
                                                                    checked={filters.mealPlan.includes(mealPlan)}
                                                                    onChange={(e) => handleFilterChange('mealPlan', mealPlan, e.target.checked)}
                                                                />
                                                                <label className="form-check-label ms-2" htmlFor={`mealPlan${index + 1}`}>
                                                                    {mealPlan}
                                                                </label>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    {/* Star Ratings Filter - Only show if there are star ratings */}
                                    {availableFilters.starRatings.length > 0 && (
                                        <div className="accordion-item border-bottom p-3">
                                            <div className="accordion-header">
                                                <div className="accordion-button p-0" data-bs-toggle="collapse"
                                                    data-bs-target="#accordion-brands" aria-expanded="true" aria-controls="accordion-brands"
                                                    role="button">Reviews
                                                </div>
                                            </div>
                                            <div id="accordion-brands" className="accordion-collapse collapse show">
                                                <div className="accordion-body">
                                                    {availableFilters.starRatings.map((starRating) => (
                                                        <div key={starRating} className="form-check d-flex align-items-center ps-0 mb-2">
                                                            <input 
                                                                className="form-check-input ms-0 mt-0" 
                                                                name="starRating" 
                                                                type="checkbox"
                                                                id={`star${starRating}`}
                                                                checked={filters.starRating.includes(starRating)}
                                                                onChange={(e) => handleFilterChange('starRating', starRating, e.target.checked)}
                                                            />
                                                            <label className="form-check-label ms-2" htmlFor={`star${starRating}`}>
                                                                <span className="rating d-flex align-items-center">
                                                                    {Array.from({ length: starRating }, (_, i) => (
                                                                        <i key={i} className="fas fa-star filled text-primary me-1"></i>
                                                                    ))}
                                                                    <span className="ms-2">{starRating} Star</span>
                                                                </span>
                                                            </label>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                {/* Price Range Filter - Only show if there are hotels with prices */}
                                {availableFilters.priceRange[1] > availableFilters.priceRange[0] && (
                                    <div className="accordion-item border-bottom p-3">
                                        <div className="accordion-header">
                                            <div className="accordion-button p-0" data-bs-toggle="collapse" data-bs-target="#accordion-popular" aria-expanded="true" aria-controls="accordion-popular" role="button">
                                                Price Range
                                            </div>
                                        </div>
                                        <div id="accordion-popular" className="accordion-collapse collapse show">
                                            <div className="accordion-body" style={{ paddingTop: '15px' }}>
                                                <PriceRangeSlider
                                                    min={availableFilters.priceRange[0]}
                                                    max={availableFilters.priceRange[1]}
                                                    value={filters.priceRange}
                                                    onChange={handlePriceRangeChange}
                                                    step={500}
                                                    formatValue={(value) => `₹${value?.toLocaleString() || '0'}`}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                                    {/* Amenities Filter - Only show if there are amenities */}
                                    {availableFilters.amenities.length > 0 && (
                                        <div className="accordion-item border-bottom p-3">
                                            <div className="accordion-header">
                                                <div className="accordion-button p-0" data-bs-toggle="collapse"
                                                    data-bs-target="#accordion-amenities" aria-expanded="true"
                                                    aria-controls="accordion-amenities" role="button"> Amenities
                                                </div>
                                            </div>
                                            <div id="accordion-amenities" className="accordion-collapse collapse show">
                                                <div className="accordion-body">
                                                    <div className="more-content">
                                                        {availableFilters.amenities.map((amenity, index) => (
                                                            <div key={amenity} className="form-check d-flex align-items-center ps-0 mb-2">
                                                                <input 
                                                                    className="form-check-input ms-0 mt-0" 
                                                                    name="amenities" 
                                                                    type="checkbox"
                                                                    id={`amenity${index + 1}`}
                                                                    checked={filters.amenities.includes(amenity)}
                                                                    onChange={(e) => handleFilterChange('amenities', amenity, e.target.checked)}
                                                                />
                                                                <label className="form-check-label ms-2" htmlFor={`amenity${index + 1}`}>
                                                                    {amenity}
                                                                </label>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

                {/* <?php include('hotels/hotel-content.php');?> */}
                <HotelSearchResults 
                    hotels={hotels.map(hotel => ({
                        id: hotel.id,
                        name: hotel.name,
                        location: hotel.location?.address || hotel.location?.city || hotel.location || 'Location not available',
                        rating: hotel.rating,
                        // reviewCount removed - no longer displayed
                        reviewScore: hotel.reviewScore,
                        image: hotel.images?.[0] || hotel.image || '/images/hotel-01.jpg',
                        amenities: hotel.amenities || [],
                        roomType: hotel.roomType || 'Standard Room',
                        lastBooked: hotel.lastBooked || '2 hours ago',
                        originalPrice: hotel.originalPrice || (hotel.currentPrice * 1.2) || (hotel.tp ? Math.round(hotel.tp * 1.2) : 0),
                        currentPrice: hotel.currentPrice || hotel.tp || 0,
                        currency: hotel.currency || 'AED',
                        specialOffer: hotel.specialOffer || 'Free cancellation',
                        discount: hotel.discount || 'Save 20%',
                        propertyType: hotel.propertyType
                    }))}
                    totalResults={totalResults}
                    loading={hotelsLoading}
                    onSortChange={handleSortChange}
                />

            </div>

        </div>
        </>
    );
}

export default function HotelsListPage() {
  return (
    <Suspense fallback={
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    }>
      <HotelsListContent />
    </Suspense>
  );
} 