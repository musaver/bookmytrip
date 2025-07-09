'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAirportSearch } from '@/hooks/useAirportSearch';
import OffersSection from '@/components/OffersSection';
import BenefitsSection from '@/components/BenefitsSection';
import DestinationsSection from '@/components/DestinationsSection';
import PartnersSection from '@/components/PartnersSection';
import PopularCitiesSection from '@/components/PopularCitiesSection';
import FeaturedHotelsSection from '@/components/FeaturedHotelsSection';
import Link from 'next/link';

export default function Home() {
  const router = useRouter();
  
  // State to manage active dropdowns
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // Updated form state structure to match flights list
  const [searchForm, setSearchForm] = useState({
    origin: { code: '', name: '', airport: '' },
    destination: { code: '', name: '', airport: '' },
    departureDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
    returnDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 14 days from now
    tripType: 'oneway',
    travelers: { adults: 1, children: 0, infants: 0 },
    cabinClass: 'Economy'
  });

  // Airport search hooks
  const originSearch = useAirportSearch();
  const destinationSearch = useAirportSearch();
  const [originQuery, setOriginQuery] = useState('');
  const [destinationQuery, setDestinationQuery] = useState('');

  // Refs for dropdown containers
  const fromDropdownRef = useRef<HTMLDivElement>(null);
  const toDropdownRef = useRef<HTMLDivElement>(null);
  const travelersDropdownRef = useRef<HTMLDivElement>(null);
  const originInputRef = useRef<HTMLInputElement>(null);
  const destinationInputRef = useRef<HTMLInputElement>(null);

  // Function to toggle dropdown
  const toggleDropdown = (dropdownName: string) => {
    setActiveDropdown(activeDropdown === dropdownName ? null : dropdownName);
    
    // Auto-focus on respective search inputs when dropdowns are opened
    if (dropdownName === 'from' && activeDropdown !== 'from') {
      setTimeout(() => {
        originInputRef.current?.focus();
      }, 100);
    } else if (dropdownName === 'to' && activeDropdown !== 'to') {
      setTimeout(() => {
        destinationInputRef.current?.focus();
      }, 100);
    }
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
    if (type === 'origin') {
      setOriginQuery('');
    } else {
      setDestinationQuery('');
    }
  };

  // Function to swap airports
  const handleSwapAirports = () => {
    setSearchForm(prev => ({
      ...prev,
      origin: prev.destination,
      destination: prev.origin
    }));
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

  // Handle search form submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!searchForm.origin.code || !searchForm.destination.code) {
      alert('Please select both origin and destination airports');
      return;
    }
    
    if (!searchForm.departureDate) {
      alert('Please select a departure date');
      return;
    }
    
    if (searchForm.tripType === 'roundtrip' && !searchForm.returnDate) {
      alert('Please select a return date for round trip');
      return;
    }
    
    if (searchForm.travelers.adults + searchForm.travelers.children + searchForm.travelers.infants === 0) {
      alert('Please select at least one passenger');
      return;
    }

    // Create URL parameters for navigation
    const searchParams = new URLSearchParams({
      origin: searchForm.origin.code,
      destination: searchForm.destination.code,
      departureDate: searchForm.departureDate,
      adults: searchForm.travelers.adults.toString(),
      children: searchForm.travelers.children.toString(),
      infants: searchForm.travelers.infants.toString(),
      cabinClass: searchForm.cabinClass.toUpperCase().replace(' ', '_'),
      tripType: searchForm.tripType
    });

    // Add airport names if available
    if (searchForm.origin.name) {
      searchParams.append('originName', searchForm.origin.name);
    }
    if (searchForm.origin.airport) {
      searchParams.append('originAirport', searchForm.origin.airport);
    }
    if (searchForm.destination.name) {
      searchParams.append('destinationName', searchForm.destination.name);
    }
    if (searchForm.destination.airport) {
      searchParams.append('destinationAirport', searchForm.destination.airport);
    }

    if (searchForm.tripType === 'roundtrip' && searchForm.returnDate) {
      searchParams.append('returnDate', searchForm.returnDate);
    }

    // Navigate to flights list page with search parameters
    router.push(`/flights-list?${searchParams.toString()}`);
  };

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
      }}
    >
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
                      <Link href="/" className="nav-link active">
                        <i className="isax isax-airplane5 me-2"></i>Flights
                      </Link>
                    </li>
                    <li>
                      <Link href="/hotels-landing" className="nav-link">
                        <i className="isax isax-buildings5 me-2"></i>Hotels
                      </Link>
                    </li>
                  </ul>
                </div>
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
                        <div className="form-check d-flex align-items-center me-3 mb-2 d-none">
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
                                    placeholder="Search airports or cities" 
                                    value={originQuery}
                                    onChange={(e) => {
                                      setOriginQuery(e.target.value);
                                      originSearch.updateQuery(e.target.value);
                                    }}
                                    ref={originInputRef}
                                  />
                                  <span className="input-group-text px-2 border-start-0">
                                    <i className="isax isax-search-normal"></i>
                                  </span>
                                </div>
                              </div>
                              <ul style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                {originSearch.loading ? (
                                  <li className="p-3 text-center">
                                    <div className="spinner-border spinner-border-sm" role="status">
                                      <span className="visually-hidden">Loading...</span>
                                    </div>
                                  </li>
                                ) : originSearch.airports.length > 0 ? (
                                  originSearch.airports.map((airport) => (
                                    <li key={airport.code} className="border-bottom">
                                      <a 
                                        className="dropdown-item" 
                                        href="javascript:void(0);"
                                        onClick={() => handleAirportSelect(airport, 'origin')}
                                      >
                                        <h6 className="fs-16 fw-medium">{airport.city}</h6>
                                        <p className="mb-0">{airport.name} ({airport.code})</p>
                                      </a>
                                    </li>
                                  ))
                                ) : (
                                  <li className="p-3 text-center text-muted">
                                    No airports found
                                  </li>
                                )}
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
                                    placeholder="Search airports or cities" 
                                    value={destinationQuery}
                                    onChange={(e) => {
                                      setDestinationQuery(e.target.value);
                                      destinationSearch.updateQuery(e.target.value);
                                    }}
                                    ref={destinationInputRef}
                                  />
                                  <span className="input-group-text px-2 border-start-0">
                                    <i className="isax isax-search-normal"></i>
                                  </span>
                                </div>
                              </div>
                              <ul style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                {destinationSearch.loading ? (
                                  <li className="p-3 text-center">
                                    <div className="spinner-border spinner-border-sm" role="status">
                                      <span className="visually-hidden">Loading...</span>
                                    </div>
                                  </li>
                                ) : destinationSearch.airports.length > 0 ? (
                                  destinationSearch.airports.map((airport) => (
                                    <li key={airport.code} className="border-bottom">
                                      <a 
                                        className="dropdown-item" 
                                        href="javascript:void(0);"
                                        onClick={() => handleAirportSelect(airport, 'destination')}
                                      >
                                        <h6 className="fs-16 fw-medium">{airport.city}</h6>
                                        <p className="mb-0">{airport.name} ({airport.code})</p>
                                      </a>
                                    </li>
                                  ))
                                ) : (
                                  <li className="p-3 text-center text-muted">
                                    No airports found
                                  </li>
                                )}
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
                              min={new Date().toISOString().split('T')[0]}
                              required
                            />
                            <p className="fs-12 mb-0">
                              {searchForm.departureDate ? new Date(searchForm.departureDate).toLocaleDateString('en-US', { weekday: 'long' }) : 'Select date'}
                            </p>
                          </div>
                          {searchForm.tripType === 'roundtrip' && (
                            <div className="form-item">
                              <label className="form-label fs-14 text-default mb-1">Return</label>
                              <input 
                                type="date" 
                                className="form-control" 
                                value={searchForm.returnDate || ''}
                                onChange={(e) => setSearchForm(prev => ({ ...prev, returnDate: e.target.value }))}
                                min={searchForm.departureDate || new Date().toISOString().split('T')[0]}
                                required={searchForm.tripType === 'roundtrip'}
                              />
                              <p className="fs-12 mb-0">
                                {searchForm.returnDate ? new Date(searchForm.returnDate).toLocaleDateString('en-US', { weekday: 'long' }) : 'Select date'}
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
                        <button type="submit" className="btn btn-primary search-btn rounded">Search</button>
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

      <OffersSection />
      <BenefitsSection />
      <DestinationsSection />
      <PartnersSection />
      <FeaturedHotelsSection />
      <PopularCitiesSection />
      
    </>
  );
}
