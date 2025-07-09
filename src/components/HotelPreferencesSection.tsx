'use client';

import React, { useEffect } from 'react';

// Declare the global jQuery interface
declare global {
  interface Window {
    $: any;
    jQuery: any;
  }
}

interface HotelPreference {
    id: number;
    title: string;
    image: string;
    hotelsCount: number;
}

const HotelPreferencesSection: React.FC = () => {

    const hotelPreferences: HotelPreference[] = [
        {
            id: 1,
            title: 'Deluxe Room',
            image: '/images/home/600x400-3.jpg',
            hotelsCount: 288
        },
        {
            id: 2,
            title: 'Standard Room',
            image: '/images/home/600x400-4.jpg',
            hotelsCount: 156
        },
        {
            id: 3,
            title: 'Premium Suite',
            image: '/images/home/600x400-3.jpg',
            hotelsCount: 94
        },
        {
            id: 4,
            title: 'Executive Room',
            image: '/images/home/600x400-4.jpg',
            hotelsCount: 210
        },
        {
            id: 5,
            title: 'Family Room',
            image: '/images/home/600x400-3.jpg',
            hotelsCount: 175
        },
        {
            id: 6,
            title: 'Business Suite',
            image: '/images/home/600x400-4.jpg',
            hotelsCount: 132
        }
    ];

    useEffect(() => {
        const initCarousel = () => {
            if (typeof window !== 'undefined' && window.$ && window.$.fn.owlCarousel) {
                const $carousel = window.$(".hotel-preferences-slider");
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
                            },
                            1200: {
                                items: 3
                            }
                        }
                    });
                }
            }
        };

        // Check if window is loaded
        if (typeof window !== 'undefined') {
            if (document.readyState === 'complete') {
                // Page already loaded
                setTimeout(initCarousel, 100);
            } else {
                // Wait for page to load
                window.addEventListener('load', () => {
                    setTimeout(initCarousel, 100);
                });
            }
        }

        // Also try after a longer delay as fallback
        const timer = setTimeout(initCarousel, 2000);

        // Cleanup
        return () => {
            clearTimeout(timer);
            if (typeof window !== 'undefined') {
                window.removeEventListener('load', initCarousel);
            }
        };
    }, []);

    return (
        <section className="section place-section bg-white" style={{ padding: '20px 0px' }}>
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-xl-10 col-lg-10 text-center wow fadeInUp" data-wow-delay="0.2s">
                        <div className="section-header mb-4 text-center">
                            <h2 className="mb-2">
                                Travelers & <span className="text-primary text-decoration-underline">Preferences</span>
                            </h2>
                            <p className="sub-title">Choose from our wide range of hotel room types and preferences</p>
                        </div>
                    </div>
                </div>
                
                <div className="tab-content">
                    <div className="tab-pane fade active show" id="hotel-list">
                        <div className="owl-carousel hotel-preferences-slider">
                            {hotelPreferences.map((preference) => (
                                <div key={preference.id} className="card travelers-card">
                                    <div className="card-img">
                                        <a href="#!">
                                            <img
                                                src={preference.image}
                                                className="rounded-top"
                                                alt={preference.title}
                                            />
                                        </a>
                                        <span className="overlay-icon">
                                            <i className="isax isax-building-3"></i>
                                        </span>
                                    </div>
                                    <div className="card-body d-flex align-items-center justify-content-between">
                                        <div>
                                            <h5 className="mb-1">
                                                <a href="#!">{preference.title}</a>
                                            </h5>
                                            <p>{preference.hotelsCount} Hotels Available</p>
                                        </div>
                                        <div>
                                            <a href="#!" className="rounded-arrow-next">
                                                <i className="isax isax-arrow-right-3"></i>
                                            </a>
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

export default HotelPreferencesSection; 