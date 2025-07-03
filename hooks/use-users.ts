'use client';
import { useState, useCallback, useMemo, useRef } from 'react';
import useApi from './use-api'; 
import useAuth from './use-auth';
import { User } from '@/types/properties';

// Form data interfaces
export interface UserUpdateData {
  first_name?: string;
  last_name?: string;
  email?: string;
  username?: string;
}

export interface StudentProfileUpdateData {
  university?: number;
  course?: string;
  year_of_study?: number;
  graduation_year?: number;
  student_id?: string;
  bio?: string;
  phone_number?: string;
  emergency_contact?: string;
  date_of_birth?: string;
  gender?: 'M' | 'F' | 'O';
  nationality?: string;
  special_needs?: string;
  profile_picture?: File | string;
}

// Backend response structures
interface BackendUsersResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: User[];
}

// Simplified paginated response for easier use
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// Enhanced filters for user search
export interface UserFilters {
  // Basic filters
  search?: string;
  page?: number;
  page_size?: number;
  ordering?: string;
  
  // User filters
  roles?: 'student' | 'admin';
  is_active?: boolean;
  
  // Student-specific filters
  university_id?: string;
  course?: string;
  year_of_study?: number;
  graduation_year?: number;
  gender?: 'M' | 'F' | 'O';
  nationality?: string;
  
  // Date filters
  date_joined_after?: string;
  date_joined_before?: string;
  
  // Allow dynamic keys for any additional filters
  [key: string]: any;
}

// Search and filter state management
export interface SearchState {
  query: string;
  filters: UserFilters;
  activeFilters: string[];
  isSearching: boolean;
  searchHistory: string[];
}

