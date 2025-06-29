'use client';
import { Button } from '@/components/ui/button';
import { Plus, Home, MapPin, Loader2, Edit, Trash2, Camera, ChevronLeft, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, FC } from 'react';
import useProperty from '@/hooks/use-property';
import { PropertyImage } from '@/types/properties';
import PropertyImageCarousel from '@/components/property/PropertyImageCarousel';

// Media types
type MediaType = 'image' | 'video';

// Base media interface
interface MediaItem {
  url: string;
  id?: string;
  type?: MediaType;
  thumbnail?: string;
  [key: string]: any;
}

// Property media extends the base MediaItem with property-specific fields
type PropertyMedia = MediaItem;

// Property interface
interface Property {
  id: string | number;
  properties: {
    media?: PropertyMedia[];
    videos?: (string | PropertyMedia)[];
    property_type?: string;
    property_type_display?: string;
    bedrooms?: number;
    toilets?: number;
    size?: number;
    is_furnished?: boolean;
    overall_score?: number;
    [key: string]: any;
  };
  [key: string]: any;
}

// Extend the properties type to include videos
type PropertyWithVideos = Property & {
  properties: Property['properties'] & {
    videos?: (string | PropertyMedia)[];
  };
};

// Image modal props
interface ImageModalProps {
  images: MediaItem[];
  videos?: MediaItem[];
  initialIndex: number;
  isOpen: boolean;
  onClose: () => void;
}

// Pagination interface
interface Pagination {
  next: string | null;
  previous: string | null;
  count: number;
}

