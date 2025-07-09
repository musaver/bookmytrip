import { useState, useEffect, useCallback } from 'react';

export interface Airport {
  code: string;
  name: string;
  city: string;
  country?: string;
}

export interface AirportSearchState {
  airports: Airport[];
  loading: boolean;
  error: string | null;
  fallback: boolean;
}

export const useAirportSearch = () => {
  const [state, setState] = useState<AirportSearchState>({
    airports: [],
    loading: false,
    error: null,
    fallback: false
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch airports when debounced query changes
  useEffect(() => {
    if (debouncedQuery.length >= 2) {
      searchAirports(debouncedQuery);
    } else if (debouncedQuery.length === 0) {
      // Load default airports when query is empty
      searchAirports('');
    }
  }, [debouncedQuery]);

  const searchAirports = useCallback(async (query: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await fetch(`/api/airports?q=${encodeURIComponent(query)}`);
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }
      
      const data = await response.json();
      
      setState(prev => ({
        ...prev,
        loading: false,
        airports: data.airports || [],
        fallback: data.fallback || false
      }));
      
    } catch (error) {
      console.error('Airport search error:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to search airports'
      }));
    }
  }, []);

  const updateQuery = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setDebouncedQuery('');
  }, []);

  // Load default airports on mount
  useEffect(() => {
    searchAirports('');
  }, [searchAirports]);

  return {
    ...state,
    query: searchQuery,
    updateQuery,
    clearSearch,
    searchAirports
  };
}; 