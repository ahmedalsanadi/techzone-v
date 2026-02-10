'use client';

import React, { useState } from 'react';
import Image, { ImageProps } from 'next/image';
import { ImageOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DynamicImageProps extends Omit<ImageProps, 'onLoad' | 'onError'> {
    fallbackComponent?: React.ReactNode;
    containerClassName?: string;
    onLoad?: () => void;
    onError?: () => void;
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
    className,
    priority,
    loading: loadingProp,
    onLoad,
    onError,
    ...props
}: DynamicImageProps) {
    const [error, setError] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    
    // ✅ Store previous src to detect changes during render
    const [prevSrc, setPrevSrc] = useState(src);
    
    // ✅ Adjust state during rendering when src changes
    if (src !== prevSrc) {
        setPrevSrc(src);
        setError(false);
        setIsLoading(true);
    }

    const handleLoadingComplete = () => {
        setIsLoading(false);
        onLoad?.();
    };

    const handleError = () => {
        setError(true);
        setIsLoading(false);
        onError?.();
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
                loading={priority ? undefined : (loadingProp || 'lazy')}
                className={cn(
                    'transition-all duration-500 ease-in-out',
                    isLoading ? 'blur-lg scale-[1.02]' : 'blur-0 scale-100',
                    className,
                )}
                onLoad={handleLoadingComplete}
                onError={handleError}
            />
        </div>
    );
}