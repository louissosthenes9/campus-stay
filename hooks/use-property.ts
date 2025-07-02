'use client';
import { useState, useCallback, useMemo } from 'react';
import useApi from './use-api'; 
import useAuth from './use-auth';
import { PropertyFormData, Property, ApiResponse, BackendPropertyResponse, MarketingCategories, MarketingCategoriesResponse, PaginatedResponse, PropertyFilters, SearchState, SortOption, ApiHook } from '@/types/properties';
import { generateCacheKey, getPropertyAddress, getPropertyCoordinates, getPropertyPrice, getPropertyPrimaryImage, getPropertyTitle, isPropertyAvailable, transformBackendResponse, transformMarketingResponse, transformToApiFormat } from '@/utils/helpers';



export default function useProperty() {
  const { 
    performGetRequest,
    performPostRequest,
    performPutRequest,
    performPatchRequest,
    performDeleteRequest,
  } = useApi() as ApiHook;
  
  const { authHeaders, user } = useAuth();
  
  const [properties, setProperties] = useState<Property[]>([]);
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<Omit<PaginatedResponse<any>, 'results'> | null>(null);
  
  // Marketing categories state
  const [marketingCategories, setMarketingCategories] = useState<MarketingCategories | null>(null);
  const [marketingLoading, setMarketingLoading] = useState<boolean>(false);
  const [marketingError, setMarketingError] = useState<string | null>(null);
  
  // Search and filter state
  const [searchState, setSearchState] = useState<SearchState>({
    query: '',
    filters: {},
    activeFilters: [],
    isSearching: false,
    searchHistory: []
  });
  
  // Cached results for performance
  const [cachedResults, setCachedResults] = useState<Map<string, { data: Property[], timestamp: number }>>(new Map());
  
  const API_ENDPOINT = '/properties/';
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  
  // Predefined sort options
  const sortOptions: SortOption[] = useMemo(() => [
    { value: 'created_at', label: 'Newest First', direction: 'desc' },
    { value: '-created_at', label: 'Oldest First', direction: 'asc' },
    { value: 'price', label: 'Price: Low to High', direction: 'asc' },
    { value: '-price', label: 'Price: High to Low', direction: 'desc' },
    { value: 'title', label: 'Name: A to Z', direction: 'asc' },
    { value: '-title', label: 'Name: Z to A', direction: 'desc' }
  ], []);
  
 
  // Check if cached result is still valid
  const isCacheValid = (timestamp: number): boolean => {
    return Date.now() - timestamp < CACHE_DURATION;
  };

  // Clean and format filters according to backend expectations
  const cleanFilters = (filters: PropertyFilters): PropertyFilters => {
    const cleaned = { ...filters };
    
    // Handle array values by joining with commas
    if (cleaned.amenities && Array.isArray(cleaned.amenities)) {
      cleaned.amenities = cleaned.amenities.join(',');
    }
    
    if (cleaned.property_type && Array.isArray(cleaned.property_type)) {
      cleaned.property_type = cleaned.property_type.join(',');
    }
    
    if (cleaned.electricity_type && Array.isArray(cleaned.electricity_type)) {
      cleaned.electricity_type = cleaned.electricity_type.join(',');
    }
    
    // Handle price range
    if (cleaned.min_price || cleaned.max_price) {
      if (cleaned.price) delete cleaned.price;
    }
    
    // Handle bedroom filters
    if (cleaned.bedrooms && typeof cleaned.bedrooms === 'object') {
      const bedFilter = cleaned.bedrooms as any;
      if (bedFilter.min !== undefined) {
        cleaned.bedrooms__gte = bedFilter.min;
      }
      if (bedFilter.max !== undefined) {
        cleaned.bedrooms__lte = bedFilter.max;
      }
      delete cleaned.bedrooms;
    }
    

    Object.keys(cleaned).forEach(key => {
      const value = cleaned[key as keyof PropertyFilters];
      if (value === undefined || value === null || value === '') {
        delete cleaned[key as keyof PropertyFilters];
      }
    });
    
    return cleaned;
  };

  // Update search state
  const updateSearchState = useCallback((updates: Partial<SearchState>) => {
    setSearchState(prev => ({ ...prev, ...updates }));
  }, []);

  // Set search query
  const setSearchQuery = useCallback((query: string) => {
    updateSearchState({ 
      query,
      isSearching: query.length > 0
    });
    
    // Add to search history if not empty and not already in history
    if (query && !searchState.searchHistory.includes(query)) {
      updateSearchState({
        searchHistory: [query, ...searchState.searchHistory.slice(0, 9)] // Keep last 10 searches
      });
    }
  }, [searchState.searchHistory, updateSearchState]);

  // Update filters
  const updateFilters = useCallback((newFilters: Partial<PropertyFilters>) => {
    const updatedFilters = { ...searchState.filters, ...newFilters };
    const cleanedFilters = cleanFilters(updatedFilters);
    
    // Update active filters list
    const activeFilters = Object.keys(cleanedFilters).filter(key => 
      key !== 'page' && key !== 'page_size' && key !== 'ordering'
    );
    
    updateSearchState({ 
      filters: cleanedFilters,
      activeFilters
    });
  }, [searchState.filters, updateSearchState]);

  // Clear all filters
  const clearFilters = useCallback(() => {
    updateSearchState({
      filters: {},
      activeFilters: [],
      query: ''
    });
  }, [updateSearchState]);

  // Clear specific filter
  const clearFilter = useCallback((filterKey: keyof PropertyFilters) => {
    const updatedFilters = { ...searchState.filters };
    delete updatedFilters[filterKey];
    
    const activeFilters = searchState.activeFilters.filter(key => key !== filterKey);
    
    updateSearchState({
      filters: updatedFilters,
      activeFilters
    });
  }, [searchState.filters, searchState.activeFilters, updateSearchState]);

  // Set sorting
  const setSorting = useCallback((sortValue: string) => {
    updateFilters({ ordering: sortValue });
  }, [updateFilters]);

  // Fetch marketing categories
  const fetchMarketingCategories = useCallback(async (): Promise<MarketingCategories | null> => {
    setMarketingLoading(true);
    setMarketingError(null);
    
    try {
      const response = await performGetRequest<MarketingCategoriesResponse>(
        `${API_ENDPOINT}marketing-categories/`, 
        {}, 
        authHeaders()
      );
      
      if (response.success) {
        const transformedData = transformMarketingResponse(response.data);
        setMarketingCategories(transformedData);
        return transformedData;
      } else {
        setMarketingError(response.error || 'Failed to fetch marketing categories');
        setMarketingCategories(null);
        return null;
      }
    } catch (err: any) {
      setMarketingError(err.message || 'An error occurred while fetching marketing categories');
      setMarketingCategories(null);
      return null;
    } finally {
      setMarketingLoading(false);
    }
  }, []);

  // Enhanced fetch properties with search and filtering
  const fetchProperties = useCallback(async (
    customFilters: PropertyFilters = {},
    useCache: boolean = true
  ): Promise<PaginatedResponse<Property> | null> => {
    setLoading(true);
    setError(null);
    
    // Combine current filters with custom filters
    const combinedFilters = { 
      ...searchState.filters, 
      ...customFilters
    };
    
    // Add search query if present
    if (searchState.query) {
      combinedFilters.search = searchState.query;
    }
    
    const cleanedFilters = cleanFilters(combinedFilters);
    const cacheKey = generateCacheKey(cleanedFilters);
    
    // Debug log
    console.log('Fetching properties with filters:', cleanedFilters);
    
    // Check cache first
    if (useCache) {
      const cachedResult = cachedResults.get(cacheKey);
      if (cachedResult && isCacheValid(cachedResult.timestamp)) {
        const cachedResponse: PaginatedResponse<Property> = {
          count: cachedResult.data.length,
          next: null,
          previous: null,
          results: cachedResult.data
        };
        setProperties(cachedResponse.results);
        setPagination({
          count: cachedResponse.count,
          next: cachedResponse.next,
          previous: cachedResponse.previous,
        });
        setLoading(false);
        return cachedResponse;
      }
    }
    
    try {
      console.log('Making API request to:', API_ENDPOINT);
      console.log('With filters:', cleanedFilters);
      
      const response = await performGetRequest<BackendPropertyResponse>(
        API_ENDPOINT, 
        cleanedFilters, 
        authHeaders()
      );
      
      console.log('API Response:', response);
      
      if (response.success) {
        const transformedData = transformBackendResponse(response.data);
        
        // Cache the results
        if (useCache) {
          setCachedResults(prev => new Map(prev).set(cacheKey, {
            data: transformedData.results,
            timestamp: Date.now()
          }));
        }

        setProperties(transformedData.results);
        setPagination({
          count: transformedData.count,
          next: transformedData.next,
          previous: transformedData.previous,
        });
        return transformedData;
      } else {
        const errorMsg = response.error || 'Failed to fetch properties';
        console.error('API Error:', errorMsg);
        setError(errorMsg);
        setProperties([]);
        setPagination(null);
        return null;
      }
    } catch (err: any) {
      const errorMsg = err.message || 'An error occurred while fetching properties';
      console.error('Fetch Error:', errorMsg, err);
      setError(errorMsg);
      setProperties([]);
      setPagination(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, [searchState.filters, searchState.query, cachedResults, performGetRequest]);

  // Search properties with debouncing
  const searchProperties = useCallback(async (
    query: string,
    filters: PropertyFilters = {}
  ): Promise<PaginatedResponse<Property> | null> => {
    setSearchQuery(query);
    return fetchProperties({ ...filters, search: query }, false);
  }, [fetchProperties, setSearchQuery]);

  // Fetch properties by page
  const fetchPropertiesPage = useCallback(async (page: number): Promise<PaginatedResponse<Property> | null> => {
    return fetchProperties({ page });
  }, [fetchProperties]);

  // Fetch next page
  const fetchNextPage = useCallback(async (): Promise<PaginatedResponse<Property> | null> => {
    if (!pagination?.next) return null;
    
    const currentPage = searchState.filters.page || 1;
    return fetchPropertiesPage(currentPage + 1);
  }, [pagination, searchState.filters.page, fetchPropertiesPage]);

  // Fetch previous page
  const fetchPreviousPage = useCallback(async (): Promise<PaginatedResponse<Property> | null> => {
    if (!pagination?.previous) return null;
    
    const currentPage = searchState.filters.page || 1;
    return fetchPropertiesPage(Math.max(1, currentPage - 1));
  }, [pagination, searchState.filters.page, fetchPropertiesPage]);

  // Fetch single property by ID
  const fetchPropertyById = useCallback(async (id: string | number): Promise<Property | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await performGetRequest<Property>(`${API_ENDPOINT}${id}/`, {}, authHeaders());
      
      if (response.success) {
        setProperty(response.data);
        return response.data;
      } else {
        setError(response.error || `Failed to fetch property ${id}`);
        setProperty(null);
        return null;
      }
    } catch (err: any) {
      setError(err.message || `An error occurred while fetching property ${id}`);
      setProperty(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create new property
  const createProperty = useCallback(async (propertyData: PropertyFormData): Promise<Property | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      const apiData = transformToApiFormat(propertyData);
      
      // Add all property fields to FormData
      Object.entries(apiData).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          formData.append(key, JSON.stringify(value));
        } else if (typeof value === 'object' && value !== null) {
          formData.append(key, JSON.stringify(value));
        } else if (typeof value === 'boolean') {
          formData.append(key, value ? 'true' : 'false');
        } else {
          formData.append(key, String(value));
        }
      });

      // Add images
      if (propertyData.images) {
        propertyData.images.forEach((image) => {
          formData.append('images', image);
        });
      }
      
      // Add videos
      if (propertyData.videos) {
        propertyData.videos.forEach((video) => {
          formData.append('videos', video);
        });
      }
      
      const response = await performPostRequest<Property>(
        API_ENDPOINT, 
        formData,
        {
          ...authHeaders(),
          'Content-Type': 'multipart/form-data' 
        }
      );
      
      if (response.success) {
        // Clear cache after creating new property
        setCachedResults(new Map());
        return response.data;
      } else {
        setError(response.error || 'Failed to create property');
        return null;
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while creating property');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update existing property
  const updateProperty = useCallback(async (
    id: string | number, 
    propertyData: PropertyFormData, 
    replaceMedia: boolean = false
  ): Promise<Property | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      const apiData = transformToApiFormat(propertyData);
      
      // Add property fields
      Object.entries(apiData).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          formData.append(key, JSON.stringify(value));
        } else if (typeof value === 'object' && value !== null) {
          formData.append(key, JSON.stringify(value));
        } else if (typeof value === 'boolean') {
          formData.append(key, value ? 'true' : 'false');
        } else {
          formData.append(key, String(value));
        }
      });

      // Add replace_media flag
      formData.append('replace_media', replaceMedia ? 'true' : 'false');

      // Add images
      if (propertyData.images) {
        propertyData.images.forEach((image) => {
          formData.append('images', image);
        });
      }
      
      // Add videos
      if (propertyData.videos) {
        propertyData.videos.forEach((video) => {
          formData.append('videos', video);
        });
      }
      
      const response = await performPutRequest<Property>(
        `${API_ENDPOINT}${id}/`, 
        formData, 
        authHeaders()
      );
      
      if (response.success) {
        setProperty(prev => (prev && prev.id === Number(id) ? response.data : prev));
        // Clear cache after updating property
        setCachedResults(new Map());
        return response.data;
      } else {
        setError(response.error || `Failed to update property ${id}`);
        return null;
      }
    } catch (err: any) {
      setError(err.message || `An error occurred while updating property ${id}`);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Partial update of property
  const patchProperty = useCallback(async (
    id: string | number, 
    propertyData: Partial<PropertyFormData>
  ): Promise<Property | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const apiData = transformToApiFormat(propertyData as PropertyFormData);
      
      const response = await performPatchRequest<Property>(
        `${API_ENDPOINT}${id}/`, 
        apiData, 
        authHeaders()
      );
      
      if (response.success) {
        setProperty(prev => (prev && prev.id === Number(id) ? response.data : prev));
        // Clear cache after updating property
        setCachedResults(new Map());
        return response.data;
      } else {
        setError(response.error || `Failed to patch property ${id}`);
        return null;
      }
    } catch (err: any) {
      setError(err.message || `An error occurred while patching property ${id}`);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Add media to existing property
  const addMedia = useCallback(async (
    id: string | number,
    images?: File[],
    videos?: File[]
  ): Promise<Property | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      
      if (images) {
        images.forEach((image) => {
          formData.append('images', image);
        });
      }
      
      if (videos) {
        videos.forEach((video) => {
          formData.append('videos', video);
        });
      }
      
      const response = await performPostRequest<Property>(
        `${API_ENDPOINT}${id}/add-media/`, 
        formData,
        authHeaders()
      );
      
      if (response.success) {
        setProperty(prev => (prev && prev.id === Number(id) ? response.data : prev));
        return response.data;
      } else {
        setError(response.error || `Failed to add media to property ${id}`);
        return null;
      }
    } catch (err: any) {
      setError(err.message || `An error occurred while adding media to property ${id}`);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Remove media from property
  const removeMedia = useCallback(async (
    propertyId: string | number,
    mediaId: string | number
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await performDeleteRequest(
        `${API_ENDPOINT}${propertyId}/remove-media/${mediaId}/`,
        {},
        authHeaders()
      );
      
      if (response.success) {
        return true;
      } else {
        setError(response.error || `Failed to remove media ${mediaId}`);
        return false;
      }
    } catch (err: any) {
      setError(err.message || `An error occurred while removing media ${mediaId}`);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete property
  const deleteProperty = useCallback(async (id: string | number): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await performDeleteRequest<null>(`${API_ENDPOINT}${id}/`, {}, authHeaders());
      
      if (response.success) {
        // Remove from local state
        setProperties(prev => prev.filter(p => p.id !== Number(id)));
        setProperty(prev => prev && prev.id === Number(id) ? null : prev);
        // Clear cache after deleting property
        setCachedResults(new Map());
        return true;
      } else {
        setError(response.error || `Failed to delete property ${id}`);
        return false;
      }
    } catch (err: any) {
      setError(err.message || `An error occurred while deleting property ${id}`);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch properties near university (for students)
  const fetchPropertiesNearUniversity = useCallback(async (distance?: number): Promise<Property[] | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const params: { distance?: number } = {};
      if (distance !== undefined) {
        params.distance = distance;
      }
      
      const response = await performGetRequest<BackendPropertyResponse>(
        `${API_ENDPOINT}near-university/`, 
        params, 
        authHeaders()
      );
      
      if (response.success) {
        const transformedData = transformBackendResponse(response.data);
        setProperties(transformedData.results);
        return transformedData.results;
      } else {
        setError(response.error || 'Failed to fetch properties near university');
        setProperties([]);
        return null;
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching properties near university');
      setProperties([]);
      return null;
    } finally {
      setLoading(false);
    }
  }, [performGetRequest]);

  
  // Clear errors
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearMarketingError = useCallback(() => {
    setMarketingError(null);
  }, []);

  // Clear cache
  const clearCache = useCallback(() => {
    setCachedResults(new Map());
  }, []);

  // Reset state
  const resetState = useCallback(() => {
    setProperties([]);
    setProperty(null);
    setError(null);
    setPagination(null);
    setCachedResults(new Map());
  }, []);

  const resetMarketingState = useCallback(() => {
    setMarketingCategories(null);
    setMarketingError(null);
  }, []);

  const resetSearchState = useCallback(() => {
    setSearchState({
      query: '',
      filters: {},
      activeFilters: [],
      isSearching: false,
      searchHistory: []
    });
  }, []);

  // Computed values
  const hasActiveFilters = useMemo(() => {
    return searchState.activeFilters.length > 0 || searchState.query.length > 0;
  }, [searchState.activeFilters, searchState.query]);

  const canFetchNextPage = useMemo(() => {
    return pagination?.next !== null;
  }, [pagination]);

  const canFetchPreviousPage = useMemo(() => {
    return pagination?.previous !== null;
  }, [pagination]);

  const currentPage = useMemo(() => {
    return searchState.filters.page || 1;
  }, [searchState.filters.page]);

  const totalPages = useMemo(() => {
    if (!pagination?.count) return 0;
    const pageSize = searchState.filters.page_size || 20;
    return Math.ceil(pagination.count / pageSize);
  }, [pagination?.count, searchState.filters.page_size]);

  return {
    // State
    properties,
    property,
    loading,
    error,
    pagination,
    
    // Marketing categories state
    marketingCategories,
    marketingLoading,
    marketingError,
    
    // Search and filter state
    searchState,
    hasActiveFilters,
    canFetchNextPage,
    canFetchPreviousPage,
    currentPage,
    totalPages,
    sortOptions,
    
    // CRUD operations
    fetchProperties,
    fetchPropertyById,
    createProperty,
    updateProperty,
    patchProperty,
    deleteProperty,
    
    // Search and filtering
    searchProperties,
    setSearchQuery,
    updateFilters,
    clearFilters,
    clearFilter,
    setSorting,
    
    // Pagination
    fetchPropertiesPage,
    fetchNextPage,
    fetchPreviousPage,
    
    // Media operations
    addMedia,
    removeMedia,
    
    // Special queries
    fetchPropertiesNearUniversity,
    fetchMarketingCategories,
    
    // Helper functions
    getPropertyCoordinates,
    getPropertyPrice,
    getPropertyTitle,
    getPropertyAddress,
    isPropertyAvailable,
    getPropertyPrimaryImage,
    
    // Utility functions
    clearError,
    clearMarketingError,
    clearCache,
    resetState,
    resetMarketingState,
    resetSearchState,
  };
}