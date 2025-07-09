'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

const DestinationsSection = () => {
  const [activeTab, setActiveTab] = useState('Hotels-list');

  const hotels = [
    {
      image: '/images/home/600x400-3.jpg',
      badge: { type: 'info', icon: 'isax-ranking', text: 'Trending' },
      title: 'Athen Hotel Plaza',
      location: 'Barcelona',
      facilities: ['wifi', 'scissor', 'profile-2user', 'wind-2'],
      price: 500
    },
    {
      image: '/images/home/600x400-4.jpg',
      badge: { type: 'danger', icon: 'isax-tag', text: 'Hot' },
      title: 'A Luxury Hotel',
      location: 'New York',
      facilities: ['wifi', 'scissor', 'personalcard'],
      price: 500
    }
  ];

  const flights = [
    {
      image: '/images/home/600x400-2.jpg',
      badge: { type: 'info', icon: 'isax-ranking', text: 'Trending' },
      from: 'Toronto',
      to: 'Bangkok',
      airline: '/images/airindia.svg',
      stops: 'stops at Frankfurt',
      dates: 'Sep 04, 2024 - Sep 07, 2024',
      price: 300
    },
    {
      image: '/images/home/600x400-1.jpg',
      badge: { type: 'danger', icon: 'isax-tag', text: 'Hot' },
      from: 'Chicago',
      to: 'Melbourne',
      airline: '/images/airindia.svg',
      stops: '1-stop at Dallas',
      dates: 'Sep 11, 2024 - Sep 13, 2024',
      price: 550
    }
  ];

  const cars = [
    {
      image: '/images/home/600x400-5.jpg',
      badge: { type: 'info', icon: 'isax-ranking', text: 'Trending' },
      type: 'Sedan',
      title: 'Toyota Camry SE 400',
      location: 'Ciutat Vella, Barcelona',
      specs: {
        fuel: 'Hybrid',
        gear: 'Manual',
        traveled: '14,000 KM'
      },
      price: 500
    },
    {
      image: '/images/home/600x400-6.jpg',
      badge: { type: 'danger', icon: 'isax-tag', text: 'Hot' },
      type: 'Sedan',
      title: 'Ford Mustang 4.0 AT',
      location: 'Oxford Street, London',
      specs: {
        fuel: 'Hybrid',
        gear: 'Auto',
        traveled: '12,000 KM'
      },
      price: 600
    }
  ];

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
  };

  // Initialize Owl Carousel when component mounts
  useEffect(() => {
    const initCarousel = () => {
      if (typeof window !== 'undefined' && window.$ && window.$.fn.owlCarousel) {
        const $carousel = window.$(".place-slider");
        
        // Destroy existing carousel if it exists
        if ($carousel.hasClass('owl-loaded')) {
          $carousel.trigger('destroy.owl.carousel').removeClass('owl-loaded');
        }
        
        // Initialize new carousel
        $carousel.owlCarousel({
          loop: true,
          margin: 24,
          nav: true,
          dots: false,
          autoplay: true,
          autoplayTimeout: 5000,
          autoplayHoverPause: true,
          navText: [
            '<i class="fas fa-chevron-left"></i>',
            '<i class="fas fa-chevron-right"></i>'
          ],
          responsive: {
            0: {
              items: 1
            },
            576: {
              items: 2
            },
            768: {
              items: 2
            },
            992: {
              items: 3
            }
          }
        });
      }
    };

    // Initialize carousel immediately if DOM is ready
    if (document.readyState === 'complete') {
      setTimeout(initCarousel, 100);
    } else {
      // Wait for window load event
      window.addEventListener('load', () => {
        setTimeout(initCarousel, 100);
      });
    }

    // Also initialize when tab changes
    setTimeout(initCarousel, 200);

    // Cleanup function
    return () => {
      if (typeof window !== 'undefined' && window.$) {
        try {
          const $carousel = window.$(".place-slider");
          if ($carousel.hasClass('owl-loaded')) {
            $carousel.trigger('destroy.owl.carousel').removeClass('owl-loaded');
          }
        } catch (error) {
          console.warn('Error during carousel cleanup:', error);
        }
      }
    };
  }, [activeTab]); // Re-initialize when activeTab changes

  return (
    <section className="section place-section bg-white" style={{padding: "20px 0px"}}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-xl-10 col-lg-10 text-center wow fadeInUp" data-wow-delay="0.2s">
            <div className="section-header mb-4 text-center">
              <h2 className="mb-2">Discover The World Like <span className="text-primary text-decoration-underline">Never Before</span></h2>
              <p className="sub-title">Here are some famous tourist places around the world</p>
            </div>
          </div>
        </div>
        <div className="place-nav">
          <ul className="nav justify-content-center">
            <li>
              <button 
                className={`nav-link ${activeTab === 'flight-list' ? 'active' : ''}`}
                onClick={() => handleTabClick('flight-list')}
                type="button"
              >
                Flights
              </button>
            </li>
            <li>
              <button 
                className={`nav-link ${activeTab === 'Hotels-list' ? 'active' : ''}`}
                onClick={() => handleTabClick('Hotels-list')}
                type="button"
              >
                Hotels
              </button>
            </li>
          </ul>
        </div>
        <div className="tab-content">
          <div className={`tab-pane fade ${activeTab === 'flight-list' ? 'active show' : ''}`} id="flight-list">
            <div className="owl-carousel place-slider nav-center">
              {flights.map((flight, index) => (
                <div key={index} className="place-item mb-4">
                  <div className="place-img">
                    <a href="#!">
                      <Image src={flight.image} alt={flight.from} width={600} height={400} className="img-fluid" />
                    </a>
                    <div className="fav-item">
                      <span className={`badge bg-${flight.badge.type} d-inline-flex align-items-center`}>
                        <i className={`isax ${flight.badge.icon} me-1`}></i>{flight.badge.text}
                      </span>
                    </div>
                  </div>
                  <div className="place-content">
                    <div className="flight-loc d-flex align-items-center justify-content-between mb-2">
                      <span className="loc-name d-inline-flex align-items-center">
                        <i className="isax isax-airplane rotate-45 me-2"></i>{flight.from}
                      </span>
                      <span className="arrow-icon"><i className="isax isax-arrow-2"></i></span>
                      <span className="loc-name d-inline-flex align-items-center">
                        <i className="isax isax-airplane rotate-135 me-2"></i>{flight.to}
                      </span>
                    </div>
                    <div className="d-flex align-items-center mb-2">
                      <span className="avatar avatar-sm me-2">
                        <Image src={flight.airline} alt="airline" width={24} height={24} className="rounded-circle" />
                      </span>
                      <p className="fs-14 mb-0">{flight.stops}</p>
                    </div>
                    <div className="date-info p-2 mb-3">
                      <p className="d-flex align-items-center">
                        <i className="isax isax-calendar-2 me-2"></i>{flight.dates}
                      </p>
                    </div>
                    <div className="d-flex align-items-center justify-content-between border-top pt-3">
                      <h6 className="text-primary">
                        <span className="fs-14 fw-normal text-default">From </span>AED {flight.price}
                      </h6>
                      <div className="d-flex align-items-center">
                        <a href="#!">
                          <span className="badge bg-outline-success fs-10 fw-medium p-2 me-2">Book Now</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={`tab-pane fade ${activeTab === 'Hotels-list' ? 'active show' : ''}`} id="Hotels-list">
            <div className="owl-carousel place-slider nav-center">
              {hotels.map((hotel, index) => (
                <div key={index} className="place-item mb-4">
                  <div className="place-img">
                    <a href={`/hotel-details/${index + 1}?checkinDate=${new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}&checkoutDate=${new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}&adults=1&children=0&rooms=1`}>
                      <Image src={hotel.image} alt={hotel.title} width={600} height={400} className="img-fluid" />
                    </a>
                    <div className="fav-item">
                      <span className={`badge bg-${hotel.badge.type} d-inline-flex align-items-center`}>
                        <i className={`isax ${hotel.badge.icon} me-1`}></i>{hotel.badge.text}
                      </span>
                    </div>
                  </div>
                  <div className="place-content">
                    <h5 className="mb-1"><a href={`/hotel-details/${index + 1}?checkinDate=${new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}&checkoutDate=${new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}&adults=1&children=0&rooms=1`}>{hotel.title}</a></h5>
                    <p className="d-flex align-items-center mb-2">
                      <i className="isax isax-location5 me-2"></i>{hotel.location}
                    </p>
                    <div className="border-top pt-2 mb-2">
                      <h6 className="d-flex align-items-center">
                        Facilities :
                        {hotel.facilities.map((facility, i) => (
                          <i key={i} className={`isax isax-${facility} me-2 text-primary`}></i>
                        ))}
                        {hotel.facilities.length > 3 && (
                          <a href="#!" className="fs-14 fw-normal text-default d-inline-block">+2</a>
                        )}
                      </h6>
                    </div>
                    <div className="d-flex align-items-center justify-content-between border-top pt-3">
                      <h5 className="text-primary">
                        AED {hotel.price} <span className="fs-14 fw-normal text-default">/ Night</span>
                      </h5>
                      <div className="d-flex align-items-center">
                        <a href="#!">
                          <span className="badge bg-outline-success fs-10 fw-medium p-2 me-2">Book Now</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          
        </div>
      </div>
    </section>
  );
};

export default DestinationsSection; 