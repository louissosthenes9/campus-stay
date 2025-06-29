import { useState, useCallback } from 'react';
import { useMapboxContext } from '@/contexts/MapboxContext';
import { Property } from '@/types/properties';

export default function usePropertyMap() {
  const { flyTo } = useMapboxContext();
  const [activeProperty, setActiveProperty] = useState<Property | null>(null);

  const handleMarkerClick = useCallback((property: Property) => {
    setActiveProperty(property);
    
    // Fly to the property location
    if (property.latitude && property.longitude) {
      const coordinates: [number, number] = [
        parseFloat(property.longitude),
        parseFloat(property.latitude),
      ];
      
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
