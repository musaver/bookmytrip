'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

interface Provider {
  id: string;
  name: string;
  logo: string;
  rating: number;
  reviews: number;
  flights: number;
  locations: number;
  isFavorite: boolean;
}

interface Package {
  id: string;
  title: string;
  description: string;
  icon: string;
  bgColor: string;
  borderColor: string;
  iconBg: string;
}

const TopRatedProviders: React.FC = () => {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [providers, setProviders] = useState<Provider[]>([
    {
      id: '1',
      name: 'Delta Air Lines',
      logo: '/images/provider-01.svg',
      rating: 4.5,
      reviews: 2000,
      flights: 12,
      locations: 5,
      isFavorite: true
    },
    {
      id: '2',
      name: 'Lufthansa',
      logo: '/images/provider-02.svg',
      rating: 4.7,
      reviews: 1500,
      flights: 15,
      locations: 25,
      isFavorite: false
    },
    {
      id: '3',
      name: 'Etihad Airways',
      logo: '/images/provider-03.svg',
      rating: 4.5,
      reviews: 1000,
      flights: 12,
      locations: 10,
      isFavorite: false
    },
    {
      id: '4',
      name: 'Kuwait Airways',
      logo: '/images/provider-04.svg',
      rating: 4.5,
      reviews: 1500,
      flights: 5,
      locations: 50,
      isFavorite: true
    },
    {
      id: '5',
      name: 'Delta Air Lines',
      logo: '/images/provider-01.svg',
      rating: 4.5,
      reviews: 2000,
      flights: 12,
      locations: 5,
      isFavorite: true
    }
  ]);

  const packages: Package[] = [
    {
      id: '1',
      title: 'VIP Packages',
      description: 'Include premium seating, meet-and-greet experiences, backstage tours.',
      icon: 'isax-lock-1',
      bgColor: 'bg-secondary-transparent',
      borderColor: 'border-secondary',
      iconBg: 'bg-secondary'
    },
    {
      id: '2',
      title: 'Travel Packages',
      description: 'Bundles that include concert tickets, accommodations.',
      icon: 'isax-receipt-add',
      bgColor: 'bg-purple-transparent',
      borderColor: 'border-purple',
      iconBg: 'bg-purple'
    },
    {
      id: '3',
      title: 'Best Price Guarantee',
      description: 'Such as private rehearsals, soundcheck access.',
      icon: 'isax-location-tick',
      bgColor: 'bg-teal-transparent',
      borderColor: 'border-teal',
      iconBg: 'bg-teal'
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
            items: 4
          }
        }
      });
    }
  }, []);

  const toggleFavorite = (providerId: string) => {
    setProviders(prev => 
      prev.map(provider => 
        provider.id === providerId 
          ? { ...provider, isFavorite: !provider.isFavorite }
          : provider
      )
    );
  };

  const handleProviderClick = (provider: Provider) => {
    console.log('Provider clicked:', provider.name);
    // Navigate to provider details or flights
  };

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
        
        <div className="owl-carousel experts-slider nav-center" ref={carouselRef}>
          {providers.map((provider) => (
            <div key={provider.id} className="flight-expert mb-4">
              <a 
                href="javascript:void(0);" 
                className="expert-img"
                onClick={() => handleProviderClick(provider)}
              >
                <Image
                  src={provider.logo}
                  alt={provider.name}
                  width={100}
                  height={100}
                  className="img-fluid"
                />
              </a>
              <a 
                href="javascript:void(0);" 
                className={`fav-icon ${provider.isFavorite ? 'selected' : ''}`}
                onClick={() => toggleFavorite(provider.id)}
              >
                <i className="isax isax-heart5"></i>
              </a>
              <div className="expert-content text-center">
                <h5 className="mb-1">
                  <a href="#!" onClick={(e) => e.preventDefault()}>
                    {provider.name}
                  </a>
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

        <div className="package-sec">
          <div className="row justify-content-center g-4">
            {packages.map((pkg, index) => (
              <div key={pkg.id} className="col-lg-4 col-md-6 d-flex wow fadeInDown" data-wow-delay={`0.${index + 1}s`}>
                <div className={`card ${pkg.borderColor} shadow-none ${pkg.bgColor} flex-fill mb-0`}>
                  <div className="card-body d-flex align-items-center">
                    <span className={`avatar ${pkg.iconBg} rounded-circle flex-shrink-0`}>
                      <i className={`isax ${pkg.icon} fs-20`}></i>
                    </span>
                    <div className="ms-3">
                      <h5 className="mb-1">{pkg.title}</h5>
                      <p>{pkg.description}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TopRatedProviders; 