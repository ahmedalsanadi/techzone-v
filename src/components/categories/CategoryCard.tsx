'use client';

import React from 'react';
import { Link } from '@/i18n/navigation';
import { LayoutGrid } from 'lucide-react';
import DynamicImage from '../ui/DynamicImage';
import SmallTileCard from '../ui/SmallTileCard';
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
    index?: number;
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
    index = 0,
}) => {
    const animationDelay = `${(index % 9) * 50}ms`;

    if (variant === 'circular') {
        const content = (
            <div
                className={cn(
                    'flex flex-col items-center gap-1.5 w-[72px] sm:w-[80px] md:w-[88px] shrink-0 transition-all duration-300 rounded-xl p-1.5 animate-in fade-in zoom-in-95 duration-500 fill-mode-both',
                    'ring-2 ring-transparent shadow-sm',
                    isActive
                        ? 'bg-white ring-theme-primary shadow-lg shadow-theme-primary/15 scale-[1.02]'
                        : 'bg-transparent group-hover:bg-white/70 group-hover:ring-theme-primary/15 group-hover:shadow-md',
                    !href && onClick && 'cursor-pointer',
                )}
                style={{ animationDelay }}>
                <div
                    className={cn(
                        'w-11 h-11 sm:w-12 sm:h-12 md:w-12 md:h-12 rounded-xl overflow-hidden flex items-center justify-center transition-all duration-300',
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
                            className="object-cover transition-transform duration-300 ease-out group-hover:scale-105"
                            sizes="(max-width: 768px) 56px, 64px"
                        />
                    </div>
                </div>
                <span
                    className={cn(
                        'text-[10px] font-semibold text-center line-clamp-2 px-0.5 transition-colors duration-150 leading-tight',
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
            index={index}
            icon={
                isMain ? (
                    <LayoutGrid
                        size={22}
                        className="text-theme-primary"
                        strokeWidth={1.5}
                    />
                ) : undefined
            }
        />
    );
};

export default CategoryCard;
