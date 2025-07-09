'use client';

import React, { useEffect, useRef } from 'react';
import Image from 'next/image';

interface Flight {
  id: string;
  flightNumber: string;
  origin: string;
  destination: string;
  airline: string;
  airlineIcon: string;
  stops: string;
  departureDate: string;
  returnDate: string;
  price: number;
  currency: string;
  image: string;
  badge: {
    type: 'trending' | 'hot';
    text: string;
  };
}

const FeaturedFlights: React.FC = () => {
  const carouselRef = useRef<HTMLDivElement>(null);

  const flights: Flight[] = [
    {
      id: '1',
      flightNumber: 'AstraFlight 215',
      origin: 'Toronto',
      destination: 'Bangkok',
      airline: 'Air India',
      airlineIcon: '/images/airindia.svg',
      stops: 'stops at Frankfurt',
      departureDate: 'Sep 04, 2024',
      returnDate: 'Sep 07, 2024',
      price: 300,
      currency: 'AED',
      image: '/images/home/600x400-2.jpg',
      badge: {
        type: 'trending',
        text: 'Trending'
      }
    },
    {
      id: '2',
      flightNumber: 'AstraFlight 215',
      origin: 'Chicago',
      destination: 'Melbourne',
      airline: 'Air India',
      airlineIcon: '/images/airindia.svg',
      stops: '1-stop at Dallas',
      departureDate: 'Sep 11, 2024',
      returnDate: 'Sep 13, 2024',
      price: 550,
      currency: 'AED',
      image: '/images/home/600x400-1.jpg',
      badge: {
        type: 'hot',
        text: 'Hot'
      }
    },
    {
      id: '3',
      flightNumber: 'AstraFlight 215',
      origin: 'Toronto',
      destination: 'Bangkok',
      airline: 'Air India',
      airlineIcon: '/images/airindia.svg',
      stops: 'stops at Frankfurt',
      departureDate: 'Sep 04, 2024',
      returnDate: 'Sep 07, 2024',
      price: 300,
      currency: 'AED',
      image: '/images/home/600x400-2.jpg',
      badge: {
        type: 'trending',
        text: 'Trending'
      }
    },
    {
      id: '4',
      flightNumber: 'AstraFlight 215',
      origin: 'Chicago',
      destination: 'Melbourne',
      airline: 'Air India',
      airlineIcon: '/images/airindia.svg',
      stops: '1-stop at Dallas',
      departureDate: 'Sep 11, 2024',
      returnDate: 'Sep 13, 2024',
      price: 550,
      currency: 'AED',
      image: '/images/home/600x400-1.jpg',
      badge: {
        type: 'hot',
        text: 'Hot'
      }
    }
  ];

  useEffect(() => {
    // Initialize Owl Carousel if available
    if (typeof window !== 'undefined' && (window as any).$ && (window as any).$.fn.owlCarousel) {
      const $ = (window as any).$;
      const carousel = $(carouselRef.current);
      
      carousel.owlCarousel({
        loop: true,
        margin: 30,
        nav: true,
        dots: false,
        navText: ['<i class="fa fa-chevron-left"></i>', '<i class="fa fa-chevron-right"></i>'],
        responsive: {
          0: {
            items: 1
          },
          600: {
            items: 2
          },
          1000: {
            items: 3
          }
        }
      });
    }
  }, []);

  const handleBookNow = (flight: Flight) => {
    console.log('Book now clicked for:', flight.flightNumber);
    // Navigate to booking page or flight details
  };

  return (
    <section className="section place-section bg-white" style={{ padding: '20px 0px' }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-xl-10 col-lg-10 text-center wow fadeInUp" data-wow-delay="0.2s">
            <div className="section-header mb-4 text-center">
              <h2 className="mb-2">
                Discover The World Like <span className="text-primary text-decoration-underline">Never Before</span>
              </h2>
              <p className="sub-title">Here are some famous tourist places around the world</p>
            </div>
          </div>
        </div>
        <div className="tab-content">
          <div className="tab-pane fade active show" id="flight-list">
            <div className="owl-carousel place-slider nav-center" ref={carouselRef}>
              {flights.map((flight) => (
                <div key={flight.id} className="place-item mb-4">
                  <div className="place-img">
                    <a href="#!" onClick={(e) => e.preventDefault()}>
                      <Image
                        src={flight.image}
                        alt={flight.flightNumber}
                        width={600}
                        height={400}
                        className="img-fluid"
                        style={{ objectFit: 'cover', height: '250px' }}
                      />
                    </a>
                    <div className="fav-item">
                      <span className={`badge ${flight.badge.type === 'trending' ? 'bg-info' : 'bg-danger'} d-inline-flex align-items-center`}>
                        <i className={`isax ${flight.badge.type === 'trending' ? 'isax-ranking' : 'isax-tag'} me-1`}></i>
                        {flight.badge.text}
                      </span>
                    </div>
                  </div>
                  <div className="place-content">
                    <div className="flight-loc d-flex align-items-center justify-content-between mb-2">
                      <span className="loc-name d-inline-flex align-items-center">
                        <i className="isax isax-airplane rotate-45 me-2"></i>
                        {flight.origin}
                      </span>
                      <span className="arrow-icon">
                        <i className="isax isax-arrow-2"></i>
                      </span>
                      <span className="loc-name d-inline-flex align-items-center">
                        <i className="isax isax-airplane rotate-135 me-2"></i>
                        {flight.destination}
                      </span>
                    </div>
                    <h5 className="text-truncate mb-1">
                      <a href="#!" onClick={(e) => e.preventDefault()}>
                        {flight.flightNumber}
                      </a>
                    </h5>
                    <div className="d-flex align-items-center mb-2">
                      <span className="avatar avatar-sm me-2">
                        <Image
                          src={flight.airlineIcon}
                          alt={flight.airline}
                          width={32}
                          height={32}
                          className="rounded-circle"
                        />
                      </span>
                      <p className="fs-14 mb-0">{flight.stops}</p>
                    </div>
                    <div className="date-info p-2 mb-3">
                      <p className="d-flex align-items-center">
                        <i className="isax isax-calendar-2 me-2"></i>
                        {flight.departureDate} - {flight.returnDate}
                      </p>
                    </div>
                    <div className="d-flex align-items-center justify-content-between border-top pt-3">
                      <h6 className="text-primary">
                        <span className="fs-14 fw-normal text-default">From </span>
                        {flight.currency} {flight.price}
                      </h6>
                      <div className="d-flex align-items-center">
                        <button
                          className="btn btn-outline-success btn-sm"
                          onClick={() => handleBookNow(flight)}
                        >
                          Book Now
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="text-center view-all wow fadeInUp">
            <a href="/flights-list" className="btn btn-dark">
              View All<i className="isax isax-arrow-right-3 ms-2"></i>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedFlights; 