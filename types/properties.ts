export default interface Property {
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
      property_type_display: string; // Added from serializer
      price: number; // Changed from string to number to match Django
      bedrooms: number;
      toilets: number;
      address: string;
      available_from: string; // ISO date string
      lease_duration: number;
      is_furnished: boolean;
      is_available: boolean;
      is_fenced: boolean;
      windows_type: string;
      windows_type_display: string; // Added from serializer
      electricity_type: string;
      electricity_type_display: string; // Added from serializer
      water_supply: boolean;
      size: number; // Changed from string to number
      safety_score: string;
      transportation_score: string;
      amenities_score: string;
      overall_score: string;
      distance_to_university?: number; // Added from serializer
      created_at: string; // ISO date string
      updated_at: string; // ISO date string
    };
    // Media fields from serializer
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
    // Amenities from serializer
    amenities: Array<{
      id: number;
      amenity: number;
      amenity_name: string;
      amenity_description: string;
      amenity_icon: string;
    }>;
    // Nearby places from serializer
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