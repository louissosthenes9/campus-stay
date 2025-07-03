'use client';

import { createContext, useContext, ReactNode, useState, useRef, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';

interface MapboxContextType {
  map: mapboxgl.Map | null;
  markers: mapboxgl.Marker[];
  addMarker: (coordinates: [number, number], popupContent: string | HTMLElement) => mapboxgl.Marker | null;
  clearMarkers: () => void;
  setMap: (map: mapboxgl.Map | null) => void;
  flyTo: (coordinates: [number, number], zoom: number) => void;
}

const MapboxContext = createContext<MapboxContextType>({
  map: null,
  markers: [],
  addMarker: () => null,
  clearMarkers: () => {},
  setMap: () => {},
  flyTo: () => {},
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

  const flyTo = (coordinates: [number, number], zoom: number) => {
    if (map) {
      map.flyTo({
        center: coordinates,
        zoom: zoom,
        essential: true
      });
    }
  };

  return (
    <MapboxContext.Provider value={{ 
      map, 
      markers: markersRef.current, 
      addMarker, 
      clearMarkers, 
      setMap,
      flyTo 
    }}>
      {children}
    </MapboxContext.Provider>
  );
};

export const useMapboxContext = () => useContext(MapboxContext);