import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Star, Clock, Shield, MapPin, Bed, Bath, Ruler, Heart, Share2, ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { Property } from '@/types/properties';
import { formatDistance } from 'date-fns';
import { enGB } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect, useMemo, useCallback, memo } from 'react';
import useFavourite from '@/hooks/use-favourite';
import { toast } from 'sonner';

interface PropertyCardProps {
  property: Property | (Property & {
    properties: PropertyData;
    media?: (string | PropertyMedia)[];
    videos?: (string | PropertyMedia)[];
  });
  className?: string;
  hideActions?: boolean;
  isFavorited?: boolean;
}

type MediaType = 'image' | 'video';

interface MediaItem {
  url: string;
  id?: string;
  type?: MediaType;
  thumbnail?: string;
}

interface PropertyMedia extends MediaItem {
  is_primary?: boolean;
  caption?: string;
}

interface PropertyData {
  id: string | number;
  title: string;
  price?: number;
  property_type?: string;
  is_furnished?: boolean;
  overall_score?: number | string;
  distance_to_university?: number;
  available_from: string;
  media?: (string | PropertyMedia)[];
  videos?: (string | PropertyMedia)[];
  bedrooms?: number;
  bathrooms?: number;
  size?: number;
  address?: string;
}

const getPropertyTypeColor = (type: string) => {
  switch (type.toLowerCase()) {
    case 'master_bedroom':
      return 'bg-pink-500 text-white';
    case 'single_room':
      return 'bg-blue-500 text-white';
    case 'apartment':
      return 'bg-green-500 text-white';
    case 'condo':
      return 'bg-orange-500 text-white';
    case 'self_contained':
      return 'bg-purple-500 text-white';
    default:
      return 'bg-gray-500 text-white';
  }
};

