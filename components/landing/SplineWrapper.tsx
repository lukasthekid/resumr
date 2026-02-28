'use client';

import { useState, Suspense } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';

// Dynamically import Spline to avoid SSR issues and reduce initial bundle size
const Spline = dynamic(() => import('@splinetool/react-spline'), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-slate-50 animate-pulse" />,
});

interface SplineWrapperProps {
  scene: string;
  className?: string;
  fallbackImage?: string; // URL or path
  fallbackAlt?: string;
}

export default function SplineWrapper({ 
  scene, 
  className = '', 
  fallbackImage,
  fallbackAlt = '3D Scene Fallback'
}: SplineWrapperProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
  };

  return (
    <div className={`relative w-full h-full ${className}`}>
      {/* Show fallback if loading or error, and fallback image is provided */}
      {(isLoading || hasError) && fallbackImage && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-50 transition-opacity duration-500">
           <Image 
             src={fallbackImage} 
             alt={fallbackAlt}
             fill
             className="object-contain"
             priority
           />
        </div>
      )}
      
      {!hasError && (
        <Spline
          scene={scene}
          onLoad={handleLoad}
          onError={handleError}
          className={`${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-1000 w-full h-full`}
        />
      )}
    </div>
  );
}
