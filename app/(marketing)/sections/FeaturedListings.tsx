'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ArrowRight, Star } from 'lucide-react';
import { fadeIn, scaleIn, staggerContainer } from '@/utils/motion';
import useProperty from '@/hooks/use-property'; // Adjust the import path as needed
import { Property } from '@/types/properties'; // Adjust the import path as needed

export default function FeaturedListings() {
  const { 
    marketingCategories, 
    marketingLoading, 
    marketingError, 
    fetchMarketingCategories 
  } = useProperty();
  
  const [selectedRegion, setSelectedRegion] = useState('All Regions');
  const regions = ['All Regions', 'Dar es Salaam', 'Morogoro', 'Dodoma', 'Arusha', 'Mwanza'];

  // Fetch marketing categories on component mount
  useEffect(() => {
    fetchMarketingCategories();
  }, []);

  // Get top-rated properties from marketing categories
  const topRatedProperties = marketingCategories?.popular || [];

  // Helper function to format price
  const formatPrice = (price: number): string => {
    return price.toLocaleString();
  };

  // Helper function to get property image
  const getPropertyImage = (property: Property): string => {
    return property.primary_image || '/placeholder-image.jpg'; // Fallback image
  };

 
  const getPropertyRating = (property: Property): number => {
    return property.properties.rating || 4.5;
  };

  // Helper function to get review count (you may need to adjust based on your property structure)
  const getReviewCount = (property: Property): number => {
    return property.properties.review_count || 0;
  };

  // Helper function to get photo count (you may need to adjust based on your property structure)
  const getPhotoCount = (property: Property): number => {
   
    return property.images?.length || 1;
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
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
          variants={staggerContainer}
          initial="initial"
          whileInView="whileInView"
        >
          {topRatedProperties.length > 0 ? (
            topRatedProperties.slice(0, 6).map((property, index) => (
              <motion.div
                key={property.id}
                variants={scaleIn}
                className="bg-card rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <div className="relative">
                  <Image
                    src={getPropertyImage(property)}
                    width={400}
                    height={250}
                    alt={property.properties.title}
                    className="w-full h-48 object-cover transform hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3 bg-primary text-primary-foreground px-2 py-1 rounded text-xs">
                    {getPhotoCount(property)} photos
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-semibold text-lg mb-2">{property.properties.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{property.properties.address}</p>
                  <div className="flex items-center mb-4">
                    <Star className="h-4 w-4 text-yellow-400" fill="currentColor" />
                    <span className="text-sm ml-1">{getPropertyRating(property)}</span>
                    <span className="text-xs text-muted-foreground ml-1">
                      ({getReviewCount(property)} reviews)
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-muted-foreground text-xs">From</span>
                      <p className="font-bold">
                        TZS {formatPrice(property.properties.price)} 
                        <span className="text-muted-foreground font-normal text-xs"> / month</span>
                      </p>
                    </div>
                    <Button size="sm" className="btn-primary">
                      View Details
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground text-lg">No top-rated properties available at the moment.</p>
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