import React from 'react';
import { Link } from '@/i18n/navigation';
import { LayoutGrid } from 'lucide-react';
import DynamicImage from './DynamicImage';
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
    // Shared fallback image


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

    const defaultContent = (
        <div
            className={cn(
                'flex flex-col items-center w-[85px] md:w-[110px] shrink-0',
                !href && 'cursor-pointer',
            )}>
            <div
                className={cn(
                    'w-full h-full aspect-4/5 md:aspect-square flex flex-col items-center justify-center gap-2 p-3 transition-all duration-300 rounded-2xl relative',
                    isActive
                        ? 'bg-white border-2 border-theme-primary shadow-xl -translate-y-1'
                        : 'bg-white/40 border border-gray-100 group-hover:bg-white group-hover:border-theme-primary-border group-hover:shadow-lg',
                )}>
                {isMain ? (
                    <div className="flex flex-col items-center gap-2 w-full">
                        <div className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-theme-primary/10 rounded-xl group-hover:scale-110 transition-transform">
                            <LayoutGrid
                                size={28}
                                className="text-theme-primary"
                                strokeWidth={1.5}
                            />
                        </div>
                        <span
                            className={cn(
                                'text-[11px] md:text-xs font-bold transition-colors text-center line-clamp-2 px-1',
                                isActive
                                    ? 'text-theme-primary'
                                    : 'text-gray-800 group-hover:text-theme-primary',
                            )}>
                            {label}
                        </span>
                    </div>
                ) : (
                    <>
                        <div className="relative w-10 h-10 md:w-14 md:h-14 transition-transform group-hover:scale-110">
                            <DynamicImage
                                src={image || ''}
                                alt={label}
                                fill
                                priority={priority}
                                className="object-contain"
                                sizes="(max-width: 768px) 40px, 56px"
                            />
                        </div>
                        <span
                            className={cn(
                                'text-[11px] md:text-xs font-bold transition-colors leading-tight text-center line-clamp-2 px-1',
                                isActive
                                    ? 'text-theme-primary'
                                    : 'text-gray-800 group-hover:text-theme-primary',
                            )}>
                            {label}
                        </span>
                    </>
                )}
                {/* Active Indicator Line */}
                {isActive && (
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-theme-primary rounded-full" />
                )}
            </div>
        </div>
    );

    const finalContent = variant === 'circular' ? content : defaultContent;

    if (href) {
        return (
            <Link href={href} scroll={scroll} className="group outline-none">
                {finalContent}
            </Link>
        );
    }

    return (
        <div onClick={onClick} className="group outline-none">
            {finalContent}
        </div>
    );
};

export default CategoryCard;
