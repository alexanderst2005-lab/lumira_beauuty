'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { getOptimizedImageUrl, DEFAULT_PLACEHOLDER } from '@/utils/image';

interface SafeImageProps {
  src: string | null | undefined;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  priority?: boolean;
  loading?: 'lazy' | 'eager';
  className?: string;
  sizes?: string;
  unoptimized?: boolean;
  optimizeWidth?: number;
  onLoad?: () => void;
}

export default function SafeImage({
  src,
  alt,
  fill = false,
  width,
  height,
  priority = false,
  loading,
  className = '',
  sizes,
  unoptimized = true,
  optimizeWidth = 400,
  onLoad,
}: SafeImageProps) {
  const [imgSrc, setImgSrc] = useState<string>(() => getOptimizedImageUrl(src, optimizeWidth));
  const [hasFailed, setHasFailed] = useState<boolean>(false);

  useEffect(() => {
    const newSrc = getOptimizedImageUrl(src, optimizeWidth);
    setImgSrc(newSrc);
    setHasFailed(false);
  }, [src, optimizeWidth]);

  const handleError = () => {
    if (!hasFailed) {
      setHasFailed(true);
      // Si la URL principal falla, cambiar a placeholder
      setImgSrc(DEFAULT_PLACEHOLDER);
    }
  };

  if (fill) {
    return (
      <div className="relative w-full h-full flex items-center justify-center bg-gray-50">
        <Image
          src={imgSrc}
          alt={alt || 'Producto Lumira Beauty'}
          fill
          priority={priority}
          loading={loading || (priority ? 'eager' : 'lazy')}
          sizes={sizes || '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'}
          unoptimized={unoptimized}
          className={className}
          onError={handleError}
          onLoad={onLoad}
        />
      </div>
    );
  }

  return (
    <Image
      src={imgSrc}
      alt={alt || 'Producto Lumira Beauty'}
      width={width || 400}
      height={height || 400}
      priority={priority}
      loading={loading || (priority ? 'eager' : 'lazy')}
      sizes={sizes}
      unoptimized={unoptimized}
      className={className}
      onError={handleError}
      onLoad={onLoad}
    />
  );
}
