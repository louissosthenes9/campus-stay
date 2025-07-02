'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MapPin, Bed, Bath, Ruler, Heart, Share2, Phone, Mail, Calendar, Users, Home as HomeIcon, Info, AlertCircle, Wifi, ParkingCircle, Waves, Dumbbell, Wind, Shield, Shirt, Sofa, MessageSquare, CalendarDays, Send, X } from 'lucide-react';
import PropertyImageCarousel from '@/components/property/PropertyImageCarousel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { PropertyImage } from '@/types/properties';
import useProperty from '@/hooks/use-property';
import useFavourite from '@/hooks/use-favourite';
import useEnquiry from '@/hooks/use-enquiry';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import PropertyMapView from '@/components/map/PropertyMapView';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface PropertyMedia {
  url: string;
  type: 'image' | 'video';
  id?: string;
  [key: string]: any;
}

type SidebarProps = {
  property: any;
  onEnquireClick: () => void;
}

function Sidebar({ property, onEnquireClick }: SidebarProps) {
  const { price, bedrooms, toilets } = property?.properties || {};

  return (
    <div className="lg:w-1/3 space-y-6">
      {/* Quick Actions Card */}
      <Card className="sticky top-6">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold">Interested in this property?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button 
            onClick={onEnquireClick}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 text-base"
            size="lg"
          >
            <MessageSquare className="w-5 h-5 mr-2" />
            Enquire Now
          </Button>
          <div className="grid grid-cols-2 gap-2">
            <Button 
              variant="outline" 
              className="w-full" 
              size="sm"
              onClick={() => window.open('tel:+255697080072')}
            >
              <Phone className="w-4 h-4 mr-1" />
              Call
            </Button>
            <Button 
              variant="outline" 
              className="w-full" 
              size="sm"
              onClick={() => window.open('mailto:campus-stay@business.com')}
            >
              <Mail className="w-4 h-4 mr-1" />
              Email
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Contact Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
              <Users className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h4 className="font-medium">Campus Stay Team</h4>
              <p className="text-sm text-gray-500">Property Management</p>
            </div>
          </div>
          
          <div className="space-y-3 pt-4 border-t border-gray-200">
            <div className="flex items-center space-x-3">
              <Phone className="w-4 h-4 text-gray-400" />
              <span className="text-sm">+255 697 080 072</span>
            </div>
            <div className="flex items-center space-x-3">
              <Mail className="w-4 h-4 text-gray-400" />
              <span className="text-sm">campus-stay@business.com</span>
            </div>
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
              <div key={item} className="flex space-x-4 p-3 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer border border-gray-100">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-md flex-shrink-0 flex items-center justify-center">
                  <HomeIcon className="w-6 h-6 text-indigo-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm truncate">Student Apartment {item}</h4>
                  <p className="text-sm text-indigo-600 font-medium">
                    TZS {((price ?? 0) * (1 - (item * 0.1))).toLocaleString()}/mo
                  </p>
                  <div className="flex items-center text-xs text-gray-500 mt-1">
                    <Bed className="w-3 h-3 mr-1" />
                    <span className="mr-3">{bedrooms || 0} beds</span>
                    <Bath className="w-3 h-3 mr-1" />
                    <span>{toilets || 0} baths</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Button variant="link" className="w-full mt-4 text-indigo-600" size="sm">
            View all similar properties →
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default function PropertyViewPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const { fetchPropertyById, loading, error } = useProperty();
  const { createEnquiry, loading: enquiryLoading } = useEnquiry();

  const [property, setProperty] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('details');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isEnquiryModalOpen, setIsEnquiryModalOpen] = useState(false);
  const [enquiryMessage, setEnquiryMessage] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  
  const { isFavorite, toggleFavorite, isLoading: favoriteLoading } = useFavourite();

  // Get the current favorite status for the property
  const isPropertyFavorite = useMemo(() => {
    if (!property?.properties?.id) return false;
    return isFavorite(property.properties.id);
  }, [property?.properties?.id, isFavorite]);

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
    setCurrentImageIndex(index);
  };

  const handleToggleFavorite = useCallback(async () => {
    if (!property?.properties?.id) {
      console.error('Property ID not found');
      return;
    }
    
    const propertyId = property.properties.id;
    
    try {
      await toggleFavorite(propertyId);
      toast.success(
        isPropertyFavorite ? 'Removed from favorites' : 'Added to favorites'
      );
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Failed to update favorites');
    }
  }, [property?.properties?.id, toggleFavorite, isPropertyFavorite]);

  const shareProperty = () => {
    if (navigator.share) {
      navigator.share({
        title: property?.properties?.title || 'Property',
        text: `Check out this property: ${property?.properties?.title}`,
        url: window.location.href,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  const handleEnquirySubmit = async () => {
    if (!property?.properties?.id) {
      toast.error('Property information not available');
      return;
    }

    if (!enquiryMessage.trim()) {
      toast.error('Please enter your message');
      return;
    }

    try {
      let fullMessage = enquiryMessage.trim();
      
      // Add viewing date to message if selected
      if (selectedDate) {
        const formattedDate = format(selectedDate, 'EEEE, MMMM do, yyyy');
        fullMessage += `\n\nPreferred viewing date: ${formattedDate}`;
      }

      const enquiryData = {
        property_id: property.properties.id,
        message: fullMessage,
      };

      const result = await createEnquiry(enquiryData);
      
      if (result) {
        toast.success('Enquiry sent successfully! We\'ll get back to you soon.');
        setIsEnquiryModalOpen(false);
        setEnquiryMessage('');
        setSelectedDate(undefined);
      } else {
        toast.error('Failed to send enquiry. Please try again.');
      }
    } catch (error) {
      console.error('Error sending enquiry:', error);
      toast.error('Failed to send enquiry. Please try again.');
    }
  };

  // Disable past dates
  const disablePastDates = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-2/3">
            <Skeleton className="w-full h-96 rounded-lg mb-6" />
            <Skeleton className="w-full h-64 rounded-lg" />
          </div>
          <div className="lg:w-1/3 space-y-4">
            <Skeleton className="h-32 w-full rounded-lg" />
            <Skeleton className="h-48 w-full rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto bg-red-50 p-6 rounded-lg text-center">
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
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 lg:py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6 hover:bg-white"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Properties
        </Button>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Main Content */}
          <div className="lg:w-2/3">
            {/* Image Gallery */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
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
            <Card className="shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                  <div className="flex-1">
                    <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">{title}</h1>
                    <div className="flex items-center text-gray-600">
                      <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                      <span className="text-sm lg:text-base">{address || 'No address provided'}</span>
                    </div>
                  </div>
                  <div className="flex space-x-2 flex-shrink-0">
                    <Button 
                      variant={isPropertyFavorite ? 'default' : 'outline'} 
                      size="icon" 
                      className="rounded-full transition-all duration-200"
                      onClick={handleToggleFavorite}
                      disabled={favoriteLoading}
                      aria-label={isPropertyFavorite ? 'Remove from favorites' : 'Add to favorites'}
                    >
                      <Heart 
                        className={`h-5 w-5 transition-all duration-200 ${
                          isPropertyFavorite 
                            ? 'fill-white text-white scale-110' 
                            : 'text-gray-500 hover:text-red-500'
                        }`}
                      />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-full"
                      onClick={shareProperty}
                      aria-label="Share property"
                    >
                      <Share2 className="w-5 h-5 text-gray-600" />
                    </Button>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-6">
                  <div className="text-2xl lg:text-3xl font-bold text-indigo-700">
                    {formattedPrice}
                    <span className="text-sm lg:text-base font-normal text-gray-500 ml-1">/month</span>
                  </div>
                  {!available && (
                    <div className="bg-yellow-100 text-yellow-800 text-sm font-medium px-3 py-1 rounded-full w-fit">
                      Currently Unavailable
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-8">
                  <div className="flex flex-col items-center p-3 lg:p-4 bg-gray-50 rounded-lg">
                    <Bed className="w-5 h-5 lg:w-6 lg:h-6 text-indigo-600 mb-1" />
                    <span className="text-xs lg:text-sm text-gray-500">Bedrooms</span>
                    <span className="font-semibold text-sm lg:text-base">{bedrooms || '-'}</span>
                  </div>
                  <div className="flex flex-col items-center p-3 lg:p-4 bg-gray-50 rounded-lg">
                    <Bath className="w-5 h-5 lg:w-6 lg:h-6 text-indigo-600 mb-1" />
                    <span className="text-xs lg:text-sm text-gray-500">Bathrooms</span>
                    <span className="font-semibold text-sm lg:text-base">{toilets || '-'}</span>
                  </div>
                  <div className="flex flex-col items-center p-3 lg:p-4 bg-gray-50 rounded-lg">
                    <Ruler className="w-5 h-5 lg:w-6 lg:h-6 text-indigo-600 mb-1" />
                    <span className="text-xs lg:text-sm text-gray-500">Area</span>
                    <span className="font-semibold text-sm lg:text-base">{size ? `${size} m²` : '-'}</span>
                  </div>
                  <div className="flex flex-col items-center p-3 lg:p-4 bg-gray-50 rounded-lg">
                    <HomeIcon className="w-5 h-5 lg:w-6 lg:h-6 text-indigo-600 mb-1" />
                    <span className="text-xs lg:text-sm text-gray-500">Type</span>
                    <span className="font-semibold text-sm lg:text-base">{property_type_display || 'N/A'}</span>
                  </div>
                </div>

                <Tabs
                  defaultValue="details"
                  value={activeTab}
                  onValueChange={setActiveTab}
                  className="w-full"
                >
                  <TabsList className="grid w-full grid-cols-3 mb-6">
                    <TabsTrigger value="details">Details</TabsTrigger>
                    <TabsTrigger value="amenities">Amenities</TabsTrigger>
                    <TabsTrigger value="location">Location</TabsTrigger>
                  </TabsList>

                  <TabsContent value="details" className="mt-6">
                    <h3 className="text-lg font-semibold mb-4">About this property</h3>
                    <div className="prose max-w-none">
                      {description ? (
                        <p className="text-gray-700 whitespace-pre-line leading-relaxed">{description}</p>
                      ) : (
                        <p className="text-gray-500 italic">No description provided.</p>
                      )}
                    </div>

                    <div className="mt-8">
                      <h4 className="font-medium text-gray-900 mb-4">Property Details</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                          <Calendar className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
                          <div>
                            <span className="text-sm font-medium text-gray-900">Available from:</span>
                            <p className="text-sm text-gray-600">{new Date(created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                          <Info className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
                          <div>
                            <span className="text-sm font-medium text-gray-900">Status:</span>
                            <p className="text-sm text-gray-600">{available ? 'Available' : 'Unavailable'}</p>
                          </div>
                        </div>
                        {is_furnished && (
                          <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                            <HomeIcon className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
                            <div>
                              <span className="text-sm font-medium text-gray-900">Furnishing:</span>
                              <p className="text-sm text-gray-600">Furnished</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="amenities" className="mt-6">
                    {amenities && amenities.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {amenities.map((amenity: any, index: number) => {
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
                                return <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>;
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
                      <div className="text-center py-12 bg-gray-50 rounded-lg">
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

          <Sidebar 
            property={property} 
            onEnquireClick={() => setIsEnquiryModalOpen(true)}
          />
        </div>
      </div>

      {/* Enquiry Modal */}
      <Dialog open={isEnquiryModalOpen} onOpenChange={setIsEnquiryModalOpen}>
        <DialogContent className="sm:max-w-md mx-4">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <MessageSquare className="w-5 h-5 mr-2 text-indigo-600" />
              Send Enquiry
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 pt-4">
            <div>
              <Label htmlFor="message" className="text-sm font-medium">
                Your Message *
              </Label>
              <Textarea
                id="message"
                placeholder="Hi, I'm interested in this property. Could you provide more details about availability and viewing arrangements?"
                value={enquiryMessage}
                onChange={(e) => setEnquiryMessage(e.target.value)}
                className="mt-1 min-h-[100px] resize-none"
                disabled={enquiryLoading}
              />
            </div>
            
            <div>
              <Label className="text-sm font-medium">
                Preferred Viewing Date (Optional)
              </Label>
              <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal mt-1",
                      !selectedDate && "text-muted-foreground"
                    )}
                    disabled={enquiryLoading}
                  >
                    <CalendarDays className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP") : "Select a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => {
                      setSelectedDate(date);
                      setIsDatePickerOpen(false);
                    }}
                    disabled={disablePastDates}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="flex gap-3 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setIsEnquiryModalOpen(false)}
                className="flex-1"
                disabled={enquiryLoading}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleEnquirySubmit}
                disabled={enquiryLoading || !enquiryMessage.trim()}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700"
              >
                {enquiryLoading ? (
                  <div className="flex items-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Sending...
                  </div>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send Enquiry
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}