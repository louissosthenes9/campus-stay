'use client';

import { useEffect, useRef, useState } from 'react';
import { useMapboxContext } from '@/contexts/MapboxContext';
import 'mapbox-gl/dist/mapbox-gl.css';

interface MapboxMapProps {
  initialCenter?: [number, number];
  initialZoom?: number;
  style?: React.CSSProperties;
  className?: string;
  onMapLoad?: (map: any) => void;
  children?: React.ReactNode;
}

export default function MapboxMap({
  initialCenter = [-74.5, 40],
  initialZoom = 9,
  style = { width: '100%', height: '400px' },
  className = '',
  onMapLoad,
  children,
}: MapboxMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const { setMap } = useMapboxContext();
  const [mapError, setMapError] = useState<string | null>(null);

  useEffect(() => {
    // Only run on client-side
    if (typeof window === 'undefined' || !mapContainer.current) return;

    // Dynamically import mapbox-gl to avoid SSR issues
    const mapboxgl = require('mapbox-gl');
    
    // Set access token
    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || '';
    
    // Initialize the map
    try {
      const map = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: initialCenter,
        zoom: initialZoom,
      });

      // Add navigation control (zoom buttons)
      map.addControl(new mapboxgl.NavigationControl());

      // Add geolocate control
      map.addControl(
        new mapboxgl.GeolocateControl({
          positionOptions: {
            enableHighAccuracy: true,
          },
          trackUserLocation: true,
        })
      );

      // Set the map in context
      setMap(map);
      
      // Call the onMapLoad callback if provided
      if (onMapLoad) {
        map.on('load', () => onMapLoad(map));
      }

      // Cleanup on unmount
      return () => {
        map.remove();
        setMap(null);
      };
    } catch (error) {
      console.error('Error initializing map:', error);
      setMapError('Failed to load the map. Please try again later.');
    }
  }, [initialCenter, initialZoom, onMapLoad, setMap]);

  if (mapError) {
    return (
      <div style={style} className={className}>
        <div className="flex items-center justify-center h-full bg-gray-100 text-red-600">
          {mapError}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={mapContainer}
      style={style}
      className={`map-container ${className}`}
    >
      {children}
    </div>
  );
}
