'use client';

import React, { useState, useRef, useEffect } from 'react';
import { FlightSearchParams } from '@/types/flight';
import { useAirportSearch, Airport } from '@/hooks/useAirportSearch';

interface FlightSearchFormProps {
  onSearch: (params: FlightSearchParams) => void;
  loading?: boolean;
  initialParams?: Partial<FlightSearchParams>;
}

const cabinClasses = [
  { value: 'ECONOMY', label: 'Economy' },
  { value: 'PREMIUM_ECONOMY', label: 'Premium Economy' },
  { value: 'BUSINESS', label: 'Business' },
  { value: 'FIRST', label: 'First Class' }
];

export const FlightSearchForm: React.FC<FlightSearchFormProps> = ({
  onSearch,
  loading = false,
  initialParams
}) => {
  const [formData, setFormData] = useState<FlightSearchParams>({
    origin: initialParams?.origin || '',
    destination: initialParams?.destination || '',
    departureDate: initialParams?.departureDate || '',
    returnDate: initialParams?.returnDate || '',
    adults: initialParams?.adults || 1,
    children: initialParams?.children || 0,
    infants: initialParams?.infants || 0,
    cabinClass: initialParams?.cabinClass || 'ECONOMY',
    isRoundTrip: initialParams?.isRoundTrip || false,
    isDirectFlight: initialParams?.isDirectFlight || false
  });

  // State for dropdown management
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [selectedOrigin, setSelectedOrigin] = useState<Airport | null>(null);
  const [selectedDestination, setSelectedDestination] = useState<Airport | null>(null);
  const [originQuery, setOriginQuery] = useState('');
  const [destinationQuery, setDestinationQuery] = useState('');

  // Refs for dropdown containers
  const fromDropdownRef = useRef<HTMLDivElement>(null);
  const toDropdownRef = useRef<HTMLDivElement>(null);
  const travelersDropdownRef = useRef<HTMLDivElement>(null);

  // Airport search hooks
  const originSearch = useAirportSearch();
  const destinationSearch = useAirportSearch();

  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      
      if (
        fromDropdownRef.current && !fromDropdownRef.current.contains(target) &&
        toDropdownRef.current && !toDropdownRef.current.contains(target) &&
        travelersDropdownRef.current && !travelersDropdownRef.current.contains(target)
      ) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Initialize selected airports from initial params
  useEffect(() => {
    if (initialParams?.origin && originSearch.airports.length > 0) {
      const airport = originSearch.airports.find(a => a.code === initialParams.origin);
      if (airport) setSelectedOrigin(airport);
    }
    if (initialParams?.destination && destinationSearch.airports.length > 0) {
      const airport = destinationSearch.airports.find(a => a.code === initialParams.destination);
      if (airport) setSelectedDestination(airport);
    }
  }, [initialParams, originSearch.airports, destinationSearch.airports]);

  const toggleDropdown = (dropdownName: string) => {
    setActiveDropdown(activeDropdown === dropdownName ? null : dropdownName);
  };

  const handleOriginSelect = (airport: Airport) => {
    setSelectedOrigin(airport);
    setFormData(prev => ({ ...prev, origin: airport.code }));
    setActiveDropdown(null);
    setOriginQuery('');
  };

  const handleDestinationSelect = (airport: Airport) => {
    setSelectedDestination(airport);
    setFormData(prev => ({ ...prev, destination: airport.code }));
    setActiveDropdown(null);
    setDestinationQuery('');
  };

  const handleSwapAirports = () => {
    const tempOrigin = selectedOrigin;
    const tempDestination = selectedDestination;
    
    setSelectedOrigin(tempDestination);
    setSelectedDestination(tempOrigin);
    setFormData(prev => ({
      ...prev,
      origin: tempDestination?.code || '',
      destination: tempOrigin?.code || ''
    }));
  };

  const handleInputChange = (field: keyof FlightSearchParams, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.origin || !formData.destination) {
      alert('Please select both origin and destination airports');
      return;
    }
    
    if (!formData.departureDate) {
      alert('Please select a departure date');
      return;
    }
    
    if (formData.isRoundTrip && !formData.returnDate) {
      alert('Please select a return date for round trip');
      return;
    }
    
    if (formData.adults + formData.children + formData.infants === 0) {
      alert('Please select at least one passenger');
      return;
    }

    onSearch(formData);
  };

  const getTotalPassengers = () => {
    return formData.adults + formData.children + formData.infants;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getDayOfWeek = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  };

  return (
    <div className="card flight-search">
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          <div className="d-flex align-items-center justify-content-between flex-wrap mb-2">
            <div className="d-flex align-items-center flex-wrap">
              <div className="form-check d-flex align-items-center me-3 mb-2">
                <input 
                  className="form-check-input mt-0" 
                  type="radio" 
                  name="tripType" 
                  id="oneway" 
                  value="oneway" 
                  checked={!formData.isRoundTrip}
                  onChange={() => handleInputChange('isRoundTrip', false)}
                />
                <label className="form-check-label fs-14 ms-2" htmlFor="oneway">One way</label>
              </div>
              <div className="form-check d-flex align-items-center me-3 mb-2">
                <input 
                  className="form-check-input mt-0" 
                  type="radio" 
                  name="tripType" 
                  id="roundtrip" 
                  value="roundtrip" 
                  checked={formData.isRoundTrip}
                  onChange={() => handleInputChange('isRoundTrip', true)}
                />
                <label className="form-check-label fs-14 ms-2" htmlFor="roundtrip">Round Trip</label>
              </div>
            </div>
            <h6 className="fw-medium fs-16 mb-2">Thousands of affordable flights available.</h6>
          </div>

          <div className="normal-trip">
            <div className="d-lg-flex">
              <div className="d-flex form-info">
                {/* Origin Dropdown */}
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
                      value={selectedOrigin?.city || 'Select Origin'} 
                      readOnly 
                    />
                    <p className="fs-12 mb-0">
                      {selectedOrigin?.name || 'Choose departure airport'}
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
                              onClick={() => handleOriginSelect(airport)}
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

                {/* Destination Dropdown */}
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
                      value={selectedDestination?.city || 'Select Destination'} 
                      readOnly 
                    />
                    <p className="fs-12 mb-0">
                      {selectedDestination?.name || 'Choose arrival airport'}
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
                              onClick={() => handleDestinationSelect(airport)}
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

                {/* Departure Date */}
                <div className="form-item">
                  <label className="form-label fs-14 text-default mb-1">Departure</label>
                  <input 
                    type="date" 
                    className="form-control" 
                    value={formData.departureDate}
                    onChange={(e) => handleInputChange('departureDate', e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                  <p className="fs-12 mb-0">
                    {formData.departureDate ? getDayOfWeek(formData.departureDate) : 'Select date'}
                  </p>
                </div>

                {/* Return Date */}
                {formData.isRoundTrip && (
                  <div className="form-item">
                    <label className="form-label fs-14 text-default mb-1">Return</label>
                    <input 
                      type="date" 
                      className="form-control" 
                      value={formData.returnDate || ''}
                      onChange={(e) => handleInputChange('returnDate', e.target.value)}
                      min={formData.departureDate || new Date().toISOString().split('T')[0]}
                      required={formData.isRoundTrip}
                    />
                    <p className="fs-12 mb-0">
                      {formData.returnDate ? getDayOfWeek(formData.returnDate) : 'Select date'}
                    </p>
                  </div>
                )}

                {/* Travelers Dropdown */}
                <div className="form-item dropdown ps-2 ps-sm-3" ref={travelersDropdownRef}>
                  <div 
                    onClick={() => toggleDropdown('travelers')}
                    role="button"
                    className={`dropdown-toggle ${activeDropdown === 'travelers' ? 'show' : ''}`}
                  >
                    <label className="form-label fs-14 text-default mb-1">Travelers</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={`${getTotalPassengers()} Passenger${getTotalPassengers() > 1 ? 's' : ''}`}
                      readOnly 
                    />
                    <p className="fs-12 mb-0">{formData.cabinClass}</p>
                  </div>
                  <div className={`dropdown-menu dropdown-md p-0 position-absolute ${activeDropdown === 'travelers' ? 'show' : ''}`} style={{ zIndex: 1050 }}>
                    <div className="p-3">
                      {/* Adults */}
                      <div className="d-flex align-items-center justify-content-between mb-3">
                        <div>
                          <h6 className="fs-16 fw-medium mb-1">Adults</h6>
                          <p className="fs-12 text-muted mb-0">12+ years</p>
                        </div>
                        <div className="d-flex align-items-center">
                          <button 
                            type="button" 
                            className="btn btn-outline-secondary btn-sm"
                            onClick={() => handleInputChange('adults', Math.max(1, formData.adults - 1))}
                          >
                            -
                          </button>
                          <span className="mx-3 fw-medium">{formData.adults}</span>
                          <button 
                            type="button" 
                            className="btn btn-outline-secondary btn-sm"
                            onClick={() => handleInputChange('adults', formData.adults + 1)}
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Children */}
                      <div className="d-flex align-items-center justify-content-between mb-3">
                        <div>
                          <h6 className="fs-16 fw-medium mb-1">Children</h6>
                          <p className="fs-12 text-muted mb-0">2-11 years</p>
                        </div>
                        <div className="d-flex align-items-center">
                          <button 
                            type="button" 
                            className="btn btn-outline-secondary btn-sm"
                            onClick={() => handleInputChange('children', Math.max(0, formData.children - 1))}
                          >
                            -
                          </button>
                          <span className="mx-3 fw-medium">{formData.children}</span>
                          <button 
                            type="button" 
                            className="btn btn-outline-secondary btn-sm"
                            onClick={() => handleInputChange('children', formData.children + 1)}
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Infants */}
                      <div className="d-flex align-items-center justify-content-between mb-3">
                        <div>
                          <h6 className="fs-16 fw-medium mb-1">Infants</h6>
                          <p className="fs-12 text-muted mb-0">Under 2 years</p>
                        </div>
                        <div className="d-flex align-items-center">
                          <button 
                            type="button" 
                            className="btn btn-outline-secondary btn-sm"
                            onClick={() => handleInputChange('infants', Math.max(0, formData.infants - 1))}
                          >
                            -
                          </button>
                          <span className="mx-3 fw-medium">{formData.infants}</span>
                          <button 
                            type="button" 
                            className="btn btn-outline-secondary btn-sm"
                            onClick={() => handleInputChange('infants', formData.infants + 1)}
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Cabin Class */}
                      <div className="mb-3">
                        <label className="form-label fs-14 fw-medium mb-2">Cabin Class</label>
                        <select 
                          className="form-select"
                          value={formData.cabinClass}
                          onChange={(e) => handleInputChange('cabinClass', e.target.value)}
                        >
                          {cabinClasses.map(cls => (
                            <option key={cls.value} value={cls.value}>
                              {cls.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Direct Flight Option */}
                      <div className="form-check mb-3">
                        <input 
                          className="form-check-input" 
                          type="checkbox" 
                          id="directFlight"
                          checked={formData.isDirectFlight}
                          onChange={(e) => handleInputChange('isDirectFlight', e.target.checked)}
                        />
                        <label className="form-check-label fs-14" htmlFor="directFlight">
                          Direct flights only
                        </label>
                      </div>

                      {/* Apply Button */}
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
              </div>
              
              {/* Search Button */}
              <button 
                type="submit" 
                className="btn btn-primary search-btn rounded"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Searching...
                  </>
                ) : (
                  'Search'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}; 