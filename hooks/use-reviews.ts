'use client';
import { useState, useCallback, useMemo } from 'react';
import useApi from './use-api';
import useAuth from './use-auth';

// Review interfaces
export interface Review {
  id: number;
  reviewer: {
    id: number;
    username: string;
    first_name?: string;
    last_name?: string;
    profile_picture?: string;
  };
  property: number;
  rating: number;
  title: string;
  comment: string;
  created_at: string;
  updated_at: string;
}

export interface ReviewFormData {
  property: number;
  rating: number;
  title: string;
  comment: string;
}

export interface ReviewFilters {
  property?: number;
  rating?: number;
  rating__gte?: number;
  rating__lte?: number;
  ordering?: string;
  page?: number;
  page_size?: number;
  search?: string;
}

export interface ReviewStats {
  total_reviews: number;
  average_rating: number;
  rating_distribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

// Paginated response for reviews
export interface PaginatedReviewResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Review[];
}

// API response structure
interface ApiResponse<T = any> {
  data: T;
  status: number;
  success: boolean;
  error?: string;
}

// API hook interface
interface ApiHook {
  performGetRequest: <T>(endpoint: string, params?: object, headers?: object) => Promise<ApiResponse<T>>;
  performPostRequest: <T>(endpoint: string, data: any, headers?: object, contentType?: string) => Promise<ApiResponse<T>>;
  performPutRequest: <T>(endpoint: string, data: any, headers?: object) => Promise<ApiResponse<T>>;
  performPatchRequest: <T>(endpoint: string, data: any, headers?: object) => Promise<ApiResponse<T>>;
  performDeleteRequest: <T>(endpoint: string, data?: object, headers?: object) => Promise<ApiResponse<T>>;
}

