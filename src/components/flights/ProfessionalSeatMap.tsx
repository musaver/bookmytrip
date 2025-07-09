'use client';

import React, { useState } from 'react';

interface Passenger {
  id: string;
  name: string;
  type: 'adult' | 'child' | 'infant';
}

interface Seat {
  id: string;
  row: number;
  column: string;
  price: number;
  status: 'available' | 'occupied' | 'selected';
  type: 'window' | 'middle' | 'aisle';
  category: 'business' | 'premium' | 'extra-legroom' | 'standard' | 'free';
}

interface ProfessionalSeatMapProps {
  flightId: string;
  passengers: Passenger[];
  onSeatSelect: (selections: any[]) => void;
  onClose: () => void;
}

const ProfessionalSeatMap: React.FC<ProfessionalSeatMapProps> = ({
  flightId,
  passengers,
  onSeatSelect,
  onClose
}) => {
  const [selectedSeats, setSelectedSeats] = useState<{[key: string]: Seat}>({});
  const [currentPassenger, setCurrentPassenger] = useState(0);

  // Generate realistic seat map data
  const generateSeats = (): Seat[] => {
    const seats: Seat[] = [];
    
    // Business Class (rows 1-5, 2-2 configuration)
    for (let row = 1; row <= 5; row++) {
      const basePrice = row <= 2 ? 2300 : 1400;
      const columns = ['A', 'B', 'D', 'E'];
      
      columns.forEach((col, index) => {
        seats.push({
          id: `${row}${col}`,
          row,
          column: col,
          price: basePrice,
          status: Math.random() > 0.7 ? 'occupied' : 'available',
          type: index === 0 || index === 3 ? 'window' : 'aisle',
          category: 'business'
        });
      });
    }

    // Economy Class (rows 6-35, 3-3 configuration)
    for (let row = 6; row <= 35; row++) {
      let price = 0;
      let category: Seat['category'] = 'free';
      
      if (row <= 10) {
        price = 650;
        category = 'premium';
      } else if (row <= 15) {
        price = 500;
        category = 'extra-legroom';
      } else if (row <= 25) {
        price = 350;
        category = 'standard';
      }

      const columns = ['A', 'B', 'C', 'D', 'E', 'F'];
      
      columns.forEach((col, index) => {
        let seatType: Seat['type'] = 'middle';
        if (index === 0 || index === 5) seatType = 'window';
        if (index === 2 || index === 3) seatType = 'aisle';

        seats.push({
          id: `${row}${col}`,
          row,
          column: col,
          price,
          status: Math.random() > 0.8 ? 'occupied' : 'available',
          type: seatType,
          category
        });
      });
    }

    return seats;
  };

  const [seats] = useState(generateSeats());

  const getSeatColor = (seat: Seat) => {
    if (seat.status === 'selected') return '#28a745';
    if (seat.status === 'occupied') return '#6c757d';
    
    switch (seat.category) {
      case 'business':
        return '#e1f5fe';
      case 'premium':
        return '#f3e5f5';
      case 'extra-legroom':
        return '#fff3e0';
      case 'standard':
        return '#fff8e1';
      case 'free':
        return '#e3f2fd';
      default:
        return '#f8f9fa';
    }
  };

  const getSeatBorderColor = (seat: Seat) => {
    if (seat.status === 'selected') return '#28a745';
    if (seat.status === 'occupied') return '#6c757d';
    
    switch (seat.category) {
      case 'business':
        return '#2196f3';
      case 'premium':
        return '#9c27b0';
      case 'extra-legroom':
        return '#ff9800';
      case 'standard':
        return '#ffc107';
      case 'free':
        return '#2196f3';
      default:
        return '#dee2e6';
    }
  };

  const handleSeatClick = (seat: Seat) => {
    if (seat.status === 'occupied') return;

    const currentPassengerId = passengers[currentPassenger]?.id;
    
    // Remove previous seat selection for this passenger
    if (selectedSeats[currentPassengerId]) {
      const prevSeat = selectedSeats[currentPassengerId];
      const seatIndex = seats.findIndex(s => s.id === prevSeat.id);
      if (seatIndex !== -1) {
        seats[seatIndex].status = 'available';
      }
    }

    // If clicking the same seat, deselect it
    if (selectedSeats[currentPassengerId]?.id === seat.id) {
      seat.status = 'available';
      setSelectedSeats(prev => {
        const newState = { ...prev };
        delete newState[currentPassengerId];
        return newState;
      });
      return;
    }

    // Select new seat
    seat.status = 'selected';
    setSelectedSeats(prev => ({
      ...prev,
      [currentPassengerId]: seat
    }));

    // Auto-advance to next passenger
    if (currentPassenger < passengers.length - 1) {
      setCurrentPassenger(prev => prev + 1);
    }
  };

  const handleConfirmSelection = () => {
    const selections = Object.entries(selectedSeats).map(([passengerId, seat]) => ({
      passengerId,
      segmentId: 'segment-1',
      seatCode: seat.id,
      amount: seat.price,
      travelerId: passengerId
    }));

    onSeatSelect(selections);
  };

  const getTotalPrice = () => {
    return Object.values(selectedSeats).reduce((sum, seat) => sum + seat.price, 0);
  };

  const groupSeatsByRow = () => {
    const grouped: { [key: number]: Seat[] } = {};
    seats.forEach(seat => {
      if (!grouped[seat.row]) {
        grouped[seat.row] = [];
      }
      grouped[seat.row].push(seat);
    });

    // Sort seats in each row by column
    Object.keys(grouped).forEach(row => {
      grouped[parseInt(row)].sort((a, b) => a.column.localeCompare(b.column));
    });

    return grouped;
  };

  const seatsByRow = groupSeatsByRow();

  return (
    <>
      <style jsx>{`
        .seat-button {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          border: 2px solid;
          font-size: 10px;
          font-weight: bold;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          margin: 1px;
        }
        
        .seat-button:hover:not(.occupied) {
          transform: scale(1.1);
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        }
        
        .seat-button.occupied {
          cursor: not-allowed;
          color: white;
        }
        
        .seat-button.selected {
          color: white;
        }
        
        .row-number {
          width: 30px;
          font-weight: bold;
          font-size: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #6c757d;
        }
        
        .aisle-space {
          width: 20px;
        }
        
        .aircraft-body {
          background: linear-gradient(to bottom, #f8f9fa 0%, #e9ecef 100%);
          border-radius: 20px;
          padding: 20px;
          position: relative;
          max-width: 600px;
          margin: 0 auto;
        }
        
        .aircraft-nose {
          width: 80px;
          height: 40px;
          background: linear-gradient(to bottom, #6c757d 0%, #495057 100%);
          border-radius: 50% 50% 0 0;
          margin: 0 auto 20px;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 18px;
        }
        
        .cabin-divider {
          height: 2px;
          background: linear-gradient(to right, transparent 0%, #6c757d 50%, transparent 100%);
          margin: 15px 0;
          position: relative;
        }
        
        .cabin-divider::after {
          content: '';
          position: absolute;
          left: 50%;
          top: -8px;
          transform: translateX(-50%);
          width: 0;
          height: 0;
          border-left: 8px solid transparent;
          border-right: 8px solid transparent;
          border-top: 8px solid #6c757d;
        }
      `}</style>
      
      <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <div className="modal-dialog modal-xl">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                <i className="fas fa-plane me-2"></i>
                Select Your Seats
              </h5>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>
            
            <div className="modal-body">
              {/* Flight Info */}
              <div className="text-center mb-4">
                <div className="d-flex align-items-center justify-content-center mb-3">
                  <div className="me-3">
                    <div className="bg-primary text-white px-3 py-1 rounded">
                      <i className="fas fa-plane me-2"></i>
                      IndiGo 6E-395
                    </div>
                  </div>
                  <div className="d-flex align-items-center">
                    <span className="badge bg-secondary me-2">DEL</span>
                    <i className="fas fa-arrow-right mx-2"></i>
                    <span className="badge bg-secondary">BOM</span>
                  </div>
                </div>
              </div>

              {/* Passenger Selection */}
              <div className="row mb-4">
                <div className="col-md-12">
                  <h6 className="mb-3">Selecting seats for:</h6>
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
                            {selectedSeats[passenger.id].id}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Legend */}
              <div className="row mb-4">
                <div className="col-md-6">
                  <h6 className="mb-3">Seat Status</h6>
                  <div className="d-flex flex-wrap gap-3 small">
                    <div className="d-flex align-items-center">
                      <div className="seat-button selected" style={{ backgroundColor: '#28a745', borderColor: '#28a745', color: 'white' }}>✓</div>
                      <span className="ms-2">Selected</span>
                    </div>
                    <div className="d-flex align-items-center">
                      <div className="seat-button occupied" style={{ backgroundColor: '#6c757d', borderColor: '#6c757d', color: 'white' }}>×</div>
                      <span className="ms-2">Occupied</span>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <h6 className="mb-3">Seat Categories</h6>
                  <div className="d-flex flex-wrap gap-2 small">
                    <div className="d-flex align-items-center">
                      <div className="seat-button" style={{ backgroundColor: '#e1f5fe', borderColor: '#2196f3' }}></div>
                      <span className="ms-2">Business (₹1,400-₹2,300)</span>
                    </div>
                    <div className="d-flex align-items-center">
                      <div className="seat-button" style={{ backgroundColor: '#f3e5f5', borderColor: '#9c27b0' }}></div>
                      <span className="ms-2">Premium (₹650)</span>
                    </div>
                    <div className="d-flex align-items-center">
                      <div className="seat-button" style={{ backgroundColor: '#fff3e0', borderColor: '#ff9800' }}></div>
                      <span className="ms-2">Extra Legroom (₹500)</span>
                    </div>
                    <div className="d-flex align-items-center">
                      <div className="seat-button" style={{ backgroundColor: '#fff8e1', borderColor: '#ffc107' }}></div>
                      <span className="ms-2">Standard (₹350)</span>
                    </div>
                    <div className="d-flex align-items-center">
                      <div className="seat-button" style={{ backgroundColor: '#e3f2fd', borderColor: '#2196f3' }}></div>
                      <span className="ms-2">Free (₹0)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Aircraft Seat Map */}
              <div className="aircraft-body">
                <div className="aircraft-nose">
                  ✈
                </div>
                
                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  {/* Column Headers */}
                  <div className="d-flex justify-content-center mb-2">
                    <div className="row-number"></div>
                    <div className="d-flex">
                      {/* Business Class Headers */}
                      <div className="d-flex">
                        <div style={{ width: '32px', textAlign: 'center', fontSize: '12px', fontWeight: 'bold', margin: '1px' }}>A</div>
                        <div style={{ width: '32px', textAlign: 'center', fontSize: '12px', fontWeight: 'bold', margin: '1px' }}>B</div>
                      </div>
                      <div className="aisle-space"></div>
                      <div className="d-flex">
                        <div style={{ width: '32px', textAlign: 'center', fontSize: '12px', fontWeight: 'bold', margin: '1px' }}>D</div>
                        <div style={{ width: '32px', textAlign: 'center', fontSize: '12px', fontWeight: 'bold', margin: '1px' }}>E</div>
                      </div>
                    </div>
                  </div>

                  {Object.keys(seatsByRow).map(rowNum => {
                    const rowNumber = parseInt(rowNum);
                    const rowSeats = seatsByRow[rowNumber];
                    const isBusinessClass = rowNumber <= 5;
                    
                    return (
                      <div key={rowNumber}>
                        {/* Cabin Divider between Business and Economy */}
                        {rowNumber === 6 && (
                          <>
                            <div className="cabin-divider"></div>
                            <div className="d-flex justify-content-center mb-2 mt-3">
                              <div className="row-number"></div>
                              <div className="d-flex">
                                {/* Economy Class Headers */}
                                <div className="d-flex">
                                  <div style={{ width: '32px', textAlign: 'center', fontSize: '12px', fontWeight: 'bold', margin: '1px' }}>A</div>
                                  <div style={{ width: '32px', textAlign: 'center', fontSize: '12px', fontWeight: 'bold', margin: '1px' }}>B</div>
                                  <div style={{ width: '32px', textAlign: 'center', fontSize: '12px', fontWeight: 'bold', margin: '1px' }}>C</div>
                                </div>
                                <div className="aisle-space"></div>
                                <div className="d-flex">
                                  <div style={{ width: '32px', textAlign: 'center', fontSize: '12px', fontWeight: 'bold', margin: '1px' }}>D</div>
                                  <div style={{ width: '32px', textAlign: 'center', fontSize: '12px', fontWeight: 'bold', margin: '1px' }}>E</div>
                                  <div style={{ width: '32px', textAlign: 'center', fontSize: '12px', fontWeight: 'bold', margin: '1px' }}>F</div>
                                </div>
                              </div>
                            </div>
                          </>
                        )}
                        
                        <div className="d-flex justify-content-center align-items-center mb-1">
                          <div className="row-number">{rowNumber}</div>
                          <div className="d-flex">
                            {isBusinessClass ? (
                              // Business Class Layout (2-2)
                              <>
                                <div className="d-flex">
                                  {rowSeats.filter(seat => ['A', 'B'].includes(seat.column)).map(seat => (
                                    <button
                                      key={seat.id}
                                      className={`seat-button ${seat.status}`}
                                      style={{
                                        backgroundColor: getSeatColor(seat),
                                        borderColor: getSeatBorderColor(seat),
                                        color: seat.status === 'available' ? '#000' : '#fff'
                                      }}
                                      onClick={() => handleSeatClick(seat)}
                                      disabled={seat.status === 'occupied'}
                                      title={`${seat.id} - ₹${seat.price} - ${seat.type}`}
                                    >
                                      {seat.column}
                                    </button>
                                  ))}
                                </div>
                                <div className="aisle-space"></div>
                                <div className="d-flex">
                                  {rowSeats.filter(seat => ['D', 'E'].includes(seat.column)).map(seat => (
                                    <button
                                      key={seat.id}
                                      className={`seat-button ${seat.status}`}
                                      style={{
                                        backgroundColor: getSeatColor(seat),
                                        borderColor: getSeatBorderColor(seat),
                                        color: seat.status === 'available' ? '#000' : '#fff'
                                      }}
                                      onClick={() => handleSeatClick(seat)}
                                      disabled={seat.status === 'occupied'}
                                      title={`${seat.id} - ₹${seat.price} - ${seat.type}`}
                                    >
                                      {seat.column}
                                    </button>
                                  ))}
                                </div>
                              </>
                            ) : (
                              // Economy Class Layout (3-3)
                              <>
                                <div className="d-flex">
                                  {rowSeats.filter(seat => ['A', 'B', 'C'].includes(seat.column)).map(seat => (
                                    <button
                                      key={seat.id}
                                      className={`seat-button ${seat.status}`}
                                      style={{
                                        backgroundColor: getSeatColor(seat),
                                        borderColor: getSeatBorderColor(seat),
                                        color: seat.status === 'available' ? '#000' : '#fff'
                                      }}
                                      onClick={() => handleSeatClick(seat)}
                                      disabled={seat.status === 'occupied'}
                                      title={`${seat.id} - ₹${seat.price} - ${seat.type}`}
                                    >
                                      {seat.column}
                                    </button>
                                  ))}
                                </div>
                                <div className="aisle-space"></div>
                                <div className="d-flex">
                                  {rowSeats.filter(seat => ['D', 'E', 'F'].includes(seat.column)).map(seat => (
                                    <button
                                      key={seat.id}
                                      className={`seat-button ${seat.status}`}
                                      style={{
                                        backgroundColor: getSeatColor(seat),
                                        borderColor: getSeatBorderColor(seat),
                                        color: seat.status === 'available' ? '#000' : '#fff'
                                      }}
                                      onClick={() => handleSeatClick(seat)}
                                      disabled={seat.status === 'occupied'}
                                      title={`${seat.id} - ₹${seat.price} - ${seat.type}`}
                                    >
                                      {seat.column}
                                    </button>
                                  ))}
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Selected Seats Summary */}
              {Object.keys(selectedSeats).length > 0 && (
                <div className="mt-4">
                  <h6>Selected Seats:</h6>
                  <div className="row">
                    {Object.entries(selectedSeats).map(([passengerId, seat]) => {
                      const passenger = passengers.find(p => p.id === passengerId);
                      return (
                        <div key={passengerId} className="col-md-6 mb-2">
                          <div className="card">
                            <div className="card-body py-2">
                              <div className="d-flex justify-content-between">
                                <span>{passenger?.name || 'Passenger'}</span>
                                <span className="fw-bold">
                                  {seat.id}
                                  {seat.price > 0 && (
                                    <span className="text-primary ms-2">
                                      +₹{seat.price}
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
                          {passengers[currentPassenger]?.name || `ADULT-${currentPassenger + 1}`}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4 text-center">
                    <div>
                      <strong>Seat</strong>
                      <div className="mt-1">
                        <span className="fw-bold">
                          {selectedSeats[passengers[currentPassenger]?.id]?.id || '-'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4 text-center">
                    <div>
                      <strong>Fee</strong>
                      <div className="mt-1">
                        <span className="fw-bold">
                          ₹{selectedSeats[passengers[currentPassenger]?.id]?.price || 0}
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

export default ProfessionalSeatMap; 