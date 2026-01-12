'use client';

import React, { useState, useEffect } from 'react';
import Image, { ImageProps } from 'next/image';
import { ImageOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DynamicImageProps extends ImageProps {
    fallbackComponent?: React.ReactNode;
    containerClassName?: string;
}

/**
 * A premium image component with loading shimmers and automatic failure handling.
 * The internal wrapper and image are optimized for the best UX/Performance.
 */
export default function DynamicImage({
    src,
    alt,
    fallbackComponent,
    containerClassName,
    className, // This will be applied directly to the Image component
    priority,
    loading: loadingProp,
    ...props
}: DynamicImageProps) {
    const [error, setError] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Reset state when src changes
    useEffect(() => {
        setError(false);
        setIsLoading(true);
    }, [src]);

    // Handle initial loading state for cached images
    const handleLoadingComplete = () => {
        setIsLoading(false);
    };

    if (error || !src) {
        return (
            <div
                className={cn(
                    'flex items-center justify-center bg-gray-50 text-gray-400 w-full h-full min-h-[inherit]',
                    containerClassName,
                )}>
                {fallbackComponent || (
                    <ImageOff className="w-1/2 h-1/2 opacity-20" />
                )}
            </div>
        );
    }

    return (
        <div
            className={cn(
                'relative overflow-hidden w-full h-full',
                containerClassName,
            )}>
            {isLoading && (
                <div className="absolute inset-0 bg-gray-100 animate-pulse z-10" />
            )}
            <Image
                {...props}
                src={src}
                alt={alt}
                priority={priority}
                // Only set loading if priority is not set (priority takes precedence)
                // When priority is true, Next.js Image automatically handles it and loading should not be set
                {...(priority ? {} : { loading: loadingProp || 'lazy' })}
                className={cn(
                    'transition-all duration-500 ease-in-out',
                    isLoading ? 'blur-lg scale-[1.02]' : 'blur-0 scale-100',
                    className,
                )}
                onLoad={handleLoadingComplete}
                onError={() => {
                    setError(true);
                    setIsLoading(false);
                }}
            />
        </div>
    );
}
