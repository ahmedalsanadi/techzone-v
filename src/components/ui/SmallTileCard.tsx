'use client';

import React from 'react';
import { Link } from '@/i18n/navigation';
import DynamicImage from './DynamicImage';
import { cn } from '@/lib/utils';

export interface SmallTileCardProps {
    label: string;
    image?: string | null;
    isSelected?: boolean;
    onClick?: () => void;
    href?: string;
    scroll?: boolean;
    icon?: React.ReactNode;
    /** Fallback when image fails to load (e.g. ReactNode with Next/Image or img) */
    fallbackComponent?: React.ReactNode;
    priority?: boolean;
    className?: string;
    imageClassName?: string;
    title?: string;
    /** Unselected style: default (white/40) or muted (gray-100, for collection strip) */
    variant?: 'default' | 'muted';
}

/**
 * Reusable small tile card (85px/110px) with image or icon, label, and optional selected state.
 * Used for category tabs, collection strip, and similar “select one” UIs.
 */
const SmallTileCard: React.FC<SmallTileCardProps> = ({
    label,
    image,
    isSelected = false,
    onClick,
    href,
    scroll = true,
    icon,
    fallbackComponent,
    priority = false,
    className,
    imageClassName,
    title,
    variant = 'default',
}) => {
    const content = (
        <div
            className={cn(
                'flex flex-col items-center w-[85px] md:w-[110px] shrink-0',
                !href && onClick && 'cursor-pointer',
                className,
            )}>
            <div
                className={cn(
                    'w-full h-full aspect-4/5 md:aspect-square flex flex-col items-center justify-center gap-2 p-3 transition-all duration-300 rounded-2xl relative',
                    isSelected
                        ? 'bg-white border-2 border-theme-primary shadow-xl -translate-y-1'
                        : variant === 'muted'
                          ? 'bg-gray-100 border border-gray-200 group-hover:bg-gray-50 group-hover:border-theme-primary-border group-hover:shadow-md'
                          : 'bg-white/40 border border-gray-100 group-hover:bg-white group-hover:border-theme-primary-border group-hover:shadow-lg',
                )}>
                {icon ? (
                    <div className="flex flex-col items-center gap-2 w-full">
                        <div className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-theme-primary/10 rounded-xl group-hover:scale-110 transition-transform">
                            {icon}
                        </div>
                        <span
                            className={cn(
                                'text-[11px] md:text-xs font-bold transition-colors text-center line-clamp-2 px-1',
                                isSelected
                                    ? 'text-theme-primary'
                                    : 'text-gray-800 group-hover:text-theme-primary',
                            )}>
                            {label}
                        </span>
                    </div>
                ) : (
                    <>
                        <div
                            className={cn(
                                'relative w-10 h-10 md:w-14 md:h-14 transition-transform group-hover:scale-110',
                                imageClassName,
                            )}>
                            <DynamicImage
                                src={image || ''}
                                alt={label}
                                fill
                                priority={priority}
                                className="object-contain"
                                sizes="(max-width: 768px) 40px, 56px"
                                fallbackComponent={fallbackComponent}
                            />
                        </div>
                        <span
                            className={cn(
                                'text-[11px] md:text-xs font-bold transition-colors leading-tight text-center line-clamp-2 px-1',
                                isSelected
                                    ? 'text-theme-primary'
                                    : 'text-gray-800 group-hover:text-theme-primary',
                            )}
                            title={title ?? label}>
                            {label}
                        </span>
                    </>
                )}
                {isSelected && (
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-theme-primary rounded-full" />
                )}
            </div>
        </div>
    );

    if (href) {
        return (
            <Link href={href} scroll={scroll} className="group outline-none">
                {content}
            </Link>
        );
    }

    return (
        <div onClick={onClick} className="group outline-none" role={onClick ? 'button' : undefined}>
            {content}
        </div>
    );
};

export default SmallTileCard;
