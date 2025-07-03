'use client';
import { useState, useCallback, useMemo } from 'react';
import useApi from './use-api';
import useAuth from './use-auth';
import { ApiHook } from '@/types/properties';

// Enquiry status enum
export enum EnquiryStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  CANCELLED = 'cancelled'
}

// Core enquiry interfaces
export interface EnquiryMessage {
  id: number;
  enquiry: number;
  sender: {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
  };
  content: string;
  is_read: boolean;
  created_at: string;
  updated_at: string;
}

export interface Enquiry {
  id: number;
  student: {
    id: number;
    user: {
      id: number;
      username: string;
      email: string;
      first_name: string;
      last_name: string;
    };
  };
  property: {
    id: number;
    title: string;
    address: string;
    price: number;
    user: {
      id: number;
      username: string;
      email: string;
      first_name: string;
      last_name: string;
    };
  };
  subject: string;
  message: string;
  status: EnquiryStatus;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  messages: EnquiryMessage[];
  unread_count?: number;
}

// Form data interfaces
export interface CreateEnquiryData {
  property: number;
  message: string;
}

export interface CreateMessageData {
  content: string;
}

export interface UpdateEnquiryData {
  status?: EnquiryStatus;
  is_active?: boolean;
}

// Filter interfaces
export interface EnquiryFilters {
  status?: EnquiryStatus;
  is_active?: boolean;
  property?: number;
  page?: number;
  page_size?: number;
  ordering?: string;
  search?: string;
  [key: string]: any;
}

// Paginated response interface
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// Search and filter state
export interface EnquirySearchState {
  query: string;
  filters: EnquiryFilters;
  activeFilters: string[];
  isSearching: boolean;
}

// Sort options
export interface SortOption {
  value: string;
  label: string;
  direction: 'asc' | 'desc';
}



