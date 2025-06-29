'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MapPin, Bed, Bath, Ruler, Heart, Share2, Phone, Mail, Calendar, Users, Home as HomeIcon, Info, AlertCircle, Wifi, ParkingCircle, Waves, Dumbbell, Wind, Shield, Shirt, Sofa } from 'lucide-react';
import PropertyImageCarousel from '@/components/property/PropertyImageCarousel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PropertyImage } from '@/types/properties';
import useProperty from '@/hooks/use-property';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import PropertyMapView from '@/components/map/PropertyMapView';

interface PropertyMedia {
  url: string;
  type: 'image' | 'video';
  id?: string;
  [key: string]: any;
}

export default function PropertyViewPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const { fetchPropertyById, loading, error } = useProperty();

  const [property, setProperty] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('details');
  const [isFavorite, setIsFavorite] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const fetchProperty = async () => {
      if (id) {
        try {
          const data = await fetchPropertyById(id as string);
          if (data) {
            setProperty(data);
          }
        } catch (err) {
          console.error('Error fetching property:', err);
        }
      }
    };

    fetchProperty();
  }, [id]);

  const handleImageClick = (images: (string | PropertyImage)[], index: number) => {
    // Handle image click to show in a modal or lightbox
    setCurrentImageIndex(index);
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    // TODO: Add to favorites logic
  };

  const shareProperty = () => {
    if (navigator.share) {
      navigator.share({
        title: property?.properties?.title || 'Property',
        text: `Check out this property: ${property?.properties?.title}`,
        url: window.location.href,
      }).catch(console.error);
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Image Gallery Skeleton */}
          <div className="w-full md:w-2/3">
            <Skeleton className="w-full h-96 rounded-lg" />
          </div>

          {/* Details Skeleton */}
          <div className="w-full md:w-1/3 space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-24 w-full" />
            <div className="flex gap-4">
              <Skeleton className="h-10 w-1/2" />
              <Skeleton className="h-10 w-1/2" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="max-w-md mx-auto bg-red-50 p-6 rounded-lg">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Property Not Found</h2>
          <p className="text-gray-600 mb-6">
            {error || 'The property you are looking for does not exist or has been removed.'}
          </p>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Properties
          </Button>
        </div>
      </div>
    );
  }

  const {
    title = 'Untitled Property',
    description,
    property_type_display,
    bedrooms,
    toilets,
    size,
    is_furnished,
    price,
    address,
    amenities = [],
    media = [],
    videos = [],
    available = true,
    created_at,
    updated_at,
  } = property.properties || {};

  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'TZS',
    minimumFractionDigits: 0,
  }).format(price || 0);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Properties
      </Button>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main Content */}
        <div className="lg:w-2/3">
          {/* Image Gallery */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
            <PropertyImageCarousel
              images={media}
              videos={videos}
              title={title}
              propertyType={property_type_display}
              available={available}
              onImageClick={handleImageClick}
              showVideos={false}
            />
          </div>

          {/* Property Details */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                  <div className="flex items-center text-gray-600 mt-1">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span>{address || 'No address provided'}</span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={toggleFavorite}
                    aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                  >
                    <Heart
                      className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}`}
                    />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={shareProperty}
                    aria-label="Share property"
                  >
                    <Share2 className="w-5 h-5 text-gray-600" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between mt-4">
                <div className="text-2xl font-bold text-indigo-700">
                  {formattedPrice}
                  <span className="text-sm font-normal text-gray-500 ml-1">/month</span>
                </div>
                {!available && (
                  <div className="bg-yellow-100 text-yellow-800 text-sm font-medium px-3 py-1 rounded-full">
                    Currently Unavailable
                  </div>
                )}
              </div>
            </CardHeader>

            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="flex flex-col items-center p-3 bg-gray-50 rounded-lg">
                  <Bed className="w-6 h-6 text-indigo-600 mb-1" />
                  <span className="text-sm text-gray-500">Bedrooms</span>
                  <span className="font-semibold">{bedrooms || '-'}</span>
                </div>
                <div className="flex flex-col items-center p-3 bg-gray-50 rounded-lg">
                  <Bath className="w-6 h-6 text-indigo-600 mb-1" />
                  <span className="text-sm text-gray-500">Bathrooms</span>
                  <span className="font-semibold">{toilets || '-'}</span>
                </div>
                <div className="flex flex-col items-center p-3 bg-gray-50 rounded-lg">
                  <Ruler className="w-6 h-6 text-indigo-600 mb-1" />
                  <span className="text-sm text-gray-500">Area</span>
                  <span className="font-semibold">{size ? `${size} m²` : '-'}</span>
                </div>
                <div className="flex flex-col items-center p-3 bg-gray-50 rounded-lg">
                  <HomeIcon className="w-6 h-6 text-indigo-600 mb-1" />
                  <span className="text-sm text-gray-500">Type</span>
                  <span className="font-semibold">{property_type_display || 'N/A'}</span>
                </div>
              </div>

              <Tabs
                defaultValue="details"
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="amenities">Amenities</TabsTrigger>
                  <TabsTrigger value="location">Location</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="mt-6">
                  <h3 className="text-lg font-semibold mb-4">About this property</h3>
                  <div className="prose max-w-none">
                    {description ? (
                      <p className="text-gray-700 whitespace-pre-line">{description}</p>
                    ) : (
                      <p className="text-gray-500 italic">No description provided.</p>
                    )}
                  </div>

                  <div className="mt-6">
                    <h4 className="font-medium text-gray-900 mb-2">Property Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center">
                        <Calendar className="w-5 h-5 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-600">
                          <span className="font-medium">Available from:</span> {new Date(created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Info className="w-5 h-5 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-600">
                          <span className="font-medium">Status:</span> {available ? 'Available' : 'Unavailable'}
                        </span>
                      </div>
                      {is_furnished && (
                        <div className="flex items-center">
                          <HomeIcon className="w-5 h-5 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-600">
                            <span className="font-medium">Furnishing:</span> Furnished
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="amenities" className="mt-6">
                  {amenities && amenities.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {amenities.map((amenity: any, index: number) => {
                        // Function to get the appropriate icon component
                        const getAmenityIcon = (name: string) => {
                          switch (name.toLowerCase()) {
                            case 'wi-fi':
                              return <Wifi className="w-5 h-5 text-indigo-600" />;
                            case 'parking':
                              return <ParkingCircle className="w-5 h-5 text-indigo-600" />;
                            case 'swimming pool':
                              return <Waves className="w-5 h-5 text-indigo-600" />;
                            case 'gym':
                              return <Dumbbell className="w-5 h-5 text-indigo-600" />;
                            case 'ac':
                              return <Wind className="w-5 h-5 text-indigo-600" />;
                            case 'security':
                              return <Shield className="w-5 h-5 text-indigo-600" />;
                            case 'laundry':
                              return <Shirt className="w-5 h-5 text-indigo-600" />;
                            case 'furnished':
                              return <Sofa className="w-5 h-5 text-indigo-600" />;
                            case 'balcony':
                              return <HomeIcon className="w-5 h-5 text-indigo-600" />;
                            case 'pet friendly':
                              return <Heart className="w-5 h-5 text-indigo-600" />;
                            default:
                              return <div className="w-2 h-2 bg-green-500 rounded-full"></div>;
                          }
                        };

                        return (
                          <div key={amenity.id || index} className="flex items-start p-4 bg-white border border-gray-100 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex-shrink-0 w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center mr-4">
                              {getAmenityIcon(amenity.amenity_name || '')}
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">{amenity.amenity_name || 'Amenity'}</h4>
                              {amenity.amenity_description && (
                                <p className="text-sm text-gray-600 mt-1">{amenity.amenity_description}</p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <p className="text-gray-500 italic">No amenities listed for this property.</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="location" className="mt-6">
                  <PropertyMapView
                    property={property}
                    nearbyPlaces={property?.properties?.nearby_places || []}
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="lg:w-1/3 space-y-6">
          {/* Contact Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Contact Agent</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
                  <Users className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h4 className="font-medium">Property Manager</h4>
                  <p className="text-sm text-gray-500">Campus Stay Team</p>
                </div>
              </div>

              <div className="space-y-2">
                <Button className="w-full" size="lg">
                  <Phone className="w-4 h-4 mr-2" />
                  Call Now
                </Button>
                <Button variant="outline" className="w-full" size="lg">
                  <Mail className="w-4 h-4 mr-2" />
                  Send Message
                </Button>
                <Button variant="outline" className="w-full" size="lg">
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule Viewing
                </Button>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-500 text-center">
                  Response time: Usually within 24 hours
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Similar Properties */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Similar Properties</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2].map((item) => (
                  <div key={item} className="flex space-x-4 p-2 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer">
                    <div className="w-20 h-20 bg-gray-200 rounded-md flex-shrink-0"></div>
                    <div>
                      <h4 className="font-medium text-sm">Similar Property {item}</h4>
                      <p className="text-sm text-gray-500">TZS {(price * (1 - (item * 0.1))).toLocaleString()}/mo</p>
                      <div className="flex items-center text-xs text-gray-500 mt-1">
                        <Bed className="w-3 h-3 mr-1" />
                        <span className="mr-3">{bedrooms || 0} bds</span>
                        <Bath className="w-3 h-3 mr-1" />
                        <span>{toilets || 0} ba</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="link" className="w-full mt-4" size="sm">
                View all similar properties
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
