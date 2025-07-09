'use client';

import Image from 'next/image';
import DestinationsSection from '@/components/DestinationsSection';

export default function AboutUs() {


  return (
    <>
      
    <div className="breadcrumb-bar breadcrumb-bg-01 text-center" style={{backgroundImage: 'url(/images/banner.jpg)', backgroundSize: 'cover', backgroundPosition: 'center center'}}>
        <div className="container">
            <div className="row">
                <div className="col-md-12 col-12">
                    <h2 className="breadcrumb-title mb-2">About Us</h2>
                    <nav aria-label="breadcrumb">
                        <ol className="breadcrumb justify-content-center mb-0">
                            <li className="breadcrumb-item"><a href="/"><i className="isax isax-home5"></i></a></li>
                            <li className="breadcrumb-item active" aria-current="page">About Us</li>
                        </ol>
                    </nav>
                </div>
            </div>
        </div>
    </div>


    <section className="section about">
        <div className="container">
            <div className="row align-items-center">
                <div className="col-lg-6">
                    <div className="about-image mb-4 mb-lg-0">
                        <div className="about-img" style={{marginLeft: '3rem'}}>
                            <Image src="/images/women.png" alt="about" style={{borderRadius: '10px'}} width={546} height={226} />
                        </div>
                    </div>
                </div>
                <div className="col-lg-6">
                    <div className="about-content mb-4">
                        <h6 className="text-primary fs-14 fw-medium mb-2">About BookmyTrip</h6>
                        <h2 className="display-6 mb-2">All-in-one platform for unforgettable travel experiences!</h2>
                        <p className="mb-4">At BookmyTrip, we believe that travel should be simple, seamless, and tailored to your needs. Whether you're dreaming of an exotic beach getaway, a cultural city tour, or a luxury cruise, we are here to turn your travel dreams
                            into reality.​</p>
                    </div>
                    <div className="about-mission">
                        <h6 className="text-primary fs-14 fw-medium mb-3">Our Mission</h6>
                        <p className="fs-16 text-gray-6">Our mission is to make travel more accessible, enjoyable, and hassle-free for everyone. With our range of services</p>
                    </div>
                </div>
            </div>
        </div>
    </section>


      {/* Popular Destinations Section */}
      <DestinationsSection />
      


      
        
      <section className="section choose-us-section">
        <div className="container">
            <div className="choose-title">
                <h2>Why Choose <span className="text-primary">Us?</span></h2>
            </div>
            <div className="row g-4">
                <div className="col-lg-3">
                    <div className="choose-card">
                        <div className="choose-icon mb-3">
                            <span className="rounded-circle d-flex align-items-center justify-content-center"><i className="isax isax-archive-tick text-white"></i></span>
                        </div>
                        <div className="card-content">
                            <h6 className="mb-2">Convenience</h6>
                            <p className="fs-16 text-gray-6">Plan your entire trip from one platform, saving you time and effort. No more hopping between different websites .</p>
                        </div>
                    </div>
                </div>
                <div className="col-lg-3">
                    <div className="choose-card">
                        <div className="choose-icon mb-3">
                            <span className="rounded-circle d-flex align-items-center justify-content-center"><i className="isax isax-dollar-square text-white"></i></span>
                        </div>
                        <div className="card-content">
                            <h6 className="mb-2">Best Price Guarantee</h6>
                            <p className="fs-16 text-gray-6">We work with trusted travel partners to bring you the best deals, whether you're booking a flight, hotel, or car rental.</p>
                        </div>
                    </div>
                </div>
                <div className="col-lg-3">
                    <div className="choose-card">
                        <div className="choose-icon mb-3">
                            <span className="rounded-circle d-flex align-items-center justify-content-center"><i className="isax isax-headphone text-white"></i></span>
                        </div>
                        <div className="card-content">
                            <h6 className="mb-2">Customer Support</h6>
                            <p className="fs-16 text-gray-6">Our dedicated support team is here for you 24/7, ensuring your travel plans go smoothly from start to finish.</p>
                        </div>
                    </div>
                </div>
                <div className="col-lg-3">
                    <div className="choose-card">
                        <div className="choose-icon mb-3">
                            <span className="rounded-circle d-flex align-items-center justify-content-center"><i className="isax isax-map text-white"></i></span>
                        </div>
                        <div className="card-content">
                            <h6 className="mb-2">Tailored Travel Experiences</h6>
                            <p className="fs-16 text-gray-6">Whether you're traveling for business, family vacations, or a solo adventure, we provide options that suit every needs</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

      <div className="container mb-4">
        <div className="business-wrap bg-dark wow zoomIn mt-0">
            <div className="row">
                <div className="col-lg-6">
                    <div className="business-info">
                        <h2 className="display-6 text-white mb-3">Discover the easiest way to automate flight bookings</h2>
                        <p className="text-light mb-4">Our comprehensive solution streamlines your flight booking operations, so you can focus on delivering exceptional travel experiences.</p>
                    </div>
                </div>
                <div className="col-lg-6">
                    <div className="business-img">
                        <Image src="/images/business.svg" alt="img" width={546} height={226} />
                    </div>
                </div>
            </div>
        </div>
      </div>
    </>
  );
}