export default function useEnquiry() {
  const {
    performGetRequest,
    performPostRequest,
    performPutRequest,
    performPatchRequest,
    performDeleteRequest,
  } = useApi() as ApiHook;
  
  const { authHeaders, user } = useAuth();
  
  // Enquiry state
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [enquiry, setEnquiry] = useState<Enquiry | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<Omit<PaginatedResponse<any>, 'results'> | null>(null);
  
  // Message state
  const [messages, setMessages] = useState<EnquiryMessage[]>([]);
  const [messagesLoading, setMessagesLoading] = useState<boolean>(false);
  const [messagesError, setMessagesError] = useState<string | null>(null);
  const [messagesPagination, setMessagesPagination] = useState<Omit<PaginatedResponse<any>, 'results'> | null>(null);
  
  // Search and filter state
  const [searchState, setSearchState] = useState<EnquirySearchState>({
    query: '',
    filters: {},
    activeFilters: [],
    isSearching: false,
  });
  
  // Cache for performance
  const [cachedResults, setCachedResults] = useState<Map<string, { data: Enquiry[], timestamp: number }>>(new Map());
  const [cachedMessages, setCachedMessages] = useState<Map<string, { data: EnquiryMessage[], timestamp: number }>>(new Map());
  
  const API_ENDPOINT = '/messages/enquiries/';
  const CACHE_DURATION = 2 * 60 * 1000; 
  
  // Predefined sort options
  const sortOptions: SortOption[] = useMemo(() => [
    { value: '-updated_at', label: 'Most Recent', direction: 'desc' },
    { value: 'updated_at', label: 'Oldest First', direction: 'asc' },
    { value: '-created_at', label: 'Newest First', direction: 'desc' },
    { value: 'created_at', label: 'Earliest First', direction: 'asc' },
    { value: 'status', label: 'Status', direction: 'asc' },
    { value: 'subject', label: 'Subject A-Z', direction: 'asc' },
    { value: '-subject', label: 'Subject Z-A', direction: 'desc' }
  ], []);
  
  // Generate cache key
  const generateCacheKey = (filters: EnquiryFilters): string => {
    return JSON.stringify(filters);
  };
  
  // Check cache validity
  const isCacheValid = (timestamp: number): boolean => {
    return Date.now() - timestamp < CACHE_DURATION;
  };
  
  // Clean filters
  const cleanFilters = (filters: EnquiryFilters): EnquiryFilters => {
    const cleaned = { ...filters };
    
    // Remove empty values
    Object.keys(cleaned).forEach(key => {
      const value = cleaned[key as keyof EnquiryFilters];
      if (value === undefined || value === null || value === '') {
        delete cleaned[key as keyof EnquiryFilters];
      }
    });
    
    return cleaned;
  };
  
  // Update search state
  const updateSearchState = useCallback((updates: Partial<EnquirySearchState>) => {
    setSearchState(prev => ({ ...prev, ...updates }));
  }, []);
  
  // Set search query
  const setSearchQuery = useCallback((query: string) => {
    updateSearchState({
      query,
      isSearching: query.length > 0
    });
  }, [updateSearchState]);
  
  // Update filters
  const updateFilters = useCallback((newFilters: Partial<EnquiryFilters>) => {
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
  
  // Clear filters
  const clearFilters = useCallback(() => {
    updateSearchState({
      filters: {},
      activeFilters: [],
      query: ''
    });
  }, [updateSearchState]);
  
  // Clear specific filter
  const clearFilter = useCallback((filterKey: keyof EnquiryFilters) => {
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
  
  // Fetch enquiries
  const fetchEnquiries = useCallback(async (
    customFilters: EnquiryFilters = {},
    useCache: boolean = true
  ): Promise<PaginatedResponse<Enquiry> | null> => {
    setLoading(true);
    setError(null);
    
    // Combine filters
    const combinedFilters = {
      ...searchState.filters,
      ...customFilters
    };
    
    // Add search query
    if (searchState.query) {
      combinedFilters.search = searchState.query;
    }
    
    const cleanedFilters = cleanFilters(combinedFilters);
    const cacheKey = generateCacheKey(cleanedFilters);
    
    // Check cache
    if (useCache) {
      const cachedResult = cachedResults.get(cacheKey);
      if (cachedResult && isCacheValid(cachedResult.timestamp)) {
        const cachedResponse: PaginatedResponse<Enquiry> = {
          count: cachedResult.data.length,
          next: null,
          previous: null,
          results: cachedResult.data
        };
        setEnquiries(cachedResponse.results);
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
      const response = await performGetRequest<PaginatedResponse<Enquiry>>(
        API_ENDPOINT,
        cleanedFilters,
        authHeaders()
      );
      
      if (response.success) {
        // Cache results
        if (useCache) {
          setCachedResults(prev => new Map(prev).set(cacheKey, {
            data: response.data.results,
            timestamp: Date.now()
          }));
        }
        
        setEnquiries(response.data.results);
        setPagination({
          count: response.data.count,
          next: response.data.next,
          previous: response.data.previous,
        });
        return response.data;
      } else {
        const errorMsg = response.error || 'Failed to fetch enquiries';
        setError(errorMsg);
        setEnquiries([]);
        setPagination(null);
        return null;
      }
    } catch (err: any) {
      const errorMsg = err.message || 'An error occurred while fetching enquiries';
      setError(errorMsg);
      setEnquiries([]);
      setPagination(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, [searchState.filters, searchState.query, cachedResults, performGetRequest, authHeaders]);
  
  // Search enquiries
  const searchEnquiries = useCallback(async (
    query: string,
    filters: EnquiryFilters = {}
  ): Promise<PaginatedResponse<Enquiry> | null> => {
    setSearchQuery(query);
    return fetchEnquiries({ ...filters, search: query }, false);
  }, [fetchEnquiries, setSearchQuery]);
  
  // Fetch enquiries by page
  const fetchEnquiriesPage = useCallback(async (page: number): Promise<PaginatedResponse<Enquiry> | null> => {
    return fetchEnquiries({ page });
  }, [fetchEnquiries]);
  
  // Fetch next page
  const fetchNextPage = useCallback(async (): Promise<PaginatedResponse<Enquiry> | null> => {
    if (!pagination?.next) return null;
    
    const currentPage = searchState.filters.page || 1;
    return fetchEnquiriesPage(currentPage + 1);
  }, [pagination, searchState.filters.page, fetchEnquiriesPage]);
  
  // Fetch previous page
  const fetchPreviousPage = useCallback(async (): Promise<PaginatedResponse<Enquiry> | null> => {
    if (!pagination?.previous) return null;
    
    const currentPage = searchState.filters.page || 1;
    return fetchEnquiriesPage(Math.max(1, currentPage - 1));
  }, [pagination, searchState.filters.page, fetchEnquiriesPage]);
  
  // Fetch single enquiry
  const fetchEnquiryById = useCallback(async (id: string | number): Promise<Enquiry | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await performGetRequest<Enquiry>(`${API_ENDPOINT}${id}/`, {}, authHeaders());
      
      if (response.success) {
        setEnquiry(response.data);
        return response.data;
      } else {
        setError(response.error || `Failed to fetch enquiry ${id}`);
        setEnquiry(null);
        return null;
      }
    } catch (err: any) {
      setError(err.message || `An error occurred while fetching enquiry ${id}`);
      setEnquiry(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, [performGetRequest, authHeaders]);
  
  // Create enquiry
  const createEnquiry = useCallback(async (enquiryData: CreateEnquiryData): Promise<Enquiry | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await performPostRequest<Enquiry>(
        API_ENDPOINT,
        enquiryData,
        authHeaders()
      );
      
      if (response.success) {
        // Clear cache
        setCachedResults(new Map());
        return response.data;
      } else {
        setError(response.error || 'Failed to create enquiry');
        return null;
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while creating enquiry');
      return null;
    } finally {
      setLoading(false);
    }
  }, [performPostRequest, authHeaders]);
  
  // Update enquiry
  const updateEnquiry = useCallback(async (
    id: string | number,
    enquiryData: UpdateEnquiryData
  ): Promise<Enquiry | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await performPatchRequest<Enquiry>(
        `${API_ENDPOINT}${id}/`,
        enquiryData,
        authHeaders()
      );
      
      if (response.success) {
        setEnquiry(prev => (prev && prev.id === Number(id) ? response.data : prev));
        // Update in list if present
        setEnquiries(prev => prev.map(enq => 
          enq.id === Number(id) ? response.data : enq
        ));
        // Clear cache
        setCachedResults(new Map());
        return response.data;
      } else {
        setError(response.error || `Failed to update enquiry ${id}`);
        return null;
      }
    } catch (err: any) {
      setError(err.message || `An error occurred while updating enquiry ${id}`);
      return null;
    } finally {
      setLoading(false);
    }
  }, [performPatchRequest, authHeaders]);
  
  // Cancel enquiry (soft delete)
  const cancelEnquiry = useCallback(async (id: string | number): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await performDeleteRequest(`${API_ENDPOINT}${id}/`, {}, authHeaders());
      
      if (response.success) {
        // Update local state to reflect cancellation
        setEnquiry(prev => prev && prev.id === Number(id) ? {
          ...prev,
          status: EnquiryStatus.CANCELLED,
          is_active: false
        } : prev);
        
        setEnquiries(prev => prev.map(enq => 
          enq.id === Number(id) ? {
            ...enq,
            status: EnquiryStatus.CANCELLED,
            is_active: false
          } : enq
        ));
        
        // Clear cache
        setCachedResults(new Map());
        return true;
      } else {
        setError(response.error || `Failed to cancel enquiry ${id}`);
        return false;
      }
    } catch (err: any) {
      setError(err.message || `An error occurred while cancelling enquiry ${id}`);
      return false;
    } finally {
      setLoading(false);
    }
  }, [performDeleteRequest, authHeaders]);
  
  // Mark enquiry as read
  const markAsRead = useCallback(async (id: string | number): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await performPostRequest(
        `${API_ENDPOINT}${id}/mark-as-read/`,
        {},
        authHeaders()
      );
      
      if (response.success) {
        // Update messages as read
        setMessages(prev => prev.map(msg => ({ ...msg, is_read: true })));
        
        // Update enquiry if it's the current one
        setEnquiry(prev => prev && prev.id === Number(id) ? {
          ...prev,
          messages: prev.messages.map(msg => ({ ...msg, is_read: true }))
        } : prev);
        
        return true;
      } else {
        setError(response.error || `Failed to mark enquiry ${id} as read`);
        return false;
      }
    } catch (err: any) {
      setError(err.message || `An error occurred while marking enquiry ${id} as read`);
      return false;
    } finally {
      setLoading(false);
    }
  }, [performPostRequest, authHeaders]);
  
  // Fetch messages for an enquiry
  const fetchMessages = useCallback(async (
    enquiryId: string | number,
    useCache: boolean = true
  ): Promise<EnquiryMessage[] | null> => {
    setMessagesLoading(true);
    setMessagesError(null);
    
    const cacheKey = `messages_${enquiryId}`;
    
    // Check cache
    if (useCache) {
      const cachedResult = cachedMessages.get(cacheKey);
      if (cachedResult && isCacheValid(cachedResult.timestamp)) {
        setMessages(cachedResult.data);
        setMessagesLoading(false);
        return cachedResult.data;
      }
    }
    
    try {
      const response = await performGetRequest<EnquiryMessage[]>(
        `${API_ENDPOINT}${enquiryId}/messages/`,
        {},
        authHeaders()
      );
      
      if (response.success) {
        // Cache results
        if (useCache) {
          setCachedMessages(prev => new Map(prev).set(cacheKey, {
            data: response.data,
            timestamp: Date.now()
          }));
        }
        
        setMessages(response.data);
        return response.data;
      } else {
        const errorMsg = response.error || `Failed to fetch messages for enquiry ${enquiryId}`;
        setMessagesError(errorMsg);
        setMessages([]);
        return null;
      }
    } catch (err: any) {
      const errorMsg = err.message || `An error occurred while fetching messages for enquiry ${enquiryId}`;
      setMessagesError(errorMsg);
      setMessages([]);
      return null;
    } finally {
      setMessagesLoading(false);
    }
  }, [cachedMessages, performGetRequest, authHeaders]);
  
  // Send message
  const sendMessage = useCallback(async (
    enquiryId: string | number,
    messageData: CreateMessageData
  ): Promise<EnquiryMessage | null> => {
    setMessagesLoading(true);
    setMessagesError(null);
    
    try {
      const response = await performPostRequest<EnquiryMessage>(
        `${API_ENDPOINT}${enquiryId}/messages/`,
        messageData,
        authHeaders()
      );
      
      if (response.success) {
        // Add message to current messages
        setMessages(prev => [...prev, response.data]);
        
        // Update enquiry status if it was pending
        setEnquiry(prev => prev && prev.id === Number(enquiryId) ? {
          ...prev,
          status: prev.status === EnquiryStatus.PENDING ? EnquiryStatus.IN_PROGRESS : prev.status,
          messages: [...prev.messages, response.data],
          updated_at: new Date().toISOString()
        } : prev);
        
        // Clear message cache
        setCachedMessages(prev => {
          const newCache = new Map(prev);
          newCache.delete(`messages_${enquiryId}`);
          return newCache;
        });
        
        return response.data;
      } else {
        setMessagesError(response.error || 'Failed to send message');
        return null;
      }
    } catch (err: any) {
      setMessagesError(err.message || 'An error occurred while sending message');
      return null;
    } finally {
      setMessagesLoading(false);
    }
  }, [performPostRequest, authHeaders]);
  
  // Helper functions
  const getEnquiryParticipants = (enquiry: Enquiry) => {
    return {
      student: enquiry.student.user,
      propertyOwner: enquiry.property.user
    };
  };
  
  const isEnquiryOwner = (enquiry: Enquiry): boolean => {
    return enquiry.student.user.id === Number(user?.id);
  };
  
  const isPropertyOwner = (enquiry: Enquiry): boolean => {
    return enquiry.property.user.id === Number(user?.id);
  };
  
  const getUnreadMessagesCount = (enquiry: Enquiry): number => {
    return enquiry.messages?.filter(msg => !msg.is_read).length || 0;
  };
  
  const getLastMessage = (enquiry: Enquiry): EnquiryMessage | null => {
    if (!enquiry.messages || enquiry.messages.length === 0) return null;
    return enquiry.messages[enquiry.messages.length - 1];
  };
  
  const getEnquiryStatusColor = (status: EnquiryStatus): string => {
    switch (status) {
      case EnquiryStatus.PENDING:
        return 'orange';
      case EnquiryStatus.IN_PROGRESS:
        return 'blue';
      case EnquiryStatus.RESOLVED:
        return 'green';
      case EnquiryStatus.CANCELLED:
        return 'red';
      default:
        return 'gray';
    }
  };
  
  // Clear functions
  const clearError = useCallback(() => {
    setError(null);
  }, []);
  
  const clearMessagesError = useCallback(() => {
    setMessagesError(null);
  }, []);
  
  const clearCache = useCallback(() => {
    setCachedResults(new Map());
    setCachedMessages(new Map());
  }, []);
  
  // Reset functions
  const resetState = useCallback(() => {
    setEnquiries([]);
    setEnquiry(null);
    setError(null);
    setPagination(null);
    setCachedResults(new Map());
  }, []);
  
  const resetMessagesState = useCallback(() => {
    setMessages([]);
    setMessagesError(null);
    setMessagesPagination(null);
    setCachedMessages(new Map());
  }, []);
  
  const resetSearchState = useCallback(() => {
    setSearchState({
      query: '',
      filters: {},
      activeFilters: [],
      isSearching: false,
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
  
  const totalUnreadCount = useMemo(() => {
    return enquiries.reduce((total, enquiry) => total + getUnreadMessagesCount(enquiry), 0);
  }, [enquiries]);
  
  return {
    // Enquiry state
    enquiries,
    enquiry,
    loading,
    error,
    pagination,
    
    // Message state
    messages,
    messagesLoading,
    messagesError,
    messagesPagination,
    
    // Search and filter state
    searchState,
    hasActiveFilters,
    canFetchNextPage,
    canFetchPreviousPage,
    currentPage,
    totalPages,
    sortOptions,
    totalUnreadCount,
    
    // Enquiry operations
    fetchEnquiries,
    fetchEnquiryById,
    createEnquiry,
    updateEnquiry,
    cancelEnquiry,
    markAsRead,
    
    // Search and filtering
    searchEnquiries,
    setSearchQuery,
    updateFilters,
    clearFilters,
    clearFilter,
    setSorting,
    
    // Pagination
    fetchEnquiriesPage,
    fetchNextPage,
    fetchPreviousPage,
    
    // Message operations
    fetchMessages,
    sendMessage,
    
    // Helper functions
    getEnquiryParticipants,
    isEnquiryOwner,
    isPropertyOwner,
    getUnreadMessagesCount,
    getLastMessage,
    getEnquiryStatusColor,
    
    // Utility functions
    clearError,
    clearMessagesError,
    clearCache,
    resetState,
    resetMessagesState,
    resetSearchState,
    
    // Enums
    EnquiryStatus,
  };
}