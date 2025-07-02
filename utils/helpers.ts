import { BackendPropertyResponse, MarketingCategories, MarketingCategoriesResponse, PaginatedResponse, Property, PropertyFilters, PropertyFormData } from "@/types/properties";

export const getPropertyCoordinates = (property: Property): [number, number] => {
    return property.geometry.coordinates;
  };

export const getPropertyPrice = (property: Property): number => {
    return property.properties.price;
  };

export const getPropertyTitle = (property: Property): string => {
    return property.properties.title;
  };

export const getPropertyAddress = (property: Property): string => {
    return property.properties.address;
  };

export const isPropertyAvailable = (property: Property): boolean => {
    return property.properties.is_available;
  };

export const getPropertyPrimaryImage = (property: Property): string | null => {
    return property.primary_image;
  };

 // Helper function to transform backend response to simplified structure
 export const transformBackendResponse = (backendResponse: BackendPropertyResponse): PaginatedResponse<Property> => {
    return {
      count: backendResponse.count,
      next: backendResponse.next,
      previous: backendResponse.previous,
      results: backendResponse.results.features || []
    };
  };

  // Transform marketing categories response
export const transformMarketingResponse = (marketingResponse: MarketingCategoriesResponse): MarketingCategories => {
    return {
      popular: marketingResponse.popular.features || [],
      near_university: marketingResponse.near_university.features || [],
      top_rated: marketingResponse.top_rated.features || [],
      special_needs: marketingResponse.special_needs.features || [],
      cheap: marketingResponse.cheap.features || [],
    };
  };

  // Transform form data to match Django API format
  export const transformToApiFormat = (formData: PropertyFormData) => {
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

  // Generate cache key for results
  export const generateCacheKey = (filters: PropertyFilters): string => {
    return JSON.stringify(filters);
  };

