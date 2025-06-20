'use client';

import { useState } from 'react';

interface ReliableImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  priority?: boolean;
}

export default function ReliableImage({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
}: ReliableImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleImageLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleImageError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-lg flex items-center justify-center">
          <div className="text-gray-400 text-sm">Loading...</div>
        </div>
      )}
      
      {hasError && (
        <div className="absolute inset-0 bg-gray-100 rounded-lg flex items-center justify-center">
          <div className="text-gray-500 text-sm">Image failed to load</div>
        </div>
      )}
      
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? 'eager' : 'lazy'}
        className={`
          transition-opacity duration-300 ease-in-out
          ${isLoading ? 'opacity-0' : 'opacity-100'}
          ${hasError ? 'hidden' : ''}
        `}
        onLoad={handleImageLoad}
        onError={handleImageError}
      />
    </div>
  );
} 