// Sorting options
export interface SortOption {
  value: string;
  label: string;
  direction: 'asc' | 'desc';
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

export default function useUsers() {
  const { 
    performGetRequest,
    performPostRequest,
    performPutRequest,
    performPatchRequest,
    performDeleteRequest,
  } = useApi() as ApiHook;
  
  const { authHeaders, user: currentUser } = useAuth();
  
  const [users, setUsers] = useState<User[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [currentUserProfile, setCurrentUserProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<Omit<PaginatedResponse<any>, 'results'> | null>(null);
  
  // Search and filter state
  const [searchState, setSearchState] = useState<SearchState>({
    query: '',
    filters: {},
    activeFilters: [],
    isSearching: false,
    searchHistory: []
  });
  
  // Cached results for performance - use useRef to avoid re-renders
  const cachedResults = useRef<Map<string, { data: User[], timestamp: number }>>(new Map());
  
  const API_ENDPOINT = '/users/';
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  
  // Predefined sort options - moved outside or use useMemo with empty deps
  const sortOptions: SortOption[] = useMemo(() => [
    { value: 'date_joined', label: 'Newest First', direction: 'desc' },
    { value: '-date_joined', label: 'Oldest First', direction: 'asc' },
    { value: 'first_name', label: 'First Name: A to Z', direction: 'asc' },
    { value: '-first_name', label: 'First Name: Z to A', direction: 'desc' },
    { value: 'last_name', label: 'Last Name: A to Z', direction: 'asc' },
    { value: '-last_name', label: 'Last Name: Z to A', direction: 'desc' },
    { value: 'username', label: 'Username: A to Z', direction: 'asc' },
    { value: '-username', label: 'Username: Z to A', direction: 'desc' }
  ], []); // Empty dependency array since this never changes
  
  // Helper function to transform backend response to simplified structure
  const transformBackendResponse = useCallback((backendResponse: BackendUsersResponse): PaginatedResponse<User> => {
    return {
      count: backendResponse.count,
      next: backendResponse.next,
      previous: backendResponse.previous,
      results: backendResponse.results || []
    };
  }, []);

  // Generate cache key for results
  const generateCacheKey = useCallback((filters: UserFilters): string => {
    return JSON.stringify(filters);
  }, []);

  // Check if cached result is still valid
  const isCacheValid = useCallback((timestamp: number): boolean => {
    return Date.now() - timestamp < CACHE_DURATION;
  }, []);

  // Clean and format filters according to backend expectations
  const cleanFilters = useCallback((filters: UserFilters): UserFilters => {
    const cleaned = { ...filters };
    
    // Remove empty or undefined values
    Object.keys(cleaned).forEach(key => {
      const value = cleaned[key as keyof UserFilters];
      if (value === undefined || value === null || value === '') {
        delete cleaned[key as keyof UserFilters];
      }
    });
    
    return cleaned;
  }, []);

  // Update search state
  const updateSearchState = useCallback((updates: Partial<SearchState>) => {
    setSearchState(prev => ({ ...prev, ...updates }));
  }, []);

  // Set search query
  const setSearchQuery = useCallback((query: string) => {
    setSearchState(prev => {
      // Add to search history if not empty and not already in history
      const newHistory = query && !prev.searchHistory.includes(query)
        ? [query, ...prev.searchHistory.slice(0, 9)] // Keep last 10 searches
        : prev.searchHistory;
      
      return {
        ...prev,
        query,
        isSearching: query.length > 0,
        searchHistory: newHistory
      };
    });
  }, []);

  // Update filters
  const updateFilters = useCallback((newFilters: Partial<UserFilters>) => {
    setSearchState(prev => {
      const updatedFilters = { ...prev.filters, ...newFilters };
      const cleanedFilters = cleanFilters(updatedFilters);
      
      // Update active filters list
      const activeFilters = Object.keys(cleanedFilters).filter(key => 
        key !== 'page' && key !== 'page_size' && key !== 'ordering'
      );
      
      return {
        ...prev,
        filters: cleanedFilters,
        activeFilters
      };
    });
  }, [cleanFilters]);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setSearchState(prev => ({
      ...prev,
      filters: {},
      activeFilters: [],
      query: ''
    }));
  }, []);

  // Clear specific filter
  const clearFilter = useCallback((filterKey: keyof UserFilters) => {
    setSearchState(prev => {
      const updatedFilters = { ...prev.filters };
      delete updatedFilters[filterKey];
      
      const activeFilters = prev.activeFilters.filter(key => key !== filterKey);
      
      return {
        ...prev,
        filters: updatedFilters,
        activeFilters
      };
    });
  }, []);

  // Set sorting
  const setSorting = useCallback((sortValue: string) => {
    updateFilters({ ordering: sortValue });
  }, [updateFilters]);

  // Enhanced fetch users with search and filtering (excludes admin role)
  const fetchUsers = useCallback(async (
    customFilters: UserFilters = {},
    useCache: boolean = true
  ): Promise<PaginatedResponse<User> | null> => {
    
    setError(null);
    setLoading(true);
    
    // Combine current filters with custom filters
    // Always exclude admin users
    const combinedFilters = { 
      ...searchState.filters, 
      ...customFilters,
      roles: 'student' as 'student' 
    };
    
    // Add search query if present
    if (searchState.query) {
      combinedFilters.search = searchState.query;
    }
    
    const cleanedFilters = cleanFilters(combinedFilters);
    const cacheKey = generateCacheKey(cleanedFilters);
    
    // Debug log
    console.log('Fetching users with filters:', cleanedFilters);
    
    // Check cache first
    if (useCache) {
      const cachedResult = cachedResults.current.get(cacheKey);
      if (cachedResult && isCacheValid(cachedResult.timestamp)) {
        const cachedResponse: PaginatedResponse<User> = {
          count: cachedResult.data.length,
          next: null,
          previous: null,
          results: cachedResult.data
        };
        setUsers(cachedResponse.results);
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
      
      const response = await performGetRequest<BackendUsersResponse>(
        API_ENDPOINT, 
        cleanedFilters, 
        authHeaders()
      );
      
      console.log('API Response:', response);
      
      if (response.success) {
        const transformedData = transformBackendResponse(response.data);
        
        // Cache the results
        if (useCache) {
          cachedResults.current.set(cacheKey, {
            data: transformedData.results,
            timestamp: Date.now()
          });
        }
        
        setUsers(transformedData.results);
        setPagination({
          count: transformedData.count,
          next: transformedData.next,
          previous: transformedData.previous,
        });
        return transformedData;
      } else {
        const errorMsg = response.error || 'Failed to fetch users';
        console.error('API Error:', errorMsg);
        setError(errorMsg);
        setUsers([]);
        setPagination(null);
        return null;
      }
    } catch (err: any) {
      const errorMsg = err.message || 'An error occurred while fetching users';
      console.error('Fetch Error:', errorMsg, err);
      setError(errorMsg);
      setUsers([]);
      setPagination(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, [searchState.filters, searchState.query, cleanFilters, generateCacheKey, isCacheValid, transformBackendResponse, performGetRequest, authHeaders]);

  // Search users with debouncing
  const searchUsers = useCallback(async (
    query: string,
    filters: UserFilters = {}
  ): Promise<PaginatedResponse<User> | null> => {
    setSearchQuery(query);
    return fetchUsers({ ...filters, search: query }, false);
  }, [fetchUsers, setSearchQuery]);

  // Fetch users by page
  const fetchUsersPage = useCallback(async (page: number): Promise<PaginatedResponse<User> | null> => {
    return fetchUsers({ page });
  }, [fetchUsers]);

  // Fetch next page
  const fetchNextPage = useCallback(async (): Promise<PaginatedResponse<User> | null> => {
    if (!pagination?.next) return null;
    
    const currentPage = searchState.filters.page || 1;
    return fetchUsersPage(currentPage + 1);
  }, [pagination, searchState.filters.page, fetchUsersPage]);

  // Fetch previous page
  const fetchPreviousPage = useCallback(async (): Promise<PaginatedResponse<User> | null> => {
    if (!pagination?.previous) return null;
    
    const currentPage = searchState.filters.page || 1;
    return fetchUsersPage(Math.max(1, currentPage - 1));
  }, [pagination, searchState.filters.page, fetchUsersPage]);

  // Fetch single user by ID
  const fetchUserById = useCallback(async (id: string | number): Promise<User | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await performGetRequest<User>(`${API_ENDPOINT}${id}/`, {}, authHeaders());
      
      if (response.success) {
        // Only return if user is not admin
        if (response.data.roles !== 'admin') {
          setUser(response.data);
          return response.data;
        } else {
          setError('Access denied: Cannot view admin users');
          setUser(null);
          return null;
        }
      } else {
        setError(response.error || `Failed to fetch user ${id}`);
        setUser(null);
        return null;
      }
    } catch (err: any) {
      setError(err.message || `An error occurred while fetching user ${id}`);
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, [performGetRequest, authHeaders]);

  // Fetch current user profile (me endpoint)
  const fetchMe = useCallback(async (): Promise<User | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await performGetRequest<User>(`${API_ENDPOINT}me/`, {}, authHeaders());
      
      if (response.success) {
        setCurrentUserProfile(response.data);
        return response.data;
      } else {
        setError(response.error || 'Failed to fetch current user profile');
        setCurrentUserProfile(null);
        return null;
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching current user profile');
      setCurrentUserProfile(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, [performGetRequest, authHeaders]);

  // Update current user profile
  const updateMe = useCallback(async (userData: UserUpdateData): Promise<User | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await performPatchRequest<User>(
        `${API_ENDPOINT}me/`, 
        userData, 
        authHeaders()
      );
      
      if (response.success) {
        setCurrentUserProfile(response.data);
        return response.data;
      } else {
        setError(response.error || 'Failed to update profile');
        return null;
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while updating profile');
      return null;
    } finally {
      setLoading(false);
    }
  }, [performPatchRequest, authHeaders]);

  // Update user (only if user is the current user or current user has permission)
  const updateUser = useCallback(async (
    id: string | number, 
    userData: UserUpdateData
  ): Promise<User | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await performPutRequest<User>(
        `${API_ENDPOINT}${id}/`, 
        userData, 
        authHeaders()
      );
      
      if (response.success) {
        // Only update if user is not admin
        if (response.data.roles !== 'admin') {
          setUser(prev => (prev && prev.id === Number(id) ? response.data : prev));
          // Clear cache after updating user
          cachedResults.current.clear();
          return response.data;
        } else {
          setError('Access denied: Cannot update admin users');
          return null;
        }
      } else {
        setError(response.error || `Failed to update user ${id}`);
        return null;
      }
    } catch (err: any) {
      setError(err.message || `An error occurred while updating user ${id}`);
      return null;
    } finally {
      setLoading(false);
    }
  }, [performPutRequest, authHeaders]);

  // Partial update of user
  const patchUser = useCallback(async (
    id: string | number, 
    userData: Partial<UserUpdateData>
  ): Promise<User | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await performPatchRequest<User>(
        `${API_ENDPOINT}${id}/`, 
        userData, 
        authHeaders()
      );
      
      if (response.success) {
        // Only update if user is not admin
        if (response.data.roles !== 'admin') {
          setUser(prev => (prev && prev.id === Number(id) ? response.data : prev));
          // Clear cache after updating user
          cachedResults.current.clear();
          return response.data;
        } else {
          setError('Access denied: Cannot update admin users');
          return null;
        }
      } else {
        setError(response.error || `Failed to patch user ${id}`);
        return null;
      }
    } catch (err: any) {
      setError(err.message || `An error occurred while patching user ${id}`);
      return null;
    } finally {
      setLoading(false);
    }
  }, [performPatchRequest, authHeaders]);

  // Update student profile
  const updateStudentProfile = useCallback(async (
    userId: string | number,
    profileData: StudentProfileUpdateData
  ): Promise<User | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      
      // Add profile fields to FormData
      Object.entries(profileData).forEach(([key, value]) => {
        if (key === 'profile_picture' && value instanceof File) {
          formData.append(key, value);
        } else if (value !== undefined && value !== null) {
          formData.append(key, String(value));
        }
      });
      
      const response = await performPatchRequest<User>(
        `${API_ENDPOINT}${userId}/student-profile/`, 
        formData, 
        authHeaders()
      );
      
      if (response.success) {
        setUser(prev => (prev && prev.id === Number(userId) ? response.data : prev));
        if (Number(userId) === Number(currentUser?.id)) {
          setCurrentUserProfile(response.data);
        }
        return response.data;
      } else {
        setError(response.error || 'Failed to update student profile');
        return null;
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while updating student profile');
      return null;
    } finally {
      setLoading(false);
    }
  }, [performPatchRequest, authHeaders, currentUser?.id]);

  // Delete user (only if current user has permission - typically only self-deletion)
  const deleteUser = useCallback(async (id: string | number): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await performDeleteRequest<null>(`${API_ENDPOINT}${id}/`, {}, authHeaders());
      
      if (response.success) {
        // Remove from local state
        setUsers(prev => prev.filter(u => u.id !== Number(id)));
        setUser(prev => prev && prev.id === Number(id) ? null : prev);
        // Clear cache after deleting user
        cachedResults.current.clear();
        return true;
      } else {
        setError(response.error || `Failed to delete user ${id}`);
        return false;
      }
    } catch (err: any) {
      setError(err.message || `An error occurred while deleting user ${id}`);
      return false;
    } finally {
      setLoading(false);
    }
  }, [performDeleteRequest, authHeaders]);

  // Fetch students by university
  const fetchStudentsByUniversity = useCallback(async (universityId: number): Promise<User[] | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await performGetRequest<BackendUsersResponse>(
        API_ENDPOINT, 
        { university_id: universityId, roles: 'student' }, 
        authHeaders()
      );
      
      if (response.success) {
        const transformedData = transformBackendResponse(response.data);
        setUsers(transformedData.results);
        return transformedData.results;
      } else {
        setError(response.error || 'Failed to fetch students by university');
        setUsers([]);
        return null;
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching students by university');
      setUsers([]);
      return null;
    } finally {
      setLoading(false);
    }
  }, [performGetRequest, authHeaders, transformBackendResponse]);

  // Helper functions for easier user data access
  const getUserFullName = useCallback((user: User): string => {
    return `${user.first_name} ${user.last_name}`.trim() || user.username;
  }, []);

  const getUserDisplayName = useCallback((user: User): string => {
    return user.first_name ? `${user.first_name} ${user.last_name}`.trim() : user.username;
  }, []);

  const getUserInitials = useCallback((user: User): string => {
    if (user.first_name && user.last_name) {
      return `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`.toUpperCase();
    }
    return user.username.substring(0, 2).toUpperCase();
  }, []);

  const isCurrentUser = useCallback((user: User): boolean => {
    return Number(user.id) === Number(currentUser?.id);
  }, [currentUser?.id]);

  const getUserProfilePicture = useCallback((user: User): string | null => {
    return user.student_profile?.profile_picture || null;
  }, []);

  const getUserUniversity = useCallback((user: User): string | null => {
    return user.student_profile?.university_name || null;
  }, []);

  const getUserCourse = useCallback((user: User): string | null => {
    return user.student_profile?.course || null;
  }, []);

  // Clear errors
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Clear cache
  const clearCache = useCallback(() => {
    cachedResults.current.clear();
  }, []);

  // Reset state
  const resetState = useCallback(() => {
    setUsers([]);
    setUser(null);
    setCurrentUserProfile(null);
    setError(null);
    setPagination(null);
    cachedResults.current.clear();
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
  }, [pagination?.next]);

  const canFetchPreviousPage = useMemo(() => {
    return pagination?.previous !== null;
  }, [pagination?.previous]);

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
    users,
    user,
    currentUserProfile,
    loading,
    error,
    pagination,
    
    // Search and filter state
    searchState,
    hasActiveFilters,
    canFetchNextPage,
    canFetchPreviousPage,
    currentPage,
    totalPages,
    sortOptions,
    
    // CRUD operations
    fetchUsers,
    fetchUserById,
    updateUser,
    patchUser,
    deleteUser,
    
    // Profile operations
    fetchMe,
    updateMe,
    updateStudentProfile,
    
    // Search and filtering
    searchUsers,
    setSearchQuery,
    updateFilters,
    clearFilters,
    clearFilter,
    setSorting,
    
    // Pagination
    fetchUsersPage,
    fetchNextPage,
    fetchPreviousPage,
    
    // Special queries
    fetchStudentsByUniversity,
    
    // Helper functions
    getUserFullName,
    getUserDisplayName,
    getUserInitials,
    isCurrentUser,
    getUserProfilePicture,
    getUserUniversity,
    getUserCourse,
    
    // Utility functions
    clearError,
    clearCache,
    resetState,
    resetSearchState,
  };
}