const ImageModal: React.FC<ImageModalProps> = ({
  images,
  videos = [],
  initialIndex,
  isOpen,
  onClose,
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(initialIndex);
  const [mediaType, setMediaType] = useState<MediaType>('image');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const mediaItems = mediaType === 'image' ? [...images] : [...videos];
  const hasVideos = videos.length > 0;

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  useEffect(() => {
    const handleKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (mediaItems.length === 0) return;

      if (e.key === 'ArrowLeft') {
        setCurrentIndex((prev) => (prev - 1 + mediaItems.length) % mediaItems.length);
      }
      if (e.key === 'ArrowRight') {
        setCurrentIndex(prev => (prev + 1) % mediaItems.length);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, mediaItems.length, onClose]);

  const toggleMediaType = () => {
    if (!hasVideos) return;
    const newType = mediaType === 'image' ? 'video' : 'image';
    setMediaType(newType);
    setCurrentIndex(0);
    setIsPlaying(false);
  };

  const renderMedia = () => {
    if (mediaItems.length === 0) {
      const mediaTypeText = mediaType === 'image' ? 'images' : 'videos';
      return (
        <div className="w-full h-full flex items-center justify-center bg-gray-100">
          <p className="text-gray-500">No {mediaTypeText} available</p>
        </div>
      );
    }

    const currentItem = mediaItems[currentIndex];
    const url = typeof currentItem === 'string' ? currentItem : currentItem.url;
    
    if (mediaType === 'video') {
      return (
        <div className="relative w-full h-full flex items-center justify-center">
          <video
            key={url}
            className="max-w-full max-h-full object-contain"
            controls
            autoPlay={isPlaying}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onClick={(e) => e.stopPropagation()}
          >
            <source src={url} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      );
    }
    
    return (
      <img
        src={url}
        alt={`Media ${currentIndex + 1}`}
        className="max-w-full max-h-full object-contain"
        onClick={(e) => e.stopPropagation()}
      />
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center">
      <div className="relative w-full h-full flex items-center justify-center p-4">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {renderMedia()}
        
        {hasVideos && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleMediaType();
            }}
            className="absolute top-4 left-4 z-10 bg-black/70 hover:bg-black/90 text-white rounded-full p-2 transition-all"
            title={`Switch to ${mediaType === 'image' ? 'videos' : 'images'}`}
          >
            {mediaType === 'image' ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            )}
          </button>
        )}

        {mediaItems.length > 1 && (
          <>
            <button
              onClick={() => setCurrentIndex((prev: number) => (prev - 1 + images.length) % images.length)}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 bg-black/50 rounded-full p-2"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={() => setCurrentIndex((prev: number) => (prev + 1) % images.length)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 bg-black/50 rounded-full p-2"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm">
          {currentIndex + 1} / {images.length}
        </div>
      </div>
    </div>
  );
};

export default function PropertyPage() {
  const router = useRouter();
  const { 
    properties, 
    loading, 
    error, 
    pagination,
    fetchProperties,
    deleteProperty,
    getPropertyPrice,
    getPropertyTitle,
    getPropertyAddress,
    getPropertyPrimaryImage,
    isPropertyAvailable,
    clearError
  } = useProperty();

  const [deletingId, setDeletingId] = useState<string | number | null>(null);
  const [activeTab, setActiveTab] = useState<'photos' | 'videos'>('photos');
  
  const [imageModal, setImageModal] = useState<{
    isOpen: boolean;
    images: MediaItem[];
    initialIndex: number;
  }>({ 
    isOpen: false, 
    images: [], 
    initialIndex: 0 
  });
  
  console.log('Properties:', properties);

  // Fetch properties when component mounts
  useEffect(() => {
    fetchProperties();
  }, []);

  // Handle property deletion
  const handleDeleteProperty = async (propertyId: string | number) => {
    if (!confirm('Are you sure you want to delete this property? This action cannot be undone.')) {
      return;
    }

    setDeletingId(propertyId);
    try {
      const success = await deleteProperty(propertyId);
      if (success) {
        console.log('Property deleted successfully');
      }
    } catch (err) {
      console.error('Error deleting property:', err);
    } finally {
      setDeletingId(null);
    }
  };

  // Handle retry on error
  const handleRetry = () => {
    clearError();
    fetchProperties();
  };

  // Handle image click to open modal
  const handleImageClick = (images: (string | PropertyImage)[], initialIndex: number) => {
    // Convert PropertyImage to MediaItem format if needed
    const convertedImages: MediaItem[] = images.map(img => 
      typeof img === 'string' 
        ? { url: img, type: 'image' as const }
        : { url: img.url, id: img.id, type: 'image' as const }
    );
    setImageModal({ isOpen: true, images: convertedImages, initialIndex });
  };

  // Close image modal
  const closeImageModal = () => {
    setImageModal({ isOpen: false, images: [], initialIndex: 0 });
  };

  // Handle loading state
  if (loading && properties.length === 0) {
    return (
      <div className="p-6 w-full max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-gray-900">My Properties</h1>
            <p className="text-gray-500">Manage your listed properties</p>
          </div>
          <Button 
            onClick={() => router.push('/dashboard/properties/new')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Property
          </Button>
        </div>
        
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          <span className="ml-2 text-gray-600">Loading properties...</span>
        </div>
      </div>
    );
  }

  // Handle error state
  if (error && properties.length === 0) {
    return (
      <div className="p-6 w-full max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-gray-900">My Properties</h1>
            <p className="text-gray-500">Manage your listed properties</p>
          </div>
          <Button 
            onClick={() => router.push('/dashboard/properties/new')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Property
          </Button>
        </div>
        
        <div className="text-center py-12 bg-red-50 rounded-lg border border-red-200">
          <div className="text-red-600 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-red-900 mb-2">Error loading properties</h3>
          <p className="text-red-700 mb-6">{error}</p>
          <Button 
            onClick={handleRetry}
            variant="outline"
            className="border-red-500 text-red-600 hover:bg-red-50"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 w-full max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-gray-900">My Properties</h1>
          <p className="text-gray-500">
            Manage your listed properties
            {pagination && ` (${pagination.count} total)`}
          </p>
        </div>
        <Button 
          onClick={() => router.push('/dashboard/properties/new')}
          className="bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Property
        </Button>
      </div>

      {/* Show error banner if there's an error but we still have properties */}
      {error && properties.length > 0 && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="text-red-600 mr-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-medium text-red-900">Something went wrong</h4>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
            <Button 
              onClick={clearError}
              variant="outline"
              size="sm"
              className="border-red-300 text-red-600 hover:bg-red-100"
            >
              Dismiss
            </Button>
          </div>
        </div>
      )}

      {properties.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <Home className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No properties listed yet</h3>
          <p className="text-gray-500 mb-6">Get started by creating a new property listing</p>
          <Button 
            onClick={() => router.push('/dashboard/properties/new')}
            variant="outline"
            className="border-indigo-500 text-indigo-600 hover:bg-indigo-50"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Your First Listing
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property, index) => {
            const price = getPropertyPrice(property);
            const title = getPropertyTitle(property);
            const address = getPropertyAddress(property);
            const available = isPropertyAvailable(property);
            const isDeleting = deletingId === property.id;
            
            // Fix: Access media from the correct path
            // Using type assertion for the media property since it's not in the base type
             const mediaImages = (property.properties as { media?: (string | PropertyImage)[] }).media || [];
            const propertyType = property.properties.property_type_display || property.properties.property_type;

            return (
              <div 
                key={property.id}
                className={`bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-all duration-300 ${
                  isDeleting ? 'opacity-50 pointer-events-none' : ''
                } ${
                  !available ? 'ring-2 ring-yellow-200' : ''
                }`}
              >
                <div className="relative">
                  <PropertyImageCarousel
                    images={mediaImages}
                    videos={property.properties.videos || []}
                    title={title}
                    propertyType={propertyType}
                    available={available}
                    onImageClick={handleImageClick}
                    showVideos={activeTab === 'videos'}
                  />
                  
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex bg-white/90 rounded-full p-1 shadow-md z-10">
                    <Button
                      variant={activeTab === 'photos' ? 'default' : 'ghost'}
                      size="sm"
                      className={`rounded-full text-sm font-medium ${
                        activeTab === 'photos' 
                          ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200' 
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveTab('photos');
                      }}
                    >
                      Photos
                    </Button>
                    <Button
                      variant={activeTab === 'videos' ? 'default' : 'ghost'}
                      size="sm"
                      className={`rounded-full text-sm font-medium ${
                        activeTab === 'videos' 
                          ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200' 
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveTab('videos');
                      }}
                      disabled={!property.properties.videos?.length}
                    >
                      Videos
                    </Button>
                  </div>
                </div>
                
                <div className="p-5">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-1">
                    {title}
                  </h2>
                  
                  <div className="flex items-center text-gray-500 text-sm mb-3">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span className="truncate">{address}</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="font-medium">{property.properties.bedrooms}</span> Beds
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="font-medium">{property.properties.toilets}</span> Baths
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="font-medium">{property.properties.size} m²</span>
                    </div>
                    {property.properties.is_furnished && (
                      <div className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        Furnished
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-lg font-bold text-indigo-600">
                      <span className="text-sm font-normal text-gray-500">TZS </span>
                      {price.toLocaleString()}
                    </div>
                    {property.properties.overall_score && (
                      <div className="text-sm text-gray-600">
                        Score: <span className="font-medium">{property.properties.overall_score}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="flex-1 text-indigo-600 border-indigo-600 hover:bg-indigo-50"
                      onClick={() => router.push(`/dashboard/properties/${property.id}/view`)}
                    >
                      View Details
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-gray-600 border-gray-300 hover:bg-gray-50"
                      onClick={() => router.push(`/dashboard/properties/${property.id}/edit`)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-red-600 border-red-300 hover:bg-red-50"
                      onClick={() => handleDeleteProperty(property.id)}
                      disabled={isDeleting}
                    >
                      {isDeleting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {pagination && (pagination.next || pagination.previous) && (
        <div className="mt-8 flex justify-center gap-2">
          {pagination.previous && (
            <Button
              variant="outline"
              onClick={() => {
                if (pagination.previous) {
                  const url = new URL(pagination.previous);
                  const page = url.searchParams.get('page');
                  fetchProperties({ page: page ? parseInt(page) : 1 });
                }
              }}
              disabled={loading}
            >
              Previous
            </Button>
          )}
          {pagination.next && (
            <Button
              variant="outline"
              onClick={() => {
                if (pagination.next) {
                  const url = new URL(pagination.next);
                  const page = url.searchParams.get('page');
                  fetchProperties({ page: page ? parseInt(page) : 1 });
                }
              }}
              disabled={loading}
            >
              Next
            </Button>
          )}
        </div>
      )}

      {/* Image Modal */}
      <ImageModal
        images={imageModal.images}
        initialIndex={imageModal.initialIndex}
        isOpen={imageModal.isOpen}
        onClose={closeImageModal}
      />
    </div>
  );
}