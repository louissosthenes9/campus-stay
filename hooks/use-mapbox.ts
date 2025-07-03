'use client';
import { useState, useEffect, useRef } from 'react';
import mapboxgl, { Map, MapboxOptions } from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface UseMapboxProps extends Omit<MapboxOptions, 'container'> {
  container: string | HTMLElement | null;
  onLoad?: (map: mapboxgl.Map) => void;
}

export const useMapbox = ({ container, onLoad, ...options }: UseMapboxProps) => {
  const [map, setMap] = useState<Map | null>(null);
  const [error, setError] = useState<string | null>(null);
  const mapInitialized = useRef(false);
  const mapInstanceRef = useRef<Map | null>(null);

  // Initialize map
  useEffect(() => {
    // Reset error state
    setError(null);

    // Don't initialize if we don't have a container or map is already initialized
    if (!container || mapInitialized.current) {
      return;
    }

    // Check if access token is available
    const accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
    if (!accessToken) {
      setError('Mapbox access token is not configured');
      console.error('Mapbox access token is missing. Please set NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN in your environment variables.');
      return;
    }

    // Set the access token
    mapboxgl.accessToken = accessToken;

    // Don't initialize if container is a string ID that doesn't exist
    if (typeof container === 'string' && !document.getElementById(container)) {
      console.warn(`Container element with ID "${container}" not found`);
      return;
    }

    try {
      const mapInstance = new mapboxgl.Map({
        container: container as HTMLElement | string,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [39.2083, -6.7924], // Tanzania coordinates
        zoom: 12,
        ...options,
      });

      mapInstanceRef.current = mapInstance;

      // Handle map load
      mapInstance.on('load', () => {
        mapInitialized.current = true;
        setMap(mapInstance);
        if (onLoad) {
          onLoad(mapInstance);
        }
      });

      // Handle map errors
      mapInstance.on('error', (e) => {
        console.error('Mapbox error:', e);
        setError('Failed to load map');
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
          showUserHeading: true,
        }),
        'top-right'
      );

    } catch (error) {
      console.error('Failed to initialize map:', error);
      setError('Failed to initialize map');
    }

    // Cleanup function
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        mapInitialized.current = false;
        setMap(null);
      }
    };
  }, [container]); // Remove onLoad and options from dependencies to prevent re-initialization

  // Handle onLoad changes separately
  useEffect(() => {
    if (map && onLoad) {
      onLoad(map);
    }
  }, [map, onLoad]);

  return { map, error };
};