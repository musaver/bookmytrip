'use client';

import { useState, useCallback } from 'react';

interface City {
    name: string;
    code: string;
    country: string;
    countryCode: string;
}

interface Hotel {
    id: string;
    name: string;
    cityName: string;
    cityCode: string;
    country: string;
    rating: number;
    propertyType: string;
}

interface SearchResult {
    type: 'city' | 'hotel';
    data: City | Hotel;
}

export const useHotelSearch = () => {
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const search = useCallback(async (query: string) => {
        if (query.length < 2) {
            setResults([]);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Search for cities only
            const citiesResponse = await fetch(`/api/hotels/cities?search=${encodeURIComponent(query)}`);
            const citiesData = await citiesResponse.json();

            const searchResults: SearchResult[] = [];

            // Add cities to results
            if (citiesData.success && citiesData.cities) {
                citiesData.cities.forEach((city: City) => {
                    searchResults.push({
                        type: 'city',
                        data: city
                    });
                });
            }

            // Sort results alphabetically
            searchResults.sort((a, b) => a.data.name.localeCompare(b.data.name));

            // Limit to 15 results
            setResults(searchResults.slice(0, 15));
        } catch (err) {
            console.error('Search error:', err);
            setError('Failed to search. Please try again.');
            setResults([]);
        } finally {
            setLoading(false);
        }
    }, []);

    const clearResults = useCallback(() => {
        setResults([]);
        setError(null);
    }, []);

    return {
        results,
        loading,
        error,
        search,
        clearResults
    };
}; 