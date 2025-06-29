'use client';

import { useEffect } from 'react';
import { useMapboxContext } from '@/contexts/MapboxContext';
import { Property } from '@/types/properties';

interface PropertyMarkersProps {
  properties: Property[];
  activePropertyId?: string | null;
  onMarkerClick?: (property: Property) => void;
}

export default function PropertyMarkers({
  properties,
  activePropertyId,
  onMarkerClick,
}: PropertyMarkersProps) {
  const { addMarker, clearMarkers } = useMapboxContext();

  useEffect(() => {
    if (!properties.length) return;

    // Clear existing markers
    clearMarkers();

    // Add a marker for each property
    properties.forEach((property) => {
      // Skip if property doesn't have coordinates in the correct format
      if (!property.geometry?.coordinates || property.geometry.coordinates.length !== 2) return;

      // GeoJSON uses [longitude, latitude] format
      const coordinates: [number, number] = [
        property.geometry.coordinates[0],
        property.geometry.coordinates[1],
      ] as [number, number];

      // Create a popup element
      const popupContent = (
        <div className="p-2 max-w-xs">
          <h3 className="font-semibold text-sm">{property.properties.title}</h3>
          {property.properties.price && (
            <p className="text-primary font-bold">
              ${property.properties.price.toLocaleString()}/month
            </p>
          )}
          {property.properties.bedrooms && (
            <p className="text-sm text-gray-600">
              {property.properties.bedrooms} beds  | {property.properties.size} sqft
            </p>
          )}
        </div>
      );

      // Add marker to the map
      const marker = addMarker(coordinates, popupContent);

      // Add click handler if provided
      if (marker && onMarkerClick) {
        marker.getElement().addEventListener('click', () => {
          onMarkerClick(property);
        });
      }
    });

    // Cleanup on unmount
    return () => {
      clearMarkers();
    };
  }, [properties, activePropertyId, addMarker, clearMarkers, onMarkerClick]);

  return null;
}
