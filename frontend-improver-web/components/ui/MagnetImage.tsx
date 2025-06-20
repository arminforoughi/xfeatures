'use client';

import { useState, useRef } from 'react';

interface MagnetImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  priority?: boolean;
}

export default function MagnetImage({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
}: MagnetImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const container = containerRef.current;
    if (!container) return;
    
    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    
    container.style.transform = `translate(${x * 0.08}px, ${y * 0.08}px) scale(1.04)`;
  };

  const handleMouseLeave = () => {
    const container = containerRef.current;
    if (!container) return;
    container.style.transform = 'translate(0, 0) scale(1)';
  };

  const handleImageLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleImageError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  return (
    <div 
      ref={containerRef}
      className={`relative ${className}`}
      style={{ transition: 'transform 0.3s cubic-bezier(.22,1,.36,1)' }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
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