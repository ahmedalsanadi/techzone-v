'use client';

import React, { useState } from 'react';
import Image, { ImageProps } from 'next/image';
import { cn } from '@/lib/utils';

/**
 * Theme-aware SVG fallback when image fails or is missing.
 * Uses store primary color via CSS variables (see THEME_GUIDE.md).
 */
function ThemeImageFallback() {
    return (
        <svg
            className="w-full h-full object-cover"
            viewBox="0 0 100 100"
            preserveAspectRatio="xMidYMid slice"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden>
            <defs>
                <linearGradient
                    id="dynamic-img-fallback-gradient"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%">
                    <stop
                        offset="0%"
                        stopColor="var(--theme-primary-light, rgba(180, 71, 52, 0.12))"
                    />
                    <stop
                        offset="50%"
                        stopColor="var(--theme-primary-lighter, rgba(180, 71, 52, 0.06))"
                    />
                    <stop
                        offset="100%"
                        stopColor="var(--theme-primary-lighter, rgba(180, 71, 52, 0.03))"
                    />
                </linearGradient>
                <filter
                    id="dynamic-img-fallback-shadow"
                    x="-20%"
                    y="-20%"
                    width="140%"
                    height="140%">
                    <feDropShadow
                        dx="0"
                        dy="2"
                        stdDeviation="3"
                        floodColor="var(--theme-primary, #B44734)"
                        floodOpacity="0.15"
                    />
                </filter>
            </defs>
            <rect
                width="100"
                height="100"
                fill="url(#dynamic-img-fallback-gradient)"
            />
            {/* Simple image/photo placeholder icon - outline in theme color */}
            <g
                transform="translate(50, 50)"
                fill="none"
                stroke="var(--theme-primary-border, rgba(180, 71, 52, 0.35))"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                filter="url(#dynamic-img-fallback-shadow)">
                <rect x="-18" y="-14" width="36" height="28" rx="2" />
                <circle cx="-8" cy="-6" r="3.5" />
                <path d="M-18 4 L-6 -4 L8 6 L18 -2 L18 14 L-18 14 Z" />
            </g>
        </svg>
    );
}

interface DynamicImageProps extends Omit<
    ImageProps,
    'onLoad' | 'onError' | 'src'
> {
    src: string;
    mediaSizes?: string[];
    fallbackComponent?: React.ReactNode;
    containerClassName?: string;
    onLoad?: () => void;
    onError?: () => void;
    index?: number;
}

/**
 * A premium image component with loading shimmers and automatic failure handling.
 * The internal wrapper and image are optimized for the best UX/Performance.
 */
export default function DynamicImage({
    src,
    alt,
    mediaSizes,
    fallbackComponent,
    containerClassName,
    className,
    priority,
    loading: loadingProp,
    onLoad,
    onError,
    index,
    ...props
}: DynamicImageProps) {
    const [error, setError] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [showShimmer, setShowShimmer] = useState(false);

    // ✅ Store previous src to detect changes during render
    const [prevSrc, setPrevSrc] = useState(src);

    // ✅ Reset states when src changes
    if (src !== prevSrc) {
        setPrevSrc(src);
        setError(false);
        setIsLoading(true);
        setShowShimmer(false);
    }

    // Effect to delay shimmer appearance (Avoid flicker for cached images)
    React.useEffect(() => {
        if (!isLoading) return;

        const timer = setTimeout(() => {
            setShowShimmer(true);
        }, 200); // 200ms grace period

        return () => clearTimeout(timer);
    }, [isLoading, src]);

    const handleLoadingComplete = () => {
        setIsLoading(false);
        setShowShimmer(false);
        onLoad?.();
    };

    const handleError = () => {
        setError(true);
        setIsLoading(false);
        setShowShimmer(false);
        onError?.();
    };

    const animationDelay = index ? `${(index % 8) * 150}ms` : undefined;

    if (error || !src) {
        return (
            <div
                className={cn(
                    'flex items-center justify-center w-full h-full min-h-[inherit] overflow-hidden bg-theme-primary-lighter',
                    containerClassName,
                )}>
                {fallbackComponent ?? <ThemeImageFallback />}
            </div>
        );
    }

    return (
        <div
            className={cn(
                'relative overflow-hidden w-full h-full',
                containerClassName,
            )}>
            {showShimmer && (
                <div
                    className="absolute inset-0 bg-gray-100 animate-pulse z-10"
                    style={{ animationDelay }}
                />
            )}
            <Image
                {...props}
                loader={
                    mediaSizes
                        ? ({ width }: { width: number }) => {
                              if (mediaSizes.length >= 3) {
                                  if (width <= 150) return mediaSizes[0];
                                  if (width <= 300) return mediaSizes[1];
                                  return mediaSizes[2];
                              }
                              if (mediaSizes.length > 0) {
                                  const bestIndex = Math.min(
                                      Math.floor((width / 600) * mediaSizes.length),
                                      mediaSizes.length - 1,
                                  );
                                  return mediaSizes[bestIndex];
                              }
                              return src;
                          }
                        : undefined
                }
                src={src}
                alt={alt}
                fill
                priority={priority}
                loading={priority ? undefined : loadingProp || 'lazy'}
                className={cn(
                    'object-cover transition-[transform,filter] duration-300 ease-out',
                    isLoading ? 'blur-lg scale-[1.02]' : 'blur-0 scale-100',
                    className,
                )}
                onLoad={handleLoadingComplete}
                onError={handleError}
            />
        </div>
    );
}
