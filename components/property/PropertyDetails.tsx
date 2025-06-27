'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Star, Heart, MapPin, Clock, Ruler, Bed, Bath, Users, Home, Shield, Car, Utensils, Droplet, Tv, Fan, Snowflake, WashingMachine, Microwave, Refrigerator, Coffee, WifiOff, ParkingCircle, Dumbbell, Waves, Tv2, Phone, Wind, Sun, Moon, Droplets, Flame, Thermometer, BatteryCharging, Plug, Lightbulb, Battery, PlugZap, PlugZap2, BatteryFull, BatteryMedium, BatteryLow, BatteryWarning, BatteryChargingIcon, BatteryLowIcon, BatteryMediumIcon, BatteryFullIcon, WifiIcon, WifiOffIcon, WifiIcon as WifiIconSolid, WifiOffIcon as WifiOffIconSolid, Wifi } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Property } from '@/types/properties';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Thumbs, FreeMode } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/thumbs';
import 'swiper/css/free-mode';

interface PropertyDetailsProps {
  property: Property;
}

const amenityIcons: Record<string, React.ReactNode> = {
  wifi: <Wifi className="w-5 h-5" />,
  parking: <ParkingCircle className="w-5 h-5" />,
  air_conditioning: <Snowflake className="w-5 h-5" />,
  heating: <Flame className="w-5 h-5" />,
  tv: <Tv2 className="w-5 h-5" />,
  kitchen: <Utensils className="w-5 h-5" />,
  washing_machine: <WashingMachine className="w-5 h-5" />,
  elevator: <Users className="w-5 h-5" />, 
  gym: <Dumbbell className="w-5 h-5" />,
  pool: <Waves className="w-5 h-5" />,
  balcony: <Sun className="w-5 h-5" />,
  furnished: <Home className="w-5 h-5" />,
  security: <Shield className="w-5 h-5" />,
  water_heater: <Droplets className="w-5 h-5" />,
  backup_power: <BatteryChargingIcon className="w-5 h-5" />,
};

