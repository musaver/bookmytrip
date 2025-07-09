'use client';

import React, { useState, useEffect } from 'react';
import { FlightSearchParams } from '@/types/flight';

interface DateOption {
  date: string;
  formattedDate: string;
  dayName: string;
  price: number;
  currency: string;
  isSelected: boolean;
}

interface DateCarouselProps {
  searchParams: any; // Updated to accept the new API format
  onDateSelect: (date: string) => void;
  loading?: boolean;
}

export const DateCarousel: React.FC<DateCarouselProps> = ({
  searchParams,
  onDateSelect,
  loading = false
}) => {
  const [dateOptions, setDateOptions] = useState<DateOption[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Generate date options around the selected date
  useEffect(() => {
    // Extract departure date from the new search parameter format
    const departureDate = searchParams?.searchQuery?.routeInfos?.[0]?.travelDate;
    
    if (!departureDate) return;

    const selectedDate = new Date(departureDate);
    const dates: DateOption[] = [];

    // Generate 7 dates: 3 before, selected date, 3 after
    for (let i = -3; i <= 3; i++) {
      const date = new Date(selectedDate);
      date.setDate(selectedDate.getDate() + i);
      
      // Skip dates in the past
      if (date < new Date()) continue;

      const dateString = date.toISOString().split('T')[0];
      const isSelected = dateString === departureDate;
      
      dates.push({
        date: dateString,
        formattedDate: date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        }),
        dayName: date.toLocaleDateString('en-US', { 
          weekday: 'short' 
        }),
        price: 0, // Will be updated with actual prices
        currency: 'AED',
        isSelected
      });
    }

    setDateOptions(dates);
    
    // Fetch prices for these dates
    if (dates.length > 0) {
      fetchPricesForDates(dates);
    }

    // Cleanup function to prevent DOM conflicts
    return () => {
      if (typeof window !== 'undefined' && window.$) {
        try {
          const carousel = window.$(".client-slider-two");
          if (carousel.hasClass('owl-loaded')) {
            carousel.trigger('destroy.owl.carousel').removeClass('owl-loaded');
          }
        } catch (error) {
          console.warn('Error during carousel cleanup:', error);
        }
      }
    };
  }, [searchParams]);

  // Initialize owl carousel when date options are available
  useEffect(() => {
    if (dateOptions.length > 0 && typeof window !== 'undefined' && window.$) {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        const carousel = window.$(".client-slider-two");
        if (!carousel.hasClass('owl-loaded')) {
          carousel.owlCarousel({
            loop: false,
            margin: 15,
            nav: true,
            dots: false,
            navText: [
              '<i class="fas fa-chevron-left"></i>',
              '<i class="fas fa-chevron-right"></i>'
            ],
            responsive: {
              0: {
                items: 2
              },
              576: {
                items: 2
              },
              768: {
                items: 3
              },
              992: {
                items: 4
              },
              1200: {
                items: 5
              }
            }
          });
        }
      }, 100);
    }
  }, [dateOptions]);

  const fetchPricesForDates = async (dates: DateOption[]) => {
    if (!searchParams) return;

    setIsSearching(true);
    
    try {
      // Create promises for each date search
      const pricePromises = dates.map(async (dateOption) => {
        // Skip if it's the current selected date (we might already have this data)
        if (dateOption.isSelected) {
          return { ...dateOption, price: getRandomPrice() };
        }

        // For demo purposes, we'll generate random prices
        // In a real implementation, you'd make actual API calls
        return new Promise<DateOption>((resolve) => {
          setTimeout(() => {
            resolve({
              ...dateOption,
              price: getRandomPrice()
            });
          }, Math.random() * 1000 + 500); // Random delay to simulate API calls
        });
      });

      const updatedDates = await Promise.all(pricePromises);
      setDateOptions(updatedDates);
    } catch (error) {
      console.error('Error fetching date prices:', error);
      // Set random prices as fallback
      setDateOptions(dates.map(date => ({
        ...date,
        price: getRandomPrice()
      })));
    } finally {
      setIsSearching(false);
    }
  };

  const getRandomPrice = () => {
    // Generate random prices between 800 and 3000 AED
    return Math.floor(Math.random() * (3000 - 800) + 800);
  };

  const handleDateClick = (dateOption: DateOption) => {
    if (dateOption.isSelected || loading) return;
    
    // Update selected state
    setDateOptions(prev => prev.map(d => ({
      ...d,
      isSelected: d.date === dateOption.date
    })));
    
    onDateSelect(dateOption.date);
  };

  if (!searchParams) {
    return null;
  }

  return (
    <section className="section benifit-section flight-available" style={{padding: '30px 0px'}}>
      <div className="container">
        <div className="card">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="mb-0">Choose a different date</h6>
              {isSearching && (
                <div className="d-flex align-items-center">
                  <div className="spinner-border spinner-border-sm me-2" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <small className="text-muted">Finding best prices...</small>
                </div>
              )}
            </div>
            <div className="more-companies-logo mt-0">
              <div className="owl-carousel client-slider-two">
                {dateOptions.length > 0 ? (
                  dateOptions.map((dateOption) => (
                    <div key={dateOption.date} className="client-img">
                      <button 
                        type="button"
                        onClick={() => handleDateClick(dateOption)}
                        className={`btn d-block text-center p-3 rounded w-100 ${
                          dateOption.isSelected 
                            ? 'btn-primary text-white' 
                            : 'btn-light text-dark'
                        } ${loading ? 'pe-none opacity-50' : ''}`}
                        style={{
                          textDecoration: 'none',
                          transition: 'all 0.3s ease',
                          cursor: loading ? 'not-allowed' : 'pointer',
                        }}
                        disabled={loading}
                      >
                        <div className="fw-bold">{dateOption.dayName}, {dateOption.formattedDate}</div>
                        
                        <div className="mt-2">
                          {dateOption.price > 0 ? (
                            <div className="fw-bold">
                              From {dateOption.currency} {dateOption.price.toLocaleString()}
                            </div>
                          ) : isSearching ? (
                            <div className="placeholder-glow">
                              <span className="placeholder col-8"></span>
                            </div>
                          ) : (
                            <div className="text-muted small">Price unavailable</div>
                          )}
                        </div>
                        {dateOption.isSelected && (
                          <div className="mt-0">
                            
                          </div>
                        )}
                      </button>
                    </div>
                  ))
                ) : (
                  // Show loading state when date options are being generated
                  Array.from({ length: 5 }, (_, index) => (
                    <div key={index} className="client-img">
                      <div className="btn d-block text-center p-3 rounded w-100 btn-light">
                        <div className="placeholder-glow">
                          <div className="placeholder col-6 mb-2"></div>
                          <div className="placeholder col-8 mb-2"></div>
                          <div className="placeholder col-10"></div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}; 