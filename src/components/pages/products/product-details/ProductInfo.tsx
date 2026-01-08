import React from 'react';
import { useTranslations } from 'next-intl';
import { Flame } from 'lucide-react';
import CurrencySymbol from '@/components/ui/CurrencySymbol';
import { Badge } from '@/components/ui/Badge';

interface ProductInfoProps {
    name: string;
    subtitle?: string;
    description: string;
    price: number;
    originalPrice?: number;
    calories?: number;
    categories?: Array<{ id: number; name: string }>;
}

export default function ProductInfo({
    name,
    subtitle,
    description,
    price,
    originalPrice,
    calories,
    categories,
}: ProductInfoProps) {
    const t = useTranslations('Product');

    return (
        <div className="space-y-4">
            {categories && categories.length > 0 && (
                <div className="flex gap-2">
                    {categories.map((cat) => (
                        <Badge
                            key={cat.id}
                            variant="secondary"
                            className="bg-gray-100 text-gray-600 border-none">
                            {cat.name}
                        </Badge>
                    ))}
                </div>
            )}

            <div className="space-y-1">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                    {name}
                </h1>
                {subtitle && (
                    <p className="text-lg text-gray-500 font-medium">
                        {subtitle}
                    </p>
                )}
            </div>

            <div className="flex items-center gap-4">
                <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl font-black text-[#B44734]">
                        {price}
                    </span>
                    <CurrencySymbol className="w-5 h-5 text-[#B44734]" />
                </div>

                {originalPrice && originalPrice > price && (
                    <div className="flex items-baseline gap-1 opacity-40 line-through">
                        <span className="text-xl font-bold">
                            {originalPrice}
                        </span>
                        <CurrencySymbol className="w-4 h-4" />
                    </div>
                )}

                {calories && (
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-orange-50 text-orange-600 rounded-full text-sm font-bold">
                        <Flame size={16} />
                        {calories} {t('calories')}
                    </div>
                )}
            </div>

            <p className="text-gray-600 leading-relaxed max-w-2xl">
                {description}
            </p>
        </div>
    );
}
