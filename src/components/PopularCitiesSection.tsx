'use client';

import React from 'react';
import Image from 'next/image';

const PopularCitiesSection = () => {
  const cities = [
    { name: 'San Francisco', image: '/images/country/1.PNG' },
    { name: 'Los Angeles', image: '/images/country/2.PNG' },
    { name: 'Miami', image: '/images/country/3.PNG' },
    { name: 'Sanjosh', image: '/images/country/4.PNG' },
    { name: 'New York', image: '/images/country/5.PNG' },
    { name: 'North Justen', image: '/images/country/6.PNG' },
    { name: 'Rio', image: '/images/country/7.PNG' },
    { name: 'Las Vegas', image: '/images/country/8.PNG' },
    { name: 'Texas', image: '/images/country/9.PNG' },
    { name: 'Chicago', image: '/images/country/10.PNG' },
    { name: 'New Keagon', image: '/images/country/11.PNG' },
    { name: 'Oslo', image: '/images/country/12.PNG' }
  ];

  return (
    <section className="section destination-section" style={{padding: "10px 0px"}}>
      <div className="container">
        <div className="row justify-content-center">
          {cities.map((city, index) => (
            <div key={index} className="col-lg-2 col-md-2 col-6 wow fadeInUp" data-wow-delay="0.2s">
              <div className="cruise-type">
                <Image 
                  src={city.image} 
                  alt={city.name}
                  width={200}
                  height={200}
                />
                <h6><a href="#!">{city.name}</a></h6>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PopularCitiesSection; 