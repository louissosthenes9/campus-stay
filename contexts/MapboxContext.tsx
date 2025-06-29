'use client';

import { createContext, useContext, ReactNode, useState, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import 'mapbox-gl/dist/mapbox-gl.css';

// Simple type definitions for what we need
type LngLat = [number, number];

interface MapboxContextType {
  map: any; // Using 'any' to avoid complex type definitions
  markers: any[];
  setMap: (map: any) => void;
  addMarker: (coordinates: LngLat, popupContent?: ReactNode) => any;
  clearMarkers: () => void;
  flyTo: (coordinates: LngLat, zoom?: number) => void;
}

const MapboxContext = createContext<MapboxContextType | undefined>(undefined);

export const MapboxProvider = ({ children }: { children: ReactNode }) => {
  const [map, setMap] = useState<any>(null);
  const [markers, setMarkers] = useState<any[]>([]);

  const addMarker = useCallback((coordinates: LngLat, popupContent?: ReactNode) => {
    if (!map) {
      console.error('Map is not initialized');
      return null;
    }
    
    try {
      // Dynamically import mapbox-gl only on client side
      const mapboxgl = require('mapbox-gl');
      
      const marker = new mapboxgl.Marker()
        .setLngLat(coordinates)
        .addTo(map);

      if (popupContent) {
        const popupElement = document.createElement('div');
        popupElement.className = 'mapbox-popup';
        
        // For React 18+
        const root = createRoot(popupElement);
        root.render(popupContent);
        
        const popup = new mapboxgl.Popup({ offset: 25 })
          .setDOMContent(popupElement);
          
        marker.setPopup(popup);
      }

      setMarkers(prev => [...prev, marker]);
      return marker;
    } catch (error) {
      console.error('Error adding marker:', error);
      return null;
    }
  }, [map]);

  const clearMarkers = useCallback(() => {
    markers.forEach(marker => marker.remove());
    setMarkers([]);
  }, [markers]);

  const flyTo = useCallback((coordinates: LngLat, zoom = 14) => {
    if (map) {
      map.flyTo({
        center: coordinates,
        zoom,
        essential: true
      });
    }
  }, [map]);

  const contextValue = {
    map,
    markers,
    setMap,
    addMarker,
    clearMarkers,
    flyTo
  };

  return (
    <MapboxContext.Provider value={contextValue}>
      {children}
    </MapboxContext.Provider>
  );
};

export const useMapboxContext = () => {
  const context = useContext(MapboxContext);
  if (context === undefined) {
    throw new Error('useMapboxContext must be used within a MapboxProvider');
  }
  return context;
};

// For backward compatibility
export const useMapbox = useMapboxContext;