'use client';
import { useState, useCallback } from 'react';
import useApi from './use-api'; 
import useAuth from './use-auth';

// Update GeoPoint interface to match GeoJSON spec
interface GeoPoint {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
}

// Update Property interface to match API structure
export interface Property {
  id: number;
  type: 'Feature'; // Required by GeoJSON
  geometry: {
    type: 'Point';
    coordinates: [number, number];
  };
  properties: {
    name: string;
    title: string;
    description: string;
    property_type: string;
    price: string; 
    bedrooms: number;
    toilets: number;
    address: string;
    available_from: string; // ISO date string
    lease_duration: number;
    is_furnished: boolean;
    is_available: boolean;
    is_fenced: boolean;
    windows_type: string;
    electricity_type: string;
    water_supply: boolean;
    size: string; 
    safety_score: string;
    transportation_score: string;
    amenities_score: string;
    overall_score: string;
    amenity_ids: number[];
    created_at: string; // ISO date string
    updated_at: string; // ISO date string
  };
  images?: any[];
  video?: string;
}

// Interface for form data structure from PropertyForm
export interface PropertyFormData {
  title: string;
  name: string;
  description: string;
  property_type: string;
  price: number;
  bedrooms: number;
  toilets: number;
  address: string;
  geometry?: {
    type: 'Point';
    coordinates: [number, number];
  };
  size: number;
  available_from: string;
  lease_duration: number;
  is_furnished: boolean;
  is_fenced: boolean;
  windows_type: string;
  electricity_type: string;
  water_supply: boolean;
  images?: File[];
  video?: File;
  amenity_ids: number[];
}

// For paginated responses
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