export default function useReview() {
  const {
    performGetRequest,
    performPostRequest,
    performPutRequest,
    performPatchRequest,
    performDeleteRequest,
  } = useApi() as ApiHook;
  
  const { authHeaders, user } = useAuth();
  
  // State management
  const [reviews, setReviews] = useState<Review[]>([]);
  const [review, setReview] = useState<Review | null>(null);
  const [userReviews, setUserReviews] = useState<Review[]>([]);
  const [propertyReviews, setPropertyReviews] = useState<Review[]>([]);
  const [reviewStats, setReviewStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<Omit<PaginatedReviewResponse, 'results'> | null>(null);
  
  // Filters and search
  const [filters, setFilters] = useState<ReviewFilters>({});
  
  // Cache for better performance
  const [cachedResults, setCachedResults] = useState<Map<string, { data: Review[], timestamp: number }>>(new Map());
  
  const API_ENDPOINT = '/property-reviews/';
  const CACHE_DURATION = 3 * 60 * 1000; // 3 minutes for reviews
  
  // Sort options for reviews
  const sortOptions = useMemo(() => [
    { value: '-created_at', label: 'Newest First' },
    { value: 'created_at', label: 'Oldest First' },
    { value: '-rating', label: 'Highest Rating' },
    { value: 'rating', label: 'Lowest Rating' },
    { value: 'reviewer__username', label: 'Reviewer A-Z' },
    { value: '-reviewer__username', label: 'Reviewer Z-A' }
  ], []);
  
  // Cache utilities
  const generateCacheKey = (endpoint: string, params: object = {}): string => {
    return `${endpoint}_${JSON.stringify(params)}`;
  };
  
  const isCacheValid = (timestamp: number): boolean => {
    return Date.now() - timestamp < CACHE_DURATION;
  };
  
  // Clean filters
  const cleanFilters = (filters: ReviewFilters): ReviewFilters => {
    const cleaned = { ...filters };
    
    // Remove empty or undefined values
    Object.keys(cleaned).forEach(key => {
      const value = cleaned[key as keyof ReviewFilters];
      if (value === undefined || value === null || value === '') {
        delete cleaned[key as keyof ReviewFilters];
      }
    });
    
    return cleaned;
  };
  
  // Fetch all reviews with filtering and pagination
  const fetchReviews = useCallback(async (
    customFilters: ReviewFilters = {},
    useCache: boolean = true
  ): Promise<PaginatedReviewResponse | null> => {
    setLoading(true);
    setError(null);
    
    const combinedFilters = { ...filters, ...customFilters };
    const cleanedFilters = cleanFilters(combinedFilters);
    const cacheKey = generateCacheKey(API_ENDPOINT, cleanedFilters);
    
    // Check cache first
    if (useCache) {
      const cachedResult = cachedResults.get(cacheKey);
      if (cachedResult && isCacheValid(cachedResult.timestamp)) {
        const cachedResponse: PaginatedReviewResponse = {
          count: cachedResult.data.length,
          next: null,
          previous: null,
          results: cachedResult.data
        };
        setReviews(cachedResponse.results);
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
      const response = await performGetRequest<PaginatedReviewResponse>(
        API_ENDPOINT,
        cleanedFilters,
        authHeaders()
      );
      
      if (response.success) {
        // Cache the results
        if (useCache) {
          setCachedResults(prev => new Map(prev).set(cacheKey, {
            data: response.data.results,
            timestamp: Date.now()
          }));
        }
        
        setReviews(response.data.results);
        setPagination({
          count: response.data.count,
          next: response.data.next,
          previous: response.data.previous,
        });
        return response.data;
      } else {
        setError(response.error || 'Failed to fetch reviews');
        setReviews([]);
        setPagination(null);
        return null;
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching reviews');
      setReviews([]);
      setPagination(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, [filters, cachedResults, performGetRequest, authHeaders]);
  
  // Fetch reviews for a specific property
  const fetchPropertyReviews = useCallback(async (
    propertyId: number,
    customFilters: Omit<ReviewFilters, 'property'> = {}
  ): Promise<Review[] | null> => {
    setLoading(true);
    setError(null);
    
    const propertyFilters = { 
      property: propertyId, 
      ...customFilters 
    };
    const cleanedFilters = cleanFilters(propertyFilters);
    const cacheKey = generateCacheKey(`${API_ENDPOINT}property_${propertyId}`, cleanedFilters);
    
    // Check cache first
    const cachedResult = cachedResults.get(cacheKey);
    if (cachedResult && isCacheValid(cachedResult.timestamp)) {
      setPropertyReviews(cachedResult.data);
      setLoading(false);
      return cachedResult.data;
    }
    
    try {
      const response = await performGetRequest<PaginatedReviewResponse>(
        API_ENDPOINT,
        cleanedFilters,
        authHeaders()
      );
      
      if (response.success) {
        // Cache the results
        setCachedResults(prev => new Map(prev).set(cacheKey, {
          data: response.data.results,
          timestamp: Date.now()
        }));
        
        setPropertyReviews(response.data.results);
        return response.data.results;
      } else {
        setError(response.error || `Failed to fetch reviews for property ${propertyId}`);
        setPropertyReviews([]);
        return null;
      }
    } catch (err: any) {
      setError(err.message || `An error occurred while fetching reviews for property ${propertyId}`);
      setPropertyReviews([]);
      return null;
    } finally {
      setLoading(false);
    }
  }, [cachedResults, performGetRequest, authHeaders]);
  
  // Fetch reviews by a specific user
  const fetchUserReviews = useCallback(async (userId: number): Promise<Review[] | null> => {
    setLoading(true);
    setError(null);
    
    const cacheKey = generateCacheKey(`${API_ENDPOINT}user_${userId}`);
    
    // Check cache first
    const cachedResult = cachedResults.get(cacheKey);
    if (cachedResult && isCacheValid(cachedResult.timestamp)) {
      setUserReviews(cachedResult.data);
      setLoading(false);
      return cachedResult.data;
    }
    
    try {
      const response = await performGetRequest<Review[]>(
        `${API_ENDPOINT}user-reviews/${userId}/`,
        {},
        authHeaders()
      );
      
      if (response.success) {
        // Cache the results
        setCachedResults(prev => new Map(prev).set(cacheKey, {
          data: response.data,
          timestamp: Date.now()
        }));
        
        setUserReviews(response.data);
        return response.data;
      } else {
        setError(response.error || `Failed to fetch reviews for user ${userId}`);
        setUserReviews([]);
        return null;
      }
    } catch (err: any) {
      setError(err.message || `An error occurred while fetching reviews for user ${userId}`);
      setUserReviews([]);
      return null;
    } finally {
      setLoading(false);
    }
  }, [cachedResults, performGetRequest, authHeaders]);
  
  // Fetch single review by ID
  const fetchReviewById = useCallback(async (id: number): Promise<Review | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await performGetRequest<Review>(`${API_ENDPOINT}${id}/`, {}, authHeaders());
      
      if (response.success) {
        setReview(response.data);
        return response.data;
      } else {
        setError(response.error || `Failed to fetch review ${id}`);
        setReview(null);
        return null;
      }
    } catch (err: any) {
      setError(err.message || `An error occurred while fetching review ${id}`);
      setReview(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, [performGetRequest, authHeaders]);
  
  // Create new review
  const createReview = useCallback(async (reviewData: ReviewFormData): Promise<Review | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await performPostRequest<Review>(
        API_ENDPOINT,
        reviewData,
        authHeaders()
      );
      
      if (response.success) {
        // Clear cache after creating new review
        setCachedResults(new Map());
        
        // Update local state
        setReviews(prev => [response.data, ...prev]);
        setPropertyReviews(prev => 
          prev.some(r => r.property === reviewData.property) 
            ? [response.data, ...prev.filter(r => r.property === reviewData.property)]
            : prev
        );
        
        return response.data;
      } else {
        setError(response.error || 'Failed to create review');
        return null;
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while creating review');
      return null;
    } finally {
      setLoading(false);
    }
  }, [performPostRequest, authHeaders]);
  
  // Update existing review
  const updateReview = useCallback(async (
    id: number, 
    reviewData: Partial<ReviewFormData>
  ): Promise<Review | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await performPutRequest<Review>(
        `${API_ENDPOINT}${id}/`,
        reviewData,
        authHeaders()
      );
      
      if (response.success) {
        // Clear cache after updating review
        setCachedResults(new Map());
        
        // Update local state
        const updateReviewInList = (reviews: Review[]) => 
          reviews.map(r => r.id === id ? response.data : r);
        
        setReviews(updateReviewInList);
        setPropertyReviews(updateReviewInList);
        setUserReviews(updateReviewInList);
        setReview(prev => prev && prev.id === id ? response.data : prev);
        
        return response.data;
      } else {
        setError(response.error || `Failed to update review ${id}`);
        return null;
      }
    } catch (err: any) {
      setError(err.message || `An error occurred while updating review ${id}`);
      return null;
    } finally {
      setLoading(false);
    }
  }, [performPutRequest, authHeaders]);
  
  // Partial update of review
  const patchReview = useCallback(async (
    id: number, 
    reviewData: Partial<ReviewFormData>
  ): Promise<Review | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await performPatchRequest<Review>(
        `${API_ENDPOINT}${id}/`,
        reviewData,
        authHeaders()
      );
      
      if (response.success) {
        // Clear cache after updating review
        setCachedResults(new Map());
        
        // Update local state
        const updateReviewInList = (reviews: Review[]) => 
          reviews.map(r => r.id === id ? response.data : r);
        
        setReviews(updateReviewInList);
        setPropertyReviews(updateReviewInList);
        setUserReviews(updateReviewInList);
        setReview(prev => prev && prev.id === id ? response.data : prev);
        
        return response.data;
      } else {
        setError(response.error || `Failed to patch review ${id}`);
        return null;
      }
    } catch (err: any) {
      setError(err.message || `An error occurred while patching review ${id}`);
      return null;
    } finally {
      setLoading(false);
    }
  }, [performPatchRequest, authHeaders]);
  
  // Delete review
  const deleteReview = useCallback(async (id: number): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await performDeleteRequest<null>(`${API_ENDPOINT}${id}/`, {}, authHeaders());
      
      if (response.success) {
        // Clear cache after deleting review
        setCachedResults(new Map());
        
        // Remove from local state
        const removeReviewFromList = (reviews: Review[]) => reviews.filter(r => r.id !== id);
        
        setReviews(removeReviewFromList);
        setPropertyReviews(removeReviewFromList);
        setUserReviews(removeReviewFromList);
        setReview(prev => prev && prev.id === id ? null : prev);
        
        return true;
      } else {
        setError(response.error || `Failed to delete review ${id}`);
        return false;
      }
    } catch (err: any) {
      setError(err.message || `An error occurred while deleting review ${id}`);
      return false;
    } finally {
      setLoading(false);
    }
  }, [performDeleteRequest, authHeaders]);
  
  // Check if user has already reviewed a property
  const hasUserReviewedProperty = useCallback((propertyId: number): boolean => {
    if (!user) return false;
    
    return propertyReviews.some(review => 
      review.property === propertyId && review.reviewer.id === Number(user.id)
    );
  }, [propertyReviews, user]);
  
  // Get user's review for a specific property
  const getUserReviewForProperty = useCallback((propertyId: number): Review | null => {
    if (!user) return null;
    
    return propertyReviews.find(review => 
      review.property === propertyId && review.reviewer.id === Number(user.id)
    ) || null;
  }, [propertyReviews, user]);
  
  // Calculate review statistics for a property
  const calculateReviewStats = useCallback((reviews: Review[]): ReviewStats => {
    if (reviews.length === 0) {
      return {
        total_reviews: 0,
        average_rating: 0,
        rating_distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      };
    }
    
    const total = reviews.length;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    const average = sum / total;
    
    const distribution = reviews.reduce((acc, review) => {
      acc[review.rating as keyof typeof acc]++;
      return acc;
    }, { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
    
    return {
      total_reviews: total,
      average_rating: Math.round(average * 10) / 10, // Round to 1 decimal place
      rating_distribution: distribution
    };
  }, []);
  
  // Get review stats for current property reviews
  const getPropertyReviewStats = useCallback((): ReviewStats => {
    return calculateReviewStats(propertyReviews);
  }, [propertyReviews, calculateReviewStats]);
  
  // Filter and search utilities
  const updateFilters = useCallback((newFilters: Partial<ReviewFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);
  
  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);
  
  const setSorting = useCallback((sortValue: string) => {
    updateFilters({ ordering: sortValue });
  }, [updateFilters]);
  
  // Pagination utilities
  const fetchPage = useCallback(async (page: number): Promise<PaginatedReviewResponse | null> => {
    return fetchReviews({ page });
  }, [fetchReviews]);
  
  const fetchNextPage = useCallback(async (): Promise<PaginatedReviewResponse | null> => {
    if (!pagination?.next) return null;
    
    const currentPage = filters.page || 1;
    return fetchPage(currentPage + 1);
  }, [pagination, filters.page, fetchPage]);
  
  const fetchPreviousPage = useCallback(async (): Promise<PaginatedReviewResponse | null> => {
    if (!pagination?.previous) return null;
    
    const currentPage = filters.page || 1;
    return fetchPage(Math.max(1, currentPage - 1));
  }, [pagination, filters.page, fetchPage]);
  
  // Utility functions
  const clearError = useCallback(() => {
    setError(null);
  }, []);
  
  const clearCache = useCallback(() => {
    setCachedResults(new Map());
  }, []);
  
  const resetState = useCallback(() => {
    setReviews([]);
    setReview(null);
    setUserReviews([]);
    setPropertyReviews([]);
    setReviewStats(null);
    setError(null);
    setPagination(null);
    setFilters({});
    setCachedResults(new Map());
  }, []);
  
  // Computed values
  const hasReviews = useMemo(() => reviews.length > 0, [reviews]);
  const hasPropertyReviews = useMemo(() => propertyReviews.length > 0, [propertyReviews]);
  const hasUserReviews = useMemo(() => userReviews.length > 0, [userReviews]);
  const hasActiveFilters = useMemo(() => Object.keys(filters).length > 0, [filters]);
  
  const canFetchNextPage = useMemo(() => pagination?.next !== null, [pagination]);
  const canFetchPreviousPage = useMemo(() => pagination?.previous !== null, [pagination]);
  
  const currentPage = useMemo(() => filters.page || 1, [filters.page]);
  const totalPages = useMemo(() => {
    if (!pagination?.count) return 0;
    const pageSize = filters.page_size || 20;
    return Math.ceil(pagination.count / pageSize);
  }, [pagination?.count, filters.page_size]);
  
  return {
    // State
    reviews,
    review,
    userReviews,
    propertyReviews,
    reviewStats,
    loading,
    error,
    pagination,
    filters,
    
    // Computed values
    hasReviews,
    hasPropertyReviews,
    hasUserReviews,
    hasActiveFilters,
    canFetchNextPage,
    canFetchPreviousPage,
    currentPage,
    totalPages,
    sortOptions,
    
    // CRUD operations
    fetchReviews,
    fetchPropertyReviews,
    fetchUserReviews,
    fetchReviewById,
    createReview,
    updateReview,
    patchReview,
    deleteReview,
    
    // Review utilities
    hasUserReviewedProperty,
    getUserReviewForProperty,
    calculateReviewStats,
    getPropertyReviewStats,
    
    // Filtering and sorting
    updateFilters,
    clearFilters,
    setSorting,
    
    // Pagination
    fetchPage,
    fetchNextPage,
    fetchPreviousPage,
    
    // Utility functions
    clearError,
    clearCache,
    resetState,
  };
}