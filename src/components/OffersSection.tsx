'use client';

import React from 'react';
import Image from 'next/image';

const OffersSection = () => {
  const offers = [
    {
      image: '/images/1.png',
      title: 'Upto 60% OFF',
      description: 'On Hotel Bookings\nOnline'
    },
    {
      image: '/images/2.png',
      title: 'Book & Enjoy',
      description: '20% Off on available room'
    },
    {
      image: '/images/121.PNG',
      title: 'Hot Summer Nights',
      description: 'Upto 3 nights free'
    }
  ];

  return (
    <section className="offPercentage" style={{padding: "60px 0px"}}>
      <div className="container">
        <div className="row justify-content-center">
          {offers.map((offer, index) => (
            <div key={index} className="col-md-4 col-12 m-auto">
              <div className="d-flex border" style={{
                width: "auto",
                borderRadius: "10px",
                height: "140px",
                justifyContent: "start",
                gap: "25px"
              }}>
                <div className="p-0 m-0 flex-3">
                  <Image 
                    src={offer.image} 
                    alt={offer.title}
                    width={140}
                    height={140}
                    className="w-100 h-100"
                  />
                </div>
                <div className="d-flex flex-column justify-content-center align-items-cente flex-3 p-2">
                  <h4 className="mb-1 mt-1">{offer.title}</h4>
                  <p className="mb-0">{offer.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default OffersSection; 