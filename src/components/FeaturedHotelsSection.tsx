'use client';

import React, { useEffect } from 'react';

const FeaturedHotelsSection = () => {
  useEffect(() => {
    // Initialize Owl Carousel when component mounts
    if (typeof window !== 'undefined' && window.$) {
      window.$(".place-slider").owlCarousel({
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
            items: 3
          },
          992: {
            items: 3
          }
        }
      });
    }
  }, []);

  return (
    <section className="section place-section bg-white feature-hotel" style={{padding: "20px 0px"}}>
        <div className="container">
            <div className="row justify-content-center">
                <div className="col-xl-6 col-lg-10 text-center wow fadeInUp" data-wow-delay="0.2s">
                    <div className="section-header mb-4 text-center">
                        <h2 className="mb-2">Our <span className="text-primary  text-decoration-underline">Featured</span> Hotels
                        </h2>
                        <p className="sub-title">Here are some famous tourist hotels around the world</p>
                    </div>
                </div>
            </div>
    
            <div className="owl-carousel place-slider nav-center">
    
                {/* Place Item*/}
                <div className="place-item mb-4">
                    <div className="destination-set wow fadeInUp" style={{visibility: "visible", animationName: "fadeInUp"}}>
                        <div className="destination-img">
                            <img src="/images/destination-09.jpg" alt="Img"/>
                            <div className="destination-content d-flex align-items-start flex-column w-100">
                                <h5 className="text-white fs-15 fw-semibold mb-1"><i className="isax isax-location5 mt-3"></i>
                                    New York</h5>
                            </div>
                        </div>
                        <div className="place-content">
                            <h5 className="mb-1"><a href="#!">A Luxury Hotel</a></h5>
                            <div className="d-flex align-items-center justify-content-between">
                                <h5 className="text-primary">AED 500 <span className="fs-14 fw-normal text-primary">/ Night</span></h5>
                                <div className="d-flex align-items-center">
                                    <a href="#!"><span className="badge bg-outline-success fs-10 fw-medium p-2 me-2">Book
                                            Now</span></a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* /Place Item*/}
    
                {/* Place Item*/}
                <div className="place-item mb-4">
                    <div className="destination-set wow fadeInUp" style={{visibility: "visible", animationName: "fadeInUp"}}>
                        <div className="destination-img">
                            <img src="/images/home/306x412-3.jpg" alt="Img"/>
                            <div className="destination-content d-flex align-items-start flex-column w-100">
                                <h5 className="text-white fs-15 fw-semibold mb-1"><i className="isax isax-location5 mt-3"></i>
                                    New York</h5>
                            </div>
                        </div>
                        <div className="place-content">
                            <h5 className="mb-1"><a href="#!">A Luxury Hotel</a></h5>
                            <div className="d-flex align-items-center justify-content-between">
                                <h5 className="text-primary">AED 500 <span className="fs-14 fw-normal text-primary">/ Night</span></h5>
                                <div className="d-flex align-items-center">
                                    <a href="#!"><span className="badge bg-outline-success fs-10 fw-medium p-2 me-2">Book
                                            Now</span></a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* /Place Item*/}
    
    
                {/* Place Item*/}
                <div className="place-item mb-4">
                    <div className="destination-set wow fadeInUp" style={{visibility: "visible", animationName: "fadeInUp"}}>
                        <div className="destination-img">
                            <img src="/images/home/306x412-4.jpg" alt="Img"/>
                            <div className="destination-content d-flex align-items-start flex-column w-100">
                                <h5 className="text-white fs-15 fw-semibold mb-1"><i className="isax isax-location5 mt-3"></i>
                                    New York</h5>
                            </div>
                        </div>
                        <div className="place-content">
                            <h5 className="mb-1"><a href="#!">A Luxury Hotel</a></h5>
                            <div className="d-flex align-items-center justify-content-between">
                                <h5 className="text-primary">AED 500 <span className="fs-14 fw-normal text-primary">/ Night</span></h5>
                                <div className="d-flex align-items-center">
                                    <a href="#!"><span className="badge bg-outline-success fs-10 fw-medium p-2 me-2">Book
                                            Now</span></a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* /Place Item*/}
    
    
                {/* Place Item*/}
                <div className="place-item mb-4">
                    <div className="destination-set wow fadeInUp" style={{visibility: "visible", animationName: "fadeInUp"}}>
                        <div className="destination-img">
                            <img src="/images/home/306x412-5.jpg" alt="Img"/>
                            <div className="destination-content d-flex align-items-start flex-column w-100">
                                <h5 className="text-white fs-15 fw-semibold mb-1"><i className="isax isax-location5 mt-3"></i>
                                    New York</h5>
                            </div>
                        </div>
                        <div className="place-content">
                            <h5 className="mb-1"><a href="#!">A Luxury Hotel</a></h5>
                            <div className="d-flex align-items-center justify-content-between">
                                <h5 className="text-primary">AED 500 <span className="fs-14 fw-normal text-primary">/ Night</span></h5>
                                <div className="d-flex align-items-center">
                                    <a href="#!"><span className="badge bg-outline-success fs-10 fw-medium p-2 me-2">Book
                                            Now</span></a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* /Place Item*/}
    
                {/* Place Item*/}
                <div className="place-item mb-4">
                    <div className="destination-set wow fadeInUp" style={{visibility: "visible", animationName: "fadeInUp"}}>
                        <div className="destination-img">
                            <img src="/images/home/306x412-2.jpg" alt="Img"/>
                            <div className="destination-content d-flex align-items-start flex-column w-100">
                                <h5 className="text-white fs-15 fw-semibold mb-1"><i className="isax isax-location5 mt-3"></i>
                                    New York</h5>
                            </div>
                        </div>
                        <div className="place-content">
                            <h5 className="mb-1"><a href="#!">A Luxury Hotel</a></h5>
                            <div className="d-flex align-items-center justify-content-between">
                                <h5 className="text-primary">AED 500 <span className="fs-14 fw-normal text-primary">/ Night</span></h5>
                                <div className="d-flex align-items-center">
                                    <a href="#!"><span className="badge bg-outline-success fs-10 fw-medium p-2 me-2">Book
                                            Now</span></a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* /Place Item*/}
    
                
    
            </div>
    
    
        </div>
    </section>
);
};

export default FeaturedHotelsSection; 