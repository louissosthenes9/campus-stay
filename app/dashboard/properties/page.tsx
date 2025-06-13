'use client';
import { Button } from '@/components/ui/button';
import { Plus, Home, MapPin, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import useProperty from '@/hooks/use-property'; // Adjust path as needed

export default function PropertyPage() {
  const router = useRouter();
  const { 
    properties, 
    loading, 
    error, 
    fetchProperties,
    pagination 
  } = useProperty();

  // Fetch properties when component mounts
  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  // Handle loading state
  if (loading) {
    return (
      <div className="p-6 w-full max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-gray-900">My Properties</h1>
            <p className="text-gray-500">Manage your listed properties</p>
          </div>
          <Button 
            onClick={() => router.push('/dashboard/properties/new')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Property
          </Button>
        </div>
        
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          <span className="ml-2 text-gray-600">Loading properties...</span>
        </div>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="p-6 w-full max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-gray-900">My Properties</h1>
            <p className="text-gray-500">Manage your listed properties</p>
          </div>
          <Button 
            onClick={() => router.push('/dashboard/properties/new')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Property
          </Button>
        </div>
        
        <div className="text-center py-12 bg-red-50 rounded-lg border border-red-200">
          <div className="text-red-600 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-red-900 mb-2">Error loading properties</h3>
          <p className="text-red-700 mb-6">{error}</p>
          <Button 
            onClick={() => fetchProperties()}
            variant="outline"
            className="border-red-500 text-red-600 hover:bg-red-50"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 w-full max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-gray-900">My Properties</h1>
          <p className="text-gray-500">
            Manage your listed properties
            {pagination && ` (${pagination.count} total)`}
          </p>
        </div>
        <Button 
          onClick={() => router.push('/dashboard/properties/new')}
          className="bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Property
        </Button>
      </div>

      {properties.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <Home className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No properties listed yet</h3>
          <p className="text-gray-500 mb-6">Get started by creating a new property listing</p>
          <Button 
            onClick={() => router.push('/dashboard/properties/new')}
            variant="outline"
            className="border-indigo-500 text-indigo-600 hover:bg-indigo-50"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Your First Listing
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <div 
              key={property.id}
              className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow duration-300"
            >
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={property.images?.[0] || 'https://picsum.photos/seed/property/800/600'} 
                  alt={property.properties.name } 
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                />
                <div className="absolute top-2 right-2 bg-indigo-600 text-white text-xs font-bold px-2 py-1 rounded-md">
                  {property.properties.property_type}
                </div>
              </div>
              
              <div className="p-5">
                <h2 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-1">
                  {property.properties.name}
                </h2>
                
                <div className="flex items-center text-gray-500 text-sm mb-3">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span className="truncate">{property.properties.address}</span>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="font-medium">{property.properties.bedrooms}</span> Beds
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="font-medium">{property.properties.toilets}</span> Baths
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="font-medium">{property.properties.size} m²</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="text-lg font-bold text-indigo-600">
                    <span className="text-sm font-normal text-gray-500">TZS </span>
                    {property.properties.price.toLocaleString()}
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="text-indigo-600 border-indigo-600 hover:bg-indigo-50"
                    onClick={() => router.push(`/dashboard/properties/${property.id}`)}
                  >
                    View Details
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}