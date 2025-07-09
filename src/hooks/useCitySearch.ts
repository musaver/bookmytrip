import { useState, useEffect } from 'react';

interface City {
  name: string;
  code: string;
  country: string;
  countryCode: string;
}

interface UseCitySearchResult {
  cities: City[];
  loading: boolean;
  error: string | null;
  searchCities: (query: string) => void;
}

export const useCitySearch = (): UseCitySearchResult => {
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchCities = async (query: string) => {
    if (!query.trim()) {
      setCities([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/hotels/cities?search=${encodeURIComponent(query)}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch cities');
      }

      const data = await response.json();
      
      if (data.success) {
        setCities(data.cities);
      } else {
        throw new Error(data.error || 'Failed to fetch cities');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setCities([]);
    } finally {
      setLoading(false);
    }
  };

  // Load initial cities on mount
  useEffect(() => {
    searchCities('');
  }, []);

  return {
    cities,
    loading,
    error,
    searchCities
  };
}; 