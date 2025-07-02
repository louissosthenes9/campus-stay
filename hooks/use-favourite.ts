'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import useApi from './use-api';
import useAuth from './use-auth';
import { Favourite, Property } from '@/types/properties';

// Add interface for paginated favourites response
interface FavouritesResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Favourite[];
}

// Add interface for top properties response (might also be paginated)
interface TopPropertiesResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: {
    type: 'FeatureCollection';
    features: Property[];
  };
}

interface UseFavouriteReturn {
  favorites: Favourite[];
  isLoading: boolean;
  error: string | null;
  addFavorite: (propertyId: number) => Promise<boolean>;
  removeFavorite: (propertyId: number) => Promise<boolean>;
  toggleFavorite: (propertyId: number) => Promise<boolean>;
  isFavorite: (propertyId: number) => boolean;
  refreshFavorites: () => Promise<void>;
  refreshTopProperties: () => Promise<void>;
  clearError: () => void;
  // Add pagination info
  pagination: {
    count: number;
    next: string | null;
    previous: string | null;
  } | null;
}

export default function useFavourite(): UseFavouriteReturn {
  const { performRequest } = useApi();
  const { user, authHeaders } = useAuth();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Favourite[]>([]);
  const [pagination, setPagination] = useState<{
    count: number;
    next: string | null;
    previous: string | null;
  } | null>(null);
  const [topProperties, setTopProperties] = useState<Property[]>([]);
  const [hasFetchedInitially, setHasFetchedInitially] = useState(false);

  // Clear error function
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Memoize favorite property IDs for performance
  const favoritePropertyIds = useMemo(() => {
    return new Set(favorites.map(fav => fav.property));
  }, [favorites]);

  // Check if a property is in favorites - memoized for performance
  const isFavorite = useCallback((propertyId: number): boolean => {
    return favorites.some(fav => fav.property === propertyId);
  }, [favorites]);

  // Transform favourites response to handle both paginated and direct array responses
  const transformFavouritesResponse = (response: any): { favorites: Favourite[], pagination: any } => {
    // Check if response has pagination structure
    if (response && typeof response === 'object' && 'results' in response) {
      return {
        favorites: Array.isArray(response.results) ? response.results : [],
        pagination: {
          count: response.count || 0,
          next: response.next || null,
          previous: response.previous || null
        }
      };
    }
    
    // Handle direct array response (fallback)
    if (Array.isArray(response)) {
      return {
        favorites: response,
        pagination: {
          count: response.length,
          next: null,
          previous: null
        }
      };
    }
    
    // Handle empty or invalid response
    return {
      favorites: [],
      pagination: null
    };
  };

  // Transform top properties response
  const transformTopPropertiesResponse = (response: any): Property[] => {
    // Check if response has the nested structure like properties API
    if (response && typeof response === 'object' && 'results' in response) {
      // If results contains features (GeoJSON structure)
      if (response.results && typeof response.results === 'object' && 'features' in response.results) {
        return Array.isArray(response.results.features) ? response.results.features : [];
      }
      // If results is a direct array
      if (Array.isArray(response.results)) {
        return response.results;
      }
    }
    
    // Handle direct array response (fallback)
    if (Array.isArray(response)) {
      return response;
    }
    
    return [];
  };

  // Fetch user's favorites
  const fetchFavorites = useCallback(async () => {
    if (!user?.id) {
      setFavorites([]);
      setPagination(null);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await performRequest<FavouritesResponse | Favourite[]>(
        'GET',
        '/favourites/',
        { user_id: user.id },
        authHeaders()
      );
      
      if (response.success) {
        console.log('Raw favorites response:', response.data);
        
        const { favorites: transformedFavorites, pagination: transformedPagination } = 
          transformFavouritesResponse(response.data);
        
        console.log('Transformed favorites:', transformedFavorites);
        console.log('Pagination info:', transformedPagination);
        
        setFavorites(transformedFavorites);
        console.log('Setting favorites:', favorites);
        setPagination(transformedPagination);
      } else {
        setError(response.error || 'Failed to fetch favorites');
        setFavorites([]);
        setPagination(null);
      }
    } catch (err) {
      console.error('Error fetching favorites:', err);
      setError('An error occurred while fetching favorites');
      setFavorites([]);
      setPagination(null);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Fetch top favorited properties
  const fetchTopFavoritedProperties = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await performRequest<TopPropertiesResponse | Property[]>(
        'GET',
        '/favourites/top-properties/',
        {},
        authHeaders()
      );
      
      if (response.success) {
        console.log('Raw top properties response:', response.data);
        
        const transformedProperties = transformTopPropertiesResponse(response.data);
        
        console.log('Transformed top properties:', transformedProperties);
        setTopProperties(transformedProperties);
      } else {
        setError(response.error || 'Failed to fetch top properties');
        setTopProperties([]);
      }
    } catch (err) {
      console.error('Error fetching top properties:', err);
      setError('An error occurred while fetching top properties');
      setTopProperties([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Add property to favorites
  const addFavorite = useCallback(async (propertyId: number): Promise<boolean> => {
    if (!user?.id) {
      setError('Please log in to add favorites');
      return false;
    }

    // Check if already in favorites
    if (isFavorite(propertyId)) {
      return true; // Already favorited
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await performRequest<Favourite>(
        'POST',
        '/favourites/add-favourite/',
        {
          user_id: user.id,
          property_id: propertyId
        },
        authHeaders()
      );
      
      if (response.success && response.data) {
        // Optimistically update local state
        setFavorites(prev => [...prev, response.data]);
        // Update pagination count
        setPagination(prev => prev ? { ...prev, count: prev.count + 1 } : null);
        return true;
      } else {
        setError(response.error || 'Failed to add to favorites');
        return false;
      }
    } catch (err) {
      console.error('Error adding favorite:', err);
      setError('An error occurred while adding to favorites');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, isFavorite]);

  // Remove property from favorites
  const removeFavorite = useCallback(async (propertyId: number): Promise<boolean> => {
    if (!user?.id) {
      setError('Please log in to remove favorites');
      return false;
    }

    // Check if not in favorites
    if (!isFavorite(propertyId)) {
      return true; // Already not favorited
    }
    
    setIsLoading(true);
    setError(null);
    
    // Optimistically update UI
    const previousFavorites = favorites;
    const previousPagination = pagination;
    setFavorites(prev => prev.filter(fav => fav.property !== propertyId));
    setPagination(prev => prev ? { ...prev, count: Math.max(0, prev.count - 1) } : null);
    
    try {
      const response = await performRequest<void>(
        'DELETE',
        '/favourites/remove-favourite/',
        { user_id: user.id, property_id: propertyId },
        authHeaders(),
        'application/x-www-form-urlencoded' 
      );
      
      if (response.success) {
        return true;
      } else {
        // Revert optimistic update
        setFavorites(previousFavorites);
        setPagination(previousPagination);
        setError(response.error || 'Failed to remove from favorites');
        return false;
      }
    } catch (err) {
      console.error('Error removing favorite:', err);
      // Revert optimistic update
      setFavorites(previousFavorites);
      setPagination(previousPagination);
      setError('An error occurred while removing from favorites');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, isFavorite, favorites, pagination]);

  // Toggle favorite status
  const toggleFavorite = useCallback(async (propertyId: number): Promise<boolean> => {
    if (isFavorite(propertyId)) {
      return await removeFavorite(propertyId);
    } else {
      return await addFavorite(propertyId);
    }
  }, [isFavorite, addFavorite, removeFavorite]);

  // Initial data fetching when user changes
  useEffect(() => {
    if (user?.id && !hasFetchedInitially) {
      fetchFavorites();
      setHasFetchedInitially(true);
    } else if (!user?.id) {
      // Clear favorites when user logs out
      setFavorites([]);
      setPagination(null);
      setHasFetchedInitially(false);
    }
  }, [user?.id, hasFetchedInitially]);

  return {
    favorites,
    isLoading,
    error,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
    refreshFavorites: fetchFavorites,
    refreshTopProperties: fetchTopFavoritedProperties,
    clearError,
    pagination,
  };
}