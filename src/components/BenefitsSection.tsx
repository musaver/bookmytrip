'use client';

import React from 'react';
import Image from 'next/image';

const BenefitsSection = () => {
  const benefits = [
    {
      icon: "fa-utensils",
      bgColor: "#E5F8F4",
      iconColor: "#0BBC86",
      title: "Quality Food",
      description: "Departure defective arranging rapturous did. Conduct denied adding worthy line."
    },
    {
      icon: "fa-clock",
      bgColor: "#FCE9EB",
      iconColor: "#D6293D",
      title: "Quick Services",
      description: "Supposing so be resolving breafast am or perfectly"
    },
    {
      icon: "fa-shield-halved",
      bgColor: "#FFF3E7",
      iconColor: "#FD7E15",
      title: "High Security",
      description: "Arranging rapturous did believe him all had suspend"
    },
    {
      icon: "fa-bolt",
      bgColor: "#E7F6F9",
      iconColor: "#1AA2B7",
      title: "Quick Power",
      description: "Rapturous did believe him all had suspend"
    }
  ];

  return (
    <section className="section" style={{padding: "10px 0px 30px 0px"}}>
      <div className="container">
        <div className="row align-items-center">
          <div className="col-lg-6 col-12 text-center">
            <figure>
              <Image 
                src="/images/4.png" 
                alt="Benefits"
                width={500}
                height={500}
                style={{marginLeft: "3rem"}}
              />
            </figure>
          </div>
          <div className="col-lg-6">
            <div className="section-header mb-4 wow fadeInUp">
              <h2 className="display-6 mb-2">The Best Holidays Starts Here</h2>
              <p className="sub-title">Book your hotel with us and don't forget to grab an awesome hotel deal to save massive on your stay</p>
            </div>
            <div className="row">
              {benefits.map((benefit, index) => (
                <div key={index} className="col-lg-6 wow fadeInUp">
                  <div className="card border-0 bg-transparent mb-3" style={{boxShadow: "none"}}>
                    <div className="card-body p-0">
                      <div className="d-flex flex-column gap-2">
                        <i 
                          className={`fa-solid ${benefit.icon}`} 
                          style={{
                            background: benefit.bgColor,
                            color: benefit.iconColor,
                            width: "fit-content",
                            padding: "15px",
                            borderRadius: "30px"
                          }}
                        ></i>
                        <div className="ms-2">
                          <h6 className="fs-16 mb-2">{benefit.title}</h6>
                          <p>{benefit.description}</p>
                        </div>
                      </div>
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

export default BenefitsSection; 