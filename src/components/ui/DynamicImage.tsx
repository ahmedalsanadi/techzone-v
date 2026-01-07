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
    ...props
}: DynamicImageProps) {
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(true);

    // Reset state when src changes
    useEffect(() => {
        setError(false);
        setLoading(true);
    }, [src]);

    // Handle initial loading state for cached images
    const handleLoadingComplete = () => {
        setLoading(false);
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
            {loading && (
                <div className="absolute inset-0 bg-gray-100 animate-pulse z-10" />
            )}
            <Image
                {...props}
                unoptimized
                src={src}
                alt={alt}
                className={cn(
                    'transition-all duration-500 ease-in-out',
                    loading ? 'blur-lg scale-[1.02]' : 'blur-0 scale-100',
                    className,
                )}
                onLoad={handleLoadingComplete}
                onError={() => {
                    setError(true);
                    setLoading(false);
                }}
            />
        </div>
    );
}
