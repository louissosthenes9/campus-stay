'use client';
import { useState, useCallback } from 'react';
import useApi from './use-api'; 
import useAuth from './use-auth';
import { PropertyFormData,Property  } from '@/types/properties';


interface BackendPropertyResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: {
    type: 'FeatureCollection';
    features: Property[];
  };
}

// Simplified paginated response for easier use
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// Filters for property search
export interface PropertyFilters {
  property_type?: string;
  price?: string;
  bedrooms?: number;
  toilets?: number;
  is_furnished?: boolean;
  university_id?: string;
  distance?: number;
  search?: string;
  ordering?: string;
  page?: number;
  page_size?: number;
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
  performRequest: <T>(method: string, endpoint: string, data?: any, headers?: object, contentType?: string) => Promise<ApiResponse<T>>;
}

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
  
  const API_ENDPOINT = '/properties/';
  
  // Helper function to transform backend response to simplified structure
  const transformBackendResponse = (backendResponse: BackendPropertyResponse): PaginatedResponse<Property> => {
    return {
      count: backendResponse.count,
      next: backendResponse.next,
      previous: backendResponse.previous,
      results: backendResponse.results.features || []
    };
  };

  // Transform form data to match Django API format
  const transformToApiFormat = (formData: PropertyFormData) => {
    const apiData: any = {
      name: formData.name,
      title: formData.title,
      description: formData.description,
      property_type: formData.property_type,
      price: formData.price,
      bedrooms: formData.bedrooms,
      toilets: formData.toilets,
      address: formData.address,
      available_from: formData.available_from,
      lease_duration: formData.lease_duration,
      is_furnished: formData.is_furnished,
      is_fenced: formData.is_fenced,
      windows_type: formData.windows_type,
      electricity_type: formData.electricity_type,
      water_supply: formData.water_supply,
      size: formData.size,
      amenity_ids: formData.amenity_ids || [],
    };

    // Add location if provided
    if (formData.geometry) {
      apiData.location = formData.geometry;
    }

    return apiData;
  };

  // Fetch properties with filters
  const fetchProperties = useCallback(async (filters: PropertyFilters = {}): Promise<PaginatedResponse<Property> | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await performGetRequest<BackendPropertyResponse>(API_ENDPOINT, filters, authHeaders());
      
      if (response.success) {
        const transformedData = transformBackendResponse(response.data);
        setProperties(transformedData.results);
        setPagination({
          count: transformedData.count,
          next: transformedData.next,
          previous: transformedData.previous,
        });
        return transformedData;
      } else {
        setError(response.error || 'Failed to fetch properties');
        setProperties([]);
        setPagination(null);
        return null;
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching properties');
      setProperties([]);
      setPagination(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, [performGetRequest, authHeaders]);

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
  }, [performGetRequest, authHeaders]);

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
  }, [performPostRequest, authHeaders]);

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
  }, [performPutRequest, authHeaders]);

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
  }, [performPatchRequest, authHeaders]);

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
  }, [performPostRequest, authHeaders]);

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
  }, [performDeleteRequest, authHeaders]);

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
  }, [performDeleteRequest, authHeaders]);

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
  }, [performGetRequest, authHeaders]);

  // Helper functions for easier property data access
  const getPropertyCoordinates = (property: Property): [number, number] => {
    return property.geometry.coordinates;
  };

  const getPropertyPrice = (property: Property): number => {
    return property.properties.price;
  };

  const getPropertyTitle = (property: Property): string => {
    return property.properties.title;
  };

  const getPropertyAddress = (property: Property): string => {
    return property.properties.address;
  };

  const isPropertyAvailable = (property: Property): boolean => {
    return property.properties.is_available;
  };

  const getPropertyPrimaryImage = (property: Property): string | null => {
    return property.primary_image;
  };

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Reset state
  const resetState = useCallback(() => {
    setProperties([]);
    setProperty(null);
    setError(null);
    setPagination(null);
  }, []);

  return {
    // State
    properties,
    property,
    loading,
    error,
    pagination,
    
    // CRUD operations
    fetchProperties,
    fetchPropertyById,
    createProperty,
    updateProperty,
    patchProperty,
    deleteProperty,
    
    // Media operations
    addMedia,
    removeMedia,
    
    // Special queries
    fetchPropertiesNearUniversity,
    
    // Helper functions
    getPropertyCoordinates,
    getPropertyPrice,
    getPropertyTitle,
    getPropertyAddress,
    isPropertyAvailable,
    getPropertyPrimaryImage,
    
    // Utility functions
    clearError,
    resetState,
  };
}