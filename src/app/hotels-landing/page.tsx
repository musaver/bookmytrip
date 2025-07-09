'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import DateRangeCalendar from '@/components/DateRangeCalendar';
import HotelPreferencesSection from '@/components/HotelPreferencesSection';
import TopRatedProvidersSection from '@/components/TopRatedProvidersSection';
import HowItWorksSection from '@/components/HowItWorksSection';
import HotelsListSection from '@/components/HotelsListSection';
import { useHotelSearch } from '@/hooks/useHotelSearch';
import Link from 'next/link';

export default function Hotels_landing() {
    const router = useRouter();
    const { results, loading: searchLoading, search, clearResults } = useHotelSearch();
    
    // State to manage active dropdowns
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
    const [locationSearch, setLocationSearch] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [topCities, setTopCities] = useState<any[]>([]);
    const [loadingTopCities, setLoadingTopCities] = useState(false);
    
    // State for form data
    const [hotelForm, setHotelForm] = useState({
        location: '',
        locationCode: '',
        country: '',
        checkIn: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        checkOut: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        guests: {
            rooms: 1,
            adults: 1,
            children: 1,
            infants: 1
        },
        roomType: 'Single',
        propertyType: 'Villa'
    });

    // Refs for dropdown containers
    const locationDropdownRef = useRef<HTMLDivElement>(null);
    const guestsDropdownRef = useRef<HTMLDivElement>(null);
    const locationInputRef = useRef<HTMLInputElement>(null);

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
        
        // Auto-focus on location search input when location dropdown is opened
        if (dropdownName === 'location' && activeDropdown !== 'location') {
            fetchTopCities(); // Fetch top cities when dropdown opens
            setTimeout(() => {
                locationInputRef.current?.focus();
            }, 100);
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

    // Function to handle form submission
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Build search parameters
        const searchParams = new URLSearchParams({
            location: hotelForm.location,
            locationCode: hotelForm.locationCode,
            country: hotelForm.country,
            checkinDate: hotelForm.checkIn.toISOString().split('T')[0],
            checkoutDate: hotelForm.checkOut.toISOString().split('T')[0],
            rooms: hotelForm.guests.rooms.toString(),
            adults: hotelForm.guests.adults.toString(),
            children: hotelForm.guests.children.toString(),
            infants: hotelForm.guests.infants.toString(),
            roomType: hotelForm.roomType,
            propertyType: hotelForm.propertyType
        });
        
        // Navigate to hotels-list page with search parameters
        router.push(`/hotels-list?${searchParams.toString()}`);
    };

    return (
        <>
        <section id="heroSection" className="hero-section" style={{
            background: "linear-gradient(45deg, black, transparent), url('/images/hotel_banner.png')",
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
            height: "auto"
        }}>
            <div className="container">
                <div className="hero-content">
                    <div className="row align-items-center">
                        <div className="col-md-12 mx-auto wow fadeInUp" data-wow-delay="0.3s">
                            <div className="banner-content mx-auto">
                                <h1 className="text-white display-5 mb-2">Set your destination with us</h1>
                                <h6 className="text-light mx-auto">Make your travel the most comfortable and affordable</h6>
                            </div>
                            <div className="banner-form card mb-0">
                                <div className="card-header">
                                    <ul className="nav">
                                        <li>
                                            <Link href="/flights-landing" className="nav-link">
                                                <i className="isax isax-airplane5 me-2"></i>Flights
                                            </Link>
                                        </li>
                                        <li>
                                            <Link href="/hotels-landing" className="nav-link active">
                                                <i className="isax isax-buildings5 me-2"></i>Hotels
                                            </Link>
                                        </li>
                                    </ul>
                                </div>

                                <div className="card-body">
                                    <div>
                                        <div className="tab-content">
                                            <div className="tab-pane fade active show" id="Hotels">
                                                <form onSubmit={handleSearch}>
                                                    <div className="d-flex align-items-center justify-content-between flex-wrap mb-2">
                                                        <h6 className="fw-medium fs-16 mb-2">Book Hotel - Villas, Apartments & more.</h6>
                                                    </div>
                                                    <div className="d-lg-flex">
                                                        <div className="d-flex form-info">
                                                            <div className="form-item dropdown" ref={locationDropdownRef}>
                                                                <div 
                                                                    onClick={() => toggleDropdown('location')}
                                                                    role="button"
                                                                    className={`dropdown-toggle ${activeDropdown === 'location' ? 'show' : ''}`}
                                                                >
                                                                    <label className="form-label fs-14 text-default mb-1">City or Location</label>
                                                                    <input type="text" className="form-control" value={hotelForm.location || 'Select City or Location'} readOnly />
                                                                    <p className="fs-12 mb-0">{hotelForm.country || 'Choose your destination'}</p>
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
                                                                                ref={locationInputRef}
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
                                                                                            href="javascript:void(0);" 
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
                                                                                                href="javascript:void(0);" 
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

        <HotelPreferencesSection />

        <section className="support-section support-sec-two bg-secondary">
            <div className="horizontal-slide d-flex" data-direction="left" data-speed="slow">
                <div className="slide-list d-flex">
                    <div className="support-item">
                        <h5>Personalized Itineraries</h5>
                    </div>
                    <div className="support-item">
                        <h5>Comprehensive Planning</h5>
                    </div>
                    <div className="support-item">
                        <h5>Expert Guidance</h5>
                    </div>
                    <div className="support-item">
                        <h5>Local Experience</h5>
                    </div>
                    <div className="support-item">
                        <h5>Customer Support</h5>
                    </div>
                    <div className="support-item">
                        <h5>Sustainability Efforts</h5>
                    </div>
                    <div className="support-item">
                        <h5>Multiple Regions</h5>
                    </div>
                </div>
            </div>
        </section>

        {/* Services section */}

        

        <HotelsListSection />

        <HowItWorksSection />

        <TopRatedProvidersSection />
        </>
    );
} 