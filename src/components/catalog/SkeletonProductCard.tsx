'use client';

export default function SkeletonProductCard() {
  return (
    <div className="card-premium block h-full bg-white flex flex-col border border-border">
      {/* Image Skeleton */}
      <div className="product-image-container aspect-square bg-gray-100/50 flex items-center justify-center p-6 relative">
        <div className="absolute inset-0 bg-gray-200/40 animate-pulse rounded-t-[1.3rem]" />
      </div>

      {/* Content Skeleton */}
      <div className="p-5 flex flex-col flex-grow">
        {/* Title */}
        <div className="h-5 bg-gray-200/70 rounded w-3/4 mb-2 animate-pulse" />
        {/* Subtitle */}
        <div className="h-4 bg-gray-100 rounded w-full mb-1 animate-pulse" />
        <div className="h-4 bg-gray-100 rounded w-2/3 mb-4 animate-pulse" />
        
        {/* Spacer */}
        <div className="mt-auto pt-4 flex items-center justify-between">
          {/* Price */}
          <div className="h-6 bg-gray-200/70 rounded w-1/3 animate-pulse" />
          {/* Button */}
          <div className="h-10 bg-gray-200/70 rounded-full w-24 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
