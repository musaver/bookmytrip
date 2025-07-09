'use client';

import React, { useEffect, useRef } from 'react';

interface GoogleMapProps {
  latitude: number;
  longitude: number;
  hotelName: string;
  address: string;
  className?: string;
  height?: string;
  zoom?: number;
}

declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

const GoogleMap: React.FC<GoogleMapProps> = ({
  latitude,
  longitude,
  hotelName,
  address,
  className = '',
  height = '400px',
  zoom = 15
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    // Check if coordinates are valid
    if (!latitude || !longitude || latitude === 0 || longitude === 0) {
      return;
    }

    const initializeMap = () => {
      if (!window.google || !mapRef.current) return;

      const mapOptions = {
        center: { lat: latitude, lng: longitude },
        zoom: zoom,
        mapTypeId: window.google.maps.MapTypeId.ROADMAP,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'on' }]
          }
        ]
      };

      // Create map
      const map = new window.google.maps.Map(mapRef.current, mapOptions);
      mapInstanceRef.current = map;

      // Add marker for hotel
      const marker = new window.google.maps.Marker({
        position: { lat: latitude, lng: longitude },
        map: map,
        title: hotelName,
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
              <circle cx="16" cy="16" r="12" fill="#dc3545" stroke="#fff" stroke-width="2"/>
              <text x="16" y="20" text-anchor="middle" fill="white" font-size="12" font-family="Arial">🏨</text>
            </svg>
          `),
          scaledSize: new window.google.maps.Size(32, 32),
          anchor: new window.google.maps.Point(16, 16)
        }
      });

      // Add info window
      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 10px; max-width: 250px;">
            <h6 style="margin: 0 0 5px 0; color: #333;">${hotelName}</h6>
            <p style="margin: 0; color: #666; font-size: 14px;">${address}</p>
            <div style="margin-top: 8px;">
              <a href="https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}" 
                 target="_blank" 
                 style="color: #007bff; text-decoration: none; font-size: 14px;">
                📍 Get Directions
              </a>
            </div>
          </div>
        `
      });

      // Show info window on marker click
      marker.addListener('click', () => {
        infoWindow.open(map, marker);
      });

      // Auto-open info window after a short delay
      setTimeout(() => {
        infoWindow.open(map, marker);
      }, 1000);
    };

    // Load Google Maps API if not already loaded
    if (!window.google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyBsxw1IkvR-PMohWJRSVLpc4-tbwDknHK8&callback=initMap`;
      script.async = true;
      script.defer = true;
      
      window.initMap = initializeMap;
      document.head.appendChild(script);
    } else {
      initializeMap();
    }

    return () => {
      // Cleanup
      if (mapInstanceRef.current) {
        mapInstanceRef.current = null;
      }
    };
  }, [latitude, longitude, hotelName, address, zoom]);

  // Show fallback if no coordinates
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

  return (
    <div className={`position-relative ${className}`}>
      <div 
        ref={mapRef} 
        style={{ height, width: '100%' }}
        className="border rounded"
      />
      
      {/* Map Controls Overlay */}
      <div className="position-absolute top-0 end-0 m-2">
        <div className="btn-group-vertical" role="group">
          <button
            type="button"
            className="btn btn-light btn-sm shadow-sm"
            onClick={() => {
              if (mapInstanceRef.current) {
                mapInstanceRef.current.setZoom(mapInstanceRef.current.getZoom() + 1);
              }
            }}
            title="Zoom In"
          >
            <i className="fas fa-plus"></i>
          </button>
          <button
            type="button"
            className="btn btn-light btn-sm shadow-sm"
            onClick={() => {
              if (mapInstanceRef.current) {
                mapInstanceRef.current.setZoom(mapInstanceRef.current.getZoom() - 1);
              }
            }}
            title="Zoom Out"
          >
            <i className="fas fa-minus"></i>
          </button>
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
            View on Maps
          </a>
        </div>
      </div>
    </div>
  );
};

export default GoogleMap; 