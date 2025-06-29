import { LngLatBoundsLike } from 'mapbox-gl';
import { Property } from '@/types/properties';

export function calculateBounds(properties: Property[]): LngLatBoundsLike | null {
  if (!properties.length) return null;

  // Filter out properties without valid GeoJSON coordinates
  const validProperties = properties.filter(
    (p) => p.geometry?.coordinates?.length === 2
  );

  if (!validProperties.length) return null;

  // Initialize bounds with the first property's coordinates
  const firstCoords = validProperties[0].geometry.coordinates;
  let minLng = firstCoords[0];
  let maxLng = firstCoords[0];
  let minLat = firstCoords[1];
  let maxLat = firstCoords[1];

  // Expand bounds to include all properties
  validProperties.forEach((property) => {
    const [lng, lat] = property.geometry.coordinates;

    minLng = Math.min(minLng, lng);
    maxLng = Math.max(maxLng, lng);
    minLat = Math.min(minLat, lat);
    maxLat = Math.max(maxLat, lat);
  });

  // Add some padding
  const padding = 0.01;
  return [
    [minLng - padding, minLat - padding],
    [maxLng + padding, maxLat + padding],
  ] as LngLatBoundsLike;
}

export function fitMapToBounds(
  map: any,
  bounds: LngLatBoundsLike | null,
  padding: number = 50
) {
  if (!map || !bounds) return;

  map.fitBounds(bounds, {
    padding: {
      top: padding,
      bottom: padding,
      left: padding,
      right: padding,
    },
    maxZoom: 15,
  });
}