function PropertyCard({ 
  property, 
  className = '', 
  hideActions = false, 
  isFavorited 
}: PropertyCardProps) {
  const [activeTab, setActiveTab] = useState<'photos' | 'videos'>('photos');
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const { propertyData, propertyId } = useMemo(() => {
    const data = 'properties' in property ? property.properties : property;
    const id = typeof property.id === 'string' ? parseInt(property.id) : property.id;
    return { propertyData: data, propertyId: id };
  }, [property]);

  const { toggleFavorite, isFavorite, isLoading: favoriteLoading } = useFavourite();
  
  const isPropertyFavorite = useMemo(() => {
    if (typeof isFavorited === 'boolean') return isFavorited;
    return propertyId ? isFavorite(propertyId) : false;
  }, [isFavorited, isFavorite, propertyId]);
  
  const { distance, availableFrom } = useMemo(() => {
    const dist = 'distance_to_university' in propertyData ? (propertyData as any).distance_to_university || 0 : 0;
    const available = 'available_from' in propertyData ? new Date((propertyData as any).available_from) : new Date();
    return { distance: dist, availableFrom: available };
  }, [propertyData]);
  
  const { images, videos } = useMemo(() => {
    let mediaImages: (string | PropertyMedia)[] = [];
    let mediaVideos: (string | PropertyMedia)[] = [];
    
    if ('properties' in property) {
      const prop = property as any;
      mediaImages = (prop.properties?.media || prop.media || []) as (string | PropertyMedia)[];
      mediaVideos = (prop.properties?.videos || prop.videos || []) as (string | PropertyMedia)[];
    } else {
      const prop = property as any;
      if (prop.media?.length) {
        mediaImages = prop.media.map((m: any) => ({
          url: m.url || m,
          id: m.id?.toString(),
          type: 'image' as const,
          thumbnail: m.thumbnail || m.url || m
        }));
      }
      if (prop.primary_image) {
        mediaImages.unshift({ url: prop.primary_image, type: 'image' as const });
      } else if (prop.images?.length) {
        mediaImages = [...mediaImages, ...prop.images.map((img: string) => ({ url: img, type: 'image' as const }))];
      }
      if (prop.videos?.length) {
        mediaVideos = prop.videos.map((video: string | { url: string }) => ({
          url: typeof video === 'string' ? video : video.url,
          type: 'video' as const
        }));
      }
    }
    
    const processedImages: MediaItem[] = mediaImages.map((item) => {
      if (typeof item === 'string') return { url: item, type: 'image' as const };
      const { url, id, type, thumbnail } = item;
      return { url, id, type: type || 'image', thumbnail };
    });
    
    const processedVideos: MediaItem[] = mediaVideos.map((item) => {
      if (typeof item === 'string') return { url: item, type: 'video' as const };
      const { url, id, type, thumbnail } = item;
      return { url, id, type: type || 'video', thumbnail };
    });
    
    return { images: processedImages, videos: processedVideos };
  }, [property]);
  
  const currentMedia = activeTab === 'photos' ? images : videos;
  const hasVideos = videos.length > 0;
  
  useEffect(() => {
    setCurrentIndex(0);
  }, [activeTab]);
  
  const handleToggleFavorite = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const success = await toggleFavorite(propertyId);
      if (success) {
        const action = isPropertyFavorite ? 'removed from' : 'added to';
        toast.success(`Property ${action} favorites!`, { description: propertyData.title, duration: 2000 });
      } else {
        toast.error('Failed to update favorites', { description: 'Please try again later', duration: 3000 });
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Something went wrong', { description: 'Please check your connection and try again', duration: 3000 });
    }
  }, [propertyId, toggleFavorite, isPropertyFavorite, propertyData.title]);
  
  const handleShare = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const shareData = {
      title: propertyData.title,
      text: `Check out this property: ${propertyData.title}`,
      url: `${window.location.origin}/properties/${propertyId}`,
    };
    try {
      if (navigator.share && navigator.canShare?.(shareData)) {
        await navigator.share(shareData);
        toast.success('Property shared successfully!');
      } else {
        await navigator.clipboard.writeText(shareData.url);
        toast.success('Property link copied to clipboard!', { description: 'You can now paste it anywhere to share', duration: 3000 });
      }
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Error sharing:', error);
        toast.error('Failed to share property', { description: 'Please try again', duration: 3000 });
      }
    }
  }, [propertyData.title, propertyId]);
  
  const nextImage = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (currentMedia.length > 1) setCurrentIndex((prev) => (prev + 1) % currentMedia.length);
  }, [currentMedia.length]);
  
  const prevImage = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (currentMedia.length > 1) setCurrentIndex((prev) => (prev - 1 + currentMedia.length) % currentMedia.length);
  }, [currentMedia.length]);
  
  const renderMedia = useCallback(() => {
    if (currentMedia.length === 0) {
      return (
        <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
          <span className="text-gray-500">No {activeTab} available</span>
        </div>
      );
    }
    const currentItem = currentMedia[currentIndex];
    if (activeTab === 'videos') {
      return (
        <div className="relative w-full h-48 bg-black">
          <video className="w-full h-full object-cover" poster={currentItem.thumbnail} preload="metadata">
            <source src={currentItem.url} type="video/mp4" />
          </video>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-black/50 rounded-full p-3">
              <Play className="w-8 h-8 text-white" fill="white" />
            </div>
          </div>
        </div>
      );
    }
    return (
      <Image
        src={currentItem.url}
        width={400}
        height={250}
        alt={propertyData.title}
        className="w-full h-48 object-cover"
      />
    );
  }, [currentMedia, currentIndex, activeTab, propertyData.title]);

  return (
    <Link href={`/properties/${propertyId}`} className="block h-full">
      <div className={`bg-card rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 h-full flex flex-col ${className}`}>
        <div className="relative">
          {renderMedia()}
          {currentMedia.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white rounded-full p-1.5 transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white rounded-full p-1.5 transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </>
          )}
          <div className="absolute top-3 left-3 right-3 flex justify-between">
            <button 
              onClick={handleToggleFavorite}
              disabled={favoriteLoading}
              className={`p-2 rounded-full shadow-md transition-all duration-200 transform ${
                favoriteLoading ? 'scale-95 opacity-70 cursor-not-allowed' : 'hover:scale-105 active:scale-95'
              } ${isPropertyFavorite ? 'bg-red-500 text-white shadow-red-200' : 'bg-white/90 hover:bg-white text-gray-700 hover:text-red-500'}`}
              aria-label={isPropertyFavorite ? "Remove from favorites" : "Add to favorites"}
            >
              <Heart className={`h-4 w-4 ${favoriteLoading ? 'animate-pulse' : ''}`} fill={isPropertyFavorite ? "currentColor" : "none"} />
            </button>
            <button 
              onClick={handleShare}
              className="bg-white/90 hover:bg-white p-2 rounded-full shadow-md transition-all duration-200 text-gray-700 hover:text-blue-600 hover:scale-105 active:scale-95"
              aria-label="Share property"
            >
              <Share2 className="h-4 w-4" />
            </button>
          </div>
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex bg-white/90 rounded-full p-1 shadow-md">
            <Button
              variant={activeTab === 'photos' ? 'default' : 'ghost'}
              size="sm"
              className={`rounded-full text-xs font-medium px-3 py-1 ${
                activeTab === 'photos' ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200' : 'text-gray-600 hover:bg-gray-100'
              }`}
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setActiveTab('photos'); }}
            >
              Photos ({images.length})
            </Button>
            <Button
              variant={activeTab === 'videos' ? 'default' : 'ghost'}
              size="sm"
              className={`rounded-full text-xs font-medium px-3 py-1 ${
                activeTab === 'videos' ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200' : 'text-gray-600 hover:bg-gray-100'
              }`}
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setActiveTab('videos'); }}
              disabled={!hasVideos}
            >
              Videos ({videos.length})
            </Button>
          </div>
          {currentMedia.length > 0 && (
            <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
              {currentIndex + 1} / {currentMedia.length}
            </div>
          )}
          <div className="absolute top-12 left-3 flex flex-col gap-1">
            <Badge className={`px-3 py-1 text-sm font-medium capitalize ${getPropertyTypeColor(propertyData.property_type || '')}`}>
              {propertyData.property_type?.replace('_', ' ') || 'Property'}
            </Badge>
            {propertyData.is_furnished && (
              <Badge variant="secondary" className="bg-white/90 text-foreground backdrop-blur-sm text-xs">
                Furnished
              </Badge>
            )}
          </div>
        </div>
        <div className="p-5 flex-1 flex flex-col">
          <div className="flex-1">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-lg line-clamp-2">{propertyData.title}</h3>
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
                {(propertyData as any).toilets || 0} baths
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
                TZS {propertyData.price?.toLocaleString(
                  'en-GB',
                  {
                    style: 'currency',
                    currency: 'TZS',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  },
                )?.replace(/\B(?=(\d{3})+(?!\d))/g, ',') || 'N/A'}
                <span className="text-muted-foreground font-normal text-sm ml-1">/ month</span>
              </p>
            </div>
          </div>
          {!hideActions && (
            <div className="mt-4 pt-4 border-t border-border">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center bg-green-50 text-green-700 text-xs px-2 py-1 rounded-full">
                  <Star className="h-3 w-3 mr-1 fill-current" />
                  {propertyData.overall_score || 'N/A'}
                </div>
                <div className="text-sm text-muted-foreground flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>Available {formatDistance(availableFrom, new Date(), { addSuffix: true, locale: enGB })}</span>
                </div>
              </div>
              <Button className="w-full">Enquire</Button>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

export default memo(PropertyCard);