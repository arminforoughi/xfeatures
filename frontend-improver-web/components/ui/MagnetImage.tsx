'use client';

import Image from 'next/image';
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

  return (
    <div 
      ref={containerRef}
      className={`relative ${className}`}
      style={{ transition: 'transform 0.3s cubic-bezier(.22,1,.36,1)' }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        className={`
          duration-700 ease-in-out
          ${isLoading ? 'scale-110 blur-2xl grayscale' : 'scale-100 blur-0 grayscale-0'}
        `}
        onLoadingComplete={() => setIsLoading(false)}
      />
    </div>
  );
} 