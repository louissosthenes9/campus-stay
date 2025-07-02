'use client';

import { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, X, Bed, Bath, Ruler, MapPin, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import useProperty from '@/hooks/use-property';
import { useRouter } from 'next/navigation';
import { Property } from '@/types/properties';

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

interface PropertySearchProps {
  className?: string;
  onSearchResults?: (results: Property[]) => void;
  initialSearch?: string;
}

export default function PropertySearch({ 
  className = '',
  onSearchResults,
  initialSearch = ''
}: PropertySearchProps) {
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [priceRange, setPriceRange] = useState([0, 500000]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [bedrooms, setBedrooms] = useState<number | null>(null);
  const [bathrooms, setBathrooms] = useState<number | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { fetchProperties } = useProperty();
  const router = useRouter();

  useEffect(() => {
    if (initialSearch) {
      setSearchQuery(initialSearch);
    }
  }, [initialSearch]);

  const handleSearch = async () => {
    setIsLoading(true);
    
    const filters: any = {
      search: searchQuery || undefined,
      min_price: priceRange[0] > 0 ? priceRange[0] : undefined,
      max_price: priceRange[1] < 500000 ? priceRange[1] : undefined,
    };

    if (selectedTypes.length > 0) {
      filters.property_type = selectedTypes;
    }

    if (selectedAmenities.length > 0) {
      filters.amenities = selectedAmenities.map(Number).filter(Boolean);
    }

    if (bedrooms !== null) {
      filters.bedrooms = bedrooms;
    }

    if (bathrooms !== null) {
      filters.toilets = bathrooms;
    }

    try {
      const results = await fetchProperties(filters);
      
      if (onSearchResults && results) {
        onSearchResults(results.results || []);
      }
      
      const searchParams = new URLSearchParams();
      
      if (searchQuery) searchParams.set('search', searchQuery);
      if (priceRange[0] > 0) searchParams.set('min_price', priceRange[0].toString());
      if (priceRange[1] < 500000) searchParams.set('max_price', priceRange[1].toString());
      if (selectedTypes.length > 0) searchParams.set('types', selectedTypes[0]);
      if (selectedAmenities.length > 0) searchParams.set('amenities', selectedAmenities.join(','));
      if (bedrooms !== null) searchParams.set('bedrooms', bedrooms.toString());
      if (bathrooms !== null) searchParams.set('bathrooms', bathrooms.toString());
      
      const queryString = searchParams.toString();
      const newUrl = queryString ? `/search?${queryString}` : '/search';
      
      router.push(newUrl, { scroll: false });
    } catch (error) {
      console.error('Error searching properties:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-TZ', {
      style: 'currency',
      currency: 'TZS',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setPriceRange([0, 500000]);
    setSelectedTypes([]);
    setSelectedAmenities([]);
    setBedrooms(null);
    setBathrooms(null);
  };

  const hasActiveFilters = 
    searchQuery || 
    priceRange[0] > 0 || 
    priceRange[1] < 500000 || 
    selectedTypes.length > 0 || 
    selectedAmenities.length > 0 || 
    bedrooms !== null || 
    bathrooms !== null;

  return (
    <div className={`w-full max-w-5xl mx-auto bg-white rounded-lg md:rounded-full shadow-lg p-4 md:p-6 ${className}`}>
      <div className="flex flex-col md:flex-row gap-3 md:gap-4 mb-3 md:mb-4">
        <div className="relative w-full md:flex-1">
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 md:h-5 md:w-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Search by location, property name, or university..."
            className="pl-9 md:pl-10 pr-4 py-4 md:py-6 text-sm md:text-base"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>
        
        <div className="flex gap-2 md:gap-3 w-full md:w-auto">
          <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                className="h-10 md:h-12 px-3 flex items-center gap-1 md:gap-2 flex-1 md:flex-auto"
              >
                <SlidersHorizontal className="h-4 w-4" />
                <span className="hidden sm:inline">Filters</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent 
              className="w-[calc(100vw-2rem)] max-w-md p-4" 
              align="end"
              side="bottom"
            >
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium mb-3">Price Range (TZS)</h3>
                  <div className="px-2 mb-2">
                    <Slider
                      min={0}
                      max={500000}
                      step={10000}
                      value={priceRange}
                      onValueChange={setPriceRange}
                      minStepsBetweenThumbs={1}
                      className="mb-4"
                    />
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>{formatCurrency(priceRange[0])}</span>
                      <span>{formatCurrency(priceRange[1])}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-3">Property Type</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {propertyTypes.map((type) => (
                      <div key={type.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={type.id}
                          checked={selectedTypes.includes(type.id)}
                          onCheckedChange={(checked) => {
                            setSelectedTypes(
                              checked
                                ? [...selectedTypes, type.id]
                                : selectedTypes.filter((t) => t !== type.id)
                            );
                          }}
                        />
                        <label htmlFor={type.id} className="text-sm font-medium">
                          {type.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-3">Bedrooms</h3>
                  <div className="flex flex-wrap gap-2">
                    {[1, 2, 3, 4, '5+'].map((num) => (
                      <Button
                        key={num}
                        variant={bedrooms === num ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setBedrooms(bedrooms === num ? null : num as any)}
                        className="rounded-full"
                      >
                        {num}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-3">Bathrooms</h3>
                  <div className="flex flex-wrap gap-2">
                    {[1, 2, 3, '4+'].map((num) => (
                      <Button
                        key={num}
                        variant={bathrooms === num ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setBathrooms(bathrooms === num ? null : num as any)}
                        className="rounded-full"
                      >
                        {num}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-3">Amenities</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {amenitiesList.map((amenity) => (
                      <div key={amenity.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`amenity-${amenity.id}`}
                          checked={selectedAmenities.includes(amenity.id)}
                          onCheckedChange={(checked) => {
                            setSelectedAmenities(
                              checked
                                ? [...selectedAmenities, amenity.id]
                                : selectedAmenities.filter((a) => a !== amenity.id)
                            );
                          }}
                        />
                        <label htmlFor={`amenity-${amenity.id}`} className="text-sm font-medium">
                          {amenity.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between pt-2">
                  <Button variant="ghost" onClick={clearFilters}>
                    Clear all
                  </Button>
                  <Button 
                    onClick={() => {
                      handleSearch();
                      setIsFilterOpen(false);
                    }}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Searching...' : 'Apply Filters'}
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
          
          <Button 
            className="h-10 md:h-12 px-3 md:px-6 bg-primary hover:bg-primary/90 text-white flex-1 md:flex-auto"
            onClick={handleSearch}
            disabled={isLoading}
          >
            <Search className="h-4 w-4 mr-1 md:mr-2" />
            <span className="hidden xs:inline">{isLoading ? 'Searching...' : 'Search'}</span>
            <span className="md:hidden">Search</span>
          </Button>
        </div>
      </div>
      
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 mt-2 text-xs md:text-sm">
          {searchQuery && (
            <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full flex items-center">
              {searchQuery}
              <button 
                onClick={() => setSearchQuery('')}
                className="ml-2 text-blue-500 hover:text-blue-700"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
          
          {(priceRange[0] > 0 || priceRange[1] < 500000) && (
            <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full flex items-center">
              {formatCurrency(priceRange[0])} - {formatCurrency(priceRange[1])}
              <button 
                onClick={() => setPriceRange([0, 500000])}
                className="ml-2 text-blue-500 hover:text-blue-700"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
          
          {selectedTypes.length > 0 && (
            <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full flex items-center">
              {selectedTypes.length} type{selectedTypes.length > 1 ? 's' : ''}
              <button 
                onClick={() => setSelectedTypes([])}
                className="ml-2 text-blue-500 hover:text-blue-700"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
          
          {bedrooms !== null && (
            <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full flex items-center">
              {bedrooms} bed{bedrooms !== 1 ? 's' : ''}
              <button 
                onClick={() => setBedrooms(null)}
                className="ml-2 text-blue-500 hover:text-blue-700"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
          
          {bathrooms !== null && (
            <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full flex items-center">
              {bathrooms} bath{bathrooms !== 1 ? 's' : ''}
              <button 
                onClick={() => setBathrooms(null)}
                className="ml-2 text-blue-500 hover:text-blue-700"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
          
          {selectedAmenities.length > 0 && (
            <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full flex items-center">
              {selectedAmenities.length} amenit{selectedAmenities.length > 1 ? 'ies' : 'y'}
              <button 
                onClick={() => setSelectedAmenities([])}
                className="ml-2 text-blue-500 hover:text-blue-700"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
          
          <button 
            onClick={clearFilters}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium ml-2 flex items-center"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}