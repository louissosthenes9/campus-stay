'use client';
import { Button } from '@/components/ui/button';
import { Plus, Home, MapPin } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function PropertyPage() {
  const router = useRouter();

  // Dummy property data
  const properties = [
    {
      id: 1,
      title: "Luxury Apartment in Dar es Salaam",
      location: "Oyster Bay, Dar es Salaam",
      price: 1200000,
      type: "Apartment",
      bedrooms: 3,
      bathrooms: 2,
      size: "120 m²",
      image: "https://picsum.photos/seed/apartment/800/600 "
    },
    {
      id: 2,
      title: "Modern Villa in Arusha",
      location: "New Arusha, Arusha",
      price: 950000,
      type: "House",
      bedrooms: 4,
      bathrooms: 3,
      size: "250 m²",
      image: "https://picsum.photos/seed/villa/800/600 "
    },
    {
      id: 3,
      title: "Affordable Hostel in Mwanza",
      location: "Makongoro Road, Mwanza",
      price: 350000,
      type: "Hostel",
      bedrooms: 1,
      bathrooms: 1,
      size: "40 m²",
      image: "https://picsum.photos/seed/hostel/800/600 "
    },
    {
      id: 4,
      title: "Commercial Office Space",
      location: "Kigamboni, Dar es Salaam",
      price: 2500000,
      type: "Commercial",
      bedrooms: 0,
      bathrooms: 2,
      size: "300 m²",
      image: "https://picsum.photos/seed/office/800/600 "
    },
    {
      id: 5,
      title: "Family House in Morogoro",
      location: "Mzumbe University Area",
      price: 800000,
      type: "House",
      bedrooms: 3,
      bathrooms: 2,
      size: "180 m²",
      image: "https://picsum.photos/seed/house/800/600 "
    }
  ];

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
                  src={property.image} 
                  alt={property.title} 
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                />
                <div className="absolute top-2 right-2 bg-indigo-600 text-white text-xs font-bold px-2 py-1 rounded-md">
                  {property.type}
                </div>
              </div>
              
              <div className="p-5">
                <h2 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-1">
                  {property.title}
                </h2>
                
                <div className="flex items-center text-gray-500 text-sm mb-3">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span className="truncate">{property.location}</span>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="font-medium">{property.bedrooms}</span> Beds
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="font-medium">{property.bathrooms}</span> Baths
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="font-medium">{property.size}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="text-lg font-bold text-indigo-600">
                    <span className="text-sm font-normal text-gray-500">TZS </span>
                    {property.price.toLocaleString()}
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="text-indigo-600 border-indigo-600 hover:bg-indigo-50"
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