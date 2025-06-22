import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Star, Clock, Shield, MapPin } from 'lucide-react';
import { Property } from '@/types/properties';
import { formatDistance } from 'date-fns';
import { fr } from 'date-fns/locale';

interface PropertyCardProps {
  property: Property;
  className?: string;
}

export default function PropertyCard({ property, className = '' }: PropertyCardProps) {
  const primaryImage = property.primary_image || property.images?.[0] || '/placeholder.jpg';
  const distance = property.properties.distance_to_university || 0;
  const availableFrom = new Date(property.properties.available_from);

  return (
    <div className={`bg-card rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 ${className}`}>
      <div className="relative">
        <Image
          src={primaryImage}
          width={400}
          height={250}
          alt={property.properties.title}
          className="w-full h-48 object-cover transform hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 right-3 bg-primary text-primary-foreground px-2 py-1 rounded text-xs">
          {property.media?.length} photos
        </div>
      </div>
      <div className="p-6">
        <h3 className="font-semibold text-lg mb-2">{property.properties.title}</h3>
        <p className="text-sm text-muted-foreground mb-3">
          <MapPin className="inline-block h-4 w-4 mr-1" />
          {property.properties.address}
        </p>
        <div className="flex items-center mb-4">
          <Star className="h-4 w-4 text-yellow-400" fill="currentColor" />
          <span className="text-sm ml-1">{property.properties.overall_score}</span>
          <span className="text-xs text-muted-foreground ml-1">
            ({property.properties.safety_score} safety • {property.properties.transportation_score} transport)
          </span>
        </div>
        <div className="flex justify-between items-center">
          <div>
            <span className="text-muted-foreground text-xs">From</span>
            <p className="font-bold">
              TZS {property.properties.price.toLocaleString()}{' '}
              <span className="text-muted-foreground font-normal text-xs">/ month</span>
            </p>
          </div>
          <Button size="sm" className="btn-primary">
            View Details
          </Button>
        </div>
        <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            Available {formatDistance(availableFrom, new Date(), { addSuffix: true, locale: fr })}
          </div>
          <div className="flex items-center gap-1">
            <Shield className="h-4 w-4" />
            {distance.toFixed(1)} km from university
          </div>
        </div>
      </div>
    </div>
  );
}
