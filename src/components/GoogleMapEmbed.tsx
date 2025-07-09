'use client';

import React from 'react';

interface GoogleMapEmbedProps {
  latitude: number;
  longitude: number;
  hotelName: string;
  address: string;
  className?: string;
  height?: string;
  zoom?: number;
}

type MapType = 'google-api' | 'google-basic' | 'openstreetmap';

const GoogleMapEmbed: React.FC<GoogleMapEmbedProps> = ({
  latitude,
  longitude,
  hotelName,
  address,
  className = '',
  height = '400px',
  zoom = 15
}) => {
  const [mapError, setMapError] = React.useState(false);
  const [currentMapType, setCurrentMapType] = React.useState<MapType>('google-basic');

  // Check if coordinates are valid
  if (!latitude || !longitude || latitude === 0 || longitude === 0) {
    return (
      <div className={`bg-light border rounded d-flex align-items-center justify-content-center ${className}`} 
           style={{ height }}>
        <div className="text-center text-muted">
          <i className="fas fa-map-marker-alt display-4 mb-2"></i>
          <p className="mb-1">Location coordinates not available</p>
          <small>Unable to display map for this hotel</small>
        </div>
      </div>
    );
  }

  // API key for Google Maps
  const apiKey = 'AIzaSyBsxw1IkvR-PMohWJRSVLpc4-tbwDknHK8';
  
  // Different map URLs
  const mapUrls = {
    'google-api': `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${latitude},${longitude}&zoom=${zoom}`,
    'google-basic': `https://maps.google.com/maps?q=${latitude},${longitude}&t=&z=${zoom}&ie=UTF8&iwloc=&output=embed`,
    'openstreetmap': `https://www.openstreetmap.org/export/embed.html?bbox=${longitude-0.01},${latitude-0.01},${longitude+0.01},${latitude+0.01}&layer=mapnik&marker=${latitude},${longitude}`
  };

  const mapNames = {
    'google-api': 'Google Maps (API)',
    'google-basic': 'Google Maps (Basic)',
    'openstreetmap': 'OpenStreetMap'
  };

  // Show error state if map failed to load
  if (mapError) {
    return (
      <div className={`bg-light border rounded d-flex align-items-center justify-content-center ${className}`} 
           style={{ height }}>
        <div className="text-center text-muted">
          <i className="fas fa-exclamation-triangle display-4 mb-2 text-warning"></i>
          <p className="mb-1">Map failed to load</p>
          <small className="d-block mb-3">
            {currentMapType === 'google-api' 
              ? 'Google Maps API is not authorized. Please enable Maps Embed API in Google Cloud Console.'
              : 'Current map service is unavailable. Try a different map provider.'
            }
          </small>
          <div className="d-flex gap-2 justify-content-center flex-wrap">
            <button 
              className="btn btn-sm btn-outline-primary"
              onClick={() => {
                setMapError(false);
                setCurrentMapType('google-basic');
              }}
            >
              Google Maps (Basic)
            </button>
            <button 
              className="btn btn-sm btn-outline-success"
              onClick={() => {
                setMapError(false);
                setCurrentMapType('openstreetmap');
              }}
            >
              OpenStreetMap
            </button>
            {currentMapType !== 'google-api' && (
              <button 
                className="btn btn-sm btn-outline-secondary"
                onClick={() => {
                  setMapError(false);
                  setCurrentMapType('google-api');
                }}
              >
                Try Google API
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const currentUrl = mapUrls[currentMapType];

  return (
    <div className={`position-relative ${className}`}>
      <iframe
        src={currentUrl}
        width="100%"
        height={height}
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="rounded"
        title={`Map showing location of ${hotelName}`}
        onError={() => setMapError(true)}
        onLoad={(e) => {
          // Check if the iframe loaded successfully
          const iframe = e.target as HTMLIFrameElement;
          try {
            // This will throw an error if the iframe content has an error
            if (iframe.contentWindow?.document.title?.includes('Error')) {
              setMapError(true);
            }
          } catch (error) {
            // Cross-origin restrictions prevent us from checking content
            // This is normal and expected
          }
        }}
      />
      
      {/* Overlay with hotel info */}
      <div className="position-absolute top-0 start-0 m-2">
        <div className="bg-white rounded shadow-sm p-2" style={{ maxWidth: '250px' }}>
          <h6 className="mb-1 text-primary" style={{ fontSize: '0.9rem' }}>
            <i className="fas fa-map-marker-alt me-1"></i>
            {hotelName}
          </h6>
          <p className="mb-0 text-muted" style={{ fontSize: '0.8rem' }}>
            {address}
          </p>
          <small className="text-info d-block mt-1">
            <i className="fas fa-info-circle me-1"></i>
            {mapNames[currentMapType]}
          </small>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="position-absolute bottom-0 start-0 m-2">
        <div className="btn-group" role="group">
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary btn-sm shadow-sm"
            title="Get Directions"
          >
            <i className="fas fa-directions me-1"></i>
            Directions
          </a>
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline-primary btn-sm shadow-sm"
            title="View on Google Maps"
          >
            <i className="fas fa-external-link-alt me-1"></i>
            View
          </a>
        </div>
      </div>

      {/* Map Type Selector */}
      <div className="position-absolute top-0 end-0 m-2">
        <div className="dropdown">
          <button
            className="btn btn-light btn-sm shadow-sm dropdown-toggle"
            type="button"
            data-bs-toggle="dropdown"
            aria-expanded="false"
            title="Switch Map Provider"
          >
            <i className="fas fa-map me-1"></i>
            Map
          </button>
          <ul className="dropdown-menu">
            <li>
              <button
                className={`dropdown-item ${currentMapType === 'google-basic' ? 'active' : ''}`}
                onClick={() => setCurrentMapType('google-basic')}
              >
                <i className="fab fa-google me-2"></i>
                Google Maps (Basic)
              </button>
            </li>
            <li>
              <button
                className={`dropdown-item ${currentMapType === 'openstreetmap' ? 'active' : ''}`}
                onClick={() => setCurrentMapType('openstreetmap')}
              >
                <i className="fas fa-map me-2"></i>
                OpenStreetMap
              </button>
            </li>
            <li><hr className="dropdown-divider" /></li>
            <li>
              <button
                className={`dropdown-item ${currentMapType === 'google-api' ? 'active' : ''}`}
                onClick={() => setCurrentMapType('google-api')}
              >
                <i className="fas fa-key me-2"></i>
                Google Maps (API)
                <small className="d-block text-muted">Requires API setup</small>
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default GoogleMapEmbed; 