import { useState, useCallback } from 'react';
import { useMapboxContext } from '@/contexts/MapboxContext';
import { Property } from '@/types/properties';

export default function usePropertyMap() {
  const { flyTo } = useMapboxContext();
  const [activeProperty, setActiveProperty] = useState<Property | null>(null);

  const handleMarkerClick = useCallback((property: Property) => {
    setActiveProperty(property);
    
    // Fly to the property location
    if (property.geometry?.coordinates && property.geometry.coordinates.length >= 2) {
      const [lng, lat] = property.geometry.coordinates;
      const coordinates: [number, number] = [Number(lng), Number(lat)];
      
      flyTo(coordinates, 15);
    }
  }, [flyTo]);

  const clearActiveProperty = useCallback(() => {
    setActiveProperty(null);
  }, []);

  return {
    activeProperty,
    handleMarkerClick,
    clearActiveProperty,
  };
}
