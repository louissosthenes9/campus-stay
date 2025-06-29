'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Property } from '@/types/properties';
import PropertyCard from '@/components/property/PropertyCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Search, SlidersHorizontal, X, Star, MapPin, Bed, Bath, Ruler } from 'lucide-react';
import { Input } from '@/components/ui/input';
import  useProperty  from '@/hooks/use-property';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';

const propertyTypes = [
  { id: 'apartment', label: 'Apartment' },
  { id: 'house', label: 'House' },
  { id: 'hostel', label: 'Hostel' },
  { id: 'studio', label: 'Studio' },
  { id: 'shared_room', label: 'Shared Room' },
];

const amenitiesList = [
  { id: 'wifi', label: 'Wi-Fi' },
  { id: 'parking', label: 'Parking' },
  { id: 'ac', label: 'Air Conditioning' },
  { id: 'furnished', label: 'Furnished' },
  { id: 'laundry', label: 'Laundry' },
  { id: 'security', label: '24/7 Security' },
];

const sortOptions = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
];

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { fetchProperties,properties } = useProperty();
  
  const [searchResults, setSearchResults] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState('relevance');
  
  // Initialize filters from URL params
  const [activeFilters, setActiveFilters] = useState({
    search: searchParams.get('search') || '',
    minPrice: searchParams.get('min_price') ? Number(searchParams.get('min_price')) : 0,
    maxPrice: searchParams.get('max_price') ? Number(searchParams.get('max_price')) : 500000,
    types: searchParams.get('types') ? searchParams.get('types')?.split(',') || [] : [],
    amenities: searchParams.get('amenities') ? searchParams.get('amenities')?.split(',') || [] : [],
    bedrooms: searchParams.get('bedrooms') ? Number(searchParams.get('bedrooms')) : null,
    bathrooms: searchParams.get('bathrooms') ? Number(searchParams.get('bathrooms')) : null,
  });

  // Format currency for display
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-TZ', {
      style: 'currency',
      currency: 'TZS',
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Fetch properties when filters change
  useEffect(() => {
    const fetchSearchResults = async () => {
      try {
        setIsLoading(true);
        
        // Build filters object for API
        const filters: any = {
          search: activeFilters.search || undefined,
          price__gte: activeFilters.minPrice > 0 ? activeFilters.minPrice : undefined,
          price__lte: activeFilters.maxPrice < 500000 ? activeFilters.maxPrice : undefined,
          property_type__in: activeFilters.types?.length ? activeFilters.types.join(',') : undefined,
          amenities__in: activeFilters.amenities?.length ? activeFilters.amenities.join(',') : undefined,
          bedrooms: activeFilters.bedrooms || undefined,
          toilets: activeFilters.bathrooms || undefined,
        };

        // Apply sorting
        if (sortBy === 'price_asc') filters.ordering = 'price';
        if (sortBy === 'price_desc') filters.ordering = '-price';
        if (sortBy === 'newest') filters.ordering = '-created_at';
        if (sortBy === 'oldest') filters.ordering = 'created_at';

        // Fetch properties using the useProperty hook
        const response = await fetchProperties(filters);
        
        console.log('Response:', response);
      
        if (response) {
          setSearchResults(response.results || []);
        }
        
      } catch (error) {
        console.error('Error fetching search results:', error);
        setSearchResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSearchResults();
    
    // Update URL with current filters
    const params = new URLSearchParams();
    if (activeFilters.search) params.set('search', activeFilters.search);
    if (activeFilters.minPrice > 0) params.set('min_price', activeFilters.minPrice.toString());
    if (activeFilters.maxPrice < 500000) params.set('max_price', activeFilters.maxPrice.toString());
    if (activeFilters.types?.length) params.set('types', activeFilters.types.join(','));
    if (activeFilters.amenities?.length) params.set('amenities', activeFilters.amenities.join(','));
    if (activeFilters.bedrooms !== null) params.set('bedrooms', activeFilters.bedrooms.toString());
    if (activeFilters.bathrooms !== null) params.set('bathrooms', activeFilters.bathrooms.toString());
    
    // Update URL without page reload
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.pushState({}, '', newUrl);
    
  }, [activeFilters, sortBy, fetchProperties]);
  
  // Handle filter changes
  const handleFilterChange = (updates: any) => {
    setActiveFilters(prev => ({
      ...prev,
      ...updates
    }));
  };
  
  // Clear all filters
  const clearAllFilters = () => {
    setActiveFilters({
      search: '',
      minPrice: 0,
      maxPrice: 500000,
      types: [],
      amenities: [],
      bedrooms: null,
      bathrooms: null,
    });
  };
  
  // Check if any filters are active
  const hasActiveFilters = 
    activeFilters.search ||
    activeFilters.minPrice > 0 ||
    activeFilters.maxPrice < 500000 ||
    (activeFilters.types && activeFilters.types.length > 0) ||
    (activeFilters.amenities && activeFilters.amenities.length > 0) ||
    activeFilters.bedrooms !== null ||
    activeFilters.bathrooms !== null;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Search Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Find Your Perfect Student Accommodation</h1>
        <div className="relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search by location, property name, or university..."
              className="pl-10 pr-4 py-6 text-base w-full"
              value={activeFilters.search}
              onChange={(e) => handleFilterChange({ search: e.target.value })}
              onKeyDown={(e) => e.key === 'Enter' && handleFilterChange({})}
            />
          </div>
          
          {/* Active Filters */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 mt-3">
              {activeFilters.search && (
                <Badge className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full flex items-center">
                  {activeFilters.search}
                  <button 
                    onClick={() => handleFilterChange({ search: '' })}
                    className="ml-2 text-blue-500 hover:text-blue-700"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              
              {(activeFilters.minPrice > 0 || activeFilters.maxPrice < 500000) && (
                <Badge className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full flex items-center">
                  {formatCurrency(activeFilters.minPrice)} - {formatCurrency(activeFilters.maxPrice)}
                  <button 
                    onClick={() => handleFilterChange({ minPrice: 0, maxPrice: 500000 })}
                    className="ml-2 text-blue-500 hover:text-blue-700"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              
              {activeFilters.types?.map(type => (
                <Badge key={type} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full flex items-center">
                  {type}
                  <button 
                    onClick={() => handleFilterChange({ 
                      types: activeFilters.types?.filter(t => t !== type) || [] 
                    })}
                    className="ml-2 text-blue-500 hover:text-blue-700"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
              
              {activeFilters.bedrooms !== null && (
                <Badge className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full flex items-center">
                  {activeFilters.bedrooms} {activeFilters.bedrooms === 1 ? 'Bedroom' : 'Bedrooms'}
                  <button 
                    onClick={() => handleFilterChange({ bedrooms: null })}
                    className="ml-2 text-blue-500 hover:text-blue-700"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              
              {activeFilters.bathrooms !== null && (
                <Badge className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full flex items-center">
                  {activeFilters.bathrooms} {activeFilters.bathrooms === 1 ? 'Bathroom' : 'Bathrooms'}
                  <button 
                    onClick={() => handleFilterChange({ bathrooms: null })}
                    className="ml-2 text-blue-500 hover:text-blue-700"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              
              {activeFilters.amenities?.map(amenity => (
                <Badge key={amenity} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full flex items-center">
                  {amenity}
                  <button 
                    onClick={() => handleFilterChange({ 
                      amenities: activeFilters.amenities?.filter(a => a !== amenity) || [] 
                    })}
                    className="ml-2 text-blue-500 hover:text-blue-700"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
              
              {hasActiveFilters && (
                <button 
                  onClick={clearAllFilters}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium ml-2 flex items-center"
                >
                  Clear all
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Mobile Filter Button */}
        <div className="md:hidden">
          <Button 
            variant="outline" 
            className="w-full flex items-center justify-center gap-2"
            onClick={() => setIsFilterOpen(true)}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filter Properties
          </Button>
        </div>
        
        {/* Filters Sidebar */}
        <div className={`${isFilterOpen ? 'block' : 'hidden'} md:block w-full md:w-80 flex-shrink-0`}>
          <div className="bg-white rounded-lg shadow p-6 sticky top-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold">Filters</h2>
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={clearAllFilters}
                  disabled={!hasActiveFilters}
                >
                  Clear all
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="md:hidden"
                  onClick={() => setIsFilterOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {/* Price Range Filter */}
            <div className="mb-6">
              <h3 className="text-sm font-medium mb-3">Price Range (TZS)</h3>
              <div className="px-2">
                <Slider
                  min={0}
                  max={500000}
                  step={10000}
                  value={[activeFilters.minPrice, activeFilters.maxPrice]}
                  onValueChange={(values) => {
                    handleFilterChange({
                      minPrice: values[0],
                      maxPrice: values[1]
                    });
                  }}
                  minStepsBetweenThumbs={1}
                  className="mb-4"
                />
                <div className="flex justify-between text-sm">
                  <span>{formatCurrency(activeFilters.minPrice)}</span>
                  <span>{formatCurrency(activeFilters.maxPrice)}</span>
                </div>
              </div>
            </div>
            
            {/* Property Type Filter */}
            <div className="mb-6">
              <h3 className="text-sm font-medium mb-3">Property Type</h3>
              <div className="space-y-2">
                {propertyTypes.map((type) => (
                  <div key={type.id} className="flex items-center">
                    <Checkbox
                      id={`type-${type.id}`}
                      checked={activeFilters.types?.includes(type.id)}
                      onCheckedChange={(checked) => {
                        handleFilterChange({
                          types: checked
                            ? [...(activeFilters.types || []), type.id]
                            : (activeFilters.types || []).filter(t => t !== type.id)
                        });
                      }}
                      className="h-4 w-4 rounded"
                    />
                    <label htmlFor={`type-${type.id}`} className="ml-2 text-sm">
                      {type.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Bedrooms Filter */}
            <div className="mb-6">
              <h3 className="text-sm font-medium mb-3">Bedrooms</h3>
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 4, '5+'].map((num) => (
                  <Button
                    key={num}
                    variant={activeFilters.bedrooms === num ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => 
                      handleFilterChange({ 
                        bedrooms: activeFilters.bedrooms === num ? null : num as any 
                      })
                    }
                    className="rounded-full"
                  >
                    {num}
                  </Button>
                ))}
              </div>
            </div>
            
            {/* Bathrooms Filter */}
            <div className="mb-6">
              <h3 className="text-sm font-medium mb-3">Bathrooms</h3>
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, '4+'].map((num) => (
                  <Button
                    key={num}
                    variant={activeFilters.bathrooms === num ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => 
                      handleFilterChange({ 
                        bathrooms: activeFilters.bathrooms === num ? null : num as any 
                      })
                    }
                    className="rounded-full"
                  >
                    {num}
                  </Button>
                ))}
              </div>
            </div>
            
            {/* Amenities Filter */}
            <div className="mb-6">
              <h3 className="text-sm font-medium mb-3">Amenities</h3>
              <div className="space-y-2">
                {amenitiesList.map((amenity) => (
                  <div key={amenity.id} className="flex items-center">
                    <Checkbox
                      id={`amenity-${amenity.id}`}
                      checked={activeFilters.amenities?.includes(amenity.id)}
                      onCheckedChange={(checked) => {
                        handleFilterChange({
                          amenities: checked
                            ? [...(activeFilters.amenities || []), amenity.id]
                            : (activeFilters.amenities || []).filter(a => a !== amenity.id)
                        });
                      }}
                      className="h-4 w-4 rounded"
                    />
                    <label htmlFor={`amenity-${amenity.id}`} className="ml-2 text-sm">
                      {amenity.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Search Results */}
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h2 className="text-xl font-semibold">
              {isLoading ? 'Searching...' : `${searchResults.length} properties found`}
            </h2>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-sm text-muted-foreground whitespace-nowrap">Sort by:</span>
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full sm:w-auto bg-white border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow overflow-hidden">
                  <Skeleton className="h-48 w-full" />
                  <div className="p-4">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2 mb-4" />
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : searchResults.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {searchResults.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-lg shadow">
              <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <Search className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No properties found</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                Try adjusting your search or filter criteria to find what you're looking for.
              </p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={clearAllFilters}
              >
                Clear all filters
              </Button>
            </div>
          )}
          
          {/* Pagination - To be implemented */}
          {searchResults.length > 0 && (
            <div className="mt-8 flex justify-center">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled>
                  Previous
                </Button>
                <Button variant="outline" size="sm" className="font-medium">
                  1
                </Button>
                <Button variant="ghost" size="sm" className="text-muted-foreground">
                  2
                </Button>
                <Button variant="ghost" size="sm" className="text-muted-foreground">
                  3
                </Button>
                <Button variant="outline" size="sm">
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
