import { create } from 'zustand';

// Define the Property interface
export interface Property {
  id: string;
  name: string;
  location: string;
  type: string;
  description?: string;
  price?: number;
  bedrooms?: number;
  bathrooms?: number;
  amenities?: string[];
  images?: string[];
}

// Define the property store state and actions
interface PropertyState {
  properties: Property[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchProperties: () => Promise<void>;
  addProperty: (property: Omit<Property, 'id'>) => Promise<void>;
  updateProperty: (id: string, property: Partial<Property>) => Promise<void>;
  deleteProperty: (id: string) => Promise<void>;
}

// Create the Zustand store
export const usePropertyStore = create<PropertyState>((set, get) => ({
  properties: [],
  isLoading: false,
  error: null,

  fetchProperties: async () => {
    set({ isLoading: true, error: null });
    try {
      // Replace with actual API call
      const response = await fetch('/api/properties');
      
      if (!response.ok) {
        throw new Error('Failed to fetch properties');
      }
      
      const data = await response.json();
      set({ properties: data, isLoading: false });
    } catch (error) {
      console.error('Error fetching properties:', error);
      set({ 
        error: error instanceof Error ? error.message : 'An unknown error occurred', 
        isLoading: false 
      });
    }
  },

  addProperty: async (property) => {
    set({ isLoading: true, error: null });
    try {
      // Replace with actual API call
      const response = await fetch('/api/properties', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(property),
      });

      if (!response.ok) {
        throw new Error('Failed to add property');
      }

      const newProperty = await response.json();
      set(state => ({
        properties: [...state.properties, newProperty],
        isLoading: false,
      }));
    } catch (error) {
      console.error('Error adding property:', error);
      set({ 
        error: error instanceof Error ? error.message : 'An unknown error occurred', 
        isLoading: false 
      });
    }
  },

  updateProperty: async (id, property) => {
    set({ isLoading: true, error: null });
    try {
      // Replace with actual API call
      const response = await fetch(`/api/properties/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(property),
      });

      if (!response.ok) {
        throw new Error('Failed to update property');
      }

      const updatedProperty = await response.json();
      set(state => ({
        properties: state.properties.map(p => 
          p.id === id ? { ...p, ...updatedProperty } : p
        ),
        isLoading: false,
      }));
    } catch (error) {
      console.error('Error updating property:', error);
      set({ 
        error: error instanceof Error ? error.message : 'An unknown error occurred', 
        isLoading: false 
      });
    }
  },

  deleteProperty: async (id) => {
    set({ isLoading: true, error: null });
    try {
      // Replace with actual API call
      const response = await fetch(`/api/properties/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete property');
      }

      set(state => ({
        properties: state.properties.filter(p => p.id !== id),
        isLoading: false,
      }));
    } catch (error) {
      console.error('Error deleting property:', error);
      set({ 
        error: error instanceof Error ? error.message : 'An unknown error occurred', 
        isLoading: false 
      });
    }
  },
}));
