
'use client';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function PropertyPage() {
  const router = useRouter();
  const properties = [] as any; // TODO: Fetch properties from API

  return (
    <div className="p-6 w-full">
      <div className="flex justify-between items-center mb-6">
        <div className="text-2xl font-bold">My Properties</div>
        <Button onClick={() => router.push('/dashboard/properties/new')}>
          <Plus className="mr-2 h-4 w-4" />
          Add Property
        </Button>
      </div>

      {properties.length === 0 ? (
        <div className="text-center text-gray-500">
          No properties listed yet
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* {properties.map((property) => (
            <div key={property.id} className="border rounded-lg p-4 shadow-sm">
              <img src={property.image} alt={property.title} className="w-full h-48 object-cover rounded-md" />
              <h2 className="mt-2 text-lg font-semibold">{property.title}</h2>
              <p className="text-gray-600">{property.location}</p>
              <p className="text-lg font-bold mt-2">${property.price}</p>
            </div>
          ))} */}
        </div>
      )}
    </div>
  );
}