// Auth hook interface
interface AuthHook {
  authHeaders: () => Record<string, string>;
  user: {
    id: number;
    // Add other user properties as needed
  };
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
    performRequest,
  } = useApi() as ApiHook;
  
  const { authHeaders, user } = useAuth();
  
  const [properties, setProperties] = useState<Property[]>([]);
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<Omit<PaginatedResponse<any>, 'results'> | null>(null);
  
  const API_ENDPOINT = '/properties/';
  
  const transformToApiFormat = (formData: PropertyFormData): Property => {
    return {
        id: 0, 
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: formData.geometry?.coordinates || [0, 0]
      },
      properties: {
        name: formData.name,
        title: formData.title,
        description: formData.description,
        property_type: formData.property_type,
        price: formData.price.toString(), // Convert number to string
        bedrooms: formData.bedrooms,
        toilets: formData.toilets,
        address: formData.address,
        available_from: formData.available_from,
        lease_duration: formData.lease_duration,
        is_furnished: formData.is_furnished,
        is_available: true, // Default value
        is_fenced: formData.is_fenced,
        windows_type: formData.windows_type,
        electricity_type: formData.electricity_type,
        water_supply: formData.water_supply,
        size: formData.size.toString(), // Convert number to string
        safety_score: "0", // Default value
        transportation_score: "0", // Default value
        amenities_score: "0", // Default value
        overall_score: "0", // Default value
        amenity_ids: formData.amenity_ids || [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      images: [],
      video: ''
    };
  };

  // Transform API response to form data structure
  const transformToFormFormat = (property: Property): PropertyFormData => {
    return {
      title: property.properties.title,
      name: property.properties.name,
      description: property.properties.description,
      property_type: property.properties.property_type,
      price: parseFloat(property.properties.price),
      bedrooms: property.properties.bedrooms,
      toilets: property.properties.toilets,
      address: property.properties.address,
      geometry: property.geometry,
      size: parseFloat(property.properties.size),
      available_from: property.properties.available_from,
      lease_duration: property.properties.lease_duration,
      is_furnished: property.properties.is_furnished,
      is_fenced: property.properties.is_fenced,
      windows_type: property.properties.windows_type,
      electricity_type: property.properties.electricity_type,
      water_supply: property.properties.water_supply,
      amenity_ids: property.properties.amenity_ids || []
    };
  };

  // Fetch properties with filters
  const fetchProperties = useCallback(async (filters: PropertyFilters = {}): Promise<PaginatedResponse<Property> | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await performGetRequest<PaginatedResponse<Property>>(API_ENDPOINT, filters, authHeaders());
      
      if (response.success) {
        setProperties(response.data.results || []); 
        setPagination({
          count: response.data.count,
          next: response.data.next,
          previous: response.data.previous,
        });
        return response.data;
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
    
      const apiData = transformToApiFormat(propertyData);
      
      console.log(apiData)
      // Create FormData object
      const formData = new FormData();
      
      // Add each property field individually to ensure proper formatting
      formData.append('type', 'Feature');
      formData.append('geometry', JSON.stringify(apiData.geometry));
      
      // Add all properties fields
      Object.entries(apiData.properties).forEach(([key, value]) => {
        // Handle arrays and objects
        if (Array.isArray(value) || typeof value === 'object') {
          formData.append(key, JSON.stringify(value));
        }
        else if (typeof value === 'boolean') {
          formData.append(key, value ? 'true' : 'false');
        }
        // Handle all other types
        else {
          formData.append(key, String(value));
        }
      });

      // Ensure broker ID is included
      formData.append('broker', String(user?.id));
      
      // Add files
      if (propertyData.images) {
        propertyData.images.forEach((image) => {
          formData.append('images', image);
        });
      }
      
      if (propertyData.video) {
        formData.append('video', propertyData.video);
      }
      
      const response = await performPostRequest<Property>(
        API_ENDPOINT, 
        formData,
        {
          ...authHeaders(),
          'Accept': 'application/json',
        },
        'multipart/form-data'
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
  }, [performPostRequest, authHeaders, user?.id]);

  // Update existing property
  const updateProperty = useCallback(async (id: string | number, propertyData: PropertyFormData, contentType: string = 'application/json'): Promise<Property | null> => {
    setLoading(true);
    setError(null);
    
    try {
      // Transform form data to API format
      const apiData = transformToApiFormat(propertyData);
      
      let response: ApiResponse<Property>;
      
      if (contentType === 'application/json') {
        response = await performPutRequest<Property>(
          `${API_ENDPOINT}${id}/`, 
          apiData, 
          authHeaders()
        );
      } else {
        response = await performRequest<Property>(
          'PUT', 
          `${API_ENDPOINT}${id}/`, 
          apiData, 
          authHeaders(), 
          contentType
        );
      }
      
      if (response.success) {
        setProperty(prev => (prev && prev.id === id ? response.data : prev));
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
  }, [performPutRequest, performRequest, authHeaders]);

  // Partial update of property
  const patchProperty = useCallback(async (id: string | number, propertyData: Partial<PropertyFormData>, contentType: string = 'application/json'): Promise<Property | null> => {
    setLoading(true);
    setError(null);
    
    try {
      // Get current property data if exists
      const currentProperty = property && property.id === Number(id) ? property : null;
      
    
      const mergedData = currentProperty 
        ? { ...transformToFormFormat(currentProperty), ...propertyData } 
        : propertyData;

      const apiData = transformToApiFormat(mergedData as PropertyFormData);
      
      let response: ApiResponse<Property>;
      
      if (contentType === 'application/json') {
        response = await performPatchRequest<Property>(
          `${API_ENDPOINT}${id}/`, 
          apiData, 
          authHeaders()
        );
      } else {
        response = await performRequest<Property>(
          'PATCH', 
          `${API_ENDPOINT}${id}/`, 
          apiData, 
          authHeaders(), 
          contentType
        );
      }
      
      if (response.success) {
        setProperty(prev => (prev && prev.id === id ? { ...prev, ...response.data } : prev));
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
  }, [performPatchRequest, performRequest, authHeaders, property]);

  // Delete property
  const deleteProperty = useCallback(async (id: string | number): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      // Django REST Framework typically returns 204 No Content on successful DELETE
      const response = await performDeleteRequest<null>(`${API_ENDPOINT}${id}/`, {}, authHeaders());
      
      if (response.success) {
        // Optionally refetch or update local state
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

  // Fetch properties near university
  const fetchPropertiesNearUniversity = useCallback(async (distance?: number): Promise<PaginatedResponse<Property> | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const params: { distance?: number } = {};
      if (distance !== undefined) {
        params.distance = distance;
      }
      
      // Assuming this endpoint also returns a paginated response
      const response = await performGetRequest<PaginatedResponse<Property>>(
        `${API_ENDPOINT}near-university/`, 
        params, 
        authHeaders()
      );
      
      if (response.success) {
        setProperties(response.data.results || []);
        setPagination({
          count: response.data.count,
          next: response.data.next,
          previous: response.data.previous,
        });
        return response.data;
      } else {
        setError(response.error || 'Failed to fetch properties near university');
        setProperties([]);
        setPagination(null);
        return null;
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching properties near university');
      setProperties([]);
      setPagination(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, [performGetRequest, authHeaders]);

  // Fetch properties owned by current user
  const fetchMyProperties = useCallback(async (): Promise<PaginatedResponse<Property> | null> => {
    setLoading(true);
    setError(null);
    
    try {
      // Assuming this endpoint also returns a paginated response
      const response = await performGetRequest<PaginatedResponse<Property>>(
        `${API_ENDPOINT}my-properties/`, 
        {}, 
        authHeaders()
      );
      
      if (response.success) {
        setProperties(response.data.results || []);
        setPagination({
          count: response.data.count,
          next: response.data.next,
          previous: response.data.previous,
        });
        return response.data;
      } else {
        setError(response.error || 'Failed to fetch my properties');
        setProperties([]);
        setPagination(null);
        return null;
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching my properties');
      setProperties([]);
      setPagination(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, [performGetRequest, authHeaders]);

  return {
    properties,
    property,
    loading,
    error,
    pagination,
    fetchProperties,
    fetchPropertyById,
    createProperty,
    updateProperty,
    patchProperty,
    deleteProperty,
    fetchPropertiesNearUniversity,
    fetchMyProperties,
  };
}