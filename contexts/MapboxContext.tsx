'use client';

import { createContext, useContext, ReactNode, useState, useRef, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';

interface MapboxContextType {
  map: mapboxgl.Map | null;
  markers: mapboxgl.Marker[];
  addMarker: (coordinates: [number, number], popupContent: string | HTMLElement) => mapboxgl.Marker | null;
  clearMarkers: () => void;
}

const MapboxContext = createContext<MapboxContextType>({
  map: null,
  markers: [],
  addMarker: () => null,
  clearMarkers: () => {},
});

export const MapboxProvider = ({ children }: { children: ReactNode }) => {
  const [map, setMap] = useState<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  const addMarker = (coordinates: [number, number], popupContent: string | HTMLElement) => {
    if (!map) return null;

    const el = document.createElement('div');
    el.className = 'property-marker cursor-pointer';
    
    const marker = new mapboxgl.Marker({ element: el })
      .setLngLat(coordinates)
      .addTo(map);

    if (popupContent) {
      const popup = new mapboxgl.Popup({
        offset: 25,
        closeOnClick: false,
        closeButton: false,
      }).setDOMContent(
        typeof popupContent === 'string' 
          ? document.createTextNode(popupContent) 
          : popupContent
      );

      marker.setPopup(popup);
    }

    markersRef.current.push(marker);
    return marker;
  };

  const clearMarkers = () => {
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];
  };

  return (
    <MapboxContext.Provider value={{ map, markers: markersRef.current, addMarker, clearMarkers }}>
      {children}
    </MapboxContext.Provider>
  );
};

export const useMapboxContext = () => useContext(MapboxContext);