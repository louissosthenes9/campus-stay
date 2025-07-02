'use client';
import { useEffect, useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { fadeIn, staggerContainer } from '@/utils/motion';
import useProperty from '@/hooks/use-property'; 
import { Favourite, Property } from '@/types/properties';
import PropertyCard from '@/components/property/PropertyCard';

type FeaturedListingsProps = {
  properties?: Property[];
  favourites?: Favourite[];
}

export default function FeaturedListings(
  { favourites }: FeaturedListingsProps
) {
  const { 
    marketingCategories, 
    marketingLoading, 
    marketingError, 
    fetchMarketingCategories 
  } = useProperty();
  
  // Fetch marketing categories on component mount
  useEffect(() => {
    fetchMarketingCategories();
  }, []);

  // Get all properties from marketing categories
  const allProperties = marketingCategories?.popular || [];

  // Create a Set of favorite property IDs for efficient lookup
  const favouritePropertyIds = useMemo(() => {
    if (!favourites || !Array.isArray(favourites)) return new Set<number>();
    
    return new Set(
      favourites.map(fav => {
       return fav.property
      })
    );
  }, [favourites]);

  // Use all properties since we're not filtering by region
  const filteredProperties = allProperties;

  console.log('Favourite Property IDs:', favouritePropertyIds);
  console.log('favourites',favourites)

  // Helper function to check if a property is favorited
  const isPropertyFavorited = (propertyId: number | string): boolean => {
    const id = typeof propertyId === 'string' ? parseInt(propertyId) : propertyId;
    return favouritePropertyIds.has(id);
  };

  if (marketingLoading) {
    return (
      <section id="listings" className="py-16 bg-muted">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </section>
    );
  }

  if (marketingError) {
    return (
      <section id="listings" className="py-16 bg-muted">
        <div className="container mx-auto px-4">
          <div className="text-center text-red-500">
            <p>Error loading properties: {marketingError}</p>
            <Button 
              onClick={fetchMarketingCategories} 
              className="mt-4"
              variant="outline"
            >
              Try Again
            </Button>
          </div>
        </div>
      </section>
    );
  }

  // No need to show no properties message as we're showing all properties
  const showNoProperties = false;

  return (
    <section id="listings" className="py-16 bg-muted">
      <div className="container mx-auto px-4">
        {showNoProperties && (
          <div className="text-center py-8">
            <h3 className="text-xl font-semibold mb-2">No properties found</h3>
          </div>
        )}
        <motion.div
          className="flex justify-between items-center mb-8"
          variants={fadeIn}
          initial="initial"
          whileInView="whileInView"
        >
          <h2 className="text-3xl font-bold">Student Accommodations Students Love</h2>
          <Button variant="outline" size="sm" className="rounded-full hover:bg-primary hover:text-primary-foreground">
            View all <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </motion.div>
        
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={staggerContainer}
          initial="initial"
          whileInView="whileInView"
        >
          {filteredProperties.length > 0 ? (
            filteredProperties.slice(0, 6).map((property) => {
              const propertyId = typeof property.id === 'string' ? parseInt(property.id) : property.id;
              const isFavorited = isPropertyFavorited(propertyId);
              
              return (
                <motion.div
                  key={property.id}
                  variants={fadeIn}
                  className="h-full"
                >
                  <PropertyCard 
                    property={property} 
                    className="h-full"
                    isFavorited={isFavorited}
                  />
                </motion.div>
              );
            })
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground text-lg">
                No top-rated properties available at the moment.
              </p>
              <Button 
                onClick={fetchMarketingCategories} 
                className="mt-4"
                variant="outline"
              >
                Refresh
              </Button>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}