export default function PropertyDetails({ property }: PropertyDetailsProps) {
  const [thumbsSwiper, setThumbsSwiper] = useState<any>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeTab, setActiveTab] = useState('photos');
  
  // Get all media items and sort them by display_order
  const allMedia = [
    ...(property.images?.map((url, index) => ({
      type: 'image',
      url,
      id: `img-${index}`,
      isPrimary: property.primary_image === url,
    })) || []),
    ...(property.videos?.map((url, index) => ({
      type: 'video',
      url,
      id: `vid-${index}`,
      isPrimary: false,
    })) || []),
  ].sort((a, b) => (a.isPrimary ? -1 : b.isPrimary ? 1 : 0));

  // Group amenities by category for better organization
  const amenitiesByCategory = {
    connectivity: ['wifi'],
    parking: ['parking'],
    comfort: ['air_conditioning', 'heating', 'tv'],
    kitchen: ['kitchen', 'refrigerator', 'microwave'],
    laundry: ['washing_machine'],
    building: ['elevator', 'gym', 'pool', 'security'],
    utilities: ['water_heater', 'backup_power'],
  };

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorite(!isFavorite);
    // TODO: Implement actual favorite functionality with API call
  };

  return (
    <div className="space-y-8">
      {/* Property Header */}
      <div className="space-y-2">
        <div className="flex justify-between items-start">
          <h1 className="text-3xl font-bold">{property.properties.title}</h1>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleFavorite}
            className="rounded-full"
            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart 
              className={`h-6 w-6 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} 
            />
          </Button>
        </div>
        
        <div className="flex items-center text-sm text-muted-foreground">
          <MapPin className="h-4 w-4 mr-1" />
          <span>{property.properties.address}</span>
        </div>
        
        <div className="flex items-center">
          <div className="flex items-center bg-primary/10 text-primary px-3 py-1 rounded-full">
            <Star className="h-4 w-4 fill-current mr-1" />
            <span className="font-medium">{property.properties.overall_score}</span>
            <span className="mx-1">•</span>
            <span>{property.properties.review_count} reviews</span>
          </div>
        </div>
      </div>

      {/* Media Gallery */}
      <div className="relative">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <div className="flex justify-between items-center">
            <TabsList>
              <TabsTrigger value="photos">Photos</TabsTrigger>
              {property.videos?.length > 0 && (
                <TabsTrigger value="videos">Videos</TabsTrigger>
              )}
              <TabsTrigger value="map">Map View</TabsTrigger>
            </TabsList>
            
            <div className="text-sm text-muted-foreground">
              {allMedia.length} {allMedia.length === 1 ? 'media' : 'media items'}
            </div>
          </div>
          
          <TabsContent value="photos" className="relative">
            <Swiper
              spaceBetween={10}
              navigation={true}
              pagination={{
                clickable: true,
              }}
              thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
              modules={[FreeMode, Navigation, Thumbs, Pagination]}
              className="h-[500px] w-full rounded-lg"
            >
              {property.images?.map((image, index) => (
                <SwiperSlide key={`img-${index}`}>
                  <div className="relative h-full w-full">
                    <Image
                      src={image}
                      alt={`${property.properties.title} - Photo ${index + 1}`}
                      fill
                      className="object-cover rounded-lg"
                      priority={index < 3}
                      sizes="(max-width: 768px) 100vw, 80vw"
                    />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
            
            {/* Thumbnail Navigation */}
            <Swiper
              onSwiper={setThumbsSwiper}
              spaceBetween={10}
              slidesPerView={4}
              freeMode={true}
              watchSlidesProgress={true}
              modules={[FreeMode, Navigation, Thumbs]}
              className="mt-2 h-24"
            >
              {property.images?.map((image, index) => (
                <SwiperSlide key={`thumb-${index}`} className="cursor-pointer">
                  <div className="relative h-full w-full rounded-md overflow-hidden">
                    <Image
                      src={image}
                      alt={`Thumbnail ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="100px"
                    />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </TabsContent>
          
          {property.videos?.length > 0 && (
            <TabsContent value="videos" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {property.videos.map((video, index) => (
                  <div key={`video-${index}`} className="relative aspect-video rounded-lg overflow-hidden">
                    <video
                      src={video}
                      controls
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </TabsContent>
          )}
          
          <TabsContent value="map" className="h-96 bg-muted rounded-lg flex items-center justify-center">
            <div className="text-center p-8">
              <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Map View</h3>
              <p className="text-muted-foreground mb-4">
                {property.properties.address}
              </p>
              <Button variant="outline">View on Map</Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Property Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Property Highlights */}
          <div className="bg-card p-6 rounded-xl shadow-sm">
            <h2 className="text-xl font-semibold mb-4">About this property</h2>
            <p className="text-muted-foreground mb-6">{property.properties.description}</p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
              <div className="space-y-1">
                <div className="flex items-center text-muted-foreground">
                  <Bed className="h-5 w-5 mr-2" />
                  <span>Bedrooms</span>
                </div>
                <div className="font-medium">{property.properties.bedrooms}</div>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center text-muted-foreground">
                  <Bath className="h-5 w-5 mr-2" />
                  <span>Bathrooms</span>
                </div>
                <div className="font-medium">{property.properties.toilets}</div>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center text-muted-foreground">
                  <Ruler className="h-5 w-5 mr-2" />
                  <span>Size</span>
                </div>
                <div className="font-medium">{property.properties.size} m²</div>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center text-muted-foreground">
                  <Home className="h-5 w-5 mr-2" />
                  <span>Type</span>
                </div>
                <div className="font-medium capitalize">
                  {property.properties.property_type_display || property.properties.property_type}
                </div>
              </div>
            </div>
          </div>
          
          {/* Amenities */}
          <div className="bg-card p-6 rounded-xl shadow-sm">
            <h2 className="text-xl font-semibold mb-6">What this place offers</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(amenitiesByCategory).map(([category, amenityKeys]) => {
                const amenities = amenityKeys
                  .filter(key => property.properties.amenities?.includes(key))
                  .map(key => ({
                    name: key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
                    icon: amenityIcons[key] || <div className="w-5 h-5" />
                  }));
                
                if (amenities.length === 0) return null;
                
                return (
                  <div key={category} className="space-y-2">
                    <h3 className="font-medium text-muted-foreground capitalize">
                      {category.replace('_', ' ')}
                    </h3>
                    <ul className="space-y-2">
                      {amenities.map((amenity, i) => (
                        <li key={i} className="flex items-center">
                          <span className="mr-2 text-primary">{amenity.icon}</span>
                          <span>{amenity.name}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        
        {/* Sidebar */}
        <div className="space-y-6">
          {/* Price Card */}
          <div className="bg-card p-6 rounded-xl shadow-sm border">
            <div className="space-y-4">
              <div className="flex justify-between items-baseline">
                <span className="text-2xl font-bold">
                  TZS {property.properties.price.toLocaleString()}
                </span>
                <span className="text-muted-foreground">per month</span>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Available from</span>
                  <span>{new Date(property.properties.available_from).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Lease duration</span>
                  <span>{property.properties.lease_duration} months</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Furnished</span>
                  <span>{property.properties.is_furnished ? 'Yes' : 'No'}</span>
                </div>
              </div>
              
              <Button className="w-full py-6 text-base font-medium">
                Contact Agent
              </Button>
              
              <div className="text-center text-sm text-muted-foreground">
                No hidden fees. No credit card required.
              </div>
            </div>
          </div>
          
          {/* Safety Tips */}
          <div className="bg-yellow-50 border border-yellow-100 p-4 rounded-lg text-sm">
            <h3 className="font-medium mb-2 flex items-center">
              <Shield className="h-4 w-4 mr-2 text-yellow-600" />
              Safety Tips
            </h3>
            <ul className="space-y-2 text-yellow-700">
              <li>• Always meet in a public place</li>
              <li>• Never pay a deposit before viewing</li>
              <li>• Report suspicious listings</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
