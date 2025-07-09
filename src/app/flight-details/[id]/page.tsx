'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import ProfessionalSeatMap from '@/components/flights/ProfessionalSeatMap';
import Breadcrumbs from '@/components/Breadcrumbs';

interface FlightDetails {
  id: string;
  bookingReference: string;
  airline: {
    code: string;
    name: string;
    logo: string;
  };
  flightNumber: string;
  aircraft: string;
  segments: Array<{
    id: string;
    departure: {
      airport: {
        code: string;
        name: string;
        city: string;
        country: string;
        terminal: string;
      };
      time: string;
      localTime: string;
    };
    arrival: {
      airport: {
        code: string;
        name: string;
        city: string;
        country: string;
        terminal: string;
      };
      time: string;
      localTime: string;
    };
    duration: number;
    aircraft: string;
    cabinClasses: string[];
  }>;
  totalDuration: number;
  stops: number;
  pricing: {
    economy: {
      adult: number;
      child: number;
      infant: number;
      currency: string;
    };
    business: {
      adult: number;
      child: number;
      infant: number;
      currency: string;
    };
    first: {
      adult: number;
      child: number;
      infant: number;
      currency: string;
    };
  };
  baggage: {
    [key: string]: {
      carryOn: { weight: string; dimensions: string };
      checked: { weight: string; pieces: number };
    };
  };
  amenities: {
    [key: string]: string[];
  };
  policies: {
    cancellation: { [key: string]: string };
    changes: { [key: string]: string };
    refund: { [key: string]: string };
  };
  seatMap: {
    [key: string]: {
      rows: number;
      seatsPerRow: number;
      configuration: string;
      availableSeats: number;
    };
  };
  additionalServices: Array<{
    id: string;
    name: string;
    price: number;
    currency: string;
  }>;
}

interface PassengerDetails {
  type: 'adult' | 'child' | 'infant';
  title: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  passportNumber: string;
  passportExpiry: string;
  nationality: string;
}

interface BookingForm {
  cabinClass: 'economy' | 'business' | 'first';
  passengers: PassengerDetails[];
  contactDetails: {
    email: string;
    phone: string;
    emergencyContact: {
      name: string;
      phone: string;
    };
  };
  additionalServices: string[];
  specialRequests: string;
  selectedSeats: any[];
}

