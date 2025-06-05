import React, { useRef } from 'react';
import Image, { ImageProps } from 'next/image';

// A reusable image component with a magnetic hover effect
const MagnetImage = React.forwardRef<HTMLDivElement, ImageProps>((props, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
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
      style={{ transition: 'transform 0.3s cubic-bezier(.22,1,.36,1)' }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={props.className}
    >
      <Image {...props} />
    </div>
  );
});

MagnetImage.displayName = 'MagnetImage';

export default MagnetImage; 