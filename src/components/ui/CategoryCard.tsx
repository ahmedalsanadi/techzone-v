'use client';

import React from 'react';
import Image from 'next/image';
import { LayoutGrid } from 'lucide-react';

interface CategoryCardProps {
    label: string;
    image?: string;
    isMain?: boolean;
    onClick?: () => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({
    label,
    image,
    isMain,
    onClick,
}) => {
    return (
        <div
            onClick={onClick}
            className="flex flex-col items-center min-w-[85px] md:min-w-[110px] group cursor-pointer">
            <div className="w-full aspect-[4/5.2] bg-white border border-gray-200/60 rounded-xl md:rounded-2xl flex flex-col items-center justify-center gap-2.5 p-3 shadow-xs group-hover:shadow-md transition-all group-hover:border-[#B44734]/20">
                {isMain ? (
                    <div className="flex flex-col items-center gap-3 w-full">
                        <div className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center">
                            <LayoutGrid
                                size={32}
                                className="text-[#B44734]"
                                strokeWidth={1.5}
                            />
                        </div>
                        <span className="text-[11px] md:text-sm font-bold text-gray-800 group-hover:text-[#B44734] transition-colors">
                            {label}
                        </span>
                    </div>
                ) : (
                    <>
                        <div className="relative w-10 h-10 md:w-14 md:h-14">
                            <Image
                                src={image || ''}
                                alt={label}
                                fill
                                className="object-contain"
                            />
                        </div>
                        <span className="text-[11px] md:text-sm font-bold text-gray-800 group-hover:text-[#B44734] transition-colors leading-tight">
                            {label}
                        </span>
                    </>
                )}
            </div>
        </div>
    );
};

export default CategoryCard;
