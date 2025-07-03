'use client';

import { useEffect } from 'react';
import { useMapboxContext } from '@/contexts/MapboxContext';
import { Property } from '@/types/properties';
import mapboxgl from 'mapbox-gl';

interface PropertyMarkersProps {
  properties: Property[];
  activePropertyId?: string | null;
  onMarkerClick?: (property: Property) => void;
}

const escapeHtml = (unsafe: string) => unsafe
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#039;');

export default function PropertyMarkers({
  properties,
  activePropertyId,
  onMarkerClick,
}: PropertyMarkersProps) {
  const { map, clearMarkers } = useMapboxContext();

  useEffect(() => {
    if (!map || !properties.length) return;

    // Clear existing markers
    clearMarkers();

    const markers: mapboxgl.Marker[] = [];

    properties.forEach((property) => {
      if (!property.geometry?.coordinates || property.geometry.coordinates.length !== 2) return;

      const coordinates: [number, number] = [
        property.geometry.coordinates[0],
        property.geometry.coordinates[1],
      ];

      // Create custom marker element
      const el = document.createElement('div');
      el.className = 'property-marker cursor-pointer';
      
      // Use SVG icon (home icon from Heroicons)
      el.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" 
             class="w-6 h-6 ${property.id.toString() === activePropertyId ? 'text-red-500' : 'text-blue-500'}">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      `;

      // Create popup content
      const popupContent = `
        <div class="p-2 max-w-xs bg-white rounded shadow-lg">
          <h3 class="font-semibold text-sm">${escapeHtml(property.properties.title)}</h3>
          ${property.properties.price ? `
            <p class="text-primary font-bold">
              $${property.properties.price.toLocaleString()}/month
            </p>` : ''
          }
          ${(property.properties.bedrooms && property.properties.size) ? `
            <p class="text-sm text-gray-600">
              ${property.properties.bedrooms} beds | ${property.properties.size} sqft
            </p>` : ''
          }
        </div>
      `;

      // Create marker
      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat(coordinates)
        .addTo(map);

      // Create and configure popup
      const popup = new mapboxgl.Popup({
        offset: 25,
        closeOnClick: false,
        closeButton: false,
      }).setHTML(popupContent);

      marker.setPopup(popup);

      // Add hover events
      el.addEventListener('mouseenter', () => popup.addTo(map));
      el.addEventListener('mouseleave', () => popup.remove());

      // Add click handler
      if (onMarkerClick) {
        el.addEventListener('click', () => onMarkerClick(property));
      }

      markers.push(marker);
    });

    // Cleanup
    return () => {
      markers.forEach(marker => marker.remove());
      clearMarkers();
    };
  }, [properties, activePropertyId, map, clearMarkers, onMarkerClick]);

  return null;
}