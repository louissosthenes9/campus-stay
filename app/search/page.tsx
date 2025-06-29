'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Property } from '@/types/properties';

// Define the ActiveFilters type
type ActiveFilters = {
  search: string;
  min_price: number;
  max_price: number;
  property_type: string[] | undefined;
  amenities: number[] | undefined;
  bedrooms: number | null;
  bedrooms__gte: number | null;
  bedrooms__lte: number | null;
  toilets: number | null;
  is_furnished: boolean;
  electricity_type: string[] | undefined;
  [key: string]: any; // Allow dynamic properties for backward compatibility
};
import PropertyCard from '@/components/property/PropertyCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Search, SlidersHorizontal, X, Star, MapPin, Bed, Bath, Ruler } from 'lucide-react';
import debounce from 'lodash/debounce';
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
  
  // Initialize filters from URL params with proper typing
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>({
    search: searchParams.get('search') || '',
    min_price: searchParams.get('min_price') ? Number(searchParams.get('min_price')) : 0,
    max_price: searchParams.get('max_price') ? Number(searchParams.get('max_price')) : 500000,
    property_type: searchParams.get('property_type') ? searchParams.get('property_type')?.split(',') : [],
    amenities: searchParams.get('amenities') ? searchParams.get('amenities')?.split(',').map(Number).filter(Boolean) : [],
    bedrooms: searchParams.get('bedrooms') ? Number(searchParams.get('bedrooms')) : null,
    bedrooms__gte: searchParams.get('bedrooms__gte') ? Number(searchParams.get('bedrooms__gte')) : null,
    bedrooms__lte: searchParams.get('bedrooms__lte') ? Number(searchParams.get('bedrooms__lte')) : null,
    toilets: searchParams.get('toilets') ? Number(searchParams.get('toilets')) : null,
    is_furnished: searchParams.get('is_furnished') === 'true',
    electricity_type: searchParams.get('electricity_type') ? searchParams.get('electricity_type')?.split(',') : [],
  });

  // Format currency for display
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-TZ', {
      style: 'currency',
      currency: 'TZS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Memoize the debounced fetch function
  const debouncedFetchProperties = useMemo(
    () =>
      debounce(async (filters: Record<string, any> = {}) => {
        try {
          setIsLoading(true);
          
          // Apply sorting
          if (sortBy === 'price_asc') filters.ordering = 'price';
          if (sortBy === 'price_desc') filters.ordering = '-price';
          if (sortBy === 'newest') filters.ordering = '-created_at';
          if (sortBy === 'oldest') filters.ordering = 'created_at';

          // Fetch properties using the useProperty hook
          const response = await fetchProperties(filters);
          
          if (response) {
            setSearchResults(response.results || []);
          }
        } catch (error) {
          console.error('Error fetching properties:', error);
          setSearchResults([]);
        } finally {
          setIsLoading(false);
        }
      }, 300), // 300ms debounce delay
    [fetchProperties, sortBy]
  );
  
  // Handle filter changes
  const handleFilterChange = useCallback((newFilters: Partial<ActiveFilters> & { [key: string]: any }) => {
    // Map old filter names to new ones for backward compatibility
    const mappedFilters: Partial<ActiveFilters> = { ...newFilters };
    
    // Handle old filter names
    if ('minPrice' in newFilters) {
      mappedFilters.min_price = newFilters.minPrice as number;
      delete (mappedFilters as any).minPrice;
    }
    if ('maxPrice' in newFilters) {
      mappedFilters.max_price = newFilters.maxPrice as number;
      delete (mappedFilters as any).maxPrice;
    }
    if ('types' in newFilters) {
      mappedFilters.property_type = newFilters.types as string[];
      delete (mappedFilters as any).types;
    }
    if ('bathrooms' in newFilters) {
      mappedFilters.toilets = newFilters.bathrooms as number | null;
      delete (mappedFilters as any).bathrooms;
    }
    
    setActiveFilters(prev => {
      const updatedFilters: ActiveFilters = {
        ...prev,
        ...mappedFilters,
        min_price: 'min_price' in mappedFilters ? mappedFilters.min_price! : prev.min_price,
        max_price: 'max_price' in mappedFilters ? mappedFilters.max_price! : prev.max_price,
      };
      
      return updatedFilters;
    });
  }, []);

  // Fetch properties when filters change
  useEffect(() => {
    // Build filters object for API with proper typing
    const filters: Record<string, any> = {
      search: activeFilters.search || undefined,
      price__gte: activeFilters.min_price > 0 ? activeFilters.min_price : undefined,
      price__lte: activeFilters.max_price < 500000 ? activeFilters.max_price : undefined,
      property_type__in: activeFilters.property_type?.length ? activeFilters.property_type.join(',') : undefined,
      amenities__in: activeFilters.amenities?.length ? activeFilters.amenities.join(',') : undefined,
      bedrooms: activeFilters.bedrooms || undefined,
      bedrooms__gte: activeFilters.bedrooms__gte || undefined,
      bedrooms__lte: activeFilters.bedrooms__lte || undefined,
      toilets: activeFilters.toilets || undefined,
      is_furnished: activeFilters.is_furnished || undefined,
      electricity_type__in: activeFilters.electricity_type?.length ? activeFilters.electricity_type.join(',') : undefined,
    };

    debouncedFetchProperties(filters);

    // Cleanup function to cancel any pending debounced calls
    return () => {
      debouncedFetchProperties.cancel();
    };
  }, [activeFilters, sortBy, fetchProperties]);

  // Update URL with search params
  const updateUrlParams = useCallback((filters: ActiveFilters) => {
    const params = new URLSearchParams();
    
    if (filters.search) params.set('search', filters.search);
    if (filters.min_price > 0) params.set('min_price', filters.min_price.toString());
    if (filters.max_price < 500000) params.set('max_price', filters.max_price.toString());
    
    if (filters.property_type && Array.isArray(filters.property_type) && filters.property_type.length > 0) {
      params.set('property_type', filters.property_type.join(','));
    }
    
    if (filters.amenities && Array.isArray(filters.amenities) && filters.amenities.length > 0) {
      params.set('amenities', filters.amenities.join(','));
    }
    
    if (filters.bedrooms !== null) params.set('bedrooms', filters.bedrooms.toString());
    if (filters.bedrooms__gte !== null) params.set('bedrooms__gte', filters.bedrooms__gte.toString());
    if (filters.bedrooms__lte !== null) params.set('bedrooms__lte', filters.bedrooms__lte.toString());
    if (filters.toilets !== null) params.set('toilets', filters.toilets.toString());
    
    if (filters.is_furnished) params.set('is_furnished', 'true');
    
    if (filters.electricity_type && Array.isArray(filters.electricity_type) && filters.electricity_type.length > 0) {
      params.set('electricity_type', filters.electricity_type.join(','));
    }
    
    router.push(`/search?${params.toString()}`, { scroll: false });
  }, [router]);

  // Toggle property type filter
  const togglePropertyType = (type: string) => {
    setActiveFilters((prev: ActiveFilters) => {
      const currentTypes = Array.isArray(prev.property_type) ? prev.property_type : [];
      const property_type = currentTypes.includes(type)
        ? currentTypes.filter((t: string) => t !== type)
        : [...currentTypes, type];
      
      return {
        ...prev,
        property_type,
      } as ActiveFilters;
    });
  };

  // Toggle amenity filter
  const toggleAmenity = (amenityId: string) => {
    setActiveFilters((prev: ActiveFilters) => {
      const currentAmenities = Array.isArray(prev.amenities) ? prev.amenities : [];
      const amenityNumber = parseInt(amenityId, 10);
      
      if (isNaN(amenityNumber)) return prev;
      
      const amenities = currentAmenities.includes(amenityNumber)
        ? currentAmenities.filter((a: number) => a !== amenityNumber)
        : [...currentAmenities, amenityNumber];
      
      return {
        ...prev,
        amenities,
      } as ActiveFilters;
    });
  };

  // Set number of bedrooms
  const setBedrooms = (count: number | null) => {
    setActiveFilters((prev: ActiveFilters) => ({
      ...prev,
      bedrooms: count,
      // Reset range filters when setting a specific number of bedrooms
      bedrooms__gte: null,
      bedrooms__lte: null,
    } as ActiveFilters));
  };

  // Set number of toilets
  const setToilets = (count: number | null) => {
    setActiveFilters((prev: ActiveFilters) => ({
      ...prev,
      toilets: count,
    } as ActiveFilters));
  };

  // Clear all filters
  const clearAllFilters = () => {
    const defaultFilters: ActiveFilters = {
      search: '',
      min_price: 0,
      max_price: 500000,
      property_type: [],
      amenities: [],
      bedrooms: null,
      bedrooms__gte: null,
      bedrooms__lte: null,
      toilets: null,
      is_furnished: false,
      electricity_type: [],
    };
    
    setActiveFilters(defaultFilters);
    
    // Update URL
    router.push('/search', { scroll: false });
  };

  // Check if any filters are active
  const hasActiveFilters = 
    activeFilters.search ||
    activeFilters.min_price > 0 ||
    activeFilters.max_price < 500000 ||
    (activeFilters.property_type && activeFilters.property_type.length > 0) ||
    (activeFilters.amenities && activeFilters.amenities.length > 0) ||
    activeFilters.bedrooms !== null ||
    activeFilters.bedrooms__gte !== null ||
    activeFilters.bedrooms__lte !== null ||
    activeFilters.toilets !== null ||
    activeFilters.is_furnished ||
    (activeFilters.electricity_type && activeFilters.electricity_type.length > 0);

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
              
              {(activeFilters.min_price > 0 || activeFilters.max_price < 500000) && (
                <Badge className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full flex items-center">
                  {formatCurrency(activeFilters.min_price)} - {formatCurrency(activeFilters.max_price)}
                  <button 
                    onClick={() => handleFilterChange({ min_price: 0, max_price: 500000 })}
                    className="ml-2 text-blue-500 hover:text-blue-700"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              
              {activeFilters.property_type?.map((type: string) => (
                <Badge key={type} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full flex items-center">
                  {type}
                  <button 
                    onClick={() => handleFilterChange({ 
                      property_type: activeFilters.property_type?.filter((t: string) => t !== type) || [] 
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
              
              {activeFilters.toilets !== null && (
                <Badge className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full flex items-center">
                  {activeFilters.toilets} {activeFilters.toilets === 1 ? 'Toilet' : 'Toilets'}
                  <button 
                    onClick={() => handleFilterChange({ toilets: null })}
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
                  value={[activeFilters.min_price, activeFilters.max_price]}
                  onValueChange={(values) => {
                    // Update UI immediately for better UX
                    setActiveFilters(prev => ({
                      ...prev,
                      min_price: values[0],
                      max_price: values[1]
                    }));
                    
                    // Debounced filter update
                    debouncedFetchProperties({
                      price__gte: values[0] > 0 ? values[0] : undefined,
                      price__lte: values[1] < 500000 ? values[1] : undefined,
                    });
                  }}
                  onValueCommit={(values) => {
                    // Update URL when user stops sliding
                    handleFilterChange({
                      min_price: values[0],
                      max_price: values[1]
                    });
                  }}
                  minStepsBetweenThumbs={1}
                  className="mb-4"
                />
                <div className="flex justify-between text-sm">
                  <span>{formatCurrency(activeFilters.min_price)}</span>
                  <span>{formatCurrency(activeFilters.max_price)}</span>
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
                      checked={activeFilters.property_type?.includes(type.id)}
                      onCheckedChange={(checked) => {
                        handleFilterChange({
                          property_type: checked
                            ? [...(activeFilters.property_type || []), type.id]
                            : (activeFilters.property_type || []).filter((t: string) => t !== type.id)
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
                    variant={activeFilters.toilets === num ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => 
                      handleFilterChange({ 
                        toilets: activeFilters.toilets === num ? null : Number(num) 
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
                      checked={activeFilters.amenities?.includes(parseInt(amenity.id, 10))}
                      onCheckedChange={(checked) => {
                        handleFilterChange({
                          amenities: checked
                            ? [...(activeFilters.amenities || []), parseInt(amenity.id, 10)]
                            : (activeFilters.amenities || []).filter(a => a !== parseInt(amenity.id, 10))
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
