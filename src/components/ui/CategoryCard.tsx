'use client';

import React from 'react';
import { Link } from '@/i18n/navigation';
import { LayoutGrid } from 'lucide-react';
import DynamicImage from './DynamicImage';
import SmallTileCard from './SmallTileCard';
import { cn } from '@/lib/utils';

interface CategoryCardProps {
    label: string;
    image?: string | null;
    isMain?: boolean;
    isActive?: boolean;
    variant?: 'default' | 'circular';
    priority?: boolean;
    onClick?: () => void;
    href?: string;
    scroll?: boolean;
}

const CategoryCard: React.FC<CategoryCardProps> = ({
    label,
    image,
    isMain,
    isActive,
    variant = 'default',
    priority = false,
    onClick,
    href,
    scroll = true,
}) => {
    if (variant === 'circular') {
        const content = (
            <div
                className={cn(
                    'flex flex-col items-center gap-2.5 w-[80px] sm:w-[88px] md:w-[96px] shrink-0 transition-all duration-300 rounded-2xl p-2',
                    'ring-2 ring-transparent shadow-sm',
                    isActive
                        ? 'bg-white ring-theme-primary shadow-lg shadow-theme-primary/15 scale-[1.02]'
                        : 'bg-transparent group-hover:bg-white/70 group-hover:ring-theme-primary/15 group-hover:shadow-md',
                    !href && onClick && 'cursor-pointer',
                )}>
                <div
                    className={cn(
                        'w-14 h-14 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-2xl overflow-hidden flex items-center justify-center transition-all duration-300',
                        'ring-2 ring-offset-2 ring-offset-transparent',
                        isActive
                            ? 'ring-theme-primary shadow-md'
                            : 'ring-gray-200/80 bg-white group-hover:ring-theme-primary/30 group-hover:shadow-md',
                    )}>
                    <div className="relative w-full h-full">
                        <DynamicImage
                            src={image || ''}
                            alt={label}
                            fill
                            priority={priority}
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                            sizes="(max-width: 768px) 56px, 64px"
                        />
                    </div>
                </div>
                <span
                    className={cn(
                        'text-[10px] sm:text-xs font-semibold text-center line-clamp-2 px-0.5 transition-colors leading-tight',
                        isActive
                            ? 'text-theme-primary'
                            : 'text-gray-700 group-hover:text-theme-primary',
                    )}>
                    {label}
                </span>
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
    }

    return (
        <SmallTileCard
            label={label}
            image={image}
            isSelected={isActive}
            onClick={onClick}
            href={href}
            scroll={scroll}
            priority={priority}
            icon={
                isMain ? (
                    <LayoutGrid
                        size={26}
                        className="text-theme-primary"
                        strokeWidth={1.5}
                    />
                ) : undefined
            }
        />
    );
};

export default CategoryCard;
