'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import Breadcrumbs from '@/components/Breadcrumbs';
import ImageGallery from '@/components/ImageGallery';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import NearbyAttractions from '@/components/NearbyAttractions';
import GoogleMapEmbed from '@/components/GoogleMapEmbed';

interface HotelDetails {
  id: string;
  name: string;
  description: string;
  rating: number;
  reviewCount?: number; // Made optional since we're not using it
  reviewScore: string;
  propertyType: string;
  location: {
    address: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    coordinates: {
      latitude: string;
      longitude: string;
    };
  };
  contact: {
    phone: string;
    email: string;
    website: string;
  };
  images: Array<{
    url: string;
    size: string;
    caption: string;
  }>;
  facilities: Array<{
    name: string;
    type: string;
    icon: string;
  }>;
  roomTypes: Array<{
    id: string;
    name: string;
    description: string;
    size: string;
    maxOccupancy: number;
    bedType: string;
    price: {
      current: number;
      original: number;
      currency: string;
    };
    amenities: string[];
    images: string[];
    availability: number;
  }>;
  policies: {
    checkIn: string;
    checkOut: string;
    cancellation: string;
    children: string;
    pets: string;
    smoking: string;
    extraBed: string;
  };
  nearbyAttractions: Array<{
    id: string;
    name: string;
    distance: {
      km: number;
      miles: number;
    };
    type: string;
    description?: string;
    category?: 'historical' | 'natural' | 'cultural' | 'religious' | 'museum' | 'transportation' | 'entertainment' | 'shopping' | 'healthcare' | 'education' | 'recreation' | 'landmark' | 'beach' | 'park' | 'other';
  }>;
  reviewsSummary: {
    overall: number;
    categories: {
      cleanliness: number;
      comfort: number;
      location: number;
      service: number;
      value: number;
      wifi: number;
    };
  };
}

interface BookingForm {
  checkInDate: string;
  checkOutDate: string;
  guests: {
    adults: number;
    children: number;
    rooms: number;
  };
  selectedRoom: string;
  primaryGuest: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    country: string;
  };
  additionalGuests: Array<{
    type: 'adult' | 'child';
    firstName: string;
    lastName: string;
    age?: number;
    roomAssignment: number;
    phone?: string;
    email?: string;
  }>;
  specialRequests: string;
}

interface ParsedHotelDescription {
  amenities?: string;
  spoken_languages?: string;
  rooms?: string;
  onsite_payments?: string;
  dining?: string;
  business_amenities?: string;
  location?: string;
  attractions?: string;
  headline?: string;
}

export default function HotelDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  
  const [hotel, setHotel] = useState<HotelDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingSection, setBookingSection] = useState(1); // 1: room selection, 2: primary guest, 3: additional guests, 4: confirmation
  const [parsedDescription, setParsedDescription] = useState<ParsedHotelDescription | null>(null);
  
  // Initialize booking form with URL parameters
  const [bookingForm, setBookingForm] = useState<BookingForm>({
    checkInDate: searchParams.get('checkinDate') || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    checkOutDate: searchParams.get('checkoutDate') || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    guests: {
      adults: parseInt(searchParams.get('adults') || '1'),
      children: parseInt(searchParams.get('children') || '0'),
      rooms: parseInt(searchParams.get('rooms') || '1')
    },
    selectedRoom: '',
    primaryGuest: {
      firstName: session?.user?.name?.split(' ')[0] || '',
      lastName: session?.user?.name?.split(' ')[1] || '',
      email: session?.user?.email || '',
      phone: '',
      country: 'UAE'
    },
    additionalGuests: [],
    specialRequests: ''
  });

  // Parse hotel description JSON
  const parseHotelDescription = (description: string): ParsedHotelDescription | null => {
    try {
      if (description.startsWith('{') && description.endsWith('}')) {
        const parsed = JSON.parse(description);
        return parsed;
      }
      return null;
    } catch (error) {
      console.error('Error parsing hotel description:', error);
      return null;
    }
  };

  // Fetch hotel details
  useEffect(() => {
    const fetchHotelDetails = async () => {
      try {
        const response = await fetch(`/api/hotels/${params.id}`);
        const data = await response.json();
        
        if (data.success) {
          setHotel(data.hotel);
          // Parse description if it's JSON
          const parsed = parseHotelDescription(data.hotel.description);
          setParsedDescription(parsed);
        } else {
          setError(data.error || 'Failed to fetch hotel details');
        }
      } catch (err) {
        setError('Failed to fetch hotel details');
        console.error('Error fetching hotel details:', err);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchHotelDetails();
    }
  }, [params.id]);

  // Prepare images for the gallery component
  const getGalleryImages = () => {
    if (!hotel?.images) return [];
    
    // Prefer larger images for better quality
    const largeImages = hotel.images.filter(img => 
      img.size === 'XL' || img.size === 'large' || img.size === 'Large'
    );
    
    // Fallback to all images if no large images available
    const imagesToUse = largeImages.length > 0 ? largeImages : hotel.images;
    
    return imagesToUse.map(img => ({
      url: img.url,
      caption: img.caption || hotel.name
    }));
  };

  // Calculate number of nights
  const calculateNights = () => {
    const checkIn = new Date(bookingForm.checkInDate);
    const checkOut = new Date(bookingForm.checkOutDate);
    return Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
  };

  // Handle room selection
  const handleRoomSelect = (roomId: string) => {
    setBookingForm(prev => ({ ...prev, selectedRoom: roomId }));
    setShowBookingForm(true);
    setBookingSection(2);
    // Initialize additional guests based on guest counts
    initializeAdditionalGuests();
  };

  // Handle room deselection
  const handleRoomDeselect = () => {
    setBookingForm(prev => ({ ...prev, selectedRoom: '' }));
    setShowBookingForm(false);
    setBookingSection(1);
  };

  // Get selected room details
  const getSelectedRoom = () => {
    return hotel?.roomTypes.find(room => room.id === bookingForm.selectedRoom);
  };

  // Initialize additional guests based on guest counts
  const initializeAdditionalGuests = () => {
    const totalAdults = bookingForm.guests.adults;
    const totalChildren = bookingForm.guests.children;
    const totalRooms = bookingForm.guests.rooms;
    
    const additionalGuests: BookingForm['additionalGuests'] = [];
    
    // Add additional adults (excluding primary guest)
    for (let i = 1; i < totalAdults; i++) {
      additionalGuests.push({
        type: 'adult' as const,
        firstName: '',
        lastName: '',
        roomAssignment: Math.min(i, totalRooms),
        phone: '',
        email: ''
      });
    }
    
    // Add children
    for (let i = 0; i < totalChildren; i++) {
      additionalGuests.push({
        type: 'child' as const,
        firstName: '',
        lastName: '',
        age: 8,
        roomAssignment: Math.min(Math.floor(i / 2) + 1, totalRooms)
      });
    }
    
    setBookingForm(prev => ({ ...prev, additionalGuests }));
  };

  // Add guest function
  const addGuest = (type: 'adult' | 'child') => {
    const newGuest = {
      type,
      firstName: '',
      lastName: '',
      roomAssignment: 1,
      ...(type === 'adult' ? { phone: '', email: '' } : { age: 8 })
    };

    setBookingForm(prev => ({
      ...prev,
      additionalGuests: [...prev.additionalGuests, newGuest],
      guests: {
        ...prev.guests,
        [type === 'adult' ? 'adults' : 'children']: prev.guests[type === 'adult' ? 'adults' : 'children'] + 1
      }
    }));
  };

  // Remove guest function
  const removeGuest = (index: number) => {
    const guestToRemove = bookingForm.additionalGuests[index];
    
    setBookingForm(prev => ({
      ...prev,
      additionalGuests: prev.additionalGuests.filter((_, i) => i !== index),
      guests: {
        ...prev.guests,
        [guestToRemove.type === 'adult' ? 'adults' : 'children']: 
          prev.guests[guestToRemove.type === 'adult' ? 'adults' : 'children'] - 1
      }
    }));
  };

  // Update guest details
  const updateGuestDetails = (index: number, field: string, value: string | number) => {
    setBookingForm(prev => ({
      ...prev,
      additionalGuests: prev.additionalGuests.map((guest, i) => 
        i === index ? { ...guest, [field]: value } : guest
      )
    }));
  };

  // Handle booking form submission
  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session) {
      router.push('/login?redirect=' + encodeURIComponent(window.location.pathname));
      return;
    }

    const selectedRoomType = hotel?.roomTypes.find(room => room.id === bookingForm.selectedRoom);
    if (!selectedRoomType) return;

    const bookingData = {
      hotelId: hotel?.id,
      hotelName: hotel?.name,
      roomType: selectedRoomType.name,
      checkInDate: bookingForm.checkInDate,
      checkOutDate: bookingForm.checkOutDate,
      nights: calculateNights(),
      guestCounts: bookingForm.guests,
      primaryGuest: bookingForm.primaryGuest,
      additionalGuests: bookingForm.additionalGuests,
      totalPrice: selectedRoomType.price.current * calculateNights(),
      currency: selectedRoomType.price.currency,
      specialRequests: bookingForm.specialRequests
    };

    try {
      const response = await fetch('/api/bookings/hotels', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      });

      const result = await response.json();
      
      if (result.success) {
        router.push(`/booking-confirmation/hotel/${result.bookingId}`);
      } else {
        alert('Booking failed: ' + result.error);
      }
    } catch (error) {
      console.error('Booking error:', error);
      alert('Booking failed. Please try again.');
    }
  };

  // Get images for the gallery component
  const galleryImages = getGalleryImages();

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

  if (error || !hotel) {
    return (
      <>
      <Breadcrumbs/>
      <div className="container mt-5">
        <div className="alert alert-danger" role="alert">
          {error || 'Hotel not found'}
        </div>
      </div>
      </>
    );
  }

  return (
    <>
      <Breadcrumbs/>
      
      {/* Custom Styles for Attractions Section */}
      <style jsx>{`
        .attraction-category {
          margin-bottom: 2rem;
        }
        
        .category-header {
          border-bottom: 2px solid #e9ecef;
          padding-bottom: 0.5rem;
        }
        
        .category-title {
          font-size: 1.1rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }
        
        .attraction-card {
          transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
          border-radius: 12px;
          overflow: hidden;
        }
        
        .attraction-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        
        .distance-badge {
          font-size: 0.75rem;
          padding: 0.25rem 0.5rem;
          border-radius: 20px;
          font-weight: 600;
        }
        
        .bg-info-subtle {
          background-color: rgba(13, 202, 240, 0.1);
        }
        
        .bg-success-subtle {
          background-color: rgba(25, 135, 84, 0.1);
        }
        
        .bg-warning-subtle {
          background-color: rgba(255, 193, 7, 0.1);
        }
        
        .bg-danger-subtle {
          background-color: rgba(220, 53, 69, 0.1);
        }
        
        .bg-primary-subtle {
          background-color: rgba(13, 110, 253, 0.1);
        }
        
        .bg-secondary-subtle {
          background-color: rgba(108, 117, 125, 0.1);
        }
        
        .bg-dark-subtle {
          background-color: rgba(33, 37, 41, 0.1);
        }
        
        .bg-purple-subtle {
          background-color: rgba(102, 16, 242, 0.1);
        }
        
        .text-purple {
          color: #6610f2;
        }
        
        .distance-summary-card {
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          border-radius: 12px;
          border: 1px solid #dee2e6;
        }
        
        .distance-stat {
          padding: 1rem;
          border-radius: 8px;
          margin: 0.25rem;
          background: white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }
      `}</style>
      
    <div className="container-fluid px-0">
      {/* Hero Section with Images */}
      <div className="mb-4 mt-4">
        <ImageGallery 
          images={galleryImages} 
          title={hotel.name}
          className="container"
        />
      </div>

      <div className="container">
        <div className="row">
          {/* Main Content */}
          <div className="col-lg-8">
            {/* Hotel Header */}
            <div className="mb-4">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <h1 className="h2 mb-2">{hotel.name}</h1>
                  <div className="d-flex align-items-center gap-3 mb-2">
                    <div className="d-flex align-items-center">
                      {[...Array(5)].map((_, i) => (
                        <i
                          key={i}
                          className={`fas fa-star ${i < hotel.rating ? 'text-warning' : 'text-muted'}`}
                        />
                      ))}
                      <span className="ms-2 fw-medium">{hotel.rating}</span>
                    </div>
                    <span className="badge bg-primary">{hotel.reviewScore}</span>

                  </div>
                  <p className="text-muted mb-0">
                    <i className="fas fa-map-marker-alt me-2"></i>
                    {hotel.location.address}, {hotel.location.city}, {hotel.location.country}
                  </p>
                </div>
                <div className="text-end">
                  <span className="badge bg-secondary">{hotel.propertyType}</span>
                </div>
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
                  className={`nav-link ${activeTab === 'rooms' ? 'active' : ''}`}
                  onClick={() => setActiveTab('rooms')}
                >
                  Rooms & Rates
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
                  className={`nav-link ${activeTab === 'reviews' ? 'active' : ''}`}
                  onClick={() => setActiveTab('reviews')}
                >
                  Reviews
                </button>
              </li>

              <li className="nav-item">
                <button
                  className={`nav-link ${activeTab === 'location' ? 'active' : ''}`}
                  onClick={() => setActiveTab('location')}
                >
                  Location & Map
                </button>
              </li>
            </ul>

            {/* Tab Content */}
            <div className="tab-content">
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="tab-pane fade show active">
                  {/* Enhanced Hotel Description */}
                  <div className="card mb-4">
                    <div className="card-body">
                      <h5 className="card-title mb-4">
                        <i className="fas fa-info-circle me-2 text-primary"></i>
                        About This Hotel
                      </h5>
                      
                      {parsedDescription ? (
                        <div className="hotel-description-sections row">
                          {/* Headline */}
                          {parsedDescription.headline && (
                            <div className="col-md-6">
                            <div className="description-section mb-4">
                              <h6 className="section-title text-primary mb-2">
                                <i className="fas fa-star me-2"></i>
                                Hotel Highlights
                              </h6>
                                                             <div className="section-content">
                                 <div className="markdown-content">
                                   <ReactMarkdown 
                                     remarkPlugins={[remarkGfm]}
                                     rehypePlugins={[rehypeRaw]}
                                   >
                                     {parsedDescription.headline}
                                   </ReactMarkdown>
                                 </div>
                               </div>
                            </div>
                          </div>
                          )}

                           {/* Business Amenities */}
                           {parsedDescription.business_amenities && (
                          <div className="col-md-6">
                            <div className="description-section mb-4">
                              <h6 className="section-title text-primary mb-2">
                                <i className="fas fa-briefcase me-2"></i>
                                Business Facilities
                              </h6>
                                                             <div className="section-content">
                                 <div className="markdown-content">
                                   <ReactMarkdown 
                                     remarkPlugins={[remarkGfm]}
                                     rehypePlugins={[rehypeRaw]}
                                   >
                                     {parsedDescription.business_amenities}
                                   </ReactMarkdown>
                                 </div>
                               </div>
                            </div>
                          </div>
                          )}

                          {/* Amenities */}
                          {parsedDescription.amenities && (
                          <div className="col-md-12">
                            <div className="description-section mb-4">
                              <h6 className="section-title text-primary mb-2">
                                <i className="fas fa-swimming-pool me-2"></i>
                                Recreational Amenities
                              </h6>
                                                             <div className="section-content">
                                 <div className="markdown-content">
                                   <ReactMarkdown 
                                     remarkPlugins={[remarkGfm]}
                                     rehypePlugins={[rehypeRaw]}
                                   >
                                     {parsedDescription.amenities}
                                   </ReactMarkdown>
                                 </div>
                               </div>
                            </div>
                          </div>
                          )}

                          {/* Dining */}
                          {parsedDescription.dining && (
                          <div className="col-md-12">
                            <div className="description-section mb-4">
                              <h6 className="section-title text-primary mb-2">
                                <i className="fas fa-utensils me-2"></i>
                                Dining Options
                              </h6>
                                                             <div className="section-content">
                                 <div className="markdown-content">
                                   <ReactMarkdown 
                                     remarkPlugins={[remarkGfm]}
                                     rehypePlugins={[rehypeRaw]}
                                   >
                                     {parsedDescription.dining}
                                   </ReactMarkdown>
                                 </div>
                               </div>
                            </div>
                          </div>
                          )}

                          {/* Rooms */}
                          {parsedDescription.rooms && (
                          <div className="col-md-12">
                            <div className="description-section mb-4">
                              <h6 className="section-title text-primary mb-2">
                                <i className="fas fa-bed me-2"></i>
                                Accommodations
                              </h6>
                                                             <div className="section-content">
                                 <div className="markdown-content">
                                   <ReactMarkdown 
                                     remarkPlugins={[remarkGfm]}
                                     rehypePlugins={[rehypeRaw]}
                                   >
                                     {parsedDescription.rooms}
                                   </ReactMarkdown>
                                 </div>
                               </div>
                            </div>
                          </div>
                          )}

                          

                         

                          {/* Location */}
                          {parsedDescription.location && (
                          <div className="col-md-12">
                            <div className="description-section  mb-4">
                              <h6 className="section-title text-primary mb-2">
                                <i className="fas fa-map-marker-alt me-2"></i>
                                Location Details
                              </h6>
                                                             <div className="section-content">
                                 <div className="markdown-content">
                                   <ReactMarkdown 
                                     remarkPlugins={[remarkGfm]}
                                     rehypePlugins={[rehypeRaw]}
                                   >
                                     {parsedDescription.location}
                                   </ReactMarkdown>
                                 </div>
                               </div>
                            </div>
                          </div>
                          )}

                          {/* Attractions */}
                          {parsedDescription.attractions && (
                          <div className="col-md-12">
                            <div className="description-section mb-4 d-none">
                              <h6 className="section-title text-primary mb-2">
                                <i className="fas fa-map-signs me-2"></i>
                                Nearby Attractions
                              </h6>
                                                             <div className="section-content">
                                 <div className="markdown-content">
                                   <ReactMarkdown 
                                     remarkPlugins={[remarkGfm]}
                                     rehypePlugins={[rehypeRaw]}
                                   >
                                     {parsedDescription.attractions}
                                   </ReactMarkdown>
                                 </div>
                               </div>
                            </div>
                          </div>
                          )}

                          {/* Enhanced Nearby Attractions Section */}
                          {hotel.nearbyAttractions && hotel.nearbyAttractions.length > 0 && (
                          <div className="col-md-12">
                            <div className="description-section mb-4">
                              <NearbyAttractions 
                                attractions={hotel.nearbyAttractions}
                                showCategories={true}
                                distanceUnit="km"
                              />
                            </div>
                          </div>
                          )}

                          

                          {/* Payment Options */}
                          {parsedDescription.onsite_payments && (
                          <div className="col-md-6">
                            <div className="description-section mb-4">
                              <h6 className="section-title text-primary mb-2">
                                <i className="fas fa-credit-card me-2"></i>
                                Payment Options
                              </h6>
                                                             <div className="section-content">
                                 <div className="markdown-content">
                                   <ReactMarkdown 
                                     remarkPlugins={[remarkGfm]}
                                     rehypePlugins={[rehypeRaw]}
                                   >
                                     {parsedDescription.onsite_payments}
                                   </ReactMarkdown>
                                 </div>
                               </div>
                            </div>
                          </div>
                          )}

                          {/* Spoken Languages */}
                          {parsedDescription.spoken_languages && (
                          <div className="col-md-6">
                            <div className="description-section mb-4">
                              <h6 className="section-title text-primary mb-2">
                                <i className="fas fa-language me-2"></i>
                                Languages Spoken
                              </h6>
                                                             <div className="section-content">
                                 <div className="markdown-content">
                                   <ReactMarkdown 
                                     remarkPlugins={[remarkGfm]}
                                     rehypePlugins={[rehypeRaw]}
                                   >
                                     {parsedDescription.spoken_languages}
                                   </ReactMarkdown>
                                 </div>
                               </div>
                            </div>
                          </div>
                          )}
                        </div>
                      ) : (
                        <div className="simple-description">
                          <p className="card-text">{hotel.description}</p>
                        </div>
                      )}
                    </div>
                  </div>

                 
                </div>
              )}

              {/* Rooms Tab */}
              {activeTab === 'rooms' && (
                <div className="tab-pane fade show active">
                  {hotel.roomTypes.map((room) => {
                    const isSelected = bookingForm.selectedRoom === room.id;
                    const totalPrice = room.price.current * calculateNights();
                    const totalOriginalPrice = room.price.original * calculateNights();
                    
                    return (
                      <div key={room.id} className={`card mb-4 ${isSelected ? ' ' : ''}`}>
                        <div className="card-body">
                          {isSelected && (
                            <div className="alert alert-success d-flex justify-content-between align-items-center mb-3">
                              <div>
                                <i className="fas fa-check-circle me-2"></i>
                                <strong>Room Selected!</strong> This room is added to your booking.
                              </div>
                              <button
                                className="btn btn-outline-primary btn-sm deselect-room-btn"
                                onClick={handleRoomDeselect}
                              >
                                <i className="fas fa-times me-1"></i>
                                Deselect
                              </button>
                            </div>
                          )}
                          <div className="row">
                            <div className="col-md-4">
                              <Image
                                src={room.images[0]}
                                alt={room.name}
                                width={300}
                                height={200}
                                className="w-100 rounded"
                              />
                            </div>
                            <div className="col-md-8">
                              <div className="d-flex justify-content-between align-items-start row">
                                <div className='col-md-8'>
                                  <h5 className="card-title">{room.name}</h5>
                                  <p className="text-muted mb-2">{room.description}</p>
                                  <div className="mb-3">
                                    <small className="text-muted">
                                      <i className="fas fa-expand-arrows-alt me-1"></i>{room.size} •
                                      <i className="fas fa-users ms-2 me-1"></i>Up to {room.maxOccupancy} guests •
                                      <i className="fas fa-bed ms-2 me-1"></i>{room.bedType}
                                    </small>
                                  </div>
                                  <div className="mb-3">
                                    {room.amenities.map((amenity, index) => (
                                      <span key={index} className="badge bg-light text-dark me-1 mb-1">
                                        {amenity}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                                <div className="col-md-4 text-end">
                                  <div className="mb-2">
                                    <span className="text-muted text-decoration-line-through">
                                      {room.price.currency} {room.price.original}
                                    </span>
                                  </div>
                                  <div className="mb-2">
                                    <span className="h4 text-primary">
                                      {room.price.currency} {room.price.current}
                                    </span>
                                    <small className="text-muted d-block">per night</small>
                                  </div>
                                  
                                  <div className="mb-3">
                                    <small className="text-success">
                                      <i className="fas fa-check me-1"></i>
                                      {room.availability} rooms left
                                    </small>
                                  </div>
                                  
                                  {!isSelected ? (
                                    <button
                                      className="btn btn-primary"
                                      onClick={() => handleRoomSelect(room.id)}
                                    >
                                      Select Room
                                    </button>
                                  ) : (
                                    <div className="d-grid gap-2">
                                      <button
                                        className="btn btn-success d-none"
                                        onClick={() => setActiveTab('overview')}
                                      >
                                        <i className="fas fa-check me-1"></i>
                                        Selected
                                      </button>
                                      <button
                                        className="btn btn-success"
                                        onClick={handleRoomDeselect}
                                      >
                                        Change Room
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Amenities Tab */}
              {activeTab === 'amenities' && (
                <div className="tab-pane fade show active">
                  <div className="card">
                    <div className="card-body">
                      <h5 className="card-title">Hotel Amenities</h5>
                      <div className="row">
                        {hotel.facilities.map((facility, index) => (
                          <div key={index} className="col-md-6 mb-3">
                            <div className="d-flex align-items-center">
                              <i className={`${facility.icon} me-3 text-primary`}></i>
                              <span>{facility.name}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Reviews Tab */}
              {activeTab === 'reviews' && (
                <div className="tab-pane fade show active">
                  <div className="card">
                    <div className="card-body">
                      <h5 className="card-title">Guest Reviews</h5>
                      <div className="row mb-4">
                        <div className="col-md-4">
                          <div className="text-center">
                            <div className="h1 text-primary">{hotel.reviewsSummary.overall.toFixed(1)}</div>
                            <div className="text-muted">Overall Rating</div>

                          </div>
                        </div>
                        <div className="col-md-8">
                          {Object.entries(hotel.reviewsSummary.categories).map(([category, score]) => (
                            <div key={category} className="d-flex justify-content-between align-items-center mb-2">
                              <span className="text-capitalize">{category}</span>
                              <div className="d-flex align-items-center">
                                <div className="progress me-2" style={{ width: '100px' }}>
                                  <div
                                    className="progress-bar"
                                    style={{ width: `${(score / 5) * 100}%` }}
                                  ></div>
                                </div>
                                <span className="text-muted">{score.toFixed(1)}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}



              {/* Location & Map Tab */}
              {activeTab === 'location' && (
                <div className="tab-pane fade show active">
                  <div className="row">
                    <div className="col-md-4 mb-4 d-none">
                      <div className="card h-100">
                        <div className="card-body">
                          <h5 className="card-title text-primary">
                            <i className="fas fa-map-marker-alt me-2"></i>
                            Hotel Address
                          </h5>
                          <div className="mb-3">
                            <h6 className="fw-bold">{hotel.name}</h6>
                            <p className="mb-1">{hotel.location.address}</p>
                            <p className="mb-1">{hotel.location.city}, {hotel.location.state}</p>
                            <p className="mb-0">{hotel.location.country} {hotel.location.postalCode}</p>
                          </div>
                          
                          <h6 className="text-primary">
                            <i className="fas fa-phone me-2"></i>
                            Contact Information
                          </h6>
                          <div className="mb-3">
                            <p className="mb-1">
                              <strong>Phone:</strong><br />
                              <a href={`tel:${hotel.contact.phone}`} className="text-decoration-none">
                                {hotel.contact.phone}
                              </a>
                            </p>
                            <p className="mb-1">
                              <strong>Email:</strong><br />
                              <a href={`mailto:${hotel.contact.email}`} className="text-decoration-none">
                                {hotel.contact.email}
                              </a>
                            </p>
                            {hotel.contact.website !== 'Website not available' && (
                              <p className="mb-0">
                                <strong>Website:</strong><br />
                                <a href={hotel.contact.website} target="_blank" rel="noopener noreferrer" className="text-decoration-none">
                                  Visit Website <i className="fas fa-external-link-alt ms-1"></i>
                                </a>
                              </p>
                            )}
                          </div>

                          <h6 className="text-primary">
                            <i className="fas fa-globe me-2"></i>
                            GPS Coordinates
                          </h6>
                          <div className="mb-3">
                            <p className="mb-1">
                              <strong>Latitude:</strong> {hotel.location.coordinates.latitude}
                            </p>
                            <p className="mb-0">
                              <strong>Longitude:</strong> {hotel.location.coordinates.longitude}
                            </p>
                          </div>

                          {/* Quick Actions */}
                          <div className="d-grid gap-2">
                            <a
                              href={`https://www.google.com/maps/dir/?api=1&destination=${hotel.location.coordinates.latitude},${hotel.location.coordinates.longitude}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-primary"
                            >
                              <i className="fas fa-directions me-2"></i>
                              Get Directions
                            </a>
                            <a
                              href={`https://www.google.com/maps/search/?api=1&query=${hotel.location.coordinates.latitude},${hotel.location.coordinates.longitude}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-outline-primary"
                            >
                              <i className="fas fa-external-link-alt me-2"></i>
                              View on Google Maps
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-12">
                      <div className="card h-100">
                        <div className="card-body p-0">
                          <GoogleMapEmbed
                            latitude={parseFloat(hotel.location.coordinates.latitude)}
                            longitude={parseFloat(hotel.location.coordinates.longitude)}
                            hotelName={hotel.name}
                            address={`${hotel.location.address}, ${hotel.location.city}, ${hotel.location.country}`}
                            height="500px"
                            zoom={16}
                            className="h-100"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Additional Map Options */}
                  <div className="row mt-4">
                    <div className="col-12">
                      <div className="card">
                        <div className="card-body">
                          <h6 className="card-title">
                            <i className="fas fa-map me-2"></i>
                            Alternative Map Services
                          </h6>
                          <div className="d-flex flex-wrap gap-2">
                            <a
                              href={`https://maps.apple.com/?q=${hotel.location.coordinates.latitude},${hotel.location.coordinates.longitude}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-outline-secondary"
                            >
                              <i className="fab fa-apple me-2"></i>
                              Apple Maps
                            </a>
                            <a
                              href={`https://www.openstreetmap.org/?mlat=${hotel.location.coordinates.latitude}&mlon=${hotel.location.coordinates.longitude}&zoom=16`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-outline-info"
                            >
                              <i className="fas fa-map me-2"></i>
                              OpenStreetMap
                            </a>
                            <button
                              type="button"
                              className="btn btn-outline-success"
                              onClick={() => {
                                if (navigator.share) {
                                  navigator.share({
                                    title: hotel.name,
                                    text: `Check out ${hotel.name} location`,
                                    url: `https://www.google.com/maps/search/?api=1&query=${hotel.location.coordinates.latitude},${hotel.location.coordinates.longitude}`
                                  });
                                } else {
                                  // Fallback to clipboard
                                  navigator.clipboard.writeText(`${hotel.name} - https://www.google.com/maps/search/?api=1&query=${hotel.location.coordinates.latitude},${hotel.location.coordinates.longitude}`);
                                  alert('Location link copied to clipboard!');
                                }
                              }}
                            >
                              <i className="fas fa-share me-2"></i>
                              Share Location
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Booking Sidebar */}
          <div className="col-lg-4">
            <div className="card position-sticky" style={{ top: '100px', zIndex: 10 }}>
              <div className="card-body">
                <h5 className="card-title">Book Your Stay</h5>
                
                {!showBookingForm ? (
                  <div>
                    <div className="mb-3">
                      <label className="form-label">Check-in Date</label>
                      <input
                        type="date"
                        className="form-control"
                        value={bookingForm.checkInDate}
                        onChange={(e) => setBookingForm(prev => ({ ...prev, checkInDate: e.target.value }))}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Check-out Date</label>
                      <input
                        type="date"
                        className="form-control"
                        value={bookingForm.checkOutDate}
                        onChange={(e) => setBookingForm(prev => ({ ...prev, checkOutDate: e.target.value }))}
                      />
                    </div>
                    <div className="row mb-3">
                      <div className="col-4">
                        <label className="form-label">Adults</label>
                        <select
                          className="form-select"
                          value={bookingForm.guests.adults}
                          onChange={(e) => {
                            const newAdults = parseInt(e.target.value);
                            setBookingForm(prev => ({ 
                              ...prev, 
                              guests: { ...prev.guests, adults: newAdults }
                            }));
                          }}
                        >
                          {[1,2,3,4,5,6].map(num => (
                            <option key={num} value={num}>{num}</option>
                          ))}
                        </select>
                      </div>
                      <div className="col-4">
                        <label className="form-label">Children</label>
                        <select
                          className="form-select"
                          value={bookingForm.guests.children}
                          onChange={(e) => {
                            const newChildren = parseInt(e.target.value);
                            setBookingForm(prev => ({ 
                              ...prev, 
                              guests: { ...prev.guests, children: newChildren }
                            }));
                          }}
                        >
                          {[0,1,2,3,4].map(num => (
                            <option key={num} value={num}>{num}</option>
                          ))}
                        </select>
                      </div>
                      <div className="col-4">
                        <label className="form-label">Rooms</label>
                        <select
                          className="form-select"
                          value={bookingForm.guests.rooms}
                          onChange={(e) => setBookingForm(prev => ({ 
                            ...prev, 
                            guests: { ...prev.guests, rooms: parseInt(e.target.value) }
                          }))}
                        >
                          {[1,2,3,4].map(num => (
                            <option key={num} value={num}>{num}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="mb-3">
                      <div className="text-center">
                        <div className="text-muted">
                          {calculateNights()} nights • {bookingForm.guests.adults} adults
                        </div>
                      </div>
                    </div>
                    
                    {/* Show selected room pricing - always visible when room is selected */}
                    {bookingForm.selectedRoom && getSelectedRoom() && (
                      <div className="border rounded p-3 mb-3 bg-light">
                        <h6 className="mb-2">
                          <i className="fas fa-bed me-2"></i>
                          Selected Room
                        </h6>
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <span className="fw-medium">{getSelectedRoom()?.name}</span>
                          <button
                            className="btn btn-outline-danger btn-sm"
                            onClick={handleRoomDeselect}
                            title="Remove room"
                          >
                            <i className="fas fa-times"></i>
                          </button>
                        </div>
                        <div className="small text-muted mb-2">
                          {calculateNights()} nights × {getSelectedRoom()?.price.currency} {getSelectedRoom()?.price.current}/night
                        </div>
                        
                        {/* Original Price (crossed out) */}
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <span className="small text-muted">Original Price:</span>
                          <span className="small text-muted text-decoration-line-through">
                            {getSelectedRoom()?.price.currency} {((getSelectedRoom()?.price.original || 0) * calculateNights()).toLocaleString()}
                          </span>
                        </div>
                        
                        {/* Total Price */}
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <span className="fw-bold">Total Price:</span>
                          <span className="fw-bold text-primary">
                            {getSelectedRoom()?.price.currency} {((getSelectedRoom()?.price.current || 0) * calculateNights()).toLocaleString()}
                          </span>
                        </div>
                        
                        {/* Savings */}
                        <div className="d-flex justify-content-between align-items-center">
                          <span className="small text-success">You Save:</span>
                          <span className="small text-success fw-bold">
                            {getSelectedRoom()?.price.currency} {(((getSelectedRoom()?.price.original || 0) - (getSelectedRoom()?.price.current || 0)) * calculateNights()).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    )}
                    
                    <button
                      className="btn btn-primary w-100"
                      onClick={() => setActiveTab('rooms')}
                    >
                      {bookingForm.selectedRoom ? (
                        <>
                          <i className="fas fa-exchange-alt me-2"></i>
                          Change Room
                        </>
                      ) : (
                        <>
                          <i className="fas fa-bed me-2"></i>
                          View Rooms & Rates
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <div>
                    {/* Progress Indicator */}
                    <div className="progress mb-3">
                      <div 
                        className="progress-bar" 
                        style={{ width: `${(bookingSection / 4) * 100}%` }}
                      ></div>
                    </div>
                    <small className="text-muted mb-3 d-block">
                      Step {bookingSection} of 4: {
                        bookingSection === 2 ? 'Primary Guest Details' : 
                        bookingSection === 3 ? 'Additional Guests' :
                        bookingSection === 4 ? 'Confirmation' : 'Room Selection'
                      }
                    </small>
                    
                    {/* Show selected room pricing in booking form - always visible when room is selected */}
                    {bookingForm.selectedRoom && getSelectedRoom() && (
                      <div className="border rounded p-3 mb-3 bg-primary bg-opacity-10">
                        <h6 className="mb-2 text-primary">
                          <i className="fas fa-bed me-2"></i>
                          {getSelectedRoom()?.name}
                        </h6>
                        <div className="small text-muted mb-2">
                          {calculateNights()} nights × {getSelectedRoom()?.price.currency} {getSelectedRoom()?.price.current}/night
                        </div>
                        
                        {/* Original Price (crossed out) */}
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <span className="small text-muted">Original Price:</span>
                          <span className="small text-muted text-decoration-line-through">
                            {getSelectedRoom()?.price.currency} {((getSelectedRoom()?.price.original || 0) * calculateNights()).toLocaleString()}
                          </span>
                        </div>
                        
                        {/* Total Price */}
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <span className="fw-bold text-primary">Total Price:</span>
                          <span className="fw-bold text-primary">
                            {getSelectedRoom()?.price.currency} {((getSelectedRoom()?.price.current || 0) * calculateNights()).toLocaleString()}
                          </span>
                        </div>
                        
                        {/* Savings */}
                        <div className="d-flex justify-content-between align-items-center">
                          <span className="small text-success">You Save:</span>
                          <span className="small text-success fw-bold">
                            {getSelectedRoom()?.price.currency} {(((getSelectedRoom()?.price.original || 0) - (getSelectedRoom()?.price.current || 0)) * calculateNights()).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    )}
                    
                    {/* Primary Guest Details Section */}
                    {bookingSection === 2 && (
                      <div>
                        <h6>Primary Guest Details</h6>
                        <small className="text-muted mb-3 d-block">This person will be the main contact for the booking</small>
                        
                        <div className="row mb-3">
                          <div className="col-6">
                            <label className="form-label">First Name</label>
                            <input
                              type="text"
                              className="form-control"
                              value={bookingForm.primaryGuest.firstName}
                              onChange={(e) => setBookingForm(prev => ({ 
                                ...prev, 
                                primaryGuest: { ...prev.primaryGuest, firstName: e.target.value }
                              }))}
                              required
                            />
                          </div>
                          <div className="col-6">
                            <label className="form-label">Last Name</label>
                            <input
                              type="text"
                              className="form-control"
                              value={bookingForm.primaryGuest.lastName}
                              onChange={(e) => setBookingForm(prev => ({ 
                                ...prev, 
                                primaryGuest: { ...prev.primaryGuest, lastName: e.target.value }
                              }))}
                              required
                            />
                          </div>
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Email</label>
                          <input
                            type="email"
                            className="form-control"
                            value={bookingForm.primaryGuest.email}
                            onChange={(e) => setBookingForm(prev => ({ 
                              ...prev, 
                              primaryGuest: { ...prev.primaryGuest, email: e.target.value }
                            }))}
                            required
                          />
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Phone</label>
                          <input
                            type="tel"
                            className="form-control"
                            value={bookingForm.primaryGuest.phone}
                            onChange={(e) => setBookingForm(prev => ({ 
                              ...prev, 
                              primaryGuest: { ...prev.primaryGuest, phone: e.target.value }
                            }))}
                            required
                          />
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Country</label>
                          <select
                            className="form-select"
                            value={bookingForm.primaryGuest.country}
                            onChange={(e) => setBookingForm(prev => ({ 
                              ...prev, 
                              primaryGuest: { ...prev.primaryGuest, country: e.target.value }
                            }))}
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
                        
                        <div className="d-grid gap-2">
                          <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => setShowBookingForm(false)}
                          >
                            <i className="fas fa-arrow-left me-2"></i>
                            Back to Room Selection
                          </button>
                          <button
                            type="button"
                            className="btn btn-primary"
                            onClick={() => setBookingSection(bookingForm.additionalGuests.length > 0 ? 3 : 4)}
                          >
                            {bookingForm.additionalGuests.length > 0 ? (
                              <>
                                Continue to Additional Guests
                                <i className="fas fa-arrow-right ms-2"></i>
                              </>
                            ) : (
                              <>
                                Continue to Confirmation
                                <i className="fas fa-arrow-right ms-2"></i>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Additional Guests Section */}
                    {bookingSection === 3 && (
                      <div>
                        <h6>Additional Guests</h6>
                        <small className="text-muted mb-3 d-block">
                          Add details for other guests ({bookingForm.additionalGuests.length} of {bookingForm.guests.adults + bookingForm.guests.children - 1} remaining)
                        </small>
                        
                        {bookingForm.additionalGuests.map((guest, index) => (
                          <div key={index} className="border rounded p-3 mb-3">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                              <h6 className="mb-0">
                                <i className={`fas ${guest.type === 'adult' ? 'fa-user' : 'fa-child'} me-2`}></i>
                                {guest.type === 'adult' ? 'Adult' : 'Child'} {index + 1}
                              </h6>
                              <button
                                type="button"
                                className="btn btn-outline-danger btn-sm"
                                onClick={() => removeGuest(index)}
                              >
                                <i className="fas fa-trash"></i>
                              </button>
                            </div>
                            
                            <div className="row mb-3">
                              <div className="col-6">
                                <label className="form-label">First Name</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  value={guest.firstName}
                                  onChange={(e) => updateGuestDetails(index, 'firstName', e.target.value)}
                                  required
                                />
                              </div>
                              <div className="col-6">
                                <label className="form-label">Last Name</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  value={guest.lastName}
                                  onChange={(e) => updateGuestDetails(index, 'lastName', e.target.value)}
                                  required
                                />
                              </div>
                            </div>
                            
                            <div className="row mb-3">
                              {guest.type === 'child' && (
                                <div className="col-6">
                                  <label className="form-label">Age</label>
                                  <input
                                    type="number"
                                    className="form-control"
                                    min="0"
                                    max="17"
                                    value={guest.age || ''}
                                    onChange={(e) => updateGuestDetails(index, 'age', parseInt(e.target.value))}
                                    required
                                  />
                                </div>
                              )}
                              <div className={guest.type === 'child' ? 'col-6' : 'col-12'}>
                                <label className="form-label">Room Assignment</label>
                                <select
                                  className="form-select"
                                  value={guest.roomAssignment}
                                  onChange={(e) => updateGuestDetails(index, 'roomAssignment', parseInt(e.target.value))}
                                  required
                                >
                                  {Array.from({ length: bookingForm.guests.rooms }, (_, i) => (
                                    <option key={i + 1} value={i + 1}>Room {i + 1}</option>
                                  ))}
                                </select>
                              </div>
                            </div>
                            
                            {guest.type === 'adult' && (
                              <div className="row mb-3">
                                <div className="col-6">
                                  <label className="form-label">Phone (Optional)</label>
                                  <input
                                    type="tel"
                                    className="form-control"
                                    value={guest.phone || ''}
                                    onChange={(e) => updateGuestDetails(index, 'phone', e.target.value)}
                                  />
                                </div>
                                <div className="col-6">
                                  <label className="form-label">Email (Optional)</label>
                                  <input
                                    type="email"
                                    className="form-control"
                                    value={guest.email || ''}
                                    onChange={(e) => updateGuestDetails(index, 'email', e.target.value)}
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                        
                        {/* Add Guest Section */}
                        <div className="border rounded p-3 mb-3 bg-light">
                          <h6 className="mb-3">
                            <i className="fas fa-plus-circle me-2"></i>
                            Add More Guests
                          </h6>
                          <div className="d-grid gap-2">
                            <button
                              type="button"
                              className="btn btn-outline-primary"
                              onClick={() => addGuest('adult')}
                            >
                              <i className="fas fa-user me-2"></i>
                              Add Adult
                            </button>
                            <button
                              type="button"
                              className="btn btn-outline-success"
                              onClick={() => addGuest('child')}
                            >
                              <i className="fas fa-child me-2"></i>
                              Add Child
                            </button>
                          </div>
                        </div>
                        
                        <div className="d-grid gap-2">
                          <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => setBookingSection(2)}
                          >
                            <i className="fas fa-arrow-left me-2"></i>
                            Back to Primary Guest
                          </button>
                          <button
                            type="button"
                            className="btn btn-primary"
                            onClick={() => setBookingSection(4)}
                          >
                            Continue to Confirmation
                            <i className="fas fa-arrow-right ms-2"></i>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Confirmation Section */}
                    {bookingSection === 4 && (
                      <form onSubmit={handleBookingSubmit}>
                        <h6>Booking Confirmation</h6>
                        
                        <div className="mb-3">
                          <label className="form-label">Special Requests</label>
                          <textarea
                            className="form-control"
                            rows={3}
                            value={bookingForm.specialRequests}
                            onChange={(e) => setBookingForm(prev => ({ ...prev, specialRequests: e.target.value }))}
                            placeholder="Any special requests or preferences..."
                          />
                        </div>
                        
                        {/* Guest Summary */}
                        <div className="border rounded p-3 mb-3">
                          <h6>Guest Summary</h6>
                          <div className="mb-2">
                            <strong>Primary Guest:</strong> {bookingForm.primaryGuest.firstName} {bookingForm.primaryGuest.lastName}
                            <br />
                            <small className="text-muted">{bookingForm.primaryGuest.email} • {bookingForm.primaryGuest.phone}</small>
                          </div>
                          {bookingForm.additionalGuests.length > 0 && (
                            <div>
                              <strong>Additional Guests:</strong>
                              {bookingForm.additionalGuests.map((guest, index) => (
                                <div key={index} className="ms-3 mt-1">
                                  <small>
                                    {guest.firstName} {guest.lastName} 
                                    {guest.type === 'child' && ` (Age: ${guest.age})`}
                                    - Room {guest.roomAssignment}
                                  </small>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        
                        {/* Booking Summary */}
                        <div className="border-top pt-3 mb-3">
                          <h6>Booking Summary</h6>
                          <div className="d-flex justify-content-between">
                            <span>Room Type:</span>
                            <span>{hotel.roomTypes.find(r => r.id === bookingForm.selectedRoom)?.name}</span>
                          </div>
                          <div className="d-flex justify-content-between">
                            <span>Dates:</span>
                            <span>{bookingForm.checkInDate} - {bookingForm.checkOutDate}</span>
                          </div>
                          <div className="d-flex justify-content-between">
                            <span>Nights:</span>
                            <span>{calculateNights()}</span>
                          </div>
                          <div className="d-flex justify-content-between">
                            <span>Guests:</span>
                            <span>{bookingForm.guests.adults} adults, {bookingForm.guests.children} children</span>
                          </div>
                          <div className="d-flex justify-content-between">
                            <span>Rooms:</span>
                            <span>{bookingForm.guests.rooms}</span>
                          </div>
                          <hr />
                          <div className="d-flex justify-content-between fw-bold">
                            <span>Total:</span>
                            <span>
                              {hotel.roomTypes.find(r => r.id === bookingForm.selectedRoom)?.price.currency} {
                                (hotel.roomTypes.find(r => r.id === bookingForm.selectedRoom)?.price.current || 0) * calculateNights()
                              }
                            </span>
                          </div>
                        </div>
                        
                        <div className="d-grid gap-2">
                          <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => setBookingSection(bookingForm.additionalGuests.length > 0 ? 3 : 2)}
                          >
                            <i className="fas fa-arrow-left me-2"></i>
                            Back to {bookingForm.additionalGuests.length > 0 ? 'Additional Guests' : 'Primary Guest'}
                          </button>
                          <button type="submit" className="btn btn-success">
                            <i className="fas fa-check me-2"></i>
                            Confirm & Reserve Hotel
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

              
    </>
  );
} 