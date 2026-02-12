import React from 'react';
import { useTranslations } from 'next-intl';
import { Flame, Clock } from 'lucide-react';
import CurrencySymbol from '@/components/ui/CurrencySymbol';
import { Badge } from '@/components/ui/Badge';

interface ProductInfoProps {
    name: string;
    subtitle?: string;
    description: string;
    price: number;
    originalPrice?: number;
    calories?: number;
    prepTime?: number;
    categories?: Array<{ id: number; name: string }>;
}

export default function ProductInfo({
    name,
    subtitle,
    description,
    price,
    originalPrice,
    calories,
    prepTime,
    categories,
}: ProductInfoProps) {
    const t = useTranslations('Product');

    const infoItems = [
        calories && {
            icon: Flame,
            value: `${calories} ${t('calories')}`,
            iconColor: 'text-orange-500',
        },
        prepTime && {
            icon: Clock,
            value: `${prepTime} ${t('prepTime')}`,
            iconColor: 'text-blue-500',
        },
    ].filter(Boolean) as Array<{
        icon: React.ElementType;
        value: string;
        iconColor: string;
    }>;

    const InfoItem = ({ icon: Icon, value, iconColor }: { icon: React.ElementType; value: string; iconColor: string }) => (
        <div className="flex items-center gap-2.5 px-4 py-2 bg-[#F8F9FA] rounded-2xl border border-gray-50">
            <div className={iconColor}>
                <Icon size={20} />
            </div>
            <span className="font-bold text-gray-600">{value}</span>
        </div>
    );

    return (
        <>
            <div className="space-y-5">
                {categories && categories.length > 0 && (
                    <div className="flex gap-2">
                        {categories.map((cat) => (
                            <Badge
                             className="text-md md:text-lg"
                                key={cat.id}
                                variant="primary">{cat.name}</Badge>
                        ))}
                    </div>
                )}

                <p className="text-gray-500 font-medium leading-relaxed text-base max-w-2xl">
                    {description}
                </p>

                <div className="flex items-center gap-4">
                    <div className="flex items-baseline gap-1.5">
                        <span className="text-3xl font-black text-theme-primary">
                            {price}
                        </span>
                        <CurrencySymbol className="w-5 h-5 text-theme-primary" />
                    </div>

                    {originalPrice && originalPrice > price && (
                        <div className="flex items-baseline gap-1 opacity-40 line-through">
                            <span className="text-xl font-bold">
                                {originalPrice}
                            </span>
                            <CurrencySymbol className="w-4 h-4" />
                        </div>
                    )}
                </div>
            </div>

            {infoItems.length > 0 && (
                <div className="flex items-center gap-4 justify-start">
                    {infoItems.map((item, index) => (
                        <InfoItem key={index} {...item} />
                    ))}
                </div>
            )}
        </>
    );
}
