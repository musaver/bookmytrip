'use client';

import React, { useState, useEffect } from 'react';

interface Seat {
  seatNumber: string;
  seatLabel: string;
  status: 'available' | 'occupied' | 'blocked' | 'selected';
  seatType: 'economy' | 'premium' | 'business' | 'first';
  price: number;
  currency: string;
  isWindow: boolean;
  isAisle: boolean;
  features: string[];
}

interface SeatRow {
  rowNumber: number;
  seats: Seat[];
  isExitRow: boolean;
  hasExtraLegroom: boolean;
}

interface Cabin {
  cabinClass: string;
  name: string;
  rows: SeatRow[];
  configuration: string;
}

interface Segment {
  segmentId: string;
  aircraft: string;
  departure: string;
  arrival: string;
  seatMap: {
    cabins: Cabin[];
  };
}

interface SeatMapData {
  bookingId: string;
  segments: Segment[];
  currency: string;
  status: {
    success: boolean;
    httpStatus: number;
  };
}

interface Passenger {
  id: string;
  name: string;
  type: 'adult' | 'child' | 'infant';
}

interface SeatSelectionProps {
  flightId: string;
  passengers: Passenger[];
  onSeatSelect: (selections: any[]) => void;
  onClose: () => void;
}

const SeatSelection: React.FC<SeatSelectionProps> = ({
  flightId,
  passengers,
  onSeatSelect,
  onClose
}) => {
  const [seatMapData, setSeatMapData] = useState<SeatMapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSeats, setSelectedSeats] = useState<{[passengerId: string]: {segmentId: string, seatNumber: string, price: number}}>({});
  const [currentPassenger, setCurrentPassenger] = useState(0);
  const [selectedCabin, setSelectedCabin] = useState<string>('economy');

  useEffect(() => {
    fetchSeatMap();
  }, [flightId]);

  const fetchSeatMap = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/flights/${flightId}/seat-map`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingId: `TEMP_BOOKING_${Date.now()}`
        }),
      });

      const data = await response.json();
      if (data.success) {
        setSeatMapData(data.seatMap);
      }
    } catch (error) {
      console.error('Error fetching seat map:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSeatClick = (seat: Seat, segmentId: string) => {
    if (seat.status !== 'available') return;

    const passenger = passengers[currentPassenger];
    if (!passenger) return;

    const newSelectedSeats = { ...selectedSeats };
    
    // Remove previous selection for this passenger
    const previousSelection = Object.entries(selectedSeats).find(
      ([passId, _]) => passId === passenger.id
    );
    
    if (previousSelection) {
      // Update the previous seat status back to available
      updateSeatStatus(previousSelection[1].seatNumber, 'available');
    }

    // Add new selection
    newSelectedSeats[passenger.id] = {
      segmentId,
      seatNumber: seat.seatNumber,
      price: seat.price
    };

    // Update seat status
    updateSeatStatus(seat.seatNumber, 'selected');
    
    setSelectedSeats(newSelectedSeats);

    // Auto-advance to next passenger
    if (currentPassenger < passengers.length - 1) {
      setCurrentPassenger(currentPassenger + 1);
    }
  };

  const updateSeatStatus = (seatNumber: string, status: 'available' | 'selected') => {
    if (!seatMapData) return;

    const updatedSeatMapData = { ...seatMapData };
    updatedSeatMapData.segments.forEach(segment => {
      segment.seatMap.cabins.forEach(cabin => {
        cabin.rows.forEach(row => {
          row.seats.forEach(seat => {
            if (seat.seatNumber === seatNumber) {
              seat.status = status;
            }
          });
        });
      });
    });
    
    setSeatMapData(updatedSeatMapData);
  };

  const getSeatIcon = (seat: Seat) => {
    switch (seat.status) {
      case 'available':
        return '□';
      case 'selected':
        return '■';
      case 'occupied':
        return '■';
      case 'blocked':
        return '×';
      default:
        return '□';
    }
  };

  const getSeatColor = (seat: Seat) => {
    if (seat.status === 'selected') return '#28a745';
    if (seat.status === 'occupied') return '#6c757d';
    if (seat.status === 'blocked') return '#6c757d';
    
    // Color by price/type
    if (seat.price === 0) return '#e3f2fd';
    if (seat.price <= 350) return '#f3e5f5';
    if (seat.price <= 500) return '#fff3e0';
    if (seat.price <= 650) return '#fff8e1';
    if (seat.price <= 1000) return '#e8f5e8';
    if (seat.price <= 1400) return '#e1f5fe';
    return '#ffebee';
  };

  const handleConfirmSelection = () => {
    const selections = Object.entries(selectedSeats).map(([passengerId, selection]) => ({
      passengerId,
      segmentId: selection.segmentId,
      seatCode: selection.seatNumber,
      amount: selection.price,
      travelerId: passengerId
    }));

    onSeatSelect(selections);
  };

  const getTotalPrice = () => {
    return Object.values(selectedSeats).reduce((sum, seat) => sum + seat.price, 0);
  };

  if (loading) {
    return (
      <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <div className="modal-dialog modal-xl">
          <div className="modal-content">
            <div className="modal-body text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading seat map...</span>
              </div>
              <p className="mt-3">Loading seat map...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!seatMapData) {
    return (
      <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-body text-center py-5">
              <p>Unable to load seat map. Please try again.</p>
              <button className="btn btn-secondary" onClick={onClose}>Close</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <style jsx>{`
        .seat-legend {
          width: 20px;
          height: 20px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: bold;
        }
        
        .seat-btn {
          border-radius: 8px !important;
          transition: all 0.2s ease;
          font-weight: bold;
        }
        
        .seat-btn:hover:not(:disabled) {
          transform: scale(1.1);
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        }
        
        .aircraft-visual {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        
        .aircraft-body {
          width: 300px;
          height: 20px;
          background: linear-gradient(90deg, #e9ecef 0%, #dee2e6 50%, #e9ecef 100%);
          border-radius: 10px;
          position: relative;
          margin: 10px 0;
        }
        
        .aircraft-body::before {
          content: '';
          position: absolute;
          top: -5px;
          left: 10px;
          right: 10px;
          height: 30px;
          background: linear-gradient(90deg, transparent 0%, #adb5bd 20%, #adb5bd 80%, transparent 100%);
          border-radius: 15px;
        }
        
        .cabin-section {
          border: 2px solid #dee2e6;
          border-radius: 12px;
          padding: 15px;
          margin-bottom: 20px;
          background: white;
        }
        
        .seat-grid {
          font-family: 'Courier New', monospace;
        }
        
        .row-emergency {
          background-color: #fff3cd;
          border-radius: 8px;
          padding: 5px;
        }
      `}</style>
      
      <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <div className="modal-dialog modal-xl">
          <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Select Your Seats</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          
          <div className="modal-body">
            {/* Passenger Selection */}
            <div className="row mb-4">
              <div className="col-md-6">
                <h6>Select seats for:</h6>
                <div className="btn-group flex-wrap" role="group">
                  {passengers.map((passenger, index) => (
                    <button
                      key={passenger.id}
                      type="button"
                      className={`btn btn-sm ${currentPassenger === index ? 'btn-primary' : 'btn-outline-primary'}`}
                      onClick={() => setCurrentPassenger(index)}
                    >
                      {passenger.name || `Passenger ${index + 1}`}
                      {selectedSeats[passenger.id] && (
                        <span className="badge bg-success ms-1">
                          {selectedSeats[passenger.id].seatNumber}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="col-md-6">
                <h6>Cabin Class:</h6>
                <select 
                  className="form-select"
                  value={selectedCabin}
                  onChange={(e) => setSelectedCabin(e.target.value)}
                >
                  {seatMapData.segments[0]?.seatMap.cabins.map(cabin => (
                    <option key={cabin.cabinClass} value={cabin.cabinClass}>
                      {cabin.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Seat Map Legend */}
            <div className="row mb-4">
              <div className="col-md-6">
                <h6 className="mb-3">Seat Status</h6>
                <div className="d-flex flex-wrap gap-3 small">
                  <div className="d-flex align-items-center">
                    <div className="seat-legend" style={{ backgroundColor: '#e8f5e8', border: '2px solid #28a745', color: '#28a745' }}>✓</div>
                    <span className="ms-2">Selected</span>
                  </div>
                  <div className="d-flex align-items-center">
                    <div className="seat-legend" style={{ backgroundColor: '#f8f9fa', border: '2px solid #dee2e6', color: '#6c757d' }}>×</div>
                    <span className="ms-2">Booked</span>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <h6 className="mb-3">Seat Fees</h6>
                <div className="d-flex flex-wrap gap-2 small">
                  <div className="d-flex align-items-center">
                    <div className="seat-legend" style={{ backgroundColor: '#e3f2fd', border: '2px solid #2196f3' }}></div>
                    <span className="ms-2">₹0.00</span>
                  </div>
                  <div className="d-flex align-items-center">
                    <div className="seat-legend" style={{ backgroundColor: '#f3e5f5', border: '2px solid #9c27b0' }}></div>
                    <span className="ms-2">₹350.00</span>
                  </div>
                  <div className="d-flex align-items-center">
                    <div className="seat-legend" style={{ backgroundColor: '#fff3e0', border: '2px solid #ff9800' }}></div>
                    <span className="ms-2">₹450.00</span>
                  </div>
                  <div className="d-flex align-items-center">
                    <div className="seat-legend" style={{ backgroundColor: '#fff8e1', border: '2px solid #ffc107' }}></div>
                    <span className="ms-2">₹650.00</span>
                  </div>
                  <div className="d-flex align-items-center">
                    <div className="seat-legend" style={{ backgroundColor: '#e8f5e8', border: '2px solid #4caf50' }}></div>
                    <span className="ms-2">₹1,050.00</span>
                  </div>
                  <div className="d-flex align-items-center">
                    <div className="seat-legend" style={{ backgroundColor: '#e1f5fe', border: '2px solid #2196f3' }}></div>
                    <span className="ms-2">₹1,400.00</span>
                  </div>
                  <div className="d-flex align-items-center">
                    <div className="seat-legend" style={{ backgroundColor: '#ffebee', border: '2px solid #f44336' }}></div>
                    <span className="ms-2">₹2,300.00</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Seat Map */}
            <div className="seat-map-container" style={{ maxHeight: '600px', overflowY: 'auto', backgroundColor: '#f8f9fa', borderRadius: '12px', padding: '20px', position: 'relative' }}>
              {seatMapData.segments.map(segment => (
                <div key={segment.segmentId} className="mb-4">
                  <div className="aircraft-visual mb-4">
                    <div className="aircraft-nose" style={{ 
                      width: '60px', 
                      height: '30px', 
                      backgroundColor: '#6c757d', 
                      borderRadius: '50% 50% 0 0', 
                      margin: '0 auto 5px',
                      position: 'relative'
                    }}>
                      <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        fontSize: '16px',
                        color: 'white'
                      }}>✈</div>
                    </div>
                    <div className="aircraft-body"></div>
                    <div className="text-center">
                      <h6 className="mb-1 fw-bold">{segment.aircraft}</h6>
                      <div className="d-flex align-items-center justify-content-center">
                        <span className="badge bg-primary me-2">{segment.departure}</span>
                        <i className="fas fa-arrow-right mx-2"></i>
                        <span className="badge bg-primary">{segment.arrival}</span>
                      </div>
                    </div>
                  </div>
                  
                  {segment.seatMap.cabins
                    .filter(cabin => cabin.cabinClass === selectedCabin)
                    .map(cabin => (
                    <div key={cabin.cabinClass} className="cabin-section mb-4">
                      <div className="d-flex align-items-center justify-content-center mb-3">
                        <div className="flex-grow-1 border-top"></div>
                        <h6 className="mx-3 mb-0 px-3 py-1 bg-primary text-white rounded">{cabin.name}</h6>
                        <div className="flex-grow-1 border-top"></div>
                      </div>
                      
                      <div className="seat-grid">
                        {/* Row Headers */}
                        <div className="d-flex justify-content-center mb-2">
                          <div style={{ width: '40px' }}></div>
                          {cabin.configuration.split('-').map((group, groupIndex) => (
                            <div key={groupIndex} className="d-flex">
                              {Array.from({ length: parseInt(group) }).map((_, seatIndex) => {
                                const totalSeatsBeforeGroup = cabin.configuration
                                  .split('-')
                                  .slice(0, groupIndex)
                                  .reduce((sum, g) => sum + parseInt(g), 0);
                                const seatLabel = String.fromCharCode(65 + totalSeatsBeforeGroup + seatIndex);
                                return (
                                  <div
                                    key={seatIndex}
                                    className="text-center fw-bold"
                                    style={{ width: '32px', fontSize: '12px', margin: '1px' }}
                                  >
                                    {seatLabel}
                                  </div>
                                );
                              })}
                              {groupIndex < cabin.configuration.split('-').length - 1 && (
                                <div style={{ width: '20px' }}></div>
                              )}
                            </div>
                          ))}
                        </div>

                        {/* Seat Rows */}
                        {cabin.rows.map(row => (
                          <div key={row.rowNumber} className={`d-flex justify-content-center mb-1 align-items-center ${row.isExitRow ? 'row-emergency' : ''}`}>
                            {/* Row Number */}
                            <div 
                              className="text-center fw-bold"
                              style={{ width: '40px', fontSize: '12px' }}
                            >
                              {row.rowNumber}
                            </div>
                            
                            {/* Seats grouped by configuration */}
                            {cabin.configuration.split('-').map((group, groupIndex) => (
                              <div key={groupIndex} className="d-flex">
                                {row.seats
                                  .slice(
                                    cabin.configuration.split('-').slice(0, groupIndex).reduce((sum, g) => sum + parseInt(g), 0),
                                    cabin.configuration.split('-').slice(0, groupIndex + 1).reduce((sum, g) => sum + parseInt(g), 0)
                                  )
                                  .map((seat, seatIndex) => (
                                    <button
                                      key={seat.seatNumber}
                                      className={`btn btn-sm seat-btn ${seat.status === 'available' ? '' : 'disabled'}`}
                                      style={{
                                        width: '32px',
                                        height: '32px',
                                        margin: '1px',
                                        padding: '0',
                                        fontSize: '11px',
                                        fontWeight: 'bold',
                                        backgroundColor: getSeatColor(seat),
                                        border: seat.status === 'selected' ? '2px solid #28a745' : 
                                               seat.status === 'occupied' ? '2px solid #6c757d' : 
                                               '2px solid #dee2e6',
                                        color: seat.status === 'occupied' ? '#fff' : '#000',
                                        borderRadius: '6px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                      }}
                                      onClick={() => handleSeatClick(seat, segment.segmentId)}
                                      disabled={seat.status !== 'available'}
                                      title={`${seat.seatNumber} - ${seat.features.join(', ')} ${seat.price > 0 ? `(+${seat.currency} ${seat.price})` : ''}`}
                                    >
                                      {seat.status === 'selected' ? '✓' : 
                                       seat.status === 'occupied' ? '×' : 
                                       seat.seatNumber.slice(-1)}
                                    </button>
                                  ))}
                                {/* Aisle gap */}
                                {groupIndex < cabin.configuration.split('-').length - 1 && (
                                  <div style={{ width: '20px' }}></div>
                                )}
                              </div>
                            ))}
                            
                            {/* Row indicators */}
                            {row.isExitRow && (
                              <span className="badge bg-warning ms-2" style={{ fontSize: '10px' }}>EXIT</span>
                            )}
                            {row.hasExtraLegroom && (
                              <span className="badge bg-info ms-1" style={{ fontSize: '10px' }}>+LEG</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
              
              {/* Aircraft Footer */}
              <div className="text-center mt-4">
                <div className="d-flex justify-content-center align-items-center">
                  <div style={{ 
                    width: '100px', 
                    height: '40px', 
                    background: 'linear-gradient(to bottom, #007bff 0%, #0056b3 100%)',
                    borderRadius: '0 0 50px 50px',
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <div style={{
                      position: 'absolute',
                      width: '20px',
                      height: '20px',
                      backgroundColor: '#6c757d',
                      borderRadius: '50%',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)'
                    }}></div>
                  </div>
                </div>
                <small className="text-muted mt-2 d-block">
                  * Conditions apply. We will try our best to accommodate your seat preferences, however due to operational considerations we can't guarantee this selection. The seat map shown may not be the exact replica of flight layout, we shall not be responsible for losses arising from the same. Thank you for your understanding.
                </small>
              </div>
            </div>

            {/* Selected Seats Summary */}
            {Object.keys(selectedSeats).length > 0 && (
              <div className="mt-4">
                <h6>Selected Seats:</h6>
                <div className="row">
                  {Object.entries(selectedSeats).map(([passengerId, selection]) => {
                    const passenger = passengers.find(p => p.id === passengerId);
                    return (
                      <div key={passengerId} className="col-md-6 mb-2">
                        <div className="card">
                          <div className="card-body py-2">
                            <div className="d-flex justify-content-between">
                              <span>{passenger?.name || 'Passenger'}</span>
                              <span className="fw-bold">
                                {selection.seatNumber}
                                {selection.price > 0 && (
                                  <span className="text-primary ms-2">
                                    +AED {selection.price}
                                  </span>
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          
          <div className="modal-footer bg-light">
            <div className="container-fluid">
              <div className="row align-items-center">
                <div className="col-md-4">
                  <div className="d-flex align-items-center">
                    <strong>Passenger</strong>
                    <div className="ms-3">
                      <div className="bg-warning px-2 py-1 rounded text-dark fw-bold">
                        ADULT-1
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-4 text-center">
                  <div>
                    <strong>Seat</strong>
                    <div className="mt-1">
                      <span className="fw-bold">
                        {Object.keys(selectedSeats).length > 0 ? 
                          Object.values(selectedSeats)[0]?.seatNumber || '-' : 
                          '-'
                        }
                      </span>
                    </div>
                  </div>
                </div>
                <div className="col-md-4 text-center">
                  <div>
                    <strong>Fee</strong>
                    <div className="mt-1">
                      <span className="fw-bold">
                        ₹{getTotalPrice().toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="row mt-3">
                <div className="col-md-6">
                  <div className="d-flex align-items-center">
                    <strong>Total</strong>
                    <div className="ms-3">
                      <span className="fw-bold fs-5">₹{getTotalPrice().toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                <div className="col-md-6 text-end">
                  <button 
                    type="button" 
                    className="btn btn-link text-decoration-none me-3"
                    onClick={onClose}
                  >
                    Proceed Without Seats
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-primary px-4"
                    onClick={handleConfirmSelection}
                    style={{ backgroundColor: '#ff6b35', borderColor: '#ff6b35' }}
                  >
                    Proceed
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default SeatSelection; 