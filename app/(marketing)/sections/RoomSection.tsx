'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Clock, Shield, ArrowRight, Star, MapPin, Bed, Bath, Wifi, Car, Heart } from 'lucide-react';
import { fadeIn, scaleIn, staggerContainer } from '@/utils/motion';
import useProperty from '@/hooks/use-property';
import { Property } from '@/types/properties';

// Property card component
const PropertyCard = ({ property, index }: { property: Property; index: number }) => {
  const [isLiked, setIsLiked] = useState(false);
  
  const cardVariants = {
    initial: { opacity: 0, y: 50 },
    whileInView: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.6,
        delay: index * 0.1,
        ease: "easeOut"
      }
    }
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="initial"
      whileInView="whileInView"
      viewport={{ once: true }}
      className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden transform hover:-translate-y-2"
    >
      <div className="relative overflow-hidden">
        <Image
          src={property.primary_image || '/student-room-placeholder.jpg'}
          alt={property.properties.title}
          width={400}
          height={250}
          className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg">
          <Heart 
            className={`w-4 h-4 cursor-pointer transition-colors ${isLiked ? 'text-red-500 fill-red-500' : 'text-gray-400'}`}
            onClick={() => setIsLiked(!isLiked)}
          />
        </div>
        <div className="absolute bottom-3 left-3 bg-primary text-white px-3 py-1 rounded-full text-sm font-medium">
          ${property.properties.price}/month
        </div>
      </div>
      
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <h3 className="font-bold text-lg text-gray-800 line-clamp-1">
            {property.properties.title}
          </h3>
          <div className="flex items-center gap-1 bg-yellow-100 px-2 py-1 rounded-full">
            <Star className="w-3 h-3 text-yellow-600 fill-yellow-600" />
            <span className="text-xs font-medium text-yellow-700">4.8</span>
          </div>
        </div>
        
        <div className="flex items-center text-gray-600 mb-3">
          <MapPin className="w-4 h-4 mr-1" />
          <span className="text-sm line-clamp-1">{property.properties.address}</span>
        </div>
        
        <div className="flex items-center gap-4 text-gray-600 mb-4">
          <div className="flex items-center gap-1">
            <Bed className="w-4 h-4" />
            <span className="text-sm">{property.properties.bedrooms}</span>
          </div>
          <div className="flex items-center gap-1">
            <Bath className="w-4 h-4" />
            <span className="text-sm">{property.properties.toilets}</span>
          </div>
          <div className="flex items-center gap-1">
            <Wifi className="w-4 h-4" />
            <span className="text-sm">WiFi</span>
          </div>
        </div>
        
        <button className="w-full bg-gradient-to-r from-primary to-blue-600 text-white py-2.5 rounded-xl font-medium hover:from-blue-600 hover:to-primary transition-all duration-300 transform hover:scale-105">
          View Details
        </button>
      </div>
    </motion.div>
  );
};

