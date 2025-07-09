import { useState, useCallback } from 'react';
import { FlightSearchParams, FlightSearchState, FlightResult, FlightFilters, FlightSearchRequest, FlightSearchResponse } from '@/types/flight';

// Helper function to format duration
const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
};

// Helper function to convert API response to FlightResult
const transformFlightData = (apiResponse: any): FlightResult[] => {
  const results: FlightResult[] = [];
  
  console.log('Transforming API response:', {
    hasSearchResult: !!apiResponse.searchResult,
    hasTripInfos: !!apiResponse.searchResult?.tripInfos,
    hasONWARD: !!apiResponse.searchResult?.tripInfos?.ONWARD,
    onwardLength: apiResponse.searchResult?.tripInfos?.ONWARD?.length
  });
  
  if (!apiResponse.searchResult?.tripInfos?.ONWARD) {
    console.log('No ONWARD flights found in response');
    return results;
  }

  const onwardFlights = apiResponse.searchResult.tripInfos.ONWARD;
  console.log(`Processing ${onwardFlights.length} flights`);
  
      onwardFlights.forEach((flightInfo: any, flightIndex: number) => {
      if (!flightInfo.sI || flightInfo.sI.length === 0) return;
      
      const firstSegment = flightInfo.sI[0];
      const lastSegment = flightInfo.sI[flightInfo.sI.length - 1];
      
      // Calculate total duration
      const totalDuration = flightInfo.sI.reduce((sum: number, segment: any) => sum + segment.duration, 0);
      
      // Get price information
      const priceInfo = flightInfo.totalPriceList?.[0];
      const adultPrice = priceInfo?.fd?.ADULT?.fC?.TF || priceInfo?.fd?.ADULT?.fC?.TAF || 0;
      
      // Determine number of stops
      const stops = Math.max(0, flightInfo.sI.length - 1);
      
      const flightResult: FlightResult = {
        id: `${flightIndex}-${firstSegment.id}`,
        airline: {
          code: firstSegment.fD.aI.code,
          name: firstSegment.fD.aI.name,
          logo: `/images/flight-company-${firstSegment.fD.aI.code.toLowerCase()}.svg`
        },
        flightNumber: firstSegment.fD.fN,
        aircraft: firstSegment.fD.eT,
        departure: {
          airport: {
            code: firstSegment.da.code,
            name: firstSegment.da.name,
            city: firstSegment.da.city
          },
          time: firstSegment.dt,
          date: firstSegment.dt.split('T')[0],
          terminal: firstSegment.da.terminal
        },
        arrival: {
          airport: {
            code: lastSegment.aa.code,
            name: lastSegment.aa.name,
            city: lastSegment.aa.city
          },
          time: lastSegment.at,
          date: lastSegment.at.split('T')[0],
          terminal: lastSegment.aa.terminal
        },
        duration: {
          total: totalDuration,
          formatted: formatDuration(totalDuration)
        },
        stops,
        price: {
          total: adultPrice,
          currency: 'AED',
          breakdown: {
            baseFare: priceInfo?.fd?.ADULT?.fC?.BF || 0,
            taxes: (priceInfo?.fd?.ADULT?.fC?.TF || 0) - (priceInfo?.fd?.ADULT?.fC?.BF || 0),
            fees: 0
          }
        },
        cabinClass: priceInfo?.fd?.ADULT?.cc || 'ECONOMY',
        seatsLeft: Math.floor(Math.random() * 20) + 1, // Random for now
        refundable: Math.random() > 0.5,
        changeable: Math.random() > 0.3
      };
      
      results.push(flightResult);
    });
  
  console.log(`Transformed ${results.length} flights successfully`);
  return results;
};

// Helper function to extract filters from results
const extractFiltersFromResults = (results: FlightResult[]): FlightFilters => {
  const airlines = [...new Set(results.map(r => r.airline.code))];
  const stops = [...new Set(results.map(r => r.stops))];
  const prices = results.map(r => r.price.total);
  const durations = results.map(r => r.duration.total);
  const departureAirports = [...new Set(results.map(r => r.departure.airport.code))];
  const arrivalAirports = [...new Set(results.map(r => r.arrival.airport.code))];
  
  return {
    priceRange: {
      min: Math.min(...prices),
      max: Math.max(...prices)
    },
    durationRange: {
      min: Math.min(...durations),
      max: Math.max(...durations)
    },
    airlines,
    departureAirports,
    arrivalAirports,
    refundable: true,
    changeable: true
  };
};

export const useFlightSearch = () => {
  const [state, setState] = useState<FlightSearchState>({
    loading: false,
    error: null,
    results: [],
    filters: {},
    searchParams: null,
    totalResults: 0,
    currentPage: 1,
    resultsPerPage: 20,
    sortBy: 'price',
    sortOrder: 'asc'
  });

  const searchFlights = useCallback(async (params: any) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      // The params now contain the searchQuery directly
      const requestPayload = params;

      // Call the API
      const response = await fetch('/api/flight/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestPayload)
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // Transform API response to our format
      const transformedResults = transformFlightData(data);
      
      const filters = extractFiltersFromResults(transformedResults);
      
      setState(prev => ({
        ...prev,
        loading: false,
        results: transformedResults,
        filters,
        searchParams: params,
        totalResults: transformedResults.length,
        currentPage: 1
      }));
      
    } catch (error) {
      console.error('Flight search error:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'An error occurred while searching flights'
      }));
    }
  }, []);

  const applyFilters = useCallback((activeFilters: Partial<FlightFilters>) => {
    setState(prev => {
      let filteredResults = [...prev.results];
      
      // Apply price filter
      if (activeFilters.priceRange) {
        filteredResults = filteredResults.filter(flight => 
          flight.price.total >= activeFilters.priceRange!.min &&
          flight.price.total <= activeFilters.priceRange!.max
        );
      }
      
      // Apply duration filter
      if (activeFilters.durationRange) {
        filteredResults = filteredResults.filter(flight => 
          flight.duration.total >= activeFilters.durationRange!.min &&
          flight.duration.total <= activeFilters.durationRange!.max
        );
      }
      
      // Apply airline filter
      if (activeFilters.airlines && activeFilters.airlines.length > 0) {
        filteredResults = filteredResults.filter(flight => 
          activeFilters.airlines!.includes(flight.airline.code)
        );
      }
      
      // Apply stops filter
      if (activeFilters.stops !== undefined) {
        filteredResults = filteredResults.filter(flight => 
          flight.stops === activeFilters.stops
        );
      }
      
      // Apply departure time filter
      if (activeFilters.departureTime) {
        filteredResults = filteredResults.filter(flight => {
          const departureTime = flight.departure.time;
          const hour = parseInt(departureTime.split(':')[0]);
          
          const timeSlot = activeFilters.departureTime!;
          if (timeSlot === 'early-morning') return hour >= 6 && hour < 12;
          if (timeSlot === 'morning') return hour >= 6 && hour < 12;
          if (timeSlot === 'afternoon') return hour >= 12 && hour < 18;
          if (timeSlot === 'evening') return hour >= 18 && hour < 24;
          if (timeSlot === 'night') return hour >= 0 && hour < 6;
          
          return true;
        });
      }
      
      // Apply refundable filter
      if (activeFilters.refundable !== undefined) {
        filteredResults = filteredResults.filter(flight => 
          flight.refundable === activeFilters.refundable
        );
      }
      
      return {
        ...prev,
        results: filteredResults,
        totalResults: filteredResults.length,
        currentPage: 1
      };
    });
  }, []);

  const sortResults = useCallback((sortBy: FlightSearchState['sortBy'], sortOrder: FlightSearchState['sortOrder']) => {
    setState(prev => {
      const sortedResults = [...prev.results].sort((a, b) => {
        let comparison = 0;
        
        switch (sortBy) {
          case 'price':
            comparison = a.price.total - b.price.total;
            break;
          case 'duration':
            comparison = a.duration.total - b.duration.total;
            break;
          case 'departure':
            comparison = new Date(`${a.departure.date} ${a.departure.time}`).getTime() - 
                        new Date(`${b.departure.date} ${b.departure.time}`).getTime();
            break;
          case 'arrival':
            comparison = new Date(`${a.arrival.date} ${a.arrival.time}`).getTime() - 
                        new Date(`${b.arrival.date} ${b.arrival.time}`).getTime();
            break;
          case 'stops':
            comparison = a.stops - b.stops;
            break;
        }
        
        return sortOrder === 'asc' ? comparison : -comparison;
      });
      
      return {
        ...prev,
        results: sortedResults,
        sortBy,
        sortOrder
      };
    });
  }, []);

  const setPage = useCallback((page: number) => {
    setState(prev => ({ ...prev, currentPage: page }));
  }, []);

  const searchWithNewDate = useCallback(async (newDate: string) => {
    if (!state.searchParams) return;
    
    // Update the search params with new date and search again
    const updatedParams = {
      ...state.searchParams,
      searchQuery: {
        ...(state.searchParams as any).searchQuery,
        routeInfos: (state.searchParams as any).searchQuery.routeInfos.map((route: any, index: number) => {
          if (index === 0) {
            return { ...route, travelDate: newDate };
          }
          return route;
        })
      }
    };
    
    await searchFlights(updatedParams);
  }, [state.searchParams, searchFlights]);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const resetSearch = useCallback(() => {
    setState({
      loading: false,
      error: null,
      results: [],
      filters: {},
      searchParams: null,
      totalResults: 0,
      currentPage: 1,
      resultsPerPage: 20,
      sortBy: 'price',
      sortOrder: 'asc'
    });
  }, []);

  const setResultsPerPage = useCallback((resultsPerPage: number) => {
    setState(prev => ({ 
      ...prev, 
      resultsPerPage,
      currentPage: 1 // Reset to first page when changing results per page
    }));
  }, []);

  const getPaginatedResults = useCallback(() => {
    const startIndex = (state.currentPage - 1) * state.resultsPerPage;
    const endIndex = startIndex + state.resultsPerPage;
    return state.results.slice(startIndex, endIndex);
  }, [state.results, state.currentPage, state.resultsPerPage]);

  const updateSearchParams = useCallback((updates: Partial<FlightSearchParams>) => {
    setState(prev => ({
      ...prev,
      searchParams: prev.searchParams ? { ...prev.searchParams, ...updates } : null
    }));
  }, []);

  return {
    ...state,
    searchFlights,
    applyFilters,
    sortResults,
    setPage,
    setResultsPerPage,
    getPaginatedResults,
    clearError,
    resetSearch,
    searchWithNewDate,
    updateSearchParams
  };
}; 