import { Property } from './properties';

// Property-specific API responses
export interface PropertyResponse {
  data: Property;
  status: number;
  success: boolean;
  error?: string;
  message?: string;
}

export interface PropertiesResponse {
  data: {
    count: number;
    next: string | null;
    previous: string | null;
    results: Property[];
  };
  status: number;
  success: boolean;
  error?: string;
  message?: string;
}

// Marketing categories response
export interface MarketingCategoriesResponse {
  data: {
    cheap: Property[];
    near_university: Property[];
    top_rated: Property[];
    special_needs: Property[];
    recently_viewed: Property[];
    popular: Property[];
  };
  status: number;
  success: boolean;
  error?: string;
  message?: string;
}

// Property creation/update response
export interface PropertyCreationResponse {
  data: {
    id: number;
    message: string;
  };
  status: number;
  success: boolean;
  error?: string;
  message?: string;
}

// Error response
export interface ErrorResponse {
  data: {
    detail?: string;
    errors?: Record<string, string[]>;
  };
  status: number;
  success: boolean;
  error?: string;
  message?: string;
}

// Search filters
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

// Marketing categories filters
export interface MarketingCategoriesFilters {
  limit?: number;
  distance?: number;
}

// API endpoints
export const API_ENDPOINTS = {
  PROPERTIES: '/properties/',
  MARKETING_CATEGORIES: '/properties/marketing-categories/',
} as const;