export default function RoomSection() {
  const { 
    marketingCategories, 
    marketingLoading, 
    marketingError, 
    fetchMarketingCategories 
  } = useProperty();
  
  const [activeTab, setActiveTab] = useState<'affordable' | 'top-rated'>('affordable');

  useEffect(() => {
    fetchMarketingCategories();
  }, []);

  const affordableProperties = marketingCategories?.cheap || [];
  const topRatedProperties = marketingCategories?.top_rated || [];
  
  const displayProperties = activeTab === 'affordable' ? affordableProperties : topRatedProperties;

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 via-white to-blue-50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-20 right-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-yellow-400/5 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header Section */}
        <motion.div
          className="flex flex-col lg:flex-row items-center mb-16 gap-12"
          variants={fadeIn}
          initial="initial"
          whileInView="whileInView"
          viewport={{ once: true }}
        >
          <div className="w-full lg:w-1/2 text-center lg:text-left">
            <motion.h2 
              className="text-4xl lg:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-800 to-primary bg-clip-text text-transparent leading-tight"
              variants={fadeIn}
            >
              We Will Help You Find<br />
              Your <span className="text-primary">Perfect Room!</span>
            </motion.h2>
            <motion.p 
              className="text-lg text-gray-600 mb-8 max-w-lg"
              variants={fadeIn}
            >
              Discover amazing student accommodations that fit your budget and lifestyle. From affordable options to premium stays.
            </motion.p>
          </div>
          
          <motion.div
            className="w-full lg:w-1/2 relative"
            variants={scaleIn}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true }}
          >
            <div className="relative">
              <Image
                src="/student-room3.jpg"
                width={500}
                height={400}
                alt="Student in room"
                className="rounded-3xl shadow-2xl transform hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl p-4 shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Shield className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Verified Properties</p>
                    <p className="text-xs text-gray-600">100% Safe & Secure</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Features Section */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16"
          variants={staggerContainer}
          initial="initial"
          whileInView="whileInView"
          viewport={{ once: true }}
        >
          {[
            {
              icon: <Clock className="text-yellow-600" />,
              title: 'Price Match Promise',
              description: 'Find a lower price elsewhere, and we\'ll match it plus pay the difference.',
              bg: 'bg-gradient-to-br from-yellow-50 to-orange-50',
              iconBg: 'bg-gradient-to-br from-yellow-400 to-orange-400',
            },
            {
              icon: <Shield className="text-white" />,
              title: 'Perfect Home Guarantee',
              description: 'Enjoy peace of mind with a home that feels just right.',
              bg: 'bg-gradient-to-br from-primary/5 to-blue-50',
              iconBg: 'bg-gradient-to-br from-primary to-blue-600',
            },
            {
              icon: <ArrowRight className="text-white" />,
              title: 'Instant Book Available',
              description: 'Book reliable accommodations tailored to your needs instantly.',
              bg: 'bg-gradient-to-br from-emerald-50 to-teal-50',
              iconBg: 'bg-gradient-to-br from-emerald-500 to-teal-600',
            },
          ].map((feature, index) => (
            <motion.div
              key={index}
              variants={scaleIn}
              className={`${feature.bg} p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-white/50 backdrop-blur-sm`}
            >
              <div
                className={`${feature.iconBg} w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-lg`}
              >
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-800">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Properties Section */}
        <motion.div
          variants={fadeIn}
          initial="initial"
          whileInView="whileInView"
          viewport={{ once: true }}
          className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100"
        >
          {/* Tab Navigation */}
          <div className="flex flex-col sm:flex-row items-center justify-between mb-10">
            <h3 className="text-3xl font-bold text-gray-800 mb-4 sm:mb-0">
              Featured <span className="text-primary">Properties</span>
            </h3>
            
            <div className="flex bg-gray-100 rounded-2xl p-1">
              <button
                onClick={() => setActiveTab('affordable')}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                  activeTab === 'affordable'
                    ? 'bg-white text-primary shadow-md transform scale-105'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Affordable Rooms
              </button>
              <button
                onClick={() => setActiveTab('top-rated')}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                  activeTab === 'top-rated'
                    ? 'bg-white text-primary shadow-md transform scale-105'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Top Rated
              </button>
            </div>
          </div>

          {/* Loading State */}
          {marketingLoading && (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          )}

          {/* Error State */}
          {marketingError && (
            <div className="text-center py-20">
              <div className="text-red-500 mb-4">⚠️ {marketingError}</div>
              <button 
                onClick={() => fetchMarketingCategories()}
                className="px-6 py-3 bg-primary text-white rounded-xl hover:bg-blue-600 transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Properties Grid */}
          {!marketingLoading && !marketingError && (
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              key={activeTab} // This ensures re-animation when tab changes
            >
              {displayProperties.slice(0, 6).map((property, index) => (
                <PropertyCard key={property.id} property={property} index={index} />
              ))}
            </motion.div>
          )}

          {/* No Properties Message */}
          {!marketingLoading && !marketingError && displayProperties.length === 0 && (
            <div className="text-center py-20">
              <div className="text-gray-500 mb-4">No properties available in this category</div>
            </div>
          )}

          {/* View All Button */}
          {!marketingLoading && !marketingError && displayProperties.length > 0 && (
            <motion.div 
              className="text-center mt-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <button className="bg-gradient-to-r from-primary to-blue-600 text-white px-8 py-4 rounded-2xl font-medium hover:from-blue-600 hover:to-primary transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
                View All {activeTab === 'affordable' ? 'Affordable' : 'Top Rated'} Properties
                <ArrowRight className="inline-block ml-2 w-5 h-5" />
              </button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  );
}