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
                    'flex flex-col items-center gap-2 w-[75px] md:w-[90px] shrink-0 p-2 transition-all duration-300 rounded-[20px]',
                    isActive
                        ? 'bg-white border-2 border-theme-primary shadow-md -translate-y-0.5'
                        : 'hover:bg-white/50',
                    !href && 'cursor-pointer',
                )}>
                <div
                    className={cn(
                        'w-14 h-14 md:w-16 md:h-16 rounded-full p-0.5 transition-all duration-300 flex items-center justify-center overflow-hidden bg-white relative',
                        isActive
                            ? 'border-0'
                            : 'border-2 border-white shadow-sm group-hover:border-theme-primary-border',
                    )}>
                    <div className="relative w-full h-full rounded-full overflow-hidden">
                        <DynamicImage
                            src={image || ''}
                            alt={label}
                            fill
                            priority={priority}
                            className="object-cover"
                            sizes="(max-width: 768px) 56px, 64px"
                        />
                    </div>
                </div>
                <span
                    className={cn(
                        'text-[10px] md:text-xs font-bold transition-colors text-center line-clamp-1 px-1',
                        isActive
                            ? 'text-theme-primary'
                            : 'text-gray-600 group-hover:text-gray-900',
                    )}>
                    {label}
                </span>
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
            <div onClick={onClick} className="group outline-none">
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
                        size={28}
                        className="text-theme-primary"
                        strokeWidth={1.5}
                    />
                ) : undefined
            }
        />
    );
};

export default CategoryCard;
