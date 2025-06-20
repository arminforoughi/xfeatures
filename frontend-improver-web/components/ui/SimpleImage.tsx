'use client';

import { useState } from 'react';

interface SimpleImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
}

export default function SimpleImage({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
}: SimpleImageProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div className={`bg-gray-100 rounded-lg flex items-center justify-center ${className}`} style={{ width, height }}>
        <div className="text-gray-500 text-sm">Image unavailable</div>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      loading={priority ? 'eager' : 'lazy'}
      className={className}
      onError={() => setHasError(true)}
      style={{ maxWidth: '100%', height: 'auto' }}
    />
  );
} 