'use client';

import React, { useEffect } from 'react';

// Declare the global jQuery interface
declare global {
  interface Window {
    $: any;
    jQuery: any;
  }
}

interface Provider {
  id: number;
  name: string;
  logo: string;
  rating: number;
  reviews: number;
  flights: number;
  locations: number;
  isFavorite: boolean;
}

const TopRatedProvidersSection: React.FC = () => {
  const providers: Provider[] = [
    {
      id: 1,
      name: 'Delta Air Lines',
      logo: '/images/hotel-logo-01.svg',
      rating: 4.5,
      reviews: 2000,
      flights: 12,
      locations: 5,
      isFavorite: true
    },
    {
      id: 2,
      name: 'Lufthansa',
      logo: '/images/hotel-logo-02.svg',
      rating: 4.7,
      reviews: 1500,
      flights: 15,
      locations: 25,
      isFavorite: false
    },
    {
      id: 3,
      name: 'Etihad Airways',
      logo: '/images/hotel-logo-03.svg',
      rating: 4.5,
      reviews: 1000,
      flights: 12,
      locations: 10,
      isFavorite: false
    },
    {
      id: 4,
      name: 'Kuwait Airways',
      logo: '/images/hotel-logo-04.svg',
      rating: 4.5,
      reviews: 1500,
      flights: 5,
      locations: 50,
      isFavorite: true
    }
  ];

  useEffect(() => {
    const initCarousel = () => {
      if (typeof window !== 'undefined' && window.$ && window.$.fn.owlCarousel) {
        const $carousel = window.$('.experts-slider');
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
                items: 4
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
    <section className="section experts-section">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-xl-5 col-lg-10 text-center wow fadeInUp" data-wow-delay="0.2s">
            <div className="section-header section-header-four text-center">
              <h2 className="mb-2">
                <span>Top</span> Rated Providers
              </h2>
              <p className="sub-title">Connecting Needs with Offers for the Professional Services.</p>
            </div>
          </div>
        </div>
        <div className="owl-carousel experts-slider nav-center">
          {providers.map((provider) => (
            <div key={provider.id} className="flight-expert mb-4">
              <a href="javascript:void(0);" className="expert-img">
                <img src={provider.logo} alt="img" />
              </a>
              <a href="javascript:void(0);" className={`fav-icon ${provider.isFavorite ? 'selected' : ''}`}>
                <i className="isax isax-heart5"></i>
              </a>
              <div className="expert-content text-center">
                <h5 className="mb-1">
                  <a href="#!">{provider.name}</a>
                </h5>
                <div className="d-flex align-items-center justify-content-center mb-1">
                  <span className="badge badge-warning badge-xs text-gray-9 fs-13 fw-medium me-2">
                    {provider.rating}
                  </span>
                  <p>{provider.reviews} Reviews</p>
                </div>
                <div className="d-flex border-top mt-3 pt-3">
                  <div className="flex-fill text-center">
                    <h6 className="fw-medium">{provider.flights}+</h6>
                    <p className="fs-13">Flights</p>
                  </div>
                  <div className="flex-fill text-center">
                    <h6 className="fw-medium">{provider.locations}+</h6>
                    <p className="fs-13">Locations</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TopRatedProvidersSection; 