
export interface Property {
  
  id: number;
  type: 'Feature';
  geometry: {
    type: 'Point';
    coordinates: [number, number];
  };
  properties: {
    id: any;
    city: any;
    primary_image: string;
    amenities: any;
    rating: number;
    review_count: number;
    name: string;
    title: string;
    description: string;
    property_type: string;
    property_type_display: string;
    price: number;
    bedrooms: number;
    toilets: number;
    address: string;
    available_from: string;
    lease_duration: number;
    is_furnished: boolean;
    is_available: boolean;
    is_fenced: boolean;
    windows_type: string;
    windows_type_display: string;
    electricity_type: string;
    electricity_type_display: string;
    water_supply: boolean;
    size: number;
    safety_score: string;
    transportation_score: string;
    amenities_score: string;
    overall_score: string;
    distance_to_university?: number;
    created_at: string | number | Date;
    updated_at: string;
    videos: string[];

  };
  images: string[];
  videos: string[];
  primary_image: string | null;
  media: Array<{
    id: number;
    media_type: string;
    url: string;
    display_order: number;
    is_primary: boolean;
    created_at: string;
  }>;
  amenities: Array<{
    id: number;
    amenity: number;
    amenity_name: string;
    amenity_description: string;
    amenity_icon: string;
  }>;
  nearby_places: Array<{
    id: number;
    place: {
      id: number;
      name: string;
      place_type: string;
      place_type_display: string;
      address: string;
      geometry: {
        type: 'Point';
        coordinates: [number, number];
      };
    };
    distance: number;
    walking_time: number;
 
  }>;
}

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
  videos?: File[]; 
  amenity_ids: number[];
}

export interface PropertyImage {
  url: string;
  id?: string;
  [key: string]: any;
}

export interface Favourite {
  id: number;
  user: number;
  property: number;
  added_at: string;
}

export interface BackendPropertyResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: {
    type: 'FeatureCollection';
    features: Property[];
  };
}

// Processed marketing categories for easier use
export interface MarketingCategories {
  popular: Property[];
  near_university: Property[];
  top_rated: Property[];
  special_needs: Property[];
  cheap: Property[];
}

// Simplified paginated response for easier use
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// Enhanced filters for property search with all backend-supported options
export interface PropertyFilters {
  // Basic filters
  search?: string;
  page?: number;
  page_size?: number;
  ordering?: string;
  
  // Property type and categories
  property_type?: string | string[];
  amenities?: string | string[] | number[];
  
  // Location filters
  university_id?: string;
  distance?: number;
  
  // Price filters
  price?: string | number;
  min_price?: number;
  max_price?: number;
  
  // Property features
  bedrooms?: number | { min?: number; max?: number };
  bedrooms__gte?: number;
  bedrooms__lte?: number;
  toilets?: number;
  is_furnished?: boolean;
  is_available?: boolean;
  is_fenced?: boolean;
  
  // Utilities
  electricity_type?: string | string[];
  water_supply?: boolean;
  windows_type?: string;
  
  // Size
  size?: number;
  size__gte?: number;
  size__lte?: number;
  
  // Allow dynamic keys for any additional filters
  [key: string]: any;
}

// Search and filter state management
export interface SearchState {
  query: string;
  filters: PropertyFilters;
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
export interface ApiResponse<T = any> {
  data: T;
  status: number;
  success: boolean;
  error?: string;
}

export interface ApiHook {
  performGetRequest: <T>(endpoint: string, params?: object, headers?: object) => Promise<ApiResponse<T>>;
  performPostRequest: <T>(endpoint: string, data: any, headers?: object, contentType?: string) => Promise<ApiResponse<T>>;
  performPutRequest: <T>(endpoint: string, data: any, headers?: object) => Promise<ApiResponse<T>>;
  performPatchRequest: <T>(endpoint: string, data: any, headers?: object) => Promise<ApiResponse<T>>;
  performDeleteRequest: <T>(endpoint: string, data?: object, headers?: object) => Promise<ApiResponse<T>>;
  performRequest: <T>(method: string, endpoint: string, data?: any, headers?: object, contentType?: string) => Promise<ApiResponse<T>>;
}

// Marketing categories response structure
export interface MarketingCategoriesResponse {
  popular: {
    type: 'FeatureCollection';
    features: Property[];
  };
  near_university: {
    type: 'FeatureCollection';
    features: Property[];
  };
  top_rated: {
    type: 'FeatureCollection';
    features: Property[];
  };
  special_needs: {
    type: 'FeatureCollection';
    features: Property[];
  };
  cheap: {
    type: 'FeatureCollection';
    features: Property[];
  };
}
