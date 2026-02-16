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
    index?: number;
}

/**
 * Reusable small tile card for category tabs, collection strip, and similar “select one” UIs.
 * Enhanced: clear image area, refined hover/selected states, better typography.
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
    index = 0,
}) => {
    const animationDelay = `${(index % 9) * 50}ms`;

    const content = (
        <div
            className={cn(
                'flex flex-col w-[88px] sm:w-[100px] md:w-[116px] shrink-0 animate-in fade-in zoom-in-95 duration-500 fill-mode-both',
                !href && onClick && 'cursor-pointer',
                className,
            )}
            style={{ animationDelay }}>
            <div
                className={cn(
                    'flex flex-col rounded-xl overflow-hidden transition-all duration-300 ',
                    'ring-2 ring-transparent shadow-sm',
                    isSelected
                        ? 'bg-white ring-theme-primary shadow-lg shadow-theme-primary/15 scale-[1.02]'
                        : variant === 'muted'
                          ? 'bg-gray-50/90 border border-gray-200/80 group-hover:bg-white group-hover:border-theme-primary/30 group-hover:shadow-md group-hover:ring-theme-primary/20'
                          : 'bg-white/60 border border-white/80 group-hover:bg-white group-hover:border-theme-primary/25 group-hover:shadow-md group-hover:ring-theme-primary/15',
                )}>
                {/* Image / icon area */}
                <div
                    className={cn(
                        'relative w-full aspect-square flex items-center justify-center p-3 overflow-hidden',
                        icon &&
                            'bg-linear-to-b from-theme-primary/5 to-transparent',
                    )}>
                    {icon ? (
                        <div
                            className={cn(
                                'flex items-center justify-center rounded-xl transition-transform duration-300',
                                'w-11 h-11 md:w-12 md:h-12 bg-theme-primary/10 text-theme-primary',
                                'group-hover:bg-theme-primary/15 group-hover:scale-105',
                            )}>
                            {icon}
                        </div>
                    ) : (
                        <div
                            className={cn(
                                'relative w-full h-full min-h-[44px] min-w-[44px] rounded-xl overflow-hidden bg-gray-100',
                                imageClassName,
                            )}>
                            <DynamicImage
                                src={image || ''}
                                alt={label}
                                fill
                                priority={priority}
                                className="object-cover transition-transform duration-300 group-hover:scale-105"
                                sizes="(max-width: 768px) 88px, 116px"
                                index={index}
                                fallbackComponent={fallbackComponent}
                            />
                        </div>
                    )}
                </div>
                {/* Label */}
                {/* Fixed height keeps all cards identical even with 1–2 lines */}
                <div className="h-11 px-2 pb-2 pt-1 text-center flex items-end justify-center">
                    <span
                        className={cn(
                            ' text-xs font-bold leading-tight line-clamp-2 block w-full transition-colors',
                            isSelected
                                ? 'text-theme-primary'
                                : 'text-gray-800 group-hover:text-theme-primary',
                        )}
                        title={title ?? label}>
                        {label}
                    </span>
                </div>
            </div>
        </div>
    );

    if (href) {
        return (
            <Link
                href={href}
                scroll={scroll}
                className="group outline-none focus-visible:ring-2 focus-visible:ring-theme-primary focus-visible:ring-offset-2 rounded-2xl">
                {content}
            </Link>
        );
    }

    return (
        <div
            onClick={onClick}
            className="group outline-none focus-visible:ring-2 focus-visible:ring-theme-primary focus-visible:ring-offset-2 rounded-2xl"
            role={onClick ? 'button' : undefined}
            tabIndex={onClick ? 0 : undefined}
            onKeyDown={
                onClick ? (e) => e.key === 'Enter' && onClick() : undefined
            }>
            {content}
        </div>
    );
};

export default SmallTileCard;
