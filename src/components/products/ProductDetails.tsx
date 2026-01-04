'use client';

import React, { useState, useMemo } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import Image from 'next/image';
import {
    Product,
    ProductVariety,
    ProductAddon,
    ProductSauce,
} from '@/lib/mock-data';
import ProductGallery from './ProductGallery';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
    Flame,
    Clock,
    Info,
    Check,
    Plus,
    Minus,
    Trash2,
    MessageCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProductDetailsProps {
    product: Product;
}

export default function ProductDetails({ product }: ProductDetailsProps) {
    const t = useTranslations('Product');
    const locale = useLocale();
    const isAr = locale === 'ar';

    const [selectedVarietyId, setSelectedVarietyId] = useState<string>(
        product.varieties.find((v) => v.isDefault)?.id ||
            product.varieties[0].id,
    );
    const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
    const [selectedSauces, setSelectedSauces] = useState<
        Record<string, number>
    >({});
    const [quantity, setQuantity] = useState(1);

    const selectedVariety = useMemo(
        () => product.varieties.find((v) => v.id === selectedVarietyId)!,
        [selectedVarietyId, product.varieties],
    );

    const calculateTotalPrice = () => {
        let price = selectedVariety.price;

        // Addons
        selectedAddons.forEach((id) => {
            const addon = product.addons.find((a) => a.id === id);
            if (addon) price += addon.price;
        });

        // Sauces
        Object.entries(selectedSauces).forEach(([id, qty]) => {
            const sauce = product.sauces.find((s) => s.id === id);
            if (sauce) price += sauce.price * qty;
        });

        return price * quantity;
    };

    const toggleAddon = (id: string) => {
        setSelectedAddons((prev) =>
            prev.includes(id)
                ? prev.filter((item) => item !== id)
                : [...prev, id],
        );
    };

    const updateSauceQuantity = (id: string, delta: number) => {
        setSelectedSauces((prev) => {
            const current = prev[id] || 0;
            const next = Math.max(0, current + delta);
            if (next === 0) {
                const { [id]: _, ...rest } = prev;
                return rest;
            }
            return { ...prev, [id]: next };
        });
    };

    return (
        <div className="flex flex-col gap-10 pb-24 relative">
            {/* Top Section: Info & Image */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                {/* Info Column */}
                <div className="flex flex-col gap-8 order-2 lg:order-1">
                    <div className="space-y-4">
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 dark:text-white leading-tight">
                            {product.name}
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 text-lg md:text-xl leading-relaxed max-w-2xl">
                            {product.description}
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2.5 px-4 py-2 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700">
                            <div className="text-orange-500">
                                <Flame size={20} />
                            </div>
                            <span className="font-semibold text-gray-700 dark:text-gray-200">
                                {selectedVariety.calories || product.calories}{' '}
                                {t('calories')}
                            </span>
                        </div>
                        <div className="flex items-center gap-2.5 px-4 py-2 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700">
                            <div className="text-blue-500">
                                <Clock size={20} />
                            </div>
                            <span className="font-semibold text-gray-700 dark:text-gray-200">
                                {selectedVariety.prepTime || product.prepTime}{' '}
                                {t('prepTime')}
                            </span>
                        </div>
                    </div>

                    {/* Allergy Info Card */}
                    <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] p-8 border border-gray-100 dark:border-gray-700 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50 dark:bg-gray-700/30 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />

                        <div className="relative">
                            <div className="flex items-center gap-3 mb-6 text-gray-900 dark:text-gray-100">
                                <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/40 flex items-center justify-center text-blue-600">
                                    <Info size={18} />
                                </div>
                                <h3 className="text-xl font-bold">
                                    {t('allergies')}
                                </h3>
                            </div>

                            <div className="flex flex-wrap gap-3">
                                {product.allergies.map((allergy, idx) => (
                                    <div
                                        key={idx}
                                        className="flex items-center gap-2.5 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 px-4 py-2.5 rounded-2xl border border-gray-100 dark:border-gray-600 transition-colors">
                                        <span className="text-xl">
                                            {allergy.icon}
                                        </span>
                                        <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">
                                            {allergy.name}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Action Bar */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mt-2">
                        <div className="flex-1 bg-white dark:bg-gray-800 p-2 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 flex items-center gap-2">
                            <div className="flex-1 bg-libero-red hover:bg-libero-red/90 text-white rounded-2xl p-4 flex items-center justify-between transition-all active:scale-[0.98] cursor-pointer shadow-lg shadow-libero-red/20 group">
                                <div className="flex flex-col">
                                    <span className="text-2xl font-black">
                                        {calculateTotalPrice()} {t('currency')}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 font-black text-xl">
                                    {t('addToCart')}
                                    <Plus className="group-hover:rotate-90 transition-transform" />
                                </div>
                            </div>

                            <div className="flex items-center gap-4 px-4 bg-gray-100 dark:bg-gray-700 h-[72px] rounded-2xl">
                                <button
                                    onClick={() =>
                                        setQuantity((prev) =>
                                            Math.max(1, prev - 1),
                                        )
                                    }
                                    disabled={quantity <= 1}
                                    className="w-10 h-10 rounded-xl bg-white dark:bg-gray-600 flex items-center justify-center text-gray-500 shadow-sm disabled:opacity-30 disabled:shadow-none hover:text-libero-red transition-all">
                                    <Minus size={24} strokeWidth={3} />
                                </button>
                                <span className="w-8 text-center text-2xl font-black text-gray-900 dark:text-white">
                                    {quantity}
                                </span>
                                <button
                                    onClick={() =>
                                        setQuantity((prev) => prev + 1)
                                    }
                                    className="w-10 h-10 rounded-xl bg-white dark:bg-gray-600 flex items-center justify-center text-gray-500 shadow-sm hover:text-libero-red transition-all">
                                    <Plus size={24} strokeWidth={3} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Gallery Column */}
                <div className="order-1 lg:order-2 sticky top-24">
                    <ProductGallery images={product.images} />
                </div>
            </div>

            {/* Customization Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Size Selection */}
                <div className="flex flex-col gap-6 bg-white dark:bg-gray-800 rounded-[2.5rem] p-8 border border-gray-100 dark:border-gray-700 shadow-sm">
                    <div className="flex items-center justify-between">
                        <h3 className="text-2xl font-bold">{t('size')}</h3>
                        <span className="bg-red-50 dark:bg-red-900/20 text-red-500 px-4 py-1 rounded-full text-sm font-bold border border-red-100 dark:border-red-900/30">
                            {t('required')}
                        </span>
                    </div>

                    <div className="space-y-4">
                        {product.varieties.map((v) => {
                            const isSelected = selectedVarietyId === v.id;
                            return (
                                <label
                                    key={v.id}
                                    className={cn(
                                        'flex items-center justify-between p-5 rounded-3xl border-2 transition-all cursor-pointer relative overflow-hidden group',
                                        isSelected
                                            ? 'border-libero-red bg-libero-red/[0.03] dark:bg-libero-red/[0.05]'
                                            : 'border-gray-50 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-200',
                                    )}>
                                    <div className="flex items-center gap-4 relative z-10">
                                        <div
                                            className={cn(
                                                'w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all',
                                                isSelected
                                                    ? 'border-libero-red bg-libero-red/10'
                                                    : 'border-gray-300 dark:border-gray-600',
                                            )}>
                                            {isSelected && (
                                                <div className="w-3 h-3 rounded-full bg-libero-red" />
                                            )}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-xl font-bold">
                                                {v.name}
                                            </span>
                                            <span className="text-sm text-gray-400 font-medium">
                                                {v.calories} {t('calories')} •{' '}
                                                {v.prepTime} {t('prepTime')}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-end relative z-10">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xl font-black text-gray-900 dark:text-white">
                                                {v.price} {t('currency')}
                                            </span>
                                            {v.originalPrice && (
                                                <span className="text-sm text-gray-400 line-through font-bold">
                                                    {v.originalPrice}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <input
                                        type="radio"
                                        className="hidden"
                                        checked={isSelected}
                                        onChange={() =>
                                            setSelectedVarietyId(v.id)
                                        }
                                    />
                                </label>
                            );
                        })}
                    </div>
                </div>

                {/* Extras / Addons Selection */}
                <div className="flex flex-col gap-6 bg-white dark:bg-gray-800 rounded-[2.5rem] p-8 border border-gray-100 dark:border-gray-700 shadow-sm">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center justify-between">
                            <h3 className="text-2xl font-bold">
                                {t('addons')}
                            </h3>
                            <span className="bg-gray-50 dark:bg-gray-700 text-gray-500 px-4 py-1 rounded-full text-sm font-bold border border-gray-100 dark:border-gray-600">
                                {t('optional')}
                            </span>
                        </div>
                        <p className="text-sm font-medium text-gray-400">
                            {t('maxAddons', {
                                max: 8,
                                current: selectedAddons.length,
                            })}
                        </p>
                    </div>

                    <div className="space-y-1 divide-y divide-gray-50 dark:divide-gray-700/50">
                        {product.addons.map((addon) => {
                            const isSelected = selectedAddons.includes(
                                addon.id,
                            );
                            return (
                                <label
                                    key={addon.id}
                                    className="flex items-center justify-between py-4 group cursor-pointer">
                                    <div className="flex items-center gap-4">
                                        <div
                                            className={cn(
                                                'w-7 h-7 rounded-xl border-2 flex items-center justify-center transition-all',
                                                isSelected
                                                    ? 'border-libero-red bg-libero-red text-white'
                                                    : 'border-gray-200 dark:border-gray-600 group-hover:border-gray-300',
                                            )}>
                                            {isSelected && (
                                                <Check
                                                    size={18}
                                                    strokeWidth={3}
                                                />
                                            )}
                                        </div>
                                        <span className="text-lg font-bold text-gray-700 dark:text-gray-200 transition-colors group-hover:text-black dark:group-hover:text-white">
                                            {addon.name}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg font-black text-gray-900 dark:text-white">
                                            + {addon.price} {t('currency')}
                                        </span>
                                    </div>
                                    <input
                                        type="checkbox"
                                        className="hidden"
                                        checked={isSelected}
                                        onChange={() => toggleAddon(addon.id)}
                                    />
                                </label>
                            );
                        })}
                    </div>
                </div>

                {/* Sauce Selection */}
                <div className="flex flex-col gap-6 bg-white dark:bg-gray-800 rounded-[2.5rem] p-8 border border-gray-100 dark:border-gray-700 shadow-sm">
                    <div className="flex items-center justify-between">
                        <h3 className="text-2xl font-bold">{t('sauce')}</h3>
                        <span className="bg-gray-50 dark:bg-gray-700 text-gray-500 px-4 py-1 rounded-full text-sm font-bold border border-gray-100 dark:border-gray-600">
                            {t('optional')}
                        </span>
                    </div>

                    <div className="space-y-1 divide-y divide-gray-50 dark:divide-gray-700/50">
                        {product.sauces.map((sauce) => {
                            const qty = selectedSauces[sauce.id] || 0;
                            return (
                                <div
                                    key={sauce.id}
                                    className="flex items-center justify-between py-4 group">
                                    <span className="text-lg font-bold text-gray-700 dark:text-gray-200 transition-colors group-hover:text-black dark:group-hover:text-white">
                                        {sauce.name}
                                    </span>

                                    <div className="flex items-center gap-4">
                                        <span className="text-lg font-black text-gray-900 dark:text-white group-hover:text-libero-red">
                                            + {sauce.price} {t('currency')}
                                        </span>

                                        <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-700/50 p-1.5 rounded-2xl border border-gray-100 dark:border-gray-600">
                                            <button
                                                onClick={() =>
                                                    updateSauceQuantity(
                                                        sauce.id,
                                                        -1,
                                                    )
                                                }
                                                disabled={qty === 0}
                                                className="w-8 h-8 rounded-xl bg-white dark:bg-gray-600 flex items-center justify-center text-gray-500 shadow-sm disabled:opacity-20 transition-all hover:text-red-500">
                                                {qty === 1 ? (
                                                    <Trash2 size={16} />
                                                ) : (
                                                    <Minus
                                                        size={16}
                                                        strokeWidth={3}
                                                    />
                                                )}
                                            </button>
                                            <span className="w-5 text-center font-black text-lg">
                                                {qty}
                                            </span>
                                            <button
                                                onClick={() =>
                                                    updateSauceQuantity(
                                                        sauce.id,
                                                        1,
                                                    )
                                                }
                                                className="w-8 h-8 rounded-xl bg-white dark:bg-gray-600 flex items-center justify-center text-gray-500 shadow-sm transition-all hover:text-libero-red">
                                                <Plus
                                                    size={16}
                                                    strokeWidth={3}
                                                />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Floating Buttons Mockup (as shown in image) */}
            <div className="fixed bottom-8 left-8 flex flex-col gap-4 z-40 pointer-events-none">
                <button className="w-16 h-16 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform cursor-pointer pointer-events-auto shadow-green-500/20">
                    <svg
                        viewBox="0 0 24 24"
                        width="32"
                        height="32"
                        fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.659 1.432 5.63 1.433h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                </button>
                <button className="w-16 h-16 bg-[#F04E30] text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform cursor-pointer pointer-events-auto shadow-red-500/20">
                    <MessageCircle size={32} fill="white" />
                </button>
            </div>
        </div>
    );
}
