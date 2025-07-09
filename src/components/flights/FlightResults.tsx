'use client';

import React from 'react';
import { FlightResult } from '@/types/flight';

interface FlightResultsProps {
  flights: FlightResult[];
  loading: boolean;
  error: string | null;
}

const getClassColor = (cabinClass: string): string => {
  switch (cabinClass.toUpperCase()) {
    case 'BUSINESS':
      return '#50e151d4';
    case 'ECONOMY':
      return 'orange';
    case 'FIRST':
    case 'FIRST_CLASS':
      return '#15b6ef';
    case 'PREMIUM_ECONOMY':
      return '#9c27b0';
    default:
      return 'orange';
  }
};

const formatTime = (timeString: string): string => {
  if (!timeString) return '';
  // Handle different time formats
  if (timeString.includes('T')) {
    return new Date(timeString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  }
  return timeString;
};

const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
};

const getStopsText = (stops: number): string => {
  if (stops === 0) return 'Direct Flight';
  if (stops === 1) return '1 Stop';
  return `${stops} Stops`;
};

const formatDuration = (duration: { total: number; formatted?: string }): string => {
  if (duration.formatted) return duration.formatted;
  
  const hours = Math.floor(duration.total / 60);
  const minutes = duration.total % 60;
  return `${hours}H ${minutes}min`;
};

export const FlightResults: React.FC<FlightResultsProps> = ({
  flights,
  loading,
  error
}) => {
  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Searching for flights...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        <h5 className="alert-heading">Search Error</h5>
        <p>{error}</p>
        <button className="btn btn-outline-danger" onClick={() => window.location.reload()}>
          Try Again
        </button>
      </div>
    );
  }

  if (flights.length === 0) {
    return (
      <div className="text-center py-5">
        <i className="fas fa-plane-slash fa-3x text-muted mb-3"></i>
        <h5>No flights found</h5>
        <p className="text-muted">Try adjusting your search criteria or filters</p>
      </div>
    );
  }

  return (
    <div className="flight-results">
      {flights.map((flight) => (
        <div key={flight.id} className="place-item mb-4">
          <div className="place-content">
            <div className="d-flex justify-content-between align-items-center flex-wrap row-gap-2 mb-3">
              <div>
                <h5 className="text-truncate mb-1">
                  <span className="me-2">
                    <img 
                      src={flight.airline.logo || "/images/flight-company-01.svg"} 
                      className="rounded-circle"
                      alt={flight.airline.name}
                      style={{ width: '32px', height: '32px' }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/images/flight-company-01.svg';
                      }}
                    />
                  </span>
                  <a href="#!">{flight.airline.name}</a>
                </h5>
                <div className="d-flex align-items-center gap-2">
                  <p className="fs-14 mb-0 me-2">{flight.flightNumber}</p>
                  <p 
                    className="fs-14 mb-0"
                    style={{
                      borderRadius: '12px',
                      backgroundColor: getClassColor(flight.cabinClass),
                      padding: '0px 10px',
                      color: '#FFF'
                    }}
                  >
                    {flight.cabinClass}
                  </p>
                  {flight.refundable && (
                    <span 
                      className="fs-12 mb-0"
                      style={{
                        borderRadius: '12px',
                        backgroundColor: '#28a745',
                        padding: '0px 8px',
                        color: '#FFF'
                      }}
                    >
                      Refundable
                    </span>
                  )}
                  {flight.changeable && (
                    <span 
                      className="fs-12 mb-0"
                      style={{
                        borderRadius: '12px',
                        backgroundColor: '#17a2b8',
                        padding: '0px 8px',
                        color: '#FFF'
                      }}
                    >
                      Changeable
                    </span>
                  )}
                </div>
              </div>
              <div className="d-block" style={{ position: 'relative', left: '-20px' }}>
                <h6 className="text-primary fs-30">
                  {flight.price.currency} {flight.price.total.toLocaleString()}
                </h6>
                {flight.price.breakdown && flight.price.breakdown.baseFare !== flight.price.total && (
                  <h5 className="text-default fs-20" style={{ position: 'relative', left: '30px' }}>
                    <del>{flight.price.currency} {flight.price.breakdown.baseFare}</del>
                  </h5>
                )}
              </div>
            </div>
            <div className="flight-contentBox">
              <div className="box">
                <h3>{formatTime(flight.departure.time)}</h3>
                <p>{flight.departure.airport.code}</p>
                {/* <p>Date: {formatDate(flight.departure.date)}</p> */}
              </div>
              <div className="box text-center">
                <img src="/images/flightt.PNG" className="w-100" alt="Flight path" />
                <p>{formatDuration(flight.duration)} * {getStopsText(flight.stops)}</p>
              </div>
              <div className="box">
                <h3>{formatTime(flight.arrival.time)}</h3>
                <p>{flight.arrival.airport.code}</p>
                {/* <p>Date: {formatDate(flight.arrival.date)}</p> */}
              </div>
            </div>
            <div className="d-flex" style={{ justifyContent: 'end', marginTop: '-2rem' }}>
              {flight.seatsLeft && flight.seatsLeft <= 20 && (
                <a href="javascript:void();">
                  <span className="badge bg-outline-success fs-10 fw-medium me-2">
                    {flight.seatsLeft} Seats Left
                  </span>
                </a>
              )}
              <a 
                href={`/flight-details/${flight.id}?adults=1&children=0&infants=0`}
                className="text-decoration-none"
              >
                <span className="badge bg-outline-danger fs-10 fw-medium me-2">
                  See Details
                </span>
              </a>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

}; 

