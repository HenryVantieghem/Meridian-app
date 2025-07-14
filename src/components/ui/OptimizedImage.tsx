import React from 'react';
import Image from 'next/image';
import { useIntersectionObserver } from '@/lib/performance/code-splitting';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  priority?: boolean;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  sizes?: string;
  className?: string;
  style?: React.CSSProperties;
  onLoad?: () => void;
  onError?: () => void;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  priority = false,
  quality = 75,
  placeholder = 'empty',
  blurDataURL,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  className,
  style,
  onLoad,
  onError,
}) => {
  const imageRef = React.useRef<HTMLDivElement>(null);
  const isIntersecting = useIntersectionObserver(imageRef, {
    threshold: 0.1,
    rootMargin: '50px',
  });

  const [isLoaded, setIsLoaded] = React.useState(false);
  const [hasError, setHasError] = React.useState(false);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
    
    // Track image load performance
    if (typeof window !== 'undefined' && 'gtag' in window && typeof window.gtag === 'function') {
      window.gtag('event', 'image_load', {
        image_src: src,
        load_time: performance.now(),
      });
    }
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
    
    // Track image error
    if (typeof window !== 'undefined' && 'gtag' in window && typeof window.gtag === 'function') {
      window.gtag('event', 'image_error', {
        image_src: src,
      });
    }
  };

  // Don't render until intersection or priority
  if (!isIntersecting && !priority) {
    return (
      <div
        ref={imageRef}
        className={`bg-gray-200 animate-pulse ${className || ''}`}
        style={{
          width,
          height,
          ...style,
        }}
      />
    );
  }

  return (
    <div ref={imageRef} className={className} style={style}>
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        quality={quality}
        placeholder={placeholder}
        blurDataURL={blurDataURL}
        sizes={sizes}
        className={`transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        onLoad={handleLoad}
        onError={handleError}
        style={{
          objectFit: 'cover',
        }}
      />
      
      {/* Loading placeholder */}
      {!isLoaded && !hasError && (
        <div
          className="absolute inset-0 bg-gray-200 animate-pulse"
          style={{ width, height }}
        />
      )}
      
      {/* Error placeholder */}
      {hasError && (
        <div
          className="absolute inset-0 bg-gray-300 flex items-center justify-center"
          style={{ width, height }}
        >
          <span className="text-gray-500 text-sm">Image failed to load</span>
        </div>
      )}
    </div>
  );
};

// Responsive image component
export const ResponsiveImage: React.FC<Omit<OptimizedImageProps, 'width' | 'height'> & {
  aspectRatio?: number;
  maxWidth?: number;
}> = ({
  aspectRatio = 16 / 9,
  maxWidth = 1200,
  ...props
}) => {
  const [containerWidth, setContainerWidth] = React.useState(0);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        const width = Math.min(containerRef.current.offsetWidth, maxWidth);
        setContainerWidth(width);
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, [maxWidth]);

  const height = containerWidth / aspectRatio;

  return (
    <div ref={containerRef} className="w-full">
      {containerWidth > 0 && (
        <OptimizedImage
          {...props}
          width={containerWidth}
          height={height}
        />
      )}
    </div>
  );
};

// Lazy image with blur placeholder
export const LazyImage: React.FC<OptimizedImageProps> = (props) => {
  return (
    <OptimizedImage
      {...props}
      priority={false}
      placeholder="blur"
      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
    />
  );
};

// Hero image with high priority
export const HeroImage: React.FC<OptimizedImageProps> = (props) => {
  return (
    <OptimizedImage
      {...props}
      priority={true}
      quality={90}
      sizes="100vw"
    />
  );
};

// Thumbnail image
export const ThumbnailImage: React.FC<OptimizedImageProps> = (props) => {
  return (
    <OptimizedImage
      {...props}
      quality={60}
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
    />
  );
};

export default OptimizedImage; 