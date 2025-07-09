'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';

const PartnersSection = () => {
  const partners = [
    { id: 1, logo: '/images/home/logo-1.png' },
    { id: 2, logo: '/images/home/logo-2.png' },
    { id: 3, logo: '/images/home/logo-3.png' },
    { id: 4, logo: '/images/home/logo-4.png' },
    { id: 5, logo: '/images/home/logo-5.png' }
  ];

  useEffect(() => {
    // Initialize Owl Carousel when component mounts
    if (typeof window !== 'undefined' && window.$) {
      window.$(".client-slider-two").owlCarousel({
        loop: true,
        margin: 20,
        nav: true,
        dots: false,
        autoplay: true,
        autoplayTimeout: 3000,
        autoplayHoverPause: true,
        smartSpeed: 1000,
        navText: [
          '<i class="fas fa-chevron-left"></i>',
          '<i class="fas fa-chevron-right"></i>'
        ],
        responsive: {
          0: {
            items: 2
          },
          576: {
            items: 3
          },
          768: {
            items: 4
          },
          992: {
            items: 5
          }
        }
      });
    }
  }, []);

  return (
    <section className="section benifit-section bg-white" style={{padding: "30px 0px"}}>
      <div className="container">
        <div className="more-companies-logo mt-0">
          <div className="owl-carousel client-slider-two">
            {partners.map((partner) => (
              <div key={partner.id} className="client-img">
                <Image 
                  src={partner.logo} 
                  alt="Partner Logo" 
                  width={150}
                  height={50}
                />
              </div>
            ))}
            {/* Repeat first three for infinite scroll effect */}
            {partners.slice(0, 3).map((partner) => (
              <div key={`repeat-${partner.id}`} className="client-img">
                <Image 
                  src={partner.logo} 
                  alt="Partner Logo" 
                  width={150}
                  height={50}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PartnersSection; 