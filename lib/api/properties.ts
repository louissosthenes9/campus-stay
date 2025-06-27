import { Property } from '@/types/properties';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export async function getPropertyById(id: string): Promise<Property | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/properties/${id}/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Add cache control for better performance
      next: { revalidate: 60 * 60 }, // Revalidate every hour
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`Failed to fetch property: ${response.statusText}`);
    }

    const data = await response.json();
    return data as Property;
  } catch (error) {
    console.error('Error fetching property:', error);
    return null;
  }
}

export async function getProperties(page = 1, pageSize = 10): Promise<{ properties: Property[]; total: number }> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/properties/?page=${page}&page_size=${pageSize}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        next: { revalidate: 60 * 5 }, // Revalidate every 5 minutes
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch properties: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      properties: data.results || [],
      total: data.count || 0,
    };
  } catch (error) {
    console.error('Error fetching properties:', error);
    return { properties: [], total: 0 };
  }
}
