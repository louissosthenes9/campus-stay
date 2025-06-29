'use client';
import React, { useRef, useEffect, useState } from 'react';
import { useMapbox } from '@/hooks/use-mapbox';
import { MapPin, Navigation, Clock } from 'lucide-react';
import mapboxgl, { Map } from 'mapbox-gl';
import { Property } from '@/types/properties';

interface PropertyMapViewProps {
  property: Property;
  nearbyPlaces?: Array<{
    distance: any;
    walking_time: any;
    place: {
      geometry: {
        coordinates: [number, number];
      };
      properties: {
        place_type?: string;
        name?: string;
        [key: string]: any;
      };
    };
  }>;
}

const PropertyMapView: React.FC<PropertyMapViewProps> = ({ 
  property, 
  nearbyPlaces = [] 
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);
  
  // Extract coordinates from your GeoJSON API response
  const coordinates = property?.geometry?.coordinates || [39.2083, -6.7924]; // Default to Dar es Salaam
  const [longitude, latitude] = coordinates;

  const { map } = useMapbox({
    container: mapContainerRef.current,
    center: [longitude, latitude],
    zoom: 15,
    onLoad: (mapInstance) => {
      addPropertyMarker(mapInstance);
      addNearbyPlaces(mapInstance);
    }
  });

  const addPropertyMarker = (mapInstance: Map) => {
    if (!property?.properties) return;
    
    // Create custom marker for the main property
    const markerElement = document.createElement('div');
    markerElement.innerHTML = `
      <div style="
        background: #3b82f6;
        color: white;
        padding: 8px 12px;
        border-radius: 20px;
        font-size: 14px;
        font-weight: bold;
        box-shadow: 0 4px 8px rgba(0,0,0,0.3);
        position: relative;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 200px;
      ">
        ${property.properties.title || 'Property'}
        <div style="
          position: absolute;
          bottom: -8px;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 0;
          border-left: 8px solid transparent;
          border-right: 8px solid transparent;
          border-top: 8px solid #3b82f6;
        "></div>
      </div>
    `;

    // Add popup with property details
    const price = typeof property.properties.price === 'number' 
      ? property.properties.price.toLocaleString() 
      : String(property.properties.price || '0');
      
    const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
      <div style="padding: 12px; max-width: 250px;">
        <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: bold;">
          ${property.properties.title || 'Property'}
        </h3>
        <p style="margin: 4px 0; font-size: 14px; color: #666;">
          <strong>Price:</strong> TZS ${price}/month
        </p>
        <p style="margin: 4px 0; font-size: 14px; color: #666;">
          <strong>Type:</strong> ${property.properties.property_type_display || 'N/A'}
        </p>
        <p style="margin: 4px 0; font-size: 14px; color: #666;">
          <strong>Address:</strong> ${property.properties.address || 'No address'}
        </p>
      </div>
    `);

    new mapboxgl.Marker(markerElement)
      .setLngLat([longitude, latitude])
      .setPopup(popup)
      .addTo(mapInstance);
  };

  const addNearbyPlaces = (mapInstance: Map) => {
    nearbyPlaces.forEach((nearbyPlace) => {
      const place = nearbyPlace.place;
      const placeCoords = place.geometry?.coordinates;
      
      if (placeCoords && placeCoords.length >= 2) {
        const [placeLng, placeLat] = placeCoords;
        
        // Different colors for different place types
        const getPlaceColor = (type: any) => {
          switch(type) {
            case 'university': return '#10b981';
            case 'hospital': return '#ef4444';
            case 'market': return '#f59e0b';
            case 'transport': return '#8b5cf6';
            default: return '#6b7280';
          }
        };

        const placeElement = document.createElement('div');
        placeElement.innerHTML = `
          <div style="
            background: ${getPlaceColor(place.properties?.place_type)};
            color: white;
            padding: 6px 10px;
            border-radius: 15px;
            font-size: 12px;
            font-weight: 500;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          ">
            ${place.properties?.name || 'Place'}
          </div>
        `;

        const placePopup = new mapboxgl.Popup({ offset: 15 }).setHTML(`
          <div style="padding: 10px;">
            <h4 style="margin: 0 0 6px 0; font-size: 14px; font-weight: bold;">
              ${place.properties?.name}
            </h4>
            <p style="margin: 2px 0; font-size: 12px; color: #666;">
              <strong>Type:</strong> ${place.properties?.place_type_display}
            </p>
            <p style="margin: 2px 0; font-size: 12px; color: #666;">
              <strong>Distance:</strong> ${nearbyPlace.distance}km
            </p>
            <p style="margin: 2px 0; font-size: 12px; color: #666;">
              <strong>Walk:</strong> ${nearbyPlace.walking_time} mins
            </p>
          </div>
        `);

        new mapboxgl.Marker(placeElement)
          .setLngLat([placeLng, placeLat])
          .setPopup(placePopup)
          .addTo(mapInstance);
      }
    });
  };

  // Fit map to show all markers
  useEffect(() => {
    if (map && nearbyPlaces.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      
      // Add property coordinates
      bounds.extend([longitude, latitude]);
      
      // Add nearby places coordinates
      nearbyPlaces.forEach(nearbyPlace => {
        const coords = nearbyPlace.place.geometry?.coordinates;
        if (coords) {
          bounds.extend(coords);
        }
      });
      
      map.fitBounds(bounds, { padding: 50 });
    }
  }, [map, nearbyPlaces, longitude, latitude]);

  return (
    <div className="space-y-4">
      {/* Map Container */}
      <div 
        ref={mapContainerRef} 
        className="w-full h-96 rounded-lg overflow-hidden border border-gray-200"
      />
      
      {/* Address and Coordinates Info */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex items-center text-sm text-gray-600">
          <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
          <span>{property?.properties?.address || 'Location not specified'}</span>
          <div>
            <h4 className="font-medium text-gray-900">Property Location</h4>
            <p className="text-sm text-gray-600 mt-1">
              {property?.properties?.address || 'Address not provided'}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Coordinates: {latitude.toFixed(4)}, {longitude.toFixed(4)}
            </p>
          </div>
        </div>
      </div>

      {/* Nearby Places List */}
      {nearbyPlaces && nearbyPlaces.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3 flex items-center">
            <Navigation className="w-4 h-4 mr-2 text-indigo-600" />
            Nearby Places
          </h4>
          <div className="space-y-3">
            {nearbyPlaces.slice(0, 5).map((nearbyPlace, index) => {
              const place = nearbyPlace.place;
              return (
                <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                  <div>
                    <h5 className="font-medium text-sm text-gray-900">
                      {place.properties?.name}
                    </h5>
                    <p className="text-xs text-gray-500">
                      {place.properties?.place_type_display}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center text-xs text-gray-600">
                      <MapPin className="w-3 h-3 mr-1" />
                      <span>{nearbyPlace.distance}km</span>
                    </div>
                    <div className="flex items-center text-xs text-gray-500 mt-1">
                      <Clock className="w-3 h-3 mr-1" />
                      <span>{nearbyPlace.walking_time} min walk</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyMapView;