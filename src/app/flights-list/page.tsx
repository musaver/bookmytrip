'use client';

import React, { useEffect, useState, useRef, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useFlightSearch } from '@/hooks/useFlightSearch';
import { useAirportSearch } from '@/hooks/useAirportSearch';
import { FlightResults } from '@/components/flights/FlightResults';
import { DateCarousel } from '@/components/flights/DateCarousel';
import { Pagination } from '@/components/flights/Pagination';
import { FlightFilters } from '@/types/flight';
import { RangeSlider } from '@/components/flights/RangeSlider';

// Declare the global jQuery interface
declare global {
  interface Window {
    $: any;
    jQuery: any;
  }
}

interface RangeData {
  from: number;
  to: number;
}

function FlightsListContent() {
  const searchParams = useSearchParams();
  const flightSearch = useFlightSearch();
  const [activeFilters, setActiveFilters] = useState<Partial<FlightFilters>>({});
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 });
  const [durationRange, setDurationRange] = useState({ min: 0, max: 1440 });
  const [slidersInitialized, setSlidersInitialized] = useState(false);
  const [initialSearchTriggered, setInitialSearchTriggered] = useState(false);
  const [sortBy, setSortBy] = useState<string>('recommended');

  // Search form state - initialize with URL parameters or defaults
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [searchForm, setSearchForm] = useState(() => {
    // Check if we have URL parameters
    const origin = searchParams.get('origin');
    const destination = searchParams.get('destination');
    const departureDate = searchParams.get('departureDate');
    const returnDate = searchParams.get('returnDate');
    const tripType = searchParams.get('tripType');
    const adults = searchParams.get('adults');
    const children = searchParams.get('children');
    const infants = searchParams.get('infants');
    const cabinClass = searchParams.get('cabinClass');
    
    // Get airport names from URL if available
    const originName = searchParams.get('originName');
    const originAirport = searchParams.get('originAirport');
    const destinationName = searchParams.get('destinationName');
    const destinationAirport = searchParams.get('destinationAirport');

    // If we have URL parameters, use them
    if (origin && destination && departureDate) {
      return {
        origin: { 
          code: origin, 
          name: originName || '', 
          airport: originAirport || '' 
        },
        destination: { 
          code: destination, 
          name: destinationName || '', 
          airport: destinationAirport || '' 
        },
        departureDate: departureDate,
        returnDate: returnDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        tripType: tripType || 'oneway',
        travelers: { 
          adults: parseInt(adults || '1'), 
          children: parseInt(children || '0'), 
          infants: parseInt(infants || '0') 
        },
        cabinClass: cabinClass?.replace('_', ' ') || 'Economy'
      };
    }

    // Default values if no URL parameters
    return {
      origin: { code: 'DXB', name: 'Dubai', airport: 'Dubai International Airport' },
      destination: { code: 'LHR', name: 'London', airport: 'Heathrow Airport' },
      departureDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
      returnDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 14 days from now
      tripType: 'oneway',
      travelers: { adults: 1, children: 0, infants: 0 },
      cabinClass: 'Economy'
    };
  });

  // Airport search hooks
  const originSearch = useAirportSearch();
  const destinationSearch = useAirportSearch();

  // Populate airport names when we have codes from URL parameters
  useEffect(() => {
    // If we have airport codes from URL but no names, search for them
    if (searchForm.origin.code && !searchForm.origin.name) {
      // First try to find from current search results
      const airport = originSearch.airports.find(a => a.code === searchForm.origin.code);
      if (airport) {
        setSearchForm(prev => ({
          ...prev,
          origin: {
            code: airport.code,
            name: airport.city,
            airport: airport.name
          }
        }));
      } else {
        // If not found, trigger a search for this specific airport code
        originSearch.updateQuery(searchForm.origin.code);
      }
    }

    if (searchForm.destination.code && !searchForm.destination.name) {
      // First try to find from current search results
      const airport = destinationSearch.airports.find(a => a.code === searchForm.destination.code);
      if (airport) {
        setSearchForm(prev => ({
          ...prev,
          destination: {
            code: airport.code,
            name: airport.city,
            airport: airport.name
          }
        }));
      } else {
        // If not found, trigger a search for this specific airport code
        destinationSearch.updateQuery(searchForm.destination.code);
      }
    }
  }, [originSearch.airports, destinationSearch.airports, searchForm.origin.code, searchForm.destination.code, originSearch, destinationSearch]);

  // Refs for dropdown containers
  const fromDropdownRef = useRef<HTMLDivElement>(null);
  const toDropdownRef = useRef<HTMLDivElement>(null);
  const travelersDropdownRef = useRef<HTMLDivElement>(null);

  // Function to toggle dropdown
  const toggleDropdown = (dropdownName: string) => {
    setActiveDropdown(activeDropdown === dropdownName ? null : dropdownName);
  };

  // Function to close dropdown when clicking outside
  const handleClickOutside = (event: MouseEvent) => {
    const target = event.target as Node;
    
    // Check if click is outside all dropdowns
    if (
      fromDropdownRef.current && !fromDropdownRef.current.contains(target) &&
      toDropdownRef.current && !toDropdownRef.current.contains(target) &&
      travelersDropdownRef.current && !travelersDropdownRef.current.contains(target)
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

  // Auto-trigger search when page loads with URL parameters
  useEffect(() => {
    const origin = searchParams.get('origin');
    const destination = searchParams.get('destination');
    const departureDate = searchParams.get('departureDate');
    
    if (origin && destination && departureDate && !initialSearchTriggered) {
      setInitialSearchTriggered(true);
      
      // Reset filters for new search
      setActiveFilters({});
      
      // Trigger search with URL parameters
      const searchQuery = {
        cabinClass: searchForm.cabinClass.toUpperCase().replace(' ', '_'),
        paxInfo: {
          ADULT: searchForm.travelers.adults.toString(),
          CHILD: searchForm.travelers.children.toString(),
          INFANT: searchForm.travelers.infants.toString()
        },
        routeInfos: [{
          fromCityOrAirport: {
            code: searchForm.origin.code
          },
          toCityOrAirport: {
            code: searchForm.destination.code
          },
          travelDate: searchForm.departureDate
        }],
        ...(searchForm.tripType === 'roundtrip' && searchForm.returnDate && {
          routeInfos: [
            {
              fromCityOrAirport: {
                code: searchForm.origin.code
              },
              toCityOrAirport: {
                code: searchForm.destination.code
              },
              travelDate: searchForm.departureDate
            },
            {
              fromCityOrAirport: {
                code: searchForm.destination.code
              },
              toCityOrAirport: {
                code: searchForm.origin.code
              },
              travelDate: searchForm.returnDate
            }
          ]
        })
      };

      flightSearch.searchFlights({ searchQuery });
    }
  }, [searchParams, searchForm, initialSearchTriggered, flightSearch]);

  // Function to update traveler count
  const updateTravelerCount = (type: 'adults' | 'children' | 'infants', operation: 'plus' | 'minus') => {
    setSearchForm(prev => {
      const newCount = operation === 'plus' ? prev.travelers[type] + 1 : prev.travelers[type] - 1;
      
      // Apply limits
      if (type === 'adults') {
        if (newCount < 1 || newCount > 9) return prev;
      } else {
        if (newCount < 0 || newCount > 9) return prev;
      }
      
      return { 
        ...prev, 
        travelers: { ...prev.travelers, [type]: newCount } 
      };
    });
  };

  // Function to get total travelers text
  const getTravelersText = () => {
    const total = searchForm.travelers.adults + searchForm.travelers.children + searchForm.travelers.infants;
    return `${total} ${total === 1 ? 'Person' : 'Persons'}`;
  };

  // Function to get travelers detail text
  const getTravelersDetailText = () => {
    const parts = [];
    if (searchForm.travelers.adults) parts.push(`${searchForm.travelers.adults} Adult${searchForm.travelers.adults > 1 ? 's' : ''}`);
    if (searchForm.travelers.children) parts.push(`${searchForm.travelers.children} Child${searchForm.travelers.children > 1 ? 'ren' : ''}`);
    if (searchForm.travelers.infants) parts.push(`${searchForm.travelers.infants} Infant${searchForm.travelers.infants > 1 ? 's' : ''}`);
    return parts.join(', ') || '1 Adult';
  };

  // Function to handle airport selection
  const handleAirportSelect = (airport: any, type: 'origin' | 'destination') => {
    setSearchForm(prev => ({
      ...prev,
      [type]: {
        code: airport.code,
        name: airport.city,
        airport: airport.name
      }
    }));
    setActiveDropdown(null);
  };

  // Function to swap airports
  const handleSwapAirports = () => {
    setSearchForm(prev => ({
      ...prev,
      origin: prev.destination,
      destination: prev.origin
    }));
  };

  // Function to reset all filters
  const handleResetFilters = () => {
    setActiveFilters({});
  };

  // Handle search form submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset sliders state and all filters for new search
    setSlidersInitialized(false);
    setActiveFilters({});
    
    const searchParams = {
      searchQuery: {
        cabinClass: searchForm.cabinClass.toUpperCase().replace(' ', '_'),
        paxInfo: {
          ADULT: searchForm.travelers.adults.toString(),
          CHILD: searchForm.travelers.children.toString(),
          INFANT: searchForm.travelers.infants.toString()
        },
        routeInfos: [{
          fromCityOrAirport: {
            code: searchForm.origin.code
          },
          toCityOrAirport: {
            code: searchForm.destination.code
          },
          travelDate: searchForm.departureDate
        }],
        ...(searchForm.tripType === 'roundtrip' && {
          routeInfos: [
            {
              fromCityOrAirport: {
                code: searchForm.origin.code
              },
              toCityOrAirport: {
                code: searchForm.destination.code
              },
              travelDate: searchForm.departureDate
            },
            {
              fromCityOrAirport: {
                code: searchForm.destination.code
              },
              toCityOrAirport: {
                code: searchForm.origin.code
              },
              travelDate: searchForm.returnDate
            }
          ]
        })
      }
    };

    flightSearch.searchFlights(searchParams);
  };

  // Test search function
  const handleTestSearch = () => {
    const futureDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // 30 days from now
    const defaultParams = {
      origin: 'DXB',
      destination: 'LHR',
      departureDate: futureDate,
      adults: 1,
      children: 0,
      infants: 0,
      cabinClass: 'ECONOMY' as const,
      isRoundTrip: false,
      isDirectFlight: false
    };
    console.log('Manual search triggered with:', defaultParams);
    flightSearch.searchFlights(defaultParams);
  };
  // Reset sliders when search parameters change (new search)
  useEffect(() => {
    if (flightSearch.searchParams) {
      setSlidersInitialized(false);
    }
  }, [flightSearch.searchParams]);

  // Initialize sliders when new search results are available (not filtered results)
  useEffect(() => {
    if (typeof window !== 'undefined' && window.$ && 
        flightSearch.searchParams && 
        !flightSearch.loading && 
        flightSearch.results.length > 0 && 
        !slidersInitialized) {
      
      // Calculate ranges from original results only
      const prices = flightSearch.results.map(r => r.price.total);
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      
      const durations = flightSearch.results.map(r => r.duration.total);
      const minDuration = Math.min(...durations);
      const maxDuration = Math.max(...durations);
      
      setPriceRange({ min: minPrice, max: maxPrice });
      setDurationRange({ min: minDuration, max: maxDuration });

      setSlidersInitialized(true);
    }


  }, [flightSearch.searchParams, flightSearch.loading, flightSearch.results.length, slidersInitialized]);

  // Function to apply sorting
  const applySorting = React.useCallback((flights: any[], sortType: string) => {
    const sortedFlights = [...flights];
    
    switch (sortType) {
      case 'price-low':
        return sortedFlights.sort((a, b) => a.price.total - b.price.total);
      case 'price-high':
        return sortedFlights.sort((a, b) => b.price.total - a.price.total);
      case 'duration':
        return sortedFlights.sort((a, b) => a.duration.total - b.duration.total);
      case 'departure-time':
        return sortedFlights.sort((a, b) => 
          new Date(a.departure.time).getTime() - new Date(b.departure.time).getTime()
        );
      case 'arrival-time':
        return sortedFlights.sort((a, b) => 
          new Date(a.arrival.time).getTime() - new Date(b.arrival.time).getTime()
        );
      case 'stops':
        return sortedFlights.sort((a, b) => a.stops - b.stops);
      case 'recommended':
      default:
        // Default sorting by a combination of price and duration
        return sortedFlights.sort((a, b) => {
          const scoreA = (a.price.total / 1000) + (a.duration.total / 60) + (a.stops * 2);
          const scoreB = (b.price.total / 1000) + (b.duration.total / 60) + (b.stops * 2);
          return scoreA - scoreB;
        });
    }
  }, []);

  // Apply filters when activeFilters change
  const filteredResults = useMemo(() => {
    if (!flightSearch.results || flightSearch.results.length === 0) {
      return [];
    }

    let filtered = [...flightSearch.results]; // Always start with original results

    // Apply price filter
    if (activeFilters.priceRange) {
      filtered = filtered.filter(flight => 
        flight.price.total >= activeFilters.priceRange!.min && 
        flight.price.total <= activeFilters.priceRange!.max
      );
    }

    // Apply duration filter
    if (activeFilters.durationRange) {
      filtered = filtered.filter(flight => 
        flight.duration.total <= activeFilters.durationRange!.max
      );
    }

    // Apply airline filter
    if (activeFilters.airlines && activeFilters.airlines.length > 0) {
      filtered = filtered.filter(flight => 
        activeFilters.airlines!.includes(flight.airline.code)
      );
    }

    // Apply departure time filter
    if (activeFilters.departureTime) {
      filtered = filtered.filter(flight => {
        const departureHour = new Date(flight.departure.time).getHours();
        const timeSlot = activeFilters.departureTime!;
        
        if (timeSlot === 'night-to-morning') return departureHour >= 0 && departureHour < 6;
        if (timeSlot === 'morning-to-afternoon') return departureHour >= 6 && departureHour < 12;
        if (timeSlot === 'afternoon-to-evening') return departureHour >= 12 && departureHour < 18;
        if (timeSlot === 'evening-to-night') return departureHour >= 18 && departureHour < 24;
        
        return true;
      });
    }

    // Apply arrival time filter
    if (activeFilters.arrivalTime) {
      filtered = filtered.filter(flight => {
        const arrivalHour = new Date(flight.arrival.time).getHours();
        const timeSlot = activeFilters.arrivalTime!;
        
        if (timeSlot === 'night-to-morning') return arrivalHour >= 0 && arrivalHour < 6;
        if (timeSlot === 'morning-to-afternoon') return arrivalHour >= 6 && arrivalHour < 12;
        if (timeSlot === 'afternoon-to-evening') return arrivalHour >= 12 && arrivalHour < 18;
        if (timeSlot === 'evening-to-night') return arrivalHour >= 18 && arrivalHour < 24;
        
        return true;
      });
    }

    // Apply stops filter
    if (activeFilters.stops !== undefined) {
      filtered = filtered.filter(flight => flight.stops === activeFilters.stops);
    }

    // Apply departure airports filter
    if (activeFilters.departureAirports && activeFilters.departureAirports.length > 0) {
      filtered = filtered.filter(flight => 
        activeFilters.departureAirports!.includes(flight.departure.airport.code)
      );
    }

    // Apply arrival airports filter
    if (activeFilters.arrivalAirports && activeFilters.arrivalAirports.length > 0) {
      filtered = filtered.filter(flight => 
        activeFilters.arrivalAirports!.includes(flight.arrival.airport.code)
      );
    }

    // Apply refundable filter
    if (activeFilters.refundable) {
      filtered = filtered.filter(flight => flight.refundable === true);
    }

    // Apply changeable filter
    if (activeFilters.changeable) {
      filtered = filtered.filter(flight => flight.changeable === true);
    }

    // Apply sorting to filtered results
    return applySorting(filtered, sortBy);
  }, [flightSearch.results, activeFilters, sortBy, applySorting]); // Only depend on original results and active filters

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.$) {
        try {
          // Cleanup all jQuery plugins
          const priceSlider = window.$("#range_price").data("ionRangeSlider");
          const durationSlider = window.$("#range_duration").data("ionRangeSlider");
          
          if (priceSlider) {
            priceSlider.destroy();
          }
          if (durationSlider) {
            durationSlider.destroy();
          }

          // Cleanup all owl carousels
          window.$(".owl-carousel").each((index: number, element: any) => {
            const $this = window.$(element);
            if ($this.hasClass('owl-loaded')) {
              $this.trigger('destroy.owl.carousel').removeClass('owl-loaded');
            }
          });
        } catch (error) {
          console.warn('Error during component cleanup:', error);
        }
      }
    };
  }, []);

  return (
    <>
      <section
        id="heroSection"
        className="hero-section"
        style={{
          background:
            "linear-gradient(45deg, black, transparent), url('/images/home/1920x840.jpg')",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          height: "auto",
          marginTop: "70px"
        }}
      >
        <div className="container">
          <div className="hero-content" style={{
                paddingTop: 0,
                paddingBottom: 50
          }}>
            <div className="row align-items-center">
              <div className="col-md-12 mx-auto wow fadeInUp" data-wow-delay="0.3s">
               
                <div className="banner-form card mb-0">
                  
                  <div className="card-body">
                    <form onSubmit={handleSearch}>
                      <div className="d-flex align-items-center justify-content-between flex-wrap mb-2">
                        <div className="d-flex align-items-center flex-wrap">
                          <div className="form-check d-flex align-items-center me-3 mb-2">
                            <input 
                              className="form-check-input mt-0" 
                              type="radio" 
                              name="tripType" 
                              id="oneway" 
                              value="oneway" 
                              checked={searchForm.tripType === 'oneway'}
                              onChange={(e) => setSearchForm(prev => ({ ...prev, tripType: e.target.value }))}
                            />
                            <label className="form-check-label fs-14 ms-2" htmlFor="oneway">Oneway</label>
                          </div>
                          <div className="form-check d-flex align-items-center me-3 mb-2">
                            <input 
                              className="form-check-input mt-0" 
                              type="radio" 
                              name="tripType" 
                              id="roundtrip" 
                              value="roundtrip" 
                              checked={searchForm.tripType === 'roundtrip'}
                              onChange={(e) => setSearchForm(prev => ({ ...prev, tripType: e.target.value }))}
                            />
                            <label className="form-check-label fs-14 ms-2" htmlFor="roundtrip">Round Trip</label>
                          </div>
                          <div className="form-check d-flex align-items-center me-3 mb-2">
                            <input 
                              className="form-check-input mt-0" 
                              type="radio" 
                              name="tripType" 
                              id="multiway" 
                              value="multiway" 
                              checked={searchForm.tripType === 'multiway'}
                              onChange={(e) => setSearchForm(prev => ({ ...prev, tripType: e.target.value }))}
                            />
                            <label className="form-check-label fs-14 ms-2" htmlFor="multiway">Multi Trip</label>
                          </div>
                        </div>
                        <h6 className="fw-medium fs-16 mb-2">Thousands of affordable flights available.</h6>
                      </div>
                      <div className="normal-trip">
                        <div className="d-lg-flex">
                          <div className="d-flex form-info">
                            <div className="form-item dropdown" ref={fromDropdownRef}>
                              <div 
                                onClick={() => toggleDropdown('from')}
                                role="button"
                                className={`dropdown-toggle ${activeDropdown === 'from' ? 'show' : ''}`}
                              >
                                <label className="form-label fs-14 text-default mb-1">From</label>
                                <input 
                                  type="text" 
                                  className="form-control" 
                                  value={searchForm.origin.name || searchForm.origin.code || 'Select Origin'} 
                                  readOnly 
                                />
                                <p className="fs-12 mb-0">
                                  {searchForm.origin.airport || (searchForm.origin.code ? `Airport Code: ${searchForm.origin.code}` : 'Choose departure airport')}
                                </p>
                              </div>
                              <div className={`dropdown-menu dropdown-md p-0 position-absolute ${activeDropdown === 'from' ? 'show' : ''}`} style={{ zIndex: 1050 }}>
                                <div className="input-search p-3 border-bottom">
                                  <div className="input-group">
                                    <input 
                                      type="text" 
                                      className="form-control" 
                                      placeholder="Search Location" 
                                      value={originSearch.query}
                                      onChange={(e) => originSearch.updateQuery(e.target.value)}
                                    />
                                    <span className="input-group-text px-2 border-start-0">
                                      <i className="isax isax-search-normal"></i>
                                    </span>
                                  </div>
                                </div>
                                <ul>
                                  {originSearch.airports.map((airport) => (
                                    <li key={airport.code} className="border-bottom">
                                      <a 
                                        className="dropdown-item" 
                                        href="#"
                                        onClick={(e) => {
                                          e.preventDefault();
                                          handleAirportSelect(airport, 'origin');
                                        }}
                                      >
                                        <h6 className="fs-16 fw-medium">{airport.city}</h6>
                                        <p>{airport.name}</p>
                                      </a>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                            <div className="form-item dropdown ps-2 ps-sm-3" ref={toDropdownRef}>
                              <div 
                                onClick={() => toggleDropdown('to')}
                                role="button"
                                className={`dropdown-toggle ${activeDropdown === 'to' ? 'show' : ''}`}
                              >
                                <label className="form-label fs-14 text-default mb-1">To</label>
                                <input 
                                  type="text" 
                                  className="form-control" 
                                  value={searchForm.destination.name || searchForm.destination.code || 'Select Destination'} 
                                  readOnly 
                                />
                                <p className="fs-12 mb-0">
                                  {searchForm.destination.airport || (searchForm.destination.code ? `Airport Code: ${searchForm.destination.code}` : 'Choose arrival airport')}
                                </p>
                              </div>
                              <div className={`dropdown-menu dropdown-md p-0 position-absolute ${activeDropdown === 'to' ? 'show' : ''}`} style={{ zIndex: 1050 }}>
                                <div className="input-search p-3 border-bottom">
                                  <div className="input-group">
                                    <input 
                                      type="text" 
                                      className="form-control" 
                                      placeholder="Search Location" 
                                      value={destinationSearch.query}
                                      onChange={(e) => destinationSearch.updateQuery(e.target.value)}
                                    />
                                    <span className="input-group-text px-2 border-start-0">
                                      <i className="isax isax-search-normal"></i>
                                    </span>
                                  </div>
                                </div>
                                <ul>
                                  {destinationSearch.airports.map((airport) => (
                                    <li key={airport.code} className="border-bottom">
                                      <a 
                                        className="dropdown-item" 
                                        href="#"
                                        onClick={(e) => {
                                          e.preventDefault();
                                          handleAirportSelect(airport, 'destination');
                                        }}
                                      >
                                        <h6 className="fs-16 fw-medium">{airport.city}</h6>
                                        <p>{airport.name}</p>
                                      </a>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              <span 
                                className="way-icon badge badge-primary rounded-pill translate-middle"
                                onClick={handleSwapAirports}
                                style={{ cursor: 'pointer' }}
                              >
                                <i className="fa-solid fa-arrow-right-arrow-left"></i>
                              </span>
                            </div>
                            <div className="form-item">
                              <label className="form-label fs-14 text-default mb-1">Departure</label>
                              <input 
                                type="date" 
                                className="form-control" 
                                value={searchForm.departureDate}
                                onChange={(e) => setSearchForm(prev => ({ ...prev, departureDate: e.target.value }))}
                              />
                              <p className="fs-12 mb-0">
                                {new Date(searchForm.departureDate).toLocaleDateString('en-US', { weekday: 'long' })}
                              </p>
                            </div>
                            {searchForm.tripType === 'roundtrip' && (
                              <div className="form-item">
                                <label className="form-label fs-14 text-default mb-1">Return</label>
                                <input 
                                  type="date" 
                                  className="form-control" 
                                  value={searchForm.returnDate}
                                  onChange={(e) => setSearchForm(prev => ({ ...prev, returnDate: e.target.value }))}
                                />
                                <p className="fs-12 mb-0">
                                  {new Date(searchForm.returnDate).toLocaleDateString('en-US', { weekday: 'long' })}
                                </p>
                              </div>
                            )}
                            <div className="form-item dropdown" ref={travelersDropdownRef}>
                              <div 
                                onClick={() => toggleDropdown('travelers')}
                                role="button"
                                className={`dropdown-toggle ${activeDropdown === 'travelers' ? 'show' : ''}`}
                              >
                                <label className="form-label fs-14 text-default mb-1">Travellers and cabin class</label>
                                <h5>{getTravelersText()} <span className="fw-normal fs-14">Persons</span></h5>
                                <p className="fs-12 mb-0">{getTravelersDetailText()}, {searchForm.cabinClass}</p>
                              </div>
                              <div className={`dropdown-menu dropdown-menu-end dropdown-xl position-absolute ${activeDropdown === 'travelers' ? 'show' : ''}`} style={{ zIndex: 1050, right: 0, left: 'auto' }}>
                                <h5 className="mb-3">Select Travelers & Class</h5>
                                <div className="mb-3 border br-10 info-item pb-1">
                                  <h6 className="fs-16 fw-medium mb-2">Travellers</h6>
                                  <div className="row">
                                    <div className="col-md-4">
                                      <div className="mb-3">
                                        <label className="form-label text-gray-9 mb-2">
                                          Adults <span className="text-default fw-normal">( 12+ Yrs )</span>
                                        </label>
                                        <div className="custom-increment">
                                          <div className="input-group">
                                            <span className="input-group-btn float-start">
                                              <button 
                                                type="button" 
                                                className="quantity-left-minus btn btn-light btn-number"
                                                onClick={() => updateTravelerCount('adults', 'minus')}
                                              >
                                                <span><i className="isax isax-minus"></i></span>
                                              </button>
                                            </span>
                                            <input 
                                              type="text" 
                                              className="input-number" 
                                              value={searchForm.travelers.adults.toString().padStart(2, '0')} 
                                              readOnly 
                                            />
                                            <span className="input-group-btn float-end">
                                              <button 
                                                type="button" 
                                                className="quantity-right-plus btn btn-light btn-number"
                                                onClick={() => updateTravelerCount('adults', 'plus')}
                                              >
                                                <span><i className="isax isax-add"></i></span>
                                              </button>
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="col-md-4">
                                      <div className="mb-3">
                                        <label className="form-label text-gray-9 mb-2">
                                          Children <span className="text-default fw-normal">( 2-12 Yrs )</span>
                                        </label>
                                        <div className="custom-increment">
                                          <div className="input-group">
                                            <span className="input-group-btn float-start">
                                              <button 
                                                type="button" 
                                                className="quantity-left-minus btn btn-light btn-number"
                                                onClick={() => updateTravelerCount('children', 'minus')}
                                              >
                                                <span><i className="isax isax-minus"></i></span>
                                              </button>
                                            </span>
                                            <input 
                                              type="text" 
                                              className="input-number" 
                                              value={searchForm.travelers.children.toString().padStart(2, '0')} 
                                              readOnly 
                                            />
                                            <span className="input-group-btn float-end">
                                              <button 
                                                type="button" 
                                                className="quantity-right-plus btn btn-light btn-number"
                                                onClick={() => updateTravelerCount('children', 'plus')}
                                              >
                                                <span><i className="isax isax-add"></i></span>
                                              </button>
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="col-md-4">
                                      <div className="mb-3">
                                        <label className="form-label text-gray-9 mb-2">
                                          Infants <span className="text-default fw-normal">( 0-2 Yrs )</span>
                                        </label>
                                        <div className="custom-increment">
                                          <div className="input-group">
                                            <span className="input-group-btn float-start">
                                              <button 
                                                type="button" 
                                                className="quantity-left-minus btn btn-light btn-number"
                                                onClick={() => updateTravelerCount('infants', 'minus')}
                                              >
                                                <span><i className="isax isax-minus"></i></span>
                                              </button>
                                            </span>
                                            <input 
                                              type="text" 
                                              className="input-number" 
                                              value={searchForm.travelers.infants.toString().padStart(2, '0')} 
                                              readOnly 
                                            />
                                            <span className="input-group-btn float-end">
                                              <button 
                                                type="button" 
                                                className="quantity-right-plus btn btn-light btn-number"
                                                onClick={() => updateTravelerCount('infants', 'plus')}
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
                                  <h6 className="fs-16 fw-medium mb-2">Cabin Class</h6>
                                  <div className="d-flex align-items-center flex-wrap">
                                    {['Economy', 'Premium Economy', 'Business', 'First Class'].map((classType) => (
                                      <div key={classType} className="form-check me-3 mb-3">
                                        <input 
                                          className="form-check-input" 
                                          type="radio" 
                                          name="cabin-class" 
                                          id={classType.toLowerCase().replace(' ', '-')}
                                          checked={searchForm.cabinClass === classType}
                                          onChange={() => setSearchForm(prev => ({ ...prev, cabinClass: classType }))}
                                        />
                                        <label 
                                          className="form-check-label" 
                                          htmlFor={classType.toLowerCase().replace(' ', '-')}
                                        >
                                          {classType}
                                        </label>
                                      </div>
                                    ))}
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
                          <button 
                            type="submit" 
                            className="btn btn-primary search-btn rounded"
                            disabled={flightSearch.loading}
                          >
                            {flightSearch.loading ? 'Searching...' : 'Search'}
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container" style={{paddingTop: '50px'}}>
        {/* Show DateCarousel when search has been performed or is in progress */}
        {(flightSearch.searchParams || flightSearch.loading || flightSearch.results.length > 0) && (
          <DateCarousel
            searchParams={flightSearch.searchParams}
            onDateSelect={flightSearch.searchWithNewDate}
            loading={flightSearch.loading}
          />
        )}

        <div className="container">
          <div className="row">
            <div className="col-md-4 col-12">
              <div className="card filter-sidebar flight-sidebar mb-4 mb-lg-0">
                <div className="card-header d-flex align-items-center justify-content-between">
                  <h5>Filters</h5>
                  <button 
                    onClick={handleResetFilters}
                    className="btn btn-link fs-14 link-primary p-0"
                  >
                    Reset
                  </button>
                </div>
                <div className="card-body p-0">
                  <form action="">
                    <div className="accordion accordion-list">
                      {/* Transit Options */}
                      <div className="accordion-item border-bottom p-3">
                        <div className="accordion-header">
                          <div className="accordion-button p-0" data-bs-toggle="collapse" data-bs-target="#accordion-populars" aria-expanded="true" aria-controls="accordion-populars" role="button">
                            No. of Transit
                          </div>
                        </div>
                        <div id="accordion-populars" className="accordion-collapse collapse show">
                          <div className="accordion-body">
                            <div className="more-content">
                              {[
                                { value: 0, label: 'Direct Flights' },
                                { value: 1, label: '1 Transit' },
                                { value: 2, label: '2+ Transit' }
                              ].map((option) => (
                                <div key={option.value} className="form-check d-flex align-items-center ps-0 mb-2">
                                  <input 
                                    className="form-check-input ms-0 mt-0" 
                                    name="stops" 
                                    type="radio" 
                                    id={`stops-${option.value}`}
                                    checked={activeFilters.stops === option.value}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setActiveFilters(prev => ({
                                          ...prev,
                                          stops: option.value
                                        }));
                                      }
                                    }}
                                  />
                                  <label className="form-check-label ms-2" htmlFor={`stops-${option.value}`}>
                                    {option.label}
                                  </label>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Airline Names */}
                      <div className="accordion-item border-bottom p-3">
                        <div className="accordion-header">
                          <div className="accordion-button p-0" data-bs-toggle="collapse" data-bs-target="#accordion-flight" aria-expanded="true" aria-controls="accordion-flight" role="button">
                            Airline Names
                          </div>
                        </div>
                        <div id="accordion-flight" className="accordion-collapse collapse show">
                          <div className="accordion-body">
                            <div className="more-content">
                              {flightSearch.results.length > 0 ? 
                                // Get unique airlines from current results
                                [...new Set(flightSearch.results.map(r => r.airline.code))].map((airlineCode) => {
                                  const airline = flightSearch.results.find(r => r.airline.code === airlineCode)?.airline;
                                  if (!airline) return null;
                                  
                                  return (
                                    <div key={airlineCode} className="form-check d-flex align-items-center ps-0 mb-2">
                                      <input 
                                        className="form-check-input ms-0 mt-0" 
                                        name="airlines" 
                                        type="checkbox" 
                                        id={`airline-${airlineCode}`}
                                        checked={activeFilters.airlines?.includes(airlineCode) || false}
                                        onChange={(e) => {
                                          const currentAirlines = activeFilters.airlines || [];
                                          const newAirlines = e.target.checked 
                                            ? [...currentAirlines, airlineCode]
                                            : currentAirlines.filter(a => a !== airlineCode);
                                          setActiveFilters(prev => ({
                                            ...prev,
                                            airlines: newAirlines
                                          }));
                                        }}
                                      />
                                      <label className="form-check-label ms-2" htmlFor={`airline-${airlineCode}`}>
                                        {airline.name}
                                      </label>
                                    </div>
                                  );
                                }).filter(Boolean) : 
                                <p className="text-muted">Search for flights to see available airlines</p>
                              }
                            </div>
                            <button 
                              type="button"
                              className="btn btn-link more-view fw-medium fs-14 p-0"
                              onClick={() => {
                                // Handle show more functionality
                                console.log('Show more airlines clicked');
                              }}
                            >
                              Show More
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Airport Departure */}
                      <div className="accordion-item border-bottom p-3">
                        <div className="accordion-header">
                          <div className="accordion-button p-0" data-bs-toggle="collapse" data-bs-target="#departure-airport" aria-expanded="true" aria-controls="departure-airport" role="button">
                            Airport Departure
                          </div>
                        </div>
                        <div id="departure-airport" className="accordion-collapse collapse show">
                          <div className="accordion-body">
                            <div className="more-content">
                              {flightSearch.results.length > 0 ? 
                                // Get unique departure airports from current results
                                [...new Set(flightSearch.results.map(r => r.departure.airport.code))].map((airportCode) => {
                                  const airport = flightSearch.results.find(r => r.departure.airport.code === airportCode)?.departure.airport;
                                  if (!airport) return null;
                                  
                                  return (
                                    <div key={airportCode} className="form-check d-flex align-items-center ps-0 mb-2">
                                      <input 
                                        className="form-check-input ms-0 mt-0" 
                                        name="departureAirports" 
                                        type="checkbox" 
                                        id={`departure-airport-${airportCode}`}
                                        checked={activeFilters.departureAirports?.includes(airportCode) || false}
                                        onChange={(e) => {
                                          const currentAirports = activeFilters.departureAirports || [];
                                          const newAirports = e.target.checked 
                                            ? [...currentAirports, airportCode]
                                            : currentAirports.filter(a => a !== airportCode);
                                          setActiveFilters(prev => ({
                                            ...prev,
                                            departureAirports: newAirports
                                          }));
                                        }}
                                      />
                                      <label className="form-check-label ms-2" htmlFor={`departure-airport-${airportCode}`}>
                                        {airport.name}
                                        <br />
                                        <small className="text-muted">{airport.city} ({airportCode})</small>
                                      </label>
                                    </div>
                                  );
                                }).filter(Boolean) : 
                                <p className="text-muted">Search for flights to see available departure airports</p>
                              }
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Airport Arrival */}
                      <div className="accordion-item border-bottom p-3">
                        <div className="accordion-header">
                          <div className="accordion-button p-0" data-bs-toggle="collapse" data-bs-target="#arrival-airport" aria-expanded="true" aria-controls="arrival-airport" role="button">
                            Airport Arrival
                          </div>
                        </div>
                        <div id="arrival-airport" className="accordion-collapse collapse show">
                          <div className="accordion-body">
                            <div className="more-content">
                              {flightSearch.results.length > 0 ? 
                                // Get unique arrival airports from current results
                                [...new Set(flightSearch.results.map(r => r.arrival.airport.code))].map((airportCode) => {
                                  const airport = flightSearch.results.find(r => r.arrival.airport.code === airportCode)?.arrival.airport;
                                  if (!airport) return null;
                                  
                                  return (
                                    <div key={airportCode} className="form-check d-flex align-items-center ps-0 mb-2">
                                      <input 
                                        className="form-check-input ms-0 mt-0" 
                                        name="arrivalAirports" 
                                        type="checkbox" 
                                        id={`arrival-airport-${airportCode}`}
                                        checked={activeFilters.arrivalAirports?.includes(airportCode) || false}
                                        onChange={(e) => {
                                          const currentAirports = activeFilters.arrivalAirports || [];
                                          const newAirports = e.target.checked 
                                            ? [...currentAirports, airportCode]
                                            : currentAirports.filter(a => a !== airportCode);
                                          setActiveFilters(prev => ({
                                            ...prev,
                                            arrivalAirports: newAirports
                                          }));
                                        }}
                                      />
                                      <label className="form-check-label ms-2" htmlFor={`arrival-airport-${airportCode}`}>
                                        {airport.name}
                                        <br />
                                        <small className="text-muted">{airport.city} ({airportCode})</small>
                                      </label>
                                    </div>
                                  );
                                }).filter(Boolean) : 
                                <p className="text-muted">Search for flights to see available arrival airports</p>
                              }
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Departure Time */}
                      <div className="accordion-item border-bottom p-3">
                        <div className="accordion-header">
                          <div className="accordion-button p-0" data-bs-toggle="collapse" data-bs-target="#accordion-amenity" aria-expanded="true" aria-controls="accordion-amenity" role="button">
                            Departure Time
                          </div>
                        </div>
                        <div id="accordion-amenity" className="accordion-collapse collapse show">
                          <div className="accordion-body">
                            <div className="more-content">
                              <div className="form-check d-flex row ps-0 mb-2">
                                {[
                                  { label: 'Night To Morning', time: '00:00-06:00', value: 'night-to-morning' },
                                  { label: 'Morning To Afternoon', time: '06:00-12:00', value: 'morning-to-afternoon' },
                                  { label: 'Afternoon To Evening', time: '12:00-18:00', value: 'afternoon-to-evening' },
                                  { label: 'Evening To Night', time: '18:00-24:00', value: 'evening-to-night' }
                                ].map((timeSlot, index) => (
                                  <div key={index} className="col-md-6 col-12 mb-2">
                                    <div className="client-img">
                                      <button 
                                        type="button"
                                        className={`btn p-2 text-start w-100 ${
                                          activeFilters.departureTime === timeSlot.value 
                                            ? 'btn-primary text-white' 
                                            : 'btn-outline-secondary'
                                        }`}
                                        onClick={() => {
                                          // Toggle departure time filter (single selection)
                                          const newDepartureTime = activeFilters.departureTime === timeSlot.value ? undefined : timeSlot.value;
                                          setActiveFilters(prev => ({
                                            ...prev,
                                            departureTime: newDepartureTime
                                          }));
                                        }}
                                      >
                                        {timeSlot.label} <br/> <b>{timeSlot.time}</b>
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Arrival Time */}
                      <div className="accordion-item border-bottom p-3">
                        <div className="accordion-header">
                          <div className="accordion-button p-0" data-bs-toggle="collapse" data-bs-target="#accordion-cabin" aria-expanded="true" aria-controls="accordion-cabin" role="button">
                            Arrival Time
                          </div>
                        </div>
                        <div id="accordion-cabin" className="accordion-collapse collapse show">
                          <div className="accordion-body">
                            <div className="more-content">
                              <div className="form-check d-flex row ps-0 mb-2">
                                {[
                                  { label: 'Night To Morning', time: '00:00-06:00', value: 'night-to-morning' },
                                  { label: 'Morning To Afternoon', time: '06:00-12:00', value: 'morning-to-afternoon' },
                                  { label: 'Afternoon To Evening', time: '12:00-18:00', value: 'afternoon-to-evening' },
                                  { label: 'Evening To Night', time: '18:00-24:00', value: 'evening-to-night' }
                                ].map((timeSlot, index) => (
                                  <div key={index} className="col-md-6 col-12 mb-2">
                                    <div className="client-img">
                                      <button 
                                        type="button"
                                        className={`btn p-2 text-start w-100 ${
                                          activeFilters.arrivalTime === timeSlot.value 
                                            ? 'btn-primary text-white' 
                                            : 'btn-outline-secondary'
                                        }`}
                                        onClick={() => {
                                          // Toggle arrival time filter (single selection)
                                          const newArrivalTime = activeFilters.arrivalTime === timeSlot.value ? undefined : timeSlot.value;
                                          setActiveFilters(prev => ({
                                            ...prev,
                                            arrivalTime: newArrivalTime
                                          }));
                                        }}
                                      >
                                        {timeSlot.label} <br/> <b>{timeSlot.time}</b>
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Flight Duration */}
                      <div className="accordion-item border-bottom p-3">
                        <div className="accordion-header">
                          <div className="accordion-button p-0" data-bs-toggle="collapse" data-bs-target="#accordion-duration" aria-expanded="true" aria-controls="accordion-duration" role="button">
                            Flight Duration
                          </div>
                        </div>
                        <div id="accordion-duration" className="accordion-collapse collapse show">
                          <div className="accordion-body">
                            <RangeSlider
                              min={durationRange.min}
                              max={durationRange.max}
                              value={[
                                activeFilters.durationRange?.min || durationRange.min,
                                activeFilters.durationRange?.max || durationRange.max
                              ]}
                              onChange={([min, max]) => {
                                setActiveFilters(prev => ({
                                  ...prev,
                                  durationRange: { min, max }
                                }));
                              }}
                              formatValue={(value) => {
                                const hours = Math.floor(value / 60);
                                const minutes = value % 60;
                                return `${hours}h ${minutes}m`;
                              }}
                              step={30}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Price Range */}
                      <div className="accordion-item border-bottom p-3">
                        <div className="accordion-header">
                          <div className="accordion-button p-0" data-bs-toggle="collapse" data-bs-target="#accordion-price" aria-expanded="true" aria-controls="accordion-price" role="button">
                            Price Range
                          </div>
                        </div>
                        <div id="accordion-price" className="accordion-collapse collapse show">
                          <div className="accordion-body">
                            <RangeSlider
                              min={priceRange.min}
                              max={priceRange.max}
                              value={[
                                activeFilters.priceRange?.min || priceRange.min,
                                activeFilters.priceRange?.max || priceRange.max
                              ]}
                              onChange={([min, max]) => {
                                setActiveFilters(prev => ({
                                  ...prev,
                                  priceRange: { min, max }
                                }));
                              }}
                              prefix="AED "
                              step={50}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Refund & Reschedule */}
                      <div className="accordion-item border-bottom p-3">
                        <div className="accordion-header">
                          <div className="accordion-button p-0" data-bs-toggle="collapse" data-bs-target="#accordion-refund" aria-expanded="true" aria-controls="accordion-refund" role="button">
                            Refund & Reschedule
                          </div>
                        </div>
                        <div id="accordion-refund" className="accordion-collapse collapse show">
                          <div className="accordion-body">
                            <div className="more-content">
                              <div className="form-check d-flex align-items-center ps-0 mb-2">
                                <input 
                                  className="form-check-input ms-0 mt-0" 
                                  name="refundable" 
                                  type="checkbox" 
                                  id="refundable"
                                  checked={activeFilters.refundable || false}
                                  onChange={(e) => {
                                    setActiveFilters(prev => ({
                                      ...prev,
                                      refundable: e.target.checked || undefined
                                    }));
                                  }}
                                />
                                <label className="form-check-label ms-2" htmlFor="refundable">
                                  Refundable
                                </label>
                              </div>
                              <div className="form-check d-flex align-items-center ps-0 mb-2">
                                <input 
                                  className="form-check-input ms-0 mt-0" 
                                  name="changeable" 
                                  type="checkbox" 
                                  id="changeable"
                                  checked={activeFilters.changeable || false}
                                  onChange={(e) => {
                                    setActiveFilters(prev => ({
                                      ...prev,
                                      changeable: e.target.checked || undefined
                                    }));
                                  }}
                                />
                                <label className="form-check-label ms-2" htmlFor="changeable">
                                  Reschedule Available
                                </label>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      
                    </div>
                  </form>
                </div>
              </div>
            </div>

            {/* Flight Results */}
            <div className="col-lg-8">
              <div className="card border-0 shadow-sm mb-4">
                <div className="card-header bg-white border-0">
                  <div className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">
                      {flightSearch.loading ? 'Searching...' : `${filteredResults.length} flights found`}
                    </h5>
                    <div className="d-flex gap-2">
                      <select 
                        className="form-select form-select-sm" 
                        style={{ width: 'auto' }}
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                      >
                        <option value="recommended">Sort by: Recommended</option>
                        <option value="price-low">Sort by: Price (Low to High)</option>
                        <option value="price-high">Sort by: Price (High to Low)</option>
                        <option value="duration">Sort by: Duration</option>
                        <option value="departure-time">Sort by: Departure Time</option>
                        <option value="arrival-time">Sort by: Arrival Time</option>
                        <option value="stops">Sort by: Stops</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="card-body p-0">
                  <FlightResults 
                    flights={filteredResults} 
                    loading={flightSearch.loading}
                    error={flightSearch.error}
                  />
                </div>
              </div>
            </div>
            
            <Pagination
              currentPage={flightSearch.currentPage}
              totalResults={flightSearch.totalResults}
              resultsPerPage={flightSearch.resultsPerPage}
              onPageChange={flightSearch.setPage}
              onResultsPerPageChange={flightSearch.setResultsPerPage}
              loading={flightSearch.loading}
            />
          </div>
        </div>
      </div>
    </>
  );
}

export default function FlightsListPage() {
  return (
    <Suspense fallback={
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    }>
      <FlightsListContent />
    </Suspense>
  );
}
