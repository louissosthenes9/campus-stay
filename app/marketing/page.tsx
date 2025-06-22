'use client';

import { useEffect, useState } from 'react';
import PropertyCard from '@/components/property/PropertyCard';
import { Property } from '@/types/properties';
import useProperty from '@/hooks/use-property';
import useAuth from '@/hooks/use-auth';

export default function MarketingPage() {
  const [marketingData, setMarketingData] = useState<any>(null);
  const { authHeaders } = useAuth();

  useEffect(() => {
    const fetchMarketingData = async () => {
      try {
        const headers = new Headers();
        headers.append('Content-Type', 'application/json');
        
        const authHeader = authHeaders();
        if (authHeader.Authorization) {
          headers.append('Authorization', authHeader.Authorization);
        }
        
        const response = await fetch(
          'https://campus-stay-api-nhk4.onrender.com/api/v1/properties/marketing-categories/',
          {
            headers,
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch marketing data');
        }

        const data = await response.json();
        setMarketingData(data);
      } catch (error) {
        console.error('Error fetching marketing data:', error);
      }
    };

    fetchMarketingData();
  }, [authHeaders]);

  if (!marketingData) {
    return <div>Loading...</div>;
  }

  const categories = [
    { name: 'Popular', data: marketingData.popular.features },
    { name: 'Near University', data: marketingData.near_university.features },
    { name: 'Top Rated', data: marketingData.top_rated.features },
    { name: 'Special Needs', data: marketingData.special_needs.features },
    { name: 'Cheap', data: marketingData.cheap.features },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Marketing Categories</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {categories.map((category) => (
          <div key={category.name} className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">{category.name}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {category.data.map((property: Property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  className="h-full"
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