export default function FlightDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  
  const [flight, setFlight] = useState<FlightDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [bookingSection, setBookingSection] = useState(1); // 1: class selection, 2: passenger details, 3: seat selection, 4: services/confirmation
  const [showSeatSelection, setShowSeatSelection] = useState(false);
  
  // Initialize passenger counts from URL parameters
  const adults = parseInt(searchParams.get('adults') || '1');
  const children = parseInt(searchParams.get('children') || '0');
  const infants = parseInt(searchParams.get('infants') || '0');
  
  const [bookingForm, setBookingForm] = useState<BookingForm>({
    cabinClass: 'economy',
    passengers: [
      ...Array(adults).fill(null).map((_, index) => ({
        type: 'adult' as const,
        title: 'Mr',
        firstName: index === 0 ? (session?.user?.name?.split(' ')[0] || '') : '',
        lastName: index === 0 ? (session?.user?.name?.split(' ')[1] || '') : '',
        dateOfBirth: '',
        gender: 'male',
        passportNumber: '',
        passportExpiry: '',
        nationality: 'UAE'
      })),
      ...Array(children).fill(null).map(() => ({
        type: 'child' as const,
        title: 'Master',
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        gender: 'male',
        passportNumber: '',
        passportExpiry: '',
        nationality: 'UAE'
      })),
      ...Array(infants).fill(null).map(() => ({
        type: 'infant' as const,
        title: 'Master',
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        gender: 'male',
        passportNumber: '',
        passportExpiry: '',
        nationality: 'UAE'
      }))
    ],
    contactDetails: {
      email: session?.user?.email || '',
      phone: '',
      emergencyContact: {
        name: '',
        phone: ''
      }
    },
    additionalServices: [],
    specialRequests: '',
    selectedSeats: []
  });

  // Fetch flight details
  useEffect(() => {
    const fetchFlightDetails = async () => {
      try {
        const response = await fetch(`/api/flights/${params.id}`);
        const data = await response.json();
        
        if (data.success) {
          setFlight(data.flight);
        } else {
          setError(data.error || 'Failed to fetch flight details');
        }
      } catch (err) {
        setError('Failed to fetch flight details');
        console.error('Error fetching flight details:', err);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchFlightDetails();
    }
  }, [params.id]);

  // Calculate total price
  const calculateTotalPrice = () => {
    if (!flight) return 0;
    
    const pricing = flight.pricing[bookingForm.cabinClass];
    
    // Calculate price based on actual passengers in the booking form
    const passengerCounts = bookingForm.passengers.reduce((counts, passenger) => {
      counts[passenger.type]++;
      return counts;
    }, { adult: 0, child: 0, infant: 0 });
    
    const adultPrice = pricing.adult * passengerCounts.adult;
    const childPrice = pricing.child * passengerCounts.child;
    const infantPrice = pricing.infant * passengerCounts.infant;
    
    const servicesPrice = bookingForm.additionalServices.reduce((total, serviceId) => {
      const service = flight.additionalServices.find(s => s.id === serviceId);
      return total + (service ? service.price : 0);
    }, 0);
    
    // Add seat selection cost
    const seatPrice = bookingForm.selectedSeats.reduce((total, seat) => total + (seat.amount || 0), 0);
    
    return adultPrice + childPrice + infantPrice + servicesPrice + seatPrice;
  };

  // Handle seat selection
  const handleSeatSelection = (seatSelections: any[]) => {
    setBookingForm(prev => ({ ...prev, selectedSeats: seatSelections }));
    setShowSeatSelection(false);
    setBookingSection(3);
  };

  const handleCloseSeatSelection = () => {
    setShowSeatSelection(false);
    setBookingSection(3);
  };

  // Add passenger function
  const addPassenger = (type: 'adult' | 'child' | 'infant') => {
    const newPassenger: PassengerDetails = {
      type,
      title: type === 'infant' || type === 'child' ? 'Master' : 'Mr',
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      gender: 'male',
      passportNumber: '',
      passportExpiry: '',
      nationality: 'UAE'
    };

    setBookingForm(prev => ({
      ...prev,
      passengers: [...prev.passengers, newPassenger]
    }));
  };

  // Remove passenger function
  const removePassenger = (index: number) => {
    if (index === 0) return; // Can't remove the primary passenger
    
    setBookingForm(prev => ({
      ...prev,
      passengers: prev.passengers.filter((_, i) => i !== index),
      selectedSeats: prev.selectedSeats.filter(seat => seat.passengerId !== `passenger-${index}`)
    }));
  };

  // Format duration
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  // Handle booking submission
  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session) {
      router.push('/login?redirect=' + encodeURIComponent(window.location.pathname));
      return;
    }

    const bookingData = {
      flightId: flight?.id,
      airline: flight?.airline.name,
      flightNumber: flight?.flightNumber,
      origin: flight?.segments[0].departure.airport.code,
      destination: flight?.segments[flight.segments.length - 1].arrival.airport.code,
      departureDate: flight?.segments[0].departure.time,
      arrivalDate: flight?.segments[flight.segments.length - 1].arrival.time,
      cabinClass: bookingForm.cabinClass,
      passengers: bookingForm.passengers,
      contactDetails: bookingForm.contactDetails,
      totalPrice: calculateTotalPrice(),
      currency: flight?.pricing[bookingForm.cabinClass].currency,
      additionalServices: bookingForm.additionalServices,
      specialRequests: bookingForm.specialRequests
    };

    try {
      const response = await fetch('/api/bookings/flights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      });

      const result = await response.json();
      
      if (result.success) {
        router.push(`/booking-confirmation/flight/${result.bookingId}`);
      } else {
        alert('Booking failed: ' + result.error);
      }
    } catch (error) {
      console.error('Booking error:', error);
      alert('Booking failed. Please try again.');
    }
  };

  if (loading) {
    return (
      <>
      <Breadcrumbs/>
      <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
      </>
    );
  }

  if (error || !flight) {
    return (
      <>
      <Breadcrumbs/>
      <div className="container mt-5">
        <div className="alert alert-danger" role="alert">
          {error || 'Flight not found'}
        </div>
      </div>
      </>
    );
  }

  return (
    <>
      <Breadcrumbs/>
      <div className="container mt-4">
      <div className="row">
        {/* Main Content */}
        <div className="col-lg-8">
          {/* Flight Header */}
          <div className="card mb-4">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="d-flex align-items-center">
                  <Image
                    src={flight.airline.logo}
                    alt={flight.airline.name}
                    width={40}
                    height={40}
                    className="me-3"
                  />
                  <div>
                    <h5 className="mb-0">{flight.airline.name}</h5>
                    <small className="text-muted">{flight.flightNumber} • {flight.aircraft}</small>
                  </div>
                </div>
                <div className="text-end">
                  <span className="badge bg-primary">{flight.stops === 0 ? 'Direct' : `${flight.stops} Stop${flight.stops > 1 ? 's' : ''}`}</span>
                </div>
              </div>

              {/* Flight Route */}
              {flight.segments.map((segment, index) => (
                <div key={segment.id} className="mb-3">
                  <div className="row align-items-center">
                    <div className="col-md-4">
                      <div className="text-center">
                        <h4 className="mb-0">{segment.departure.localTime}</h4>
                        <h6 className="text-primary mb-0">{segment.departure.airport.code}</h6>
                        <small className="text-muted">{segment.departure.airport.city}</small>
                        <div className="text-muted">
                          <small>Terminal {segment.departure.airport.terminal}</small>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="text-center">
                        <div className="d-flex align-items-center justify-content-center mb-2">
                          <div className="border-top flex-grow-1"></div>
                          <i className="fas fa-plane mx-2 text-primary"></i>
                          <div className="border-top flex-grow-1"></div>
                        </div>
                        <small className="text-muted">{formatDuration(segment.duration)}</small>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="text-center">
                        <h4 className="mb-0">{segment.arrival.localTime}</h4>
                        <h6 className="text-primary mb-0">{segment.arrival.airport.code}</h6>
                        <small className="text-muted">{segment.arrival.airport.city}</small>
                        <div className="text-muted">
                          <small>Terminal {segment.arrival.airport.terminal}</small>
                        </div>
                      </div>
                    </div>
                  </div>
                  {index < flight.segments.length - 1 && (
                    <div className="text-center mt-3">
                      <span className="badge bg-warning">Layover</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Tabs */}
          <ul className="nav nav-tabs mb-4">
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveTab('overview')}
              >
                Overview
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'baggage' ? 'active' : ''}`}
                onClick={() => setActiveTab('baggage')}
              >
                Baggage
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'amenities' ? 'active' : ''}`}
                onClick={() => setActiveTab('amenities')}
              >
                Amenities
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'policies' ? 'active' : ''}`}
                onClick={() => setActiveTab('policies')}
              >
                Policies
              </button>
            </li>
          </ul>

          {/* Tab Content */}
          <div className="tab-content">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">Flight Information</h5>
                  <div className="row">
                    <div className="col-md-6">
                      <p><strong>Total Duration:</strong> {formatDuration(flight.totalDuration)}</p>
                      <p><strong>Aircraft:</strong> {flight.aircraft}</p>
                      <p><strong>Booking Reference:</strong> {flight.bookingReference}</p>
                    </div>
                    <div className="col-md-6">
                      <p><strong>Stops:</strong> {flight.stops === 0 ? 'Direct Flight' : `${flight.stops} Stop${flight.stops > 1 ? 's' : ''}`}</p>
                      <p><strong>Available Classes:</strong> {flight.segments[0].cabinClasses.join(', ')}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Baggage Tab */}
            {activeTab === 'baggage' && (
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">Baggage Allowance</h5>
                  <div className="row">
                    {Object.entries(flight.baggage).map(([cabinClass, baggage]) => (
                      <div key={cabinClass} className="col-md-4 mb-3">
                        <div className="card">
                          <div className="card-body">
                            <h6 className="card-title text-capitalize">{cabinClass}</h6>
                            <p className="mb-2">
                              <strong>Carry-on:</strong><br />
                              {baggage.carryOn.weight} • {baggage.carryOn.dimensions}
                            </p>
                            <p className="mb-0">
                              <strong>Checked:</strong><br />
                              {baggage.checked.pieces} piece{baggage.checked.pieces > 1 ? 's' : ''} • {baggage.checked.weight}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Amenities Tab */}
            {activeTab === 'amenities' && (
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">In-Flight Amenities</h5>
                  <div className="row">
                    {Object.entries(flight.amenities).map(([cabinClass, amenities]) => (
                      <div key={cabinClass} className="col-md-4 mb-3">
                        <div className="card">
                          <div className="card-body">
                            <h6 className="card-title text-capitalize">{cabinClass}</h6>
                            <ul className="list-unstyled mb-0">
                              {amenities.map((amenity, index) => (
                                <li key={index} className="mb-1">
                                  <i className="fas fa-check text-success me-2"></i>
                                  {amenity}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Policies Tab */}
            {activeTab === 'policies' && (
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">Booking Policies</h5>
                  <div className="row">
                    <div className="col-md-4">
                      <h6>Cancellation Policy</h6>
                      {Object.entries(flight.policies.cancellation).map(([cabinClass, policy]) => (
                        <p key={cabinClass} className="mb-2">
                          <strong className="text-capitalize">{cabinClass}:</strong> {policy}
                        </p>
                      ))}
                    </div>
                    <div className="col-md-4">
                      <h6>Change Policy</h6>
                      {Object.entries(flight.policies.changes).map(([cabinClass, policy]) => (
                        <p key={cabinClass} className="mb-2">
                          <strong className="text-capitalize">{cabinClass}:</strong> {policy}
                        </p>
                      ))}
                    </div>
                    <div className="col-md-4">
                      <h6>Refund Policy</h6>
                      {Object.entries(flight.policies.refund).map(([cabinClass, policy]) => (
                        <p key={cabinClass} className="mb-2">
                          <strong className="text-capitalize">{cabinClass}:</strong> {policy}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Booking Form */}
          {bookingSection > 1 && (
            <div className="card mt-4">
              <div className="card-body">
                <h5 className="card-title">Booking Details</h5>
                <form id="booking-form" onSubmit={handleBookingSubmit}>
                  {/* Passenger Details Section */}
                  {bookingSection === 2 && (
                    <div>
                      <h6>Passenger Information</h6>
                      {bookingForm.passengers.map((passenger, index) => (
                        <div key={index} className="border rounded p-3 mb-3">
                          <h6 className="text-capitalize">
                            {passenger.type} {index + 1}
                            {passenger.type === 'adult' && index === 0 && ' (Primary Contact)'}
                          </h6>
                          <div className="row">
                            <div className="col-md-2">
                              <label className="form-label">Title</label>
                              <select
                                className="form-select"
                                value={passenger.title}
                                onChange={(e) => {
                                  const newPassengers = [...bookingForm.passengers];
                                  newPassengers[index].title = e.target.value;
                                  setBookingForm(prev => ({ ...prev, passengers: newPassengers }));
                                }}
                                required
                              >
                                <option value="Mr">Mr</option>
                                <option value="Mrs">Mrs</option>
                                <option value="Ms">Ms</option>
                                <option value="Master">Master</option>
                                <option value="Miss">Miss</option>
                              </select>
                            </div>
                            <div className="col-md-5">
                              <label className="form-label">First Name</label>
                              <input
                                type="text"
                                className="form-control"
                                value={passenger.firstName}
                                onChange={(e) => {
                                  const newPassengers = [...bookingForm.passengers];
                                  newPassengers[index].firstName = e.target.value;
                                  setBookingForm(prev => ({ ...prev, passengers: newPassengers }));
                                }}
                                required
                              />
                            </div>
                            <div className="col-md-5">
                              <label className="form-label">Last Name</label>
                              <input
                                type="text"
                                className="form-control"
                                value={passenger.lastName}
                                onChange={(e) => {
                                  const newPassengers = [...bookingForm.passengers];
                                  newPassengers[index].lastName = e.target.value;
                                  setBookingForm(prev => ({ ...prev, passengers: newPassengers }));
                                }}
                                required
                              />
                            </div>
                          </div>
                          <div className="row mt-3">
                            <div className="col-md-4">
                              <label className="form-label">Date of Birth</label>
                              <input
                                type="date"
                                className="form-control"
                                value={passenger.dateOfBirth}
                                onChange={(e) => {
                                  const newPassengers = [...bookingForm.passengers];
                                  newPassengers[index].dateOfBirth = e.target.value;
                                  setBookingForm(prev => ({ ...prev, passengers: newPassengers }));
                                }}
                                required
                              />
                            </div>
                            <div className="col-md-4">
                              <label className="form-label">Gender</label>
                              <select
                                className="form-select"
                                value={passenger.gender}
                                onChange={(e) => {
                                  const newPassengers = [...bookingForm.passengers];
                                  newPassengers[index].gender = e.target.value;
                                  setBookingForm(prev => ({ ...prev, passengers: newPassengers }));
                                }}
                                required
                              >
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                              </select>
                            </div>
                            <div className="col-md-4">
                              <label className="form-label">Nationality</label>
                              <select
                                className="form-select"
                                value={passenger.nationality}
                                onChange={(e) => {
                                  const newPassengers = [...bookingForm.passengers];
                                  newPassengers[index].nationality = e.target.value;
                                  setBookingForm(prev => ({ ...prev, passengers: newPassengers }));
                                }}
                                required
                              >
                                <option value="UAE">UAE</option>
                                <option value="USA">USA</option>
                                <option value="UK">UK</option>
                                <option value="India">India</option>
                                <option value="Pakistan">Pakistan</option>
                                <option value="Bangladesh">Bangladesh</option>
                                <option value="Philippines">Philippines</option>
                                <option value="Egypt">Egypt</option>
                              </select>
                            </div>
                          </div>
                          <div className="row mt-3">
                            <div className="col-md-6">
                              <label className="form-label">Passport Number</label>
                              <input
                                type="text"
                                className="form-control"
                                value={passenger.passportNumber}
                                onChange={(e) => {
                                  const newPassengers = [...bookingForm.passengers];
                                  newPassengers[index].passportNumber = e.target.value;
                                  setBookingForm(prev => ({ ...prev, passengers: newPassengers }));
                                }}
                                required
                              />
                            </div>
                            <div className="col-md-6">
                              <label className="form-label">Passport Expiry</label>
                              <input
                                type="date"
                                className="form-control"
                                value={passenger.passportExpiry}
                                onChange={(e) => {
                                  const newPassengers = [...bookingForm.passengers];
                                  newPassengers[index].passportExpiry = e.target.value;
                                  setBookingForm(prev => ({ ...prev, passengers: newPassengers }));
                                }}
                                required
                              />
                            </div>
                          </div>
                          {/* Remove Passenger Button (only for additional passengers) */}
                          {bookingForm.passengers.length > 1 && index > 0 && (
                            <div className="text-end mt-2">
                              <button
                                type="button"
                                className="btn btn-outline-danger btn-sm"
                                onClick={() => removePassenger(index)}
                              >
                                <i className="fas fa-trash me-1"></i>
                                Remove Passenger
                              </button>
                            </div>
                          )}
                        </div>
                      ))}

                      {/* Add Passenger Section */}
                      <div className="border rounded p-3 mb-3 bg-light">
                        <h6 className="mb-3">
                          <i className="fas fa-plus-circle me-2"></i>
                          Add More Passengers
                        </h6>
                        <div className="row">
                          <div className="col-md-4">
                            <button
                              type="button"
                              className="btn btn-outline-primary w-100"
                              onClick={() => addPassenger('adult')}
                            >
                              <i className="fas fa-user me-2"></i>
                              Add Adult
                            </button>
                          </div>
                          <div className="col-md-4">
                            <button
                              type="button"
                              className="btn btn-outline-success w-100"
                              onClick={() => addPassenger('child')}
                            >
                              <i className="fas fa-child me-2"></i>
                              Add Child (2-11 years)
                            </button>
                          </div>
                          <div className="col-md-4">
                            <button
                              type="button"
                              className="btn btn-outline-info w-100"
                              onClick={() => addPassenger('infant')}
                            >
                              <i className="fas fa-baby me-2"></i>
                              Add Infant (0-2 years)
                            </button>
                          </div>
                        </div>
                        <div className="mt-3">
                          <small className="text-muted">
                            <i className="fas fa-info-circle me-1"></i>
                            Current passengers: {bookingForm.passengers.filter(p => p.type === 'adult').length} Adult(s), {' '}
                            {bookingForm.passengers.filter(p => p.type === 'child').length} Child(ren), {' '}
                            {bookingForm.passengers.filter(p => p.type === 'infant').length} Infant(s)
                          </small>
                        </div>
                      </div>

                      {/* Contact Details */}
                      <div className="border rounded p-3 mb-3">
                        <h6>Contact Information</h6>
                        <div className="row">
                          <div className="col-md-6">
                            <label className="form-label">Email</label>
                            <input
                              type="email"
                              className="form-control"
                              value={bookingForm.contactDetails.email}
                              onChange={(e) => setBookingForm(prev => ({ 
                                ...prev, 
                                contactDetails: { ...prev.contactDetails, email: e.target.value }
                              }))}
                              required
                            />
                          </div>
                          <div className="col-md-6">
                            <label className="form-label">Phone</label>
                            <input
                              type="tel"
                              className="form-control"
                              value={bookingForm.contactDetails.phone}
                              onChange={(e) => setBookingForm(prev => ({ 
                                ...prev, 
                                contactDetails: { ...prev.contactDetails, phone: e.target.value }
                              }))}
                              required
                            />
                          </div>
                        </div>
                        <div className="row mt-3">
                          <div className="col-md-6">
                            <label className="form-label">Emergency Contact Name</label>
                            <input
                              type="text"
                              className="form-control"
                              value={bookingForm.contactDetails.emergencyContact.name}
                              onChange={(e) => setBookingForm(prev => ({ 
                                ...prev, 
                                contactDetails: { 
                                  ...prev.contactDetails, 
                                  emergencyContact: { ...prev.contactDetails.emergencyContact, name: e.target.value }
                                }
                              }))}
                              required
                            />
                          </div>
                          <div className="col-md-6">
                            <label className="form-label">Emergency Contact Phone</label>
                            <input
                              type="tel"
                              className="form-control"
                              value={bookingForm.contactDetails.emergencyContact.phone}
                              onChange={(e) => setBookingForm(prev => ({ 
                                ...prev, 
                                contactDetails: { 
                                  ...prev.contactDetails, 
                                  emergencyContact: { ...prev.contactDetails.emergencyContact, phone: e.target.value }
                                }
                              }))}
                              required
                            />
                          </div>
                        </div>
                      </div>

                      {/* Navigation buttons moved to sidebar */}
                    </div>
                  )}

                  {/* Seat Selection Section */}
                  {bookingSection === 3 && (
                    <div>
                      <h6>Seat Selection Summary</h6>
                      {bookingForm.selectedSeats.length > 0 ? (
                        <div className="row">
                          {bookingForm.selectedSeats.map((seat, index) => (
                            <div key={index} className="col-md-6 mb-3">
                              <div className="card">
                                <div className="card-body">
                                  <div className="d-flex justify-content-between">
                                    <span>Passenger {index + 1}</span>
                                    <span className="fw-bold">
                                      Seat {seat.seatCode}
                                      {seat.amount > 0 && (
                                        <span className="text-primary ms-2">
                                          +AED {seat.amount}
                                        </span>
                                      )}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="alert alert-info">
                          <i className="fas fa-info-circle me-2"></i>
                          No seats selected. Seats will be assigned automatically at check-in.
                        </div>
                      )}

                      {/* Navigation buttons moved to sidebar */}
                    </div>
                  )}

                  {/* Additional Services & Confirmation Section */}
                  {bookingSection === 4 && (
                    <div>
                      <h6>Additional Services & Confirmation</h6>
                      <div className="row">
                        {flight.additionalServices.map((service) => (
                          <div key={service.id} className="col-md-6 mb-3">
                            <div className="card">
                              <div className="card-body">
                                <div className="form-check">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                    id={service.id}
                                    checked={bookingForm.additionalServices.includes(service.id)}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setBookingForm(prev => ({ 
                                          ...prev, 
                                          additionalServices: [...prev.additionalServices, service.id]
                                        }));
                                      } else {
                                        setBookingForm(prev => ({ 
                                          ...prev, 
                                          additionalServices: prev.additionalServices.filter(id => id !== service.id)
                                        }));
                                      }
                                    }}
                                  />
                                  <label className="form-check-label" htmlFor={service.id}>
                                    <div className="d-flex justify-content-between">
                                      <span>{service.name}</span>
                                      <span className="fw-bold">{service.currency} {service.price}</span>
                                    </div>
                                  </label>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="mb-3">
                        <label className="form-label">Special Requests</label>
                        <textarea
                          className="form-control"
                          rows={3}
                          value={bookingForm.specialRequests}
                          onChange={(e) => setBookingForm(prev => ({ ...prev, specialRequests: e.target.value }))}
                        />
                      </div>

                      {/* Navigation buttons moved to sidebar */}
                    </div>
                  )}
                </form>
              </div>
            </div>
          )}
        </div>

        {/* Booking Sidebar */}
        <div className="col-lg-4">
          <div className="card position-sticky" style={{ top: '100px', zIndex: 10 }}>
            <div className="card-body">
              <h5 className="card-title">Book This Flight</h5>
              
              {bookingSection === 1 && (
                <div>
                  <h6>Select Cabin Class</h6>
                  {Object.entries(flight.pricing).map(([cabinClass, pricing]) => (
                    <div key={cabinClass} className="card mb-3">
                      <div className="card-body">
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="radio"
                            name="cabinClass"
                            id={cabinClass}
                            value={cabinClass}
                            checked={bookingForm.cabinClass === cabinClass}
                            onChange={(e) => setBookingForm(prev => ({ 
                              ...prev, 
                              cabinClass: e.target.value as 'economy' | 'business' | 'first'
                            }))}
                          />
                          <label className="form-check-label w-100" htmlFor={cabinClass}>
                            <div className="d-flex justify-content-between">
                              <div>
                                <h6 className="mb-1 text-capitalize">{cabinClass}</h6>
                                <small className="text-muted">
                                  {flight.seatMap[cabinClass].availableSeats} seats available
                                </small>
                              </div>
                              <div className="text-end">
                                <div className="fw-bold">{pricing.currency} {pricing.adult}</div>
                                <small className="text-muted">per adult</small>
                              </div>
                            </div>
                          </label>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <div className="border-top pt-3 mb-3">
                    <div className="d-flex justify-content-between">
                      <span>Passengers:</span>
                      <span>
                        {bookingForm.passengers.filter(p => p.type === 'adult').length} adults, {' '}
                        {bookingForm.passengers.filter(p => p.type === 'child').length} children, {' '}
                        {bookingForm.passengers.filter(p => p.type === 'infant').length} infants
                      </span>
                    </div>
                    <div className="d-flex justify-content-between fw-bold">
                      <span>Total:</span>
                      <span>{flight.pricing[bookingForm.cabinClass].currency} {calculateTotalPrice()}</span>
                    </div>
                  </div>
                  
                  <button
                    className="btn btn-primary w-100"
                    onClick={() => setBookingSection(2)}
                  >
                    Continue to Passenger Details
                  </button>
                </div>
              )}

              {bookingSection > 1 && (
                <div>
                  <h6>Booking Summary</h6>
                  <div className="mb-3">
                    <div className="d-flex justify-content-between">
                      <span>Cabin Class:</span>
                      <span className="text-capitalize">{bookingForm.cabinClass}</span>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span>Passengers:</span>
                      <span>{bookingForm.passengers.length}</span>
                    </div>
                    <div className="small text-muted ps-3">
                      {bookingForm.passengers.filter(p => p.type === 'adult').length > 0 && (
                        <div>• {bookingForm.passengers.filter(p => p.type === 'adult').length} Adult(s)</div>
                      )}
                      {bookingForm.passengers.filter(p => p.type === 'child').length > 0 && (
                        <div>• {bookingForm.passengers.filter(p => p.type === 'child').length} Child(ren)</div>
                      )}
                      {bookingForm.passengers.filter(p => p.type === 'infant').length > 0 && (
                        <div>• {bookingForm.passengers.filter(p => p.type === 'infant').length} Infant(s)</div>
                      )}
                    </div>
                    <div className="d-flex justify-content-between fw-bold">
                      <span>Total:</span>
                      <span>{flight.pricing[bookingForm.cabinClass].currency} {calculateTotalPrice()}</span>
                    </div>
                  </div>
                  
                  <div className="progress mb-3">
                    <div 
                      className="progress-bar" 
                      style={{ width: `${(bookingSection / 4) * 100}%` }}
                    ></div>
                  </div>
                  
                  <small className="text-muted">
                    Section {bookingSection} of 4: {
                      bookingSection === 2 ? 'Passenger Details' : 
                      bookingSection === 3 ? 'Seat Selection' :
                      bookingSection === 4 ? 'Services & Confirmation' : 'Class Selection'
                    }
                  </small>
                  
                  {/* Navigation Buttons */}
                  <div className="mt-3">
                    {bookingSection === 2 && (
                      <div className="d-grid gap-2">
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={() => setBookingSection(1)}
                        >
                          <i className="fas fa-arrow-left me-2"></i>
                          Back to Class Selection
                        </button>
                        <button
                          type="button"
                          className="btn btn-primary"
                          onClick={() => setShowSeatSelection(true)}
                        >
                          Continue to Seat Selection
                          <i className="fas fa-arrow-right ms-2"></i>
                        </button>
                      </div>
                    )}
                    
                    {bookingSection === 3 && (
                      <div className="d-grid gap-2">
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={() => setBookingSection(2)}
                        >
                          <i className="fas fa-arrow-left me-2"></i>
                          Back to Passenger Details
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline-primary"
                          onClick={() => setShowSeatSelection(true)}
                        >
                          <i className="fas fa-chair me-2"></i>
                          {bookingForm.selectedSeats.length > 0 ? 'Change Seats' : 'Select Seats'}
                        </button>
                        <button
                          type="button"
                          className="btn btn-primary"
                          onClick={() => setBookingSection(4)}
                        >
                          Continue to Services
                          <i className="fas fa-arrow-right ms-2"></i>
                        </button>
                      </div>
                    )}
                    
                    {bookingSection === 4 && (
                      <div className="d-grid gap-2">
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={() => setBookingSection(3)}
                        >
                          <i className="fas fa-arrow-left me-2"></i>
                          Back to Seat Selection
                        </button>
                        <button
                          type="submit"
                          className="btn btn-success"
                          form="booking-form"
                        >
                          <i className="fas fa-check me-2"></i>
                          Confirm & Reserve Flight
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Seat Selection Modal */}
      {showSeatSelection && (
        <ProfessionalSeatMap
          flightId={flight.id}
          passengers={bookingForm.passengers.map((p, index) => ({
            id: `passenger-${index}`,
            name: `${p.firstName} ${p.lastName}`.trim() || `Passenger ${index + 1}`,
            type: p.type
          }))}
          onSeatSelect={handleSeatSelection}
          onClose={handleCloseSeatSelection}
        />
      )}
      </div>
    </>
  );
} 