'use client';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { fadeIn, staggerContainer } from '@/utils/motion';
import useProperty from '@/hooks/use-property'; 
import { Property } from '@/types/properties';
import PropertyCard from '@/components/property/PropertyCard';

type FeaturedListingsProps = {
  properties?: Property[];
}
export default function FeaturedListings(
  { properties }: FeaturedListingsProps
) {
  const { 
    marketingCategories, 
    marketingLoading, 
    marketingError, 
    fetchMarketingCategories 
  } = useProperty();43
  
  const [selectedRegion, setSelectedRegion] = useState('All Regions');
  const regions = ['All Regions', 'Dar es Salaam', 'Morogoro', 'Dodoma', 'Arusha', 'Mwanza'];

  // Fetch marketing categories on component mount
  useEffect(() => {
    fetchMarketingCategories();
  }, []);
  console.log(marketingCategories)

  // Get top-rated properties from marketing categories
  const topRatedProperties = marketingCategories?.popular || [];

  // Filter properties by selected region if not 'All Regions'
  const filteredProperties = selectedRegion === 'All Regions' 
    ? topRatedProperties 
    : topRatedProperties.filter(property => 
        property.properties?.address?.toLowerCase().includes(selectedRegion.toLowerCase()) ||
        property.properties?.city?.toLowerCase() === selectedRegion.toLowerCase()
      );

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

  return (
    <section id="listings" className="py-16 bg-muted">
      <div className="container mx-auto px-4">
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
          className="flex flex-wrap gap-2 mb-8"
          variants={staggerContainer}
          initial="initial"
          whileInView="whileInView"
        >
          {regions.map((region, index) => (
            <motion.span
              key={index}
              variants={fadeIn}
              onClick={() => setSelectedRegion(region)}
              className={`px-4 py-1 rounded-full text-sm cursor-pointer transition-colors duration-300 ${
                region === selectedRegion
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card border border-border hover:bg-primary/10'
              }`}
            >
              {region}
            </motion.span>
          ))}
        </motion.div>
        
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={staggerContainer}
          initial="initial"
          whileInView="whileInView"
        >
          {filteredProperties.length > 0 ? (
            filteredProperties.slice(0, 6).map((property) => (
              <motion.div
                key={property.id}
                variants={fadeIn}
                className="h-full"
              >
                <PropertyCard 
                  property={property} 
                  className="h-full"
                />
              </motion.div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground text-lg">
                {selectedRegion === 'All Regions' 
                  ? 'No top-rated properties available at the moment.'
                  : `No properties found in ${selectedRegion}. Try another region.`}
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