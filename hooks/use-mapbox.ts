'use client';
import { useState, useEffect, useRef } from 'react';
import mapboxgl, { Map, MapboxOptions } from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Import the entire mapbox-gl module for window assignment
import * as MapboxGL from 'mapbox-gl';

// Declare global interface for window.mapboxgl
declare global {
  interface Window {
    mapboxgl: typeof MapboxGL;
  }
}

// Set the access token and assign to window
if (typeof window !== 'undefined') {
  mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || '';
  window.mapboxgl = MapboxGL; // Use the full module import
}

interface UseMapboxProps extends Omit<MapboxOptions, 'container'> {
  container: string | HTMLElement | null;
  onLoad?: (map: mapboxgl.Map) => void;
}

export const useMapbox = ({ container, onLoad, ...options }: UseMapboxProps) => {
  const [map, setMap] = useState<Map | null>(null);
  const mapInitialized = useRef(false);

  // Initialize map
  useEffect(() => {
    // Don't initialize if we don't have a container or map is already initialized
    if (!container || mapInitialized.current || !mapboxgl.accessToken) {
      return;
    }

    // Don't initialize if container is a string ID that doesn't exist
    if (typeof container === 'string' && !document.getElementById(container)) {
      return;
    }

    try {
      const mapInstance = new mapboxgl.Map({
        container: container as HTMLElement | string,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [39.2083, -6.7924], // Default to Tanzania
        zoom: 12,
        ...options,
      });

      mapInstance.on('load', () => {
        mapInitialized.current = true;
        setMap(mapInstance);
        if (onLoad) onLoad(mapInstance);
      });

      // Add navigation control
      mapInstance.addControl(new mapboxgl.NavigationControl(), 'top-right');
     
      // Add geolocation control
      mapInstance.addControl(
        new mapboxgl.GeolocateControl({
          positionOptions: {
            enableHighAccuracy: true,
          },
          trackUserLocation: true,
        }),
        'top-right'
      );

      // Cleanup
      return () => {
        if (mapInstance) {
          mapInstance.remove();
          mapInitialized.current = false;
        }
      };
    } catch (error) {
      console.error('Failed to initialize map:', error);
    }
  }, [container, onLoad, options]);

  return { map };
};