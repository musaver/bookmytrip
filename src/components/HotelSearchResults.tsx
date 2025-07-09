'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

interface Hotel {
    id: string; // Changed from number to string
    name: string;
    location: string;
    rating: number;
    reviewCount?: number; // Made optional since we're not using it
    reviewScore: string;
    image: string;
    amenities: string[];
    roomType: string;
    lastBooked: string;
    originalPrice: number;
    currentPrice: number;
    currency: string;
    specialOffer: string;
    discount: string;
    propertyType?: string; // Added propertyType
}

interface HotelSearchResultsProps {
    hotels?: Hotel[];
    totalResults?: number;
    loading?: boolean;
    onSortChange?: (sortBy: string) => void;
}

const HotelSearchResults: React.FC<HotelSearchResultsProps> = ({ 
    hotels = [],
    totalResults = 0,
    loading = false,
    onSortChange
}) => {
    const searchParams = useSearchParams();
    const [sortBy, setSortBy] = useState<string>('recommended');
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [itemsPerPage] = useState<number>(20); // Increased from 10 to 20

    // Get search parameters for hotel details URL
    const getHotelDetailsUrl = (hotelId: string) => { // Changed parameter type to string
        const checkinDate = searchParams.get('checkinDate') || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const checkoutDate = searchParams.get('checkoutDate') || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const adults = searchParams.get('adults') || '1';
        const children = searchParams.get('children') || '0';
        const rooms = searchParams.get('rooms') || '1';
        
        return `/hotel-details/${hotelId}?checkinDate=${checkinDate}&checkoutDate=${checkoutDate}&adults=${adults}&children=${children}&rooms=${rooms}`;
    };

    // Calculate pagination
    const totalPages = Math.ceil(hotels.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentHotels = hotels.slice(startIndex, endIndex);

    // Reset to first page when hotels change
    useEffect(() => {
        setCurrentPage(1);
    }, [hotels]);

    const handleSortChange = (sortType: string) => {
        setSortBy(sortType);
        setCurrentPage(1); // Reset to first page when sorting changes
        if (onSortChange) {
            onSortChange(sortType);
        }
    };

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
            // Scroll to top of results
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const renderStars = (rating: number) => {
        return Array.from({ length: 5 }, (_, index) => (
            <i
                key={index}
                className={`fas fa-star ${index < rating ? 'filled text-primary' : ''} me-1`}
            />
        ));
    };

    const sortOptions = [
        { value: 'recommended', label: 'Recommended' },
        { value: 'price-low', label: 'Price: low to high' },
        { value: 'price-high', label: 'Price: high to low' },
        { value: 'newest', label: 'Newest' },
        { value: 'ratings', label: 'Ratings' },
        { value: 'reviews', label: 'Reviews' }
    ];

    // Generate page numbers for pagination
    const generatePageNumbers = () => {
        const pages = [];
        const maxVisiblePages = 5;
        
        if (totalPages <= maxVisiblePages) {
            // Show all pages if total pages is less than max visible
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Show pages around current page
            const startPage = Math.max(1, currentPage - 2);
            const endPage = Math.min(totalPages, currentPage + 2);
            
            if (startPage > 1) {
                pages.push(1);
                if (startPage > 2) pages.push('...');
            }
            
            for (let i = startPage; i <= endPage; i++) {
                pages.push(i);
            }
            
            if (endPage < totalPages) {
                if (endPage < totalPages - 1) pages.push('...');
                pages.push(totalPages);
            }
        }
        
        return pages;
    };

    const pageNumbers = generatePageNumbers();

    return (
        <div className="col-md-9">
            {/* Header with Results Count and Sort */}
            <div className="d-flex align-items-center justify-content-between flex-wrap">
                <h6 className="mb-3">
                    Showing {startIndex + 1}-{Math.min(endIndex, hotels.length)} of {hotels.length} Search Results
                    {totalResults > hotels.length && (
                        <span className="text-muted"> (Total: {totalResults})</span>
                    )}
                </h6>
                <div className="d-flex align-items-center flex-wrap">
                    <div className="dropdown mb-3">
                        <a 
                            href="#" 
                            className="dropdown-toggle py-2" 
                            data-bs-toggle="dropdown"
                            aria-expanded="false"
                            onClick={(e) => e.preventDefault()}
                        >
                            <span className="fw-medium text-gray-9">Sort By : </span>
                            {sortOptions.find(option => option.value === sortBy)?.label || 'Recommended'}
                        </a>
                        <div className="dropdown-menu dropdown-sm">
                            <form action="#!">
                                <h6 className="fw-medium fs-16 mb-3">Sort By</h6>
                                {sortOptions.map((option, index) => (
                                    <div key={option.value} className="form-check d-flex align-items-center ps-0 mb-2">
                                        <input 
                                            className="form-check-input ms-0 mt-0" 
                                            name="sortBy" 
                                            type="radio" 
                                            id={`sort${index + 1}`}
                                            checked={sortBy === option.value}
                                            onChange={() => handleSortChange(option.value)}
                                        />
                                        <label className="form-check-label ms-2" htmlFor={`sort${index + 1}`}>
                                            {option.label}
                                        </label>
                                    </div>
                                ))}
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            {/* Hotel Listings */}
            <div className="hotel-list hotel-content">
                <div className="row justify-content-center">
                    <div className="col-md-12">
                        {loading ? (
                            <div className="text-center py-5">
                                <div className="spinner-border text-primary" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                                <p className="mt-3">Searching for hotels...</p>
                            </div>
                        ) : currentHotels.length > 0 ? (
                            currentHotels.map((hotel) => (
                            <div key={hotel.id} className="place-item mb-4">
                                <div className="place-img">
                                    <Link href={getHotelDetailsUrl(hotel.id)}>
                                        <Image 
                                            src={hotel.image} 
                                            className="img-fluid" 
                                            alt={hotel.name}
                                            width={600}
                                            height={400}
                                        />
                                    </Link>
                                    {/* Add property type badge */}
                                    {hotel.propertyType && (
                                        <div className="fav-item">
                                            <span className="badge bg-info d-inline-flex align-items-center">
                                                <i className="isax isax-building-3 me-1"></i>
                                                {hotel.propertyType}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <div className="place-content pb-1" style={{ padding: '0', paddingLeft: '20px' }}>
                                    {/* Hotel Header */}
                                    <div className="d-flex" style={{ justifyContent: 'space-between' }}>
                                        <div className="box">
                                            <label className="form-check-label" htmlFor={`review${hotel.id}`}>
                                                <span className="rating d-flex align-items-center">
                                                    {renderStars(hotel.rating)}
                                                </span>
                                            </label>
                                            <h5 className="mt-2 mb-2 text-truncate fs-15">
                                                <Link href={getHotelDetailsUrl(hotel.id)}>{hotel.name}</Link>
                                            </h5>
                                            <p className="mt-2 mb-2 text-truncate fs-10">{hotel.location}</p>
                                            <h5 className="mt-2 mb-2 text-truncate fs-10">
                                                <Link href="#" onClick={(e) => e.preventDefault()}>Show Map</Link>
                                            </h5>
                                        </div>
                                        <div className="box">
                                            <label className="form-check-label" htmlFor={`review${hotel.id}`}>
                                                <div className="d-flex">
                                                    <div className="d-flex flex-column">
                                                        <h5 className="fs-14">{hotel.reviewScore}</h5>
                                                    </div>
                                                    <span 
                                                        className="badge badge-warning badge-xs text-gray-9 fs-13 fw-medium"
                                                        style={{ 
                                                            lineHeight: 'normal', 
                                                            display: 'flex', 
                                                            alignItems: 'center', 
                                                            height: '27px', 
                                                            marginLeft: '8px' 
                                                        }}
                                                    >
                                                        {hotel.rating}.0
                                                    </span>
                                                </div>
                                            </label>
                                        </div>
                                    </div>

                                    {/* Amenities */}
                                    <div className="d-flex flex-wrap" style={{ justifyContent: 'start', gap: '10px', marginBottom: '10px' }}>
                                        {hotel.amenities.slice(0, 6).map((amenity, index) => (
                                            <p 
                                                key={index}
                                                style={{ 
                                                    padding: '7px', 
                                                    border: '1px solid #f5f5f5', 
                                                    borderRadius: '5px', 
                                                    fontSize: '11px' 
                                                }}
                                            >
                                                {amenity}
                                            </p>
                                        ))}
                                        {hotel.amenities.length > 6 && (
                                            <p 
                                                style={{ 
                                                    padding: '7px', 
                                                    border: '1px solid #f5f5f5', 
                                                    borderRadius: '5px', 
                                                    fontSize: '11px',
                                                    color: '#666'
                                                }}
                                            >
                                                +{hotel.amenities.length - 6} more
                                            </p>
                                        )}
                                    </div>

                                    {/* Room Type and Price */}
                                    <div className="d-flex" style={{ justifyContent: 'space-between' }}>
                                        <div className="box" style={{ marginTop: '-8px' }}>
                                            <h5 className="mt-1 text-truncate fs-15">
                                                <Link href="#" onClick={(e) => e.preventDefault()}>{hotel.roomType}</Link>
                                            </h5>
                                            <p className="mb-2 text-truncate fs-10">Last booked {hotel.lastBooked}</p>
                                        </div>
                                        <div className="box d-flex gap-3">
                                            <h5 className="text-default fs-15">
                                                <del>{hotel.currency} {hotel.originalPrice.toLocaleString()}</del>
                                            </h5>
                                            <h6 className="text-primary fs-20">
                                                {hotel.currency} {hotel.currentPrice.toLocaleString()}
                                            </h6>
                                        </div>
                                    </div>

                                    {/* Special Offers and Action */}
                                    <div className="d-flex mt-2" style={{ justifyContent: 'space-between' }}>
                                        <div className="box" style={{ marginTop: '-8px' }}>
                                            <h5 
                                                className="text-truncate fs-10"
                                                style={{ 
                                                    padding: '5px', 
                                                    background: '#00f8ffcc', 
                                                    borderRadius: '4px', 
                                                    marginTop: '10px', 
                                                    width: 'max-content' 
                                                }}
                                            >
                                                <Link href="#" onClick={(e) => e.preventDefault()} style={{ color: '#008062' }}>
                                                    {hotel.specialOffer}
                                                </Link>
                                            </h5>
                                            <p className="mb-2 text-truncate fs-10">{hotel.discount}</p>
                                        </div>
                                        <div className="box d-flex gap-3">
                                            <Link href={getHotelDetailsUrl(hotel.id)}>
                                                <button className="btn btn-primary rounded-0">
                                                    See Availability
                                                </button>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            ))
                        ) : (
                            <div className="text-center py-5">
                                <h5>No hotels found</h5>
                                <p>Try adjusting your search criteria or search for a different location.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <nav className="pagination-nav">
                    <ul className="pagination justify-content-center">
                        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                            <a 
                                className="page-link" 
                                href="#" 
                                aria-label="Previous"
                                onClick={(e) => {
                                    e.preventDefault();
                                    handlePageChange(currentPage - 1);
                                }}
                            >
                                <span aria-hidden="true">
                                    <i className="fa-solid fa-chevron-left"></i>
                                </span>
                            </a>
                        </li>
                        {pageNumbers.map((page, index) => (
                            <li key={index} className={`page-item ${page === currentPage ? 'active' : ''} ${page === '...' ? 'disabled' : ''}`}>
                                <a 
                                    className="page-link" 
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        if (typeof page === 'number') handlePageChange(page);
                                    }}
                                >
                                    {page}
                                </a>
                            </li>
                        ))}
                        <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                            <a 
                                className="page-link" 
                                href="#" 
                                aria-label="Next"
                                onClick={(e) => {
                                    e.preventDefault();
                                    handlePageChange(currentPage + 1);
                                }}
                            >
                                <span aria-hidden="true">
                                    <i className="fa-solid fa-chevron-right"></i>
                                </span>
                            </a>
                        </li>
                    </ul>
                    <div className="text-center mt-3">
                        <small className="text-muted">
                            Page {currentPage} of {totalPages} ({hotels.length} total results)
                        </small>
                    </div>
                </nav>
            )}
        </div>
    );
};

export default HotelSearchResults; 