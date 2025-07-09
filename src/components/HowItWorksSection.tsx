'use client';

import React from 'react';

interface WorkStep {
  id: number;
  stepNumber: string;
  title: string;
  description: string;
  icon: string;
}

const HowItWorksSection: React.FC = () => {
  const workSteps: WorkStep[] = [
    {
      id: 1,
      stepNumber: '01',
      title: 'Search hotels',
      description: 'Choose your dates, select your room type, and book directly through our website or by contacting us.',
      icon: 'isax-buildings-25'
    },
    {
      id: 2,
      stepNumber: '02',
      title: 'Book hotel',
      description: 'Upon arrival, check in at our reception. Our friendly staff will guide you through',
      icon: 'isax-calendar-edit5'
    },
    {
      id: 3,
      stepNumber: '03',
      title: 'Enjoy Your Stay',
      description: 'Explore our amenities, dining options, and local attractions & Many More',
      icon: 'isax-direct-send5'
    }
  ];

  return (
    <section className="section work-section">
      <div className="container">
        <div className="row">
          <div className="col-xxl-3 col-lg-4">
            <div className="section-header">
              <div>
                <p className="mb-2 fw-medium d-flex align-items-center text-white">
                  <span className="text-bar bg-white"></span>How it Works
                </p>
                <h2 className="text-white">Here's a simple breakdown of how our services work</h2>
              </div>
            </div>
          </div>
          <div className="col-xxl-9 col-lg-8">
            <div className="row">
              {workSteps.map((step) => (
                <div key={step.id} className="col-md-4 col-sm-6">
                  <div className="card border-0">
                    <div className="card-body">
                      <div className="d-flex align-items-center justify-content-between mb-3">
                        <span className="work-avatar">
                          {step.stepNumber}<small className="text-primary">.</small>
                        </span>
                        <span className="work-icon d-flex">
                          <i className={`isax ${step.icon}`}></i>
                        </span>
                      </div>
                      <div>
                        <h5 className={`mb-2 ${step.id === 3 ? '' : 'text-truncate'}`}>{step.title}</h5>
                        <p className="text-truncate line-clamb-3">{step.description}</p>
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

export default HowItWorksSection; 