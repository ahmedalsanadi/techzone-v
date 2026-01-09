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
    onClick?: () => void;
    href?: string;
}

const CategoryCard: React.FC<CategoryCardProps> = ({
    label,
    image,
    isMain,
    isActive,
    variant = 'default',
    onClick,
    href,
}) => {
    // ... rest of logic
    // Shared fallback icon
    const FallbackIcon = (
        <LayoutGrid
            className={cn(
                'w-1/2 h-1/2 opacity-20',
                isActive ? 'text-[#B44734]' : 'text-gray-400',
            )}
        />
    );

    const content = (
        <div
            className={cn(
                'flex flex-col items-center gap-3 w-[80px] md:w-[100px] shrink-0',
                !href && 'cursor-pointer',
            )}>
            <div
                className={cn(
                    'w-16 h-16 md:w-20 md:h-20 rounded-full border-2 p-1 transition-all duration-300 flex items-center justify-center overflow-hidden bg-white relative',
                    isActive
                        ? 'border-[#B44734] shadow-lg scale-110 z-10'
                        : 'border-white/50 shadow-sm group-hover:border-[#B44734]/30 group-hover:shadow-md',
                )}>
                <div className="relative w-full h-full rounded-full overflow-hidden">
                    <DynamicImage
                        src={image || ''}
                        alt={label}
                        fill
                        className="object-cover"
                        fallbackComponent={FallbackIcon}
                    />
                </div>
            </div>
            <span
                className={cn(
                    'text-[10px] md:text-sm font-bold transition-colors text-center line-clamp-2 px-1',
                    isActive
                        ? 'text-[#B44734]'
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
                    'w-full aspect-4/5 md:aspect-square flex flex-col items-center justify-center gap-2 p-3 transition-all duration-300 rounded-2xl relative',
                    isActive
                        ? 'bg-white border-2 border-[#B44734] shadow-xl -translate-y-1'
                        : 'bg-white/40 border border-gray-100 group-hover:bg-white group-hover:border-[#B44734]/20 group-hover:shadow-lg',
                )}>
                {isMain ? (
                    <div className="flex flex-col items-center gap-2 w-full">
                        <div className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-[#FEF4F1] rounded-xl group-hover:scale-110 transition-transform">
                            <LayoutGrid
                                size={28}
                                className="text-[#B44734]"
                                strokeWidth={1.5}
                            />
                        </div>
                        <span
                            className={cn(
                                'text-[11px] md:text-xs font-bold transition-colors text-center line-clamp-2 px-1',
                                isActive
                                    ? 'text-[#B44734]'
                                    : 'text-gray-800 group-hover:text-[#B44734]',
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
                                className="object-contain"
                                fallbackComponent={FallbackIcon}
                            />
                        </div>
                        <span
                            className={cn(
                                'text-[11px] md:text-xs font-bold transition-colors leading-tight text-center line-clamp-2 px-1',
                                isActive
                                    ? 'text-[#B44734]'
                                    : 'text-gray-800 group-hover:text-[#B44734]',
                            )}>
                            {label}
                        </span>
                    </>
                )}
                {/* Active Indicator Line */}
                {isActive && (
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-[#B44734] rounded-full" />
                )}
            </div>
        </div>
    );

    const finalContent = variant === 'circular' ? content : defaultContent;

    if (href) {
        return (
            <Link href={href} className="group outline-none">
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
