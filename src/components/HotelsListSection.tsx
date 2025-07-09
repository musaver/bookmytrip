'use client';

import React, { useEffect } from 'react';

// Declare the global jQuery interface
declare global {
  interface Window {
    $: any;
    jQuery: any;
  }
}

interface Hotel {
  id: number;
  name: string;
  location: string;
  image: string;
  price: string;
  badge: {
    text: string;
    type: 'info' | 'danger';
  };
  facilities: string[];
}

const HotelsListSection: React.FC = () => {
  const hotels: Hotel[] = [
    {
      id: 1,
      name: 'Athen Hotel Plaza',
      location: 'Barcelona',
      image: '/images/home/600x400-3.jpg',
      price: 'AED 500',
      badge: { text: 'Trending', type: 'info' },
      facilities: ['wifi', 'scissor', 'profile-2user', 'wind-2']
    },
    {
      id: 2,
      name: 'A Luxury Hotel',
      location: 'New York',
      image: '/images/home/600x400-4.jpg',
      price: 'AED 500',
      badge: { text: 'Hot', type: 'danger' },
      facilities: ['wifi', 'scissor', 'personalcard']
    },
    {
      id: 3,
      name: 'Athen Hotel Plaza',
      location: 'Barcelona',
      image: '/images/home/600x400-3.jpg',
      price: 'AED 500',
      badge: { text: 'Trending', type: 'info' },
      facilities: ['wifi', 'scissor', 'profile-2user', 'wind-2']
    },
    {
      id: 4,
      name: 'A Luxury Hotel',
      location: 'Downtown, New York',
      image: '/images/home/600x400-4.jpg',
      price: 'AED 500',
      badge: { text: 'Hot', type: 'danger' },
      facilities: ['wifi', 'scissor', 'personalcard']
    }
  ];

  useEffect(() => {
    const initCarousel = () => {
      if (typeof window !== 'undefined' && window.$ && window.$.fn.owlCarousel) {
        const $carousel = window.$('.hotels-list-slider');
        if ($carousel.length > 0 && !$carousel.hasClass('owl-loaded')) {
          $carousel.owlCarousel({
            loop: true,
            margin: 30,
            nav: true,
            dots: false,
            autoplay: true,
            autoplayTimeout: 3000,
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
                items: 3
              },
              992: {
                items: 3
              }
            }
          });
        }
      }
    };

    if (document.readyState === 'complete') {
      initCarousel();
    } else {
      window.addEventListener('load', initCarousel);
    }

    return () => {
      window.removeEventListener('load', initCarousel);
    };
  }, []);

  return (
    <section className="section place-section bg-white" style={{ padding: '20px 0px' }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-xl-10 col-lg-10 text-center wow fadeInUp" data-wow-delay="0.2s">
            <div className="section-header mb-4 text-center">
              <h2 className="mb-2">
                Discover The World Like{' '}
                <span className="text-primary text-decoration-underline">Never Before</span>
              </h2>
              <p className="sub-title">Here are some famous tourist places around the world</p>
            </div>
          </div>
        </div>
        <div className="tab-content">
          <div className="tab-pane fade active show" id="Hotels-list">
            <div className="owl-carousel hotels-list-slider nav-center">
              {hotels.map((hotel) => (
                <div key={hotel.id} className="place-item mb-4">
                  <div className="place-img">
                    <a href={`/hotel-details/${hotel.id}?checkinDate=${new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}&checkoutDate=${new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}&adults=1&children=0&rooms=1`}>
                      <img src={hotel.image} className="img-fluid" alt="img" />
                    </a>
                    <div className="fav-item">
                      <span className={`badge bg-${hotel.badge.type} d-inline-flex align-items-center`}>
                        <i className={`isax isax-${hotel.badge.type === 'info' ? 'ranking' : 'tag'} me-1`}></i>
                        {hotel.badge.text}
                      </span>
                    </div>
                  </div>
                  <div className="place-content">
                    <h5 className="mb-1">
                      <a href={`/hotel-details/${hotel.id}?checkinDate=${new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}&checkoutDate=${new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}&adults=1&children=0&rooms=1`}>{hotel.name}</a>
                    </h5>
                    <p className="d-flex align-items-center mb-2">
                      <i className="isax isax-location5 me-2"></i>
                      {hotel.location}
                    </p>
                    <div className="border-top pt-2 mb-2">
                      <h6 className="d-flex align-items-center">
                        Facilities:
                        {hotel.facilities.map((facility, index) => (
                          <i key={index} className={`isax isax-${facility} ms-2 me-2 text-primary`}></i>
                        ))}
                        {hotel.facilities.length > 3 && (
                          <a href="javascript:void(0);" className="fs-14 fw-normal text-default d-inline-block">
                            +{hotel.facilities.length - 3}
                          </a>
                        )}
                      </h6>
                    </div>
                    <div className="d-flex align-items-center justify-content-between border-top pt-3">
                      <h5 className="text-primary">
                        {hotel.price}{' '}
                        <span className="fs-14 fw-normal text-default">/ Night</span>
                      </h5>
                      <div className="d-flex align-items-center">
                        <a href={`/hotel-details/${hotel.id}?checkinDate=${new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}&checkoutDate=${new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}&adults=1&children=0&rooms=1`}>
                          <span className="badge bg-outline-success fs-10 fw-medium p-2 me-2">
                            Book Now
                          </span>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="text-center view-all wow fadeInUp">
            <a href="/hotels-list" className="btn btn-dark">
              View All<i className="isax isax-arrow-right-3 ms-2"></i>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HotelsListSection; 