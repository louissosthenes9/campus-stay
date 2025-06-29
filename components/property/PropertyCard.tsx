import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Star, Clock, Shield, MapPin, Bed, Bath, Ruler, Heart, Share2 } from 'lucide-react';
import { Property } from '@/types/properties';
import { formatDistance } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';

interface PropertyCardProps {
  property: Property;
  className?: string;
  hideActions?: boolean;
}

export default function PropertyCard({ property, className = '', hideActions = false }: PropertyCardProps) {
  const primaryImage = property.primary_image || property.images?.[0] || '/placeholder.jpg';
  const distance = property.properties.distance_to_university || 0;
  const availableFrom = new Date(property.properties.available_from);
  
  // Handle property details for both search and regular views
  const propertyData = property.properties || property;
  const propertyId = property.id;
  
  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // TODO: Implement favorite functionality
    console.log('Toggle favorite', propertyId);
  };
  
  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // TODO: Implement share functionality
    if (navigator.share) {
      navigator.share({
        title: propertyData.title,
        text: `Check out this property: ${propertyData.title}`,
        url: window.location.href,
      }).catch(console.error);
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(window.location.href);
      // TODO: Show a toast notification
    }
  };

  return (
    <Link href={`/properties/${propertyId}`} className="block h-full">
      <div className={`bg-card rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 h-full flex flex-col ${className}`}>
        <div className="relative">
          <Image
            src={primaryImage}
            width={400}
            height={250}
            alt={propertyData.title}
            className="w-full h-48 object-cover transform hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute top-3 right-3 flex gap-2">
            <button 
              onClick={toggleFavorite}
              className="bg-white/90 hover:bg-white p-2 rounded-full shadow-md transition-colors"
              aria-label="Add to favorites"
            >
              <Heart className="h-4 w-4 text-gray-700" fill="currentColor" />
            </button>
            <button 
              onClick={handleShare}
              className="bg-white/90 hover:bg-white p-2 rounded-full shadow-md transition-colors"
              aria-label="Share property"
            >
              <Share2 className="h-4 w-4 text-gray-700" />
            </button>
          </div>
      
          <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center">
            <div className="flex gap-1">
              <Badge variant="secondary" className="bg-white/90 text-foreground backdrop-blur-sm">
                {propertyData.property_type || 'Property'}
              </Badge>
              {propertyData.is_furnished && (
                <Badge variant="secondary" className="bg-white/90 text-foreground backdrop-blur-sm">
                  Furnished
                </Badge>
              )}
            </div>
            <div className="bg-white/90 text-foreground text-xs px-2 py-1 rounded backdrop-blur-sm">
              {property.media?.length || 0} photos
            </div>
          </div>
        </div>
        
        <div className="p-5 flex-1 flex flex-col">
          <div className="flex-1">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-lg line-clamp-2">{propertyData.title}</h3>
              <div className="flex items-center bg-green-50 text-green-700 text-xs px-2 py-0.5 rounded-full ml-2">
                <Star className="h-3 w-3 mr-1 fill-current" />
                {propertyData.overall_score || 'N/A'}
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground mb-3 flex items-center">
              <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
              <span className="line-clamp-1">{propertyData.address}</span>
            </p>
            
            <div className="flex items-center gap-4 my-3 text-sm">
              <div className="flex items-center text-muted-foreground">
                <Bed className="h-4 w-4 mr-1" />
                {propertyData.bedrooms || 0} beds
              </div>
              <div className="flex items-center text-muted-foreground">
                <Bath className="h-4 w-4 mr-1" />
                {propertyData.toilets || 0} baths
              </div>
              {propertyData.size && (
                <div className="flex items-center text-muted-foreground">
                  <Ruler className="h-4 w-4 mr-1" />
                  {propertyData.size} m²
                </div>
              )}
            </div>
            
            <div className="mt-3 mb-4">
              <p className="font-bold text-lg">
                TZS {propertyData.price?.toLocaleString() || 'N/A'}
                <span className="text-muted-foreground font-normal text-sm ml-1">/ month</span>
              </p>
            
            </div>
          </div>
          
          {!hideActions && (
            <div className="mt-4 pt-4 border-t border-border">
              <div className="flex justify-between items-center">
                <div className="text-sm text-muted-foreground flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>Available {formatDistance(availableFrom, new Date(), { addSuffix: true, locale: fr })}</span>
                </div>
                <Button size="sm" className="btn-primary">
                  View Details
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
