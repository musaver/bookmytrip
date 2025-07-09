import React from 'react';
import Image from 'next/image';

interface Destination {
  id: string;
  name: string;
  image: string;
  flightCount?: number;
}

const PopularDestinations: React.FC = () => {
  const destinations: Destination[] = [
    {
      id: '1',
      name: 'Denmark',
      image: '/images/destination-15.webp'
    },
    {
      id: '2',
      name: 'Canary Islands',
      image: '/images/destination-08.jpg'
    },
    {
      id: '3',
      name: 'New York',
      image: '/images/destination-09.webp'
    },
    {
      id: '4',
      name: 'Greece',
      image: '/images/destination-10.jpg'
    },
    {
      id: '5',
      name: 'Alaska',
      image: '/images/destination-11.jpg'
    },
    {
      id: '6',
      name: 'Panama Canal',
      image: '/images/destination-12.webp'
    },
    {
      id: '7',
      name: 'Hawaiian Islands',
      image: '/images/destination-13.jpg'
    },
    {
      id: '8',
      name: 'British Isles',
      image: '/images/destination-14.webp'
    }
  ];

  const handleDestinationClick = (destination: Destination) => {
    // Handle destination click - could navigate to search results
    console.log('Destination clicked:', destination.name);
  };

  return (
    <section className="section place-section">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-xl-6 col-lg-10 text-center wow fadeInUp" data-wow-delay="0.2s">
            <div className="section-header text-center">
              <h2 className="mb-2">
                Popular <span className="text-primary text-decoration-underline">Destinations</span>
              </h2>
              <p className="sub-title">
                Connecting Needs with Offers for the Professional Flight Services, Book your next flight appointment with ease.
              </p>
            </div>
          </div>
        </div>
        <div className="row">
          {destinations.map((destination, index) => (
            <div key={destination.id} className="col-lg-3 col-md-6 col-12">
              <div 
                className={`destination-set wow ${index % 2 === 0 ? 'fadeInUp' : 'fadeInDown'}`}
                onClick={() => handleDestinationClick(destination)}
                style={{ cursor: 'pointer' }}
              >
                <div className="destination-img">
                  <Image
                    src={destination.image}
                    alt={destination.name}
                    width={300}
                    height={200}
                    className="img-fluid"
                    style={{ objectFit: 'cover', height: '200px' }}
                  />
                </div>
                <div className="destination-content d-flex align-items-center justify-content-center flex-column w-100">
                  <h5 className="text-white fs-20 fw-semibold mb-1 bg-transparent">{destination.name}</h5>
                  {destination.flightCount && (
                    <h6 className="text-light fs-16 fw-normal">{destination.flightCount} Flights</h6>
                  )}
                </div>
                <div className="destination-btn">
                  <a href="#!" onClick={(e) => e.preventDefault()}>
                    <i className="fa fa-arrow-right"></i>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PopularDestinations; 