'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Property } from '@/types/properties';
import PropertyCard from '@/components/property/PropertyCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Search, MapPin, Filter, X } from 'lucide-react';
import PropertySearch from '@/components/property/PropertySearch';
import useProperty from '@/hooks/use-property'; 

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Use your custom property hook
  const {
    properties,
    loading,
    error,
    pagination,
    searchState,
    hasActiveFilters,
    canFetchNextPage,
    canFetchPreviousPage,
    currentPage,
    totalPages,
    sortOptions,
    fetchProperties,
    searchProperties,
    setSearchQuery,
    updateFilters,
    clearFilters,
    clearFilter,
    setSorting,
    fetchNextPage,
    fetchPreviousPage,
    fetchPropertiesPage,
    clearError
  } = useProperty();

  interface LocalFilters {
    search: string;
    minPrice: number;
    maxPrice: number;
    types: string[];
    amenities: string[];
    bedrooms: number | null;
    bathrooms: number | null;
  }

  const [localFilters, setLocalFilters] = useState<LocalFilters>(() => ({
    search: searchParams.get('search') || '',
    minPrice: searchParams.get('min_price') ? Number(searchParams.get('min_price')) : 0,
    maxPrice: searchParams.get('max_price') ? Number(searchParams.get('max_price')) : 500000,
    types: searchParams.get('types')?.split(',').filter(Boolean) || [],
    amenities: [],
    bedrooms: searchParams.get('bedrooms') ? Number(searchParams.get('bedrooms')) : null,
    bathrooms: searchParams.get('bathrooms') ? Number(searchParams.get('bathrooms')) : null,
  }));

  // Initialize filters from URL params on component mount and when URL changes
  useEffect(() => {
    console.log('URL changed, initializing filters from:', searchParams.toString());
    
    const initializeFilters = async () => {
      const search = searchParams.get('search') || '';
      const minPrice = searchParams.get('min_price') ? Number(searchParams.get('min_price')) : 0;
      const maxPrice = searchParams.get('max_price') ? Number(searchParams.get('max_price')) : 500000;
      const types = searchParams.get('types')?.split(',') || [];
      const bedrooms = searchParams.get('bedrooms') ? Number(searchParams.get('bedrooms')) : null;
      const bathrooms = searchParams.get('bathrooms') ? Number(searchParams.get('bathrooms')) : null;
      
      // Update local state
      setLocalFilters({
        search,
        minPrice,
        maxPrice,
        types,
        amenities: [],
        bedrooms,
        bathrooms
      });
      
      // Prepare filters for the API
      const filters: any = {};
      
      if (search) {
        setSearchQuery(search);
        filters.search = search;
      }
      
      if (minPrice > 0) filters.min_price = minPrice;
      if (maxPrice < 500000) filters.max_price = maxPrice;
      
      if (types.length > 0) {
        filters.property_type = types[0]; // API expects single value
      }
      
      if (bedrooms !== null) filters.bedrooms = bedrooms;
      if (bathrooms !== null) filters.toilets = bathrooms;

      console.log('Initializing with filters:', filters);
      
      // Fetch properties with the filters
      if (Object.keys(filters).length > 0) {
        await updateFilters(filters);
      } else {
        await fetchProperties();
      }
    };

    initializeFilters().catch(console.error);
  }, [searchParams]); // Re-run when searchParams change

  // Apply filters and update URL
  const applyFilters = useCallback(async () => {
    console.log('Applying filters:', localFilters);
    
    const filters: any = {};
    const urlParams = new URLSearchParams();
    
    if (localFilters.search) {
      filters.search = localFilters.search;
      urlParams.set('search', localFilters.search);
      setSearchQuery(localFilters.search);
    } else {
      setSearchQuery('');
    }
    
    if (localFilters.minPrice > 0) {
      filters.min_price = localFilters.minPrice;
      urlParams.set('min_price', localFilters.minPrice.toString());
    }
    
    if (localFilters.maxPrice < 500000) {
      filters.max_price = localFilters.maxPrice;
      urlParams.set('max_price', localFilters.maxPrice.toString());
    }
    
    if (localFilters.types.length > 0) {
      const type = localFilters.types[0];
      if (type) {
        filters.property_type = type;
        urlParams.set('types', type);
      }
    }
    
    if (localFilters.bedrooms !== null) {
      filters.bedrooms = localFilters.bedrooms;
      urlParams.set('bedrooms', localFilters.bedrooms.toString());
    }
    
    if (localFilters.bathrooms !== null) {
      filters.toilets = localFilters.bathrooms;
      urlParams.set('bathrooms', localFilters.bathrooms.toString());
    }

    // Update URL
    const queryString = urlParams.toString();
    const newUrl = queryString ? `${window.location.pathname}?${queryString}` : window.location.pathname;
    
    console.log('Updating URL to:', newUrl);
    window.history.pushState({}, '', newUrl);
    
    // Update hook filters and fetch
    console.log('Updating filters:', filters);
    await updateFilters(filters);
  }, [localFilters, updateFilters, setSearchQuery]);

  // Handle sort change
  const handleSortChange = (sortValue: string) => {
    setSorting(sortValue);
  };

  // Handle search from PropertySearch component
  const handleSearchResults = (results: Property[]) => {

  };

  // Clear all filters
  const handleClearFilters = () => {
    setLocalFilters({
      search: '',
      minPrice: 0,
      maxPrice: 500000,
      types: [],
      amenities: [],
      bedrooms: null,
      bathrooms: null,
    });
    clearFilters();
    router.push('/search');
  };

  // Remove individual filter
  const removeFilter = (filterType: string, value?: any) => {
    const newFilters = { ...localFilters };
    
    switch (filterType) {
      case 'search':
        newFilters.search = '';
        clearFilter('search');
        break;
      case 'price':
        newFilters.minPrice = 0;
        newFilters.maxPrice = 500000;
        clearFilter('min_price');
        clearFilter('max_price');
        break;
      case 'type':
        newFilters.types = newFilters.types?.filter(t => t !== value) || [];
        if (newFilters.types.length === 0) {
          clearFilter('property_type');
        }
        break;
      case 'bedrooms':
        newFilters.bedrooms = null;
        clearFilter('bedrooms');
        break;
      case 'bathrooms':
        newFilters.bathrooms = null;
        clearFilter('toilets');
        break;
    }
    
    setLocalFilters(newFilters);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Find Your Perfect Student Accommodation</h1>
        <PropertySearch 
          initialSearch={localFilters.search}
          onSearchResults={handleSearchResults}
        />
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="text-sm font-medium text-gray-700">Active filters:</span>
            
            {searchState.query && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary text-white">
                Search: "{searchState.query}"
                <button
                  onClick={() => removeFilter('search')}
                  className="ml-1 hover:text-gray-200"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            
            {(localFilters.minPrice > 0 || localFilters.maxPrice < 500000) && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary text-white">
                Price: {new Intl.NumberFormat('en-TZ', {
                  style: 'currency',
                  currency: 'TZS',
                  maximumFractionDigits: 0,
                }).format(localFilters.minPrice)} - {new Intl.NumberFormat('en-TZ', {
                  style: 'currency',
                  currency: 'TZS',
                  maximumFractionDigits: 0,
                }).format(localFilters.maxPrice)}
                <button
                  onClick={() => removeFilter('price')}
                  className="ml-1 hover:text-gray-200"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            
            {localFilters.types?.map(type => (
              <span key={type} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary text-white">
                {type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ')}
                <button
                  onClick={() => removeFilter('type', type)}
                  className="ml-1 hover:text-gray-200"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
            
            {localFilters.bedrooms && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary text-white">
                {localFilters.bedrooms} Bedrooms
                <button
                  onClick={() => removeFilter('bedrooms')}
                  className="ml-1 hover:text-gray-200"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            
            {localFilters.bathrooms && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary text-white">
                {localFilters.bathrooms} Bathrooms
                <button
                  onClick={() => removeFilter('bathrooms')}
                  className="ml-1 hover:text-gray-200"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearFilters}
            className="text-sm"
          >
            Clear all filters
          </Button>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex justify-between items-center">
            <p className="text-red-800">{error}</p>
            <Button variant="ghost" size="sm" onClick={clearError}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-8">
        {/* Filters Sidebar */}
        <div className="w-full md:w-80 flex-shrink-0">
          <div className="bg-white rounded-lg shadow p-6 sticky top-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold">Filters</h2>
              <Button variant="ghost" size="sm" className="md:hidden">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
            
            {/* Search Input */}
            <div className="mb-6">
              <h3 className="text-sm font-medium mb-3">Search</h3>
              <input
                type="text"
                placeholder="Search properties..."
                value={localFilters.search}
                onChange={(e) => setLocalFilters(prev => ({ ...prev, search: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              />
            </div>
            
            {/* Price Range Filter */}
            <div className="mb-6">
              <h3 className="text-sm font-medium mb-3">Price Range (TZS)</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Min Price</label>
                  <input
                    type="number"
                    value={localFilters.minPrice}
                    onChange={(e) => setLocalFilters(prev => ({ 
                      ...prev, 
                      minPrice: Number(e.target.value) || 0 
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Max Price</label>
                  <input
                    type="number"
                    value={localFilters.maxPrice}
                    onChange={(e) => setLocalFilters(prev => ({ 
                      ...prev, 
                      maxPrice: Number(e.target.value) || 500000 
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                  />
                </div>
              </div>
            </div>
            
            {/* Property Type Filter */}
            <div className="mb-6">
              <h3 className="text-sm font-medium mb-3">Property Type</h3>
              <div className="space-y-2">
                {[
                  { id: 'apartment', label: 'Apartment' },
                  { id: 'house', label: 'House' },
                  { id: 'hostel', label: 'Hostel' },
                  { id: 'studio', label: 'Studio' },
                  { id: 'shared_room', label: 'Shared Room' },
                ].map((type) => (
                  <div key={type.id} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`type-${type.id}`}
                      checked={localFilters.types?.includes(type.id)}
                      onChange={(e) => {
                        setLocalFilters(prev => ({
                          ...prev,
                          types: e.target.checked
                            ? [...(prev.types || []), type.id]
                            : (prev.types || []).filter(t => t !== type.id)
                        }));
                      }}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <label htmlFor={`type-${type.id}`} className="ml-2 text-sm text-gray-700">
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
                {[1, 2, 3, 4, 5].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => {
                      setLocalFilters(prev => ({
                        ...prev,
                        bedrooms: prev.bedrooms === num ? null : num
                      }));
                    }}
                    className={`px-3 py-1.5 text-sm rounded-full border ${
                      localFilters.bedrooms === num 
                        ? 'bg-primary text-white border-primary' 
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Bathrooms Filter */}
            <div className="mb-6">
              <h3 className="text-sm font-medium mb-3">Bathrooms</h3>
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 4].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => {
                      setLocalFilters(prev => ({
                        ...prev,
                        bathrooms: prev.bathrooms === num ? null : num
                      }));
                    }}
                    className={`px-3 py-1.5 text-sm rounded-full border ${
                      localFilters.bathrooms === num 
                        ? 'bg-primary text-white border-primary' 
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>
            
            <Button className="w-full" onClick={applyFilters}>
              Apply Filters
            </Button>
          </div>
        </div>
        
        {/* Search Results */}
        <div className="flex-1">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">
              {loading ? 'Searching...' : `${pagination?.count || properties.length} properties found`}
            </h2>
            <div className="flex items-center text-sm text-gray-500">
              <span className="mr-2">Sort by:</span>
              <select 
                className="bg-white border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                defaultValue=""
                onChange={(e) => handleSortChange(e.target.value)}
              >
                <option value="">Default</option>
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {loading ? (
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
          ) : properties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((property) => (
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
            </div>
          )}
          
          {/* Pagination */}
          {properties.length > 0 && pagination && (
            <div className="mt-8 flex justify-center">
              <nav className="flex items-center space-x-2">
                <button
                  onClick={fetchPreviousPage}
                  disabled={!canFetchPreviousPage || loading}
                  className={`px-3 py-1.5 rounded border ${
                    canFetchPreviousPage && !loading
                      ? 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      : 'border-gray-300 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Previous
                </button>
                
                {/* Page numbers */}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = Math.max(1, currentPage - 2) + i;
                  if (pageNum > totalPages) return null;
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => fetchPropertiesPage(pageNum)}
                      disabled={loading}
                      className={`px-3 py-1.5 rounded border ${
                        pageNum === currentPage
                          ? 'border-primary bg-primary text-white'
                          : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                <button
                  onClick={fetchNextPage}
                  disabled={!canFetchNextPage || loading}
                  className={`px-3 py-1.5 rounded border ${
                    canFetchNextPage && !loading
                      ? 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      : 'border-gray-300 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Next
                </button>
              </nav>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}