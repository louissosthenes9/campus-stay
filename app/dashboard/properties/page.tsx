'use client';
import { Button } from '@/components/ui/button';
import { Plus, Home, MapPin, Loader2, Edit, Trash2, Camera } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import useProperty from '@/hooks/use-property';

export default function PropertyPage() {
  const router = useRouter();
  const { 
    properties, 
    loading, 
    error, 
    pagination,
    fetchProperties,
    deleteProperty,
    getPropertyPrice,
    getPropertyTitle,
    getPropertyAddress,
    getPropertyPrimaryImage,
    isPropertyAvailable,
    clearError
  } = useProperty();

  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Fetch properties when component mounts
  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  // Handle property deletion
  const handleDeleteProperty = async (propertyId: number) => {
    if (!confirm('Are you sure you want to delete this property? This action cannot be undone.')) {
      return;
    }

    setDeletingId(propertyId);
    try {
      const success = await deleteProperty(propertyId);
      if (success) {
        // Property is automatically removed from state by the hook
        console.log('Property deleted successfully');
      }
    } catch (err) {
      console.error('Error deleting property:', err);
    } finally {
      setDeletingId(null);
    }
  };

  // Handle retry on error
  const handleRetry = () => {
    clearError();
    fetchProperties();
  };

  // Handle loading state
  if (loading && properties.length === 0) {
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
  if (error && properties.length === 0) {
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
            onClick={handleRetry}
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

      {/* Show error banner if there's an error but we still have properties */}
      {error && properties.length > 0 && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="text-red-600 mr-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-medium text-red-900">Something went wrong</h4>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
            <Button 
              onClick={clearError}
              variant="outline"
              size="sm"
              className="border-red-300 text-red-600 hover:bg-red-100"
            >
              Dismiss
            </Button>
          </div>
        </div>
      )}

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
          {properties.map((property) => {
            const price = getPropertyPrice(property);
            const title = getPropertyTitle(property);
            const address = getPropertyAddress(property);
            const primaryImage = getPropertyPrimaryImage(property);
            const available = isPropertyAvailable(property);
            const isDeleting = deletingId === property.id;

            return (
              <div 
                key={property.id}
                className={`bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-all duration-300 ${
                  isDeleting ? 'opacity-50 pointer-events-none' : ''
                } ${
                  !available ? 'ring-2 ring-yellow-200' : ''
                }`}
              >
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={primaryImage || property.images?.[0] || 'https://picsum.photos/seed/property/800/600'} 
                    alt={title} 
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                  />
                  <div className="absolute top-2 right-2 bg-indigo-600 text-white text-xs font-bold px-2 py-1 rounded-md">
                    {property.properties.property_type_display || property.properties.property_type}
                  </div>
                  {!available && (
                    <div className="absolute top-2 left-2 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-md">
                      Unavailable
                    </div>
                  )}
                  {property.media && property.media.length > 0 && (
                    <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded-md flex items-center">
                      <Camera className="w-3 h-3 mr-1" />
                      {property.media.length}
                    </div>
                  )}
                </div>
                
                <div className="p-5">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-1">
                    {title}
                  </h2>
                  
                  <div className="flex items-center text-gray-500 text-sm mb-3">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span className="truncate">{address}</span>
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
                    {property.properties.is_furnished && (
                      <div className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        Furnished
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-lg font-bold text-indigo-600">
                      <span className="text-sm font-normal text-gray-500">TZS </span>
                      {price.toLocaleString()}
                    </div>
                    {property.properties.overall_score && (
                      <div className="text-sm text-gray-600">
                        Score: <span className="font-medium">{property.properties.overall_score}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="flex-1 text-indigo-600 border-indigo-600 hover:bg-indigo-50"
                      onClick={() => router.push(`/dashboard/properties/${property.id}`)}
                    >
                      View Details
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-gray-600 border-gray-300 hover:bg-gray-50"
                      onClick={() => router.push(`/dashboard/properties/${property.id}/edit`)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-red-600 border-red-300 hover:bg-red-50"
                      onClick={() => handleDeleteProperty(property.id)}
                      disabled={isDeleting}
                    >
                      {isDeleting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {pagination && (pagination.next || pagination.previous) && (
        <div className="mt-8 flex justify-center gap-2">
          {pagination.previous && (
            <Button
              variant="outline"
              onClick={() => {
                const url = new URL(pagination.previous!);
                const page = url.searchParams.get('page');
                fetchProperties({ page: page ? parseInt(page) : 1 });
              }}
              disabled={loading}
            >
              Previous
            </Button>
          )}
          {pagination.next && (
            <Button
              variant="outline"
              onClick={() => {
                const url = new URL(pagination.next!);
                const page = url.searchParams.get('page');
                fetchProperties({ page: page ? parseInt(page) : 1 });
              }}
              disabled={loading}
            >
              Next
            </Button>
          )}
        </div>
      )}
    </div>
  );
}