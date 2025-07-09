'use client';

import React from 'react';

interface BreadcrumbsProps {
  backgroundImage?: string;
  className?: string;
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ 
  backgroundImage = '/images/banner.jpg',
  className = ''
}) => {
  return (
    <div 
      className={`breadcrumb-bar breadcrumb-bg-01 text-center ${className}`}
      style={{
        backgroundImage: `url('${backgroundImage}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center center'
      }}
    >
      <div className="container">
        <div className="row">
          <div className="col-md-12 col-12">
          </div>
        </div>
      </div>
    </div>
  );
};

export default Breadcrumbs; 