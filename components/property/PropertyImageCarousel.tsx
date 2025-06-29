import React, { useState, useEffect } from 'react';
import { Camera, ChevronLeft, ChevronRight, Video as VideoIcon, Image as ImageIcon } from 'lucide-react';
import { PropertyImage } from '@/types/properties';

type MediaType = 'image' | 'video';

interface PropertyImageCarouselProps {
  images: (PropertyImage | string)[];
  videos?: (PropertyImage | string)[];
  title: string;
  propertyType: string;
  available: boolean;
  onImageClick: (images: (PropertyImage | string)[], index: number) => void;
  showVideos: boolean;
}

const PropertyImageCarousel = ({ 
  images, 
  videos = [],
  title, 
  propertyType, 
  available, 
  onImageClick,
  showVideos = false 
}: PropertyImageCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [mediaType, setMediaType] = useState<MediaType>(showVideos ? 'video' : 'image');
  
  // Update media type when showVideos prop changes
  useEffect(() => {
    setMediaType(showVideos ? 'video' : 'image');
  }, [showVideos]);
  
  // Ensure we always have an array for videos, even if undefined
  const videoItems = videos || [];
  const currentMedia = mediaType === 'image' ? images : videoItems;
  const hasVideos = videoItems.length > 0;
  
  // If no media is available
  if (images.length === 0 && videoItems.length === 0) {
      return (
        <div className="relative h-48 overflow-hidden bg-gray-200 flex items-center justify-center">
          <Camera className="w-12 h-12 text-gray-400" />
          <div className="absolute top-2 right-2 bg-indigo-600 text-white text-xs font-bold px-2 py-1 rounded-md">
            {propertyType}
          </div>
          {!available && (
            <div className="absolute top-2 left-2 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-md">
              Unavailable
            </div>
          )}
        </div>
      );
    }
  
    const nextMedia = (e: React.MouseEvent) => {
      e.stopPropagation();
      setCurrentIndex((prev) => (prev + 1) % currentMedia.length);
    };

    const prevMedia = (e: React.MouseEvent) => {
      e.stopPropagation();
      setCurrentIndex((prev) => (prev - 1 + currentMedia.length) % currentMedia.length);
    };

    const goToMedia = (index: number, e: React.MouseEvent) => {
      e.stopPropagation();
      setCurrentIndex(index);
    };

    const getMediaUrl = (media: PropertyImage | string) => {
      return typeof media === 'string' ? media : media.url;
    };

    return (
      <div 
        className="relative h-48 overflow-hidden cursor-pointer group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => onImageClick && onImageClick(images, currentIndex)}
      >
        {/* Main Media */}
        <div 
          className="flex transition-transform duration-300 ease-in-out h-full"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {currentMedia.map((media, index) => {
            const mediaUrl = getMediaUrl(media);
            const isVideo = mediaType === 'video' || (typeof media !== 'string' && media.type === 'video');
            
            return isVideo ? (
              <div key={index} className="w-full h-full flex-shrink-0 bg-black flex items-center justify-center">
                <video 
                  src={mediaUrl}
                  className="w-full h-full object-cover"
                  controls
                  playsInline
                  preload="metadata"
                >
                  Your browser does not support the video tag.
                </video>
              </div>
            ) : (
              <img
                key={index}
                src={mediaUrl}
                alt={`${title} - ${mediaType === 'image' ? 'Image' : 'Media'} ${index + 1}`}
                className="w-full h-full object-cover flex-shrink-0"
              />
            );
          })}
        </div>
  
        {/* Navigation Arrows - Only show if there's more than one media item */}
        {currentMedia.length > 1 && (
          <>
            <button
              onClick={prevMedia}
              className={`absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-1.5 shadow-md transition-all duration-200 ${
                isHovered ? 'opacity-100' : 'opacity-0'
              }`}
              aria-label="Previous media"
            >
              <ChevronLeft className="w-4 h-4 text-gray-700" />
            </button>
            <button
              onClick={nextMedia}
              className={`absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-1.5 shadow-md transition-all duration-200 ${
                isHovered ? 'opacity-100' : 'opacity-0'
              }`}
              aria-label="Next media"
            >
              <ChevronRight className="w-4 h-4 text-gray-700" />
            </button>
          </>
        )}
  
        {/* Media Type Toggle - Only show if there are videos available */}
        {hasVideos && (
          <div className="absolute top-2 left-2 flex bg-white/90 rounded-full p-0.5 shadow-md z-10">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setMediaType('image');
                setCurrentIndex(0);
              }}
              className={`p-1.5 rounded-full transition-colors ${mediaType === 'image' ? 'bg-indigo-100 text-indigo-600' : 'text-gray-600 hover:bg-gray-100'}`}
              aria-label="View images"
            >
              <ImageIcon className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setMediaType('video');
                setCurrentIndex(0);
              }}
              className={`p-1.5 rounded-full transition-colors ${mediaType === 'video' ? 'bg-indigo-100 text-indigo-600' : 'text-gray-600 hover:bg-gray-100'}`}
              aria-label="View videos"
            >
              <VideoIcon className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Media Dots */}
        {currentMedia.length > 1 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-1">
            {currentMedia.map((_, index) => (
              <button
                key={index}
                onClick={(e) => goToMedia(index, e)}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  index === currentIndex 
                    ? 'bg-white' 
                    : 'bg-white/50 hover:bg-white/75'
                }`}
                aria-label={`Go to ${mediaType} ${index + 1}`}
              />
            ))}
          </div>
        )}
  
        {/* Availability Badge */}
        {!available && (
          <div className="absolute top-2 right-2 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-md">
            Unavailable
          </div>
        )}
  
        {/* Media Count */}
        <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-md flex items-center">
          {mediaType === 'image' ? (
            <Camera className="w-3 h-3 mr-1" />
          ) : (
            <VideoIcon className="w-3 h-3 mr-1" />
          )}
          {currentIndex + 1}/{currentMedia.length}
        </div>
        
        {/* Property Type Badge */}
        <div className="absolute top-2 right-2 bg-white/90 text-gray-800 text-xs font-medium px-2 py-1 rounded-md">
          {propertyType}
        </div>
      </div>
    );
  };

export default PropertyImageCarousel;