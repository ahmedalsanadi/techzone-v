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
    Heart,
    Share2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProductDetailsProps {
    product: Product;
}

export default function ProductDetails({ product }: ProductDetailsProps) {
    const t = useTranslations('Product');

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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
                {/* Gallery Column */}
                <div className="order-2 lg:order-1 sticky top-24 col-span-1">
                    <ProductGallery images={product.images} />
                </div>

                {/* Info Column */}
                <div className="flex flex-col gap-8 order-1 lg:order-2 col-span-1 lg:col-span-2 p-2">
                    <div className="flex items-center justify-end gap-3">
                        {/* share button and faviorate buttons with text and icons*/}
                        <button
                            className="bg-white border-gray-200 text-gray-600 hover:bg-gray-50 flex items-center gap-2.5 px-5 py-2 rounded-md h-auto transition-all group shadow-sm cursor-pointer">

                            <Share2
                                size={16}
                                className="text-gray-400 group-hover:text-libero-red transition-colors"
                            />
                            <span className="text-sm font-bold">
                                {t('share')}
                            </span>

                        </button>
                        <button
                            
                            className="bg-white border-gray-200 text-gray-600 hover:bg-gray-50 flex items-center gap-2.5 px-5 py-2 rounded-md h-auto transition-all group shadow-sm cursor-pointer">
                          <Heart
                                size={16}
                                className="text-gray-400 group-hover:text-libero-red transition-colors"
                            />
                            <span className="text-sm font-bold">
                                {t('favorite')}
                            </span>

                        </button>
                    </div>
                    <div className="space-y-4">
                        <h1 className="text-2xl  font-medium tracking-tight text-gray-900 leading-tight">
                            {product.name}
                        </h1>
                        <p className="text-gray-600 font-medium leading-relaxed text-sm  max-w-2xl">
                            {product.description}
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2.5 px-4 py-2 bg-gray-50  rounded-2xl border border-gray-100">
                            <div className="text-orange-500">
                                <Flame size={20} />
                            </div>
                            <span className="font-semibold text-gray-700">
                                {selectedVariety.calories || product.calories}{' '}
                                {t('calories')}
                            </span>
                        </div>
                        <div className="flex items-center gap-2.5 px-4 py-2 bg-gray-50  rounded-2xl border border-gray-100 ">
                            <div className="text-blue-500">
                                <Clock size={20} />
                            </div>
                            <span className="font-semibold text-gray-700">
                                {selectedVariety.prepTime || product.prepTime}{' '}
                                {t('prepTime')}
                            </span>
                        </div>
                    </div>

                    {/* Allergy Info Card */}
                    <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />

                        <div className="relative">
                            <div className="flex items-center gap-3 mb-6 text-gray-900">
                                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
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
                                        className="flex items-center gap-2.5 bg-gray-50 hover:bg-gray-100 px-4 py-2.5 rounded-2xl border border-gray-100 transition-colors">
                                        <span className="text-xl">
                                            {allergy.icon}
                                        </span>
                                        <span className="text-sm font-semibold text-gray-600">
                                            {allergy.name}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Action Bar */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mt-2">
                        <div className="flex-1 bg-white p-2 rounded-3xl shadow-xl border border-gray-100 flex items-center gap-2">
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

                            <div className="flex items-center gap-4 px-4 bg-gray-100 h-[72px] rounded-2xl">
                                <button
                                    onClick={() =>
                                        setQuantity((prev) =>
                                            Math.max(1, prev - 1),
                                        )
                                    }
                                    disabled={quantity <= 1}
                                    className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-gray-500 shadow-sm disabled:opacity-30 disabled:shadow-none hover:text-libero-red transition-all">
                                    <Minus size={24} strokeWidth={3} />
                                </button>
                                <span className="w-8 text-center text-2xl font-black text-gray-900">
                                    {quantity}
                                </span>
                                <button
                                    onClick={() =>
                                        setQuantity((prev) => prev + 1)
                                    }
                                    className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-gray-500 shadow-sm hover:text-libero-red transition-all">
                                    <Plus size={24} strokeWidth={3} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Customization Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Size Selection */}
                <div className="flex flex-col gap-6 bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between">
                        <h3 className="text-2xl font-bold">{t('size')}</h3>
                        <span className="bg-red-50 text-red-500 px-4 py-1 rounded-full text-sm font-bold border border-red-100">
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
                                            ? 'border-libero-red bg-libero-red/3'
                                            : 'border-gray-50 bg-white hover:border-gray-200',
                                    )}>
                                    <div className="flex items-center gap-4 relative z-10">
                                        <div
                                            className={cn(
                                                'w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all',
                                                isSelected
                                                    ? 'border-libero-red bg-libero-red/10'
                                                    : 'border-gray-300',
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
                                            <span className="text-xl font-black text-gray-900">
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
                <div className="flex flex-col gap-6 bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center justify-between">
                            <h3 className="text-2xl font-bold">
                                {t('addons')}
                            </h3>
                            <span className="bg-gray-50 text-gray-500 px-4 py-1 rounded-full text-sm font-bold border border-gray-100">
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

                    <div className="space-y-1 divide-y divide-gray-50">
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
                                                    : 'border-gray-200 group-hover:border-gray-300',
                                            )}>
                                            {isSelected && (
                                                <Check
                                                    size={18}
                                                    strokeWidth={3}
                                                />
                                            )}
                                        </div>
                                        <span className="text-lg font-bold text-gray-700 transition-colors group-hover:text-black">
                                            {addon.name}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg font-black text-gray-900">
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
                <div className="flex flex-col gap-6 bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between">
                        <h3 className="text-2xl font-bold">{t('sauce')}</h3>
                        <span className="bg-gray-50 text-gray-500 px-4 py-1 rounded-full text-sm font-bold border border-gray-100">
                            {t('optional')}
                        </span>
                    </div>

                    <div className="space-y-1 divide-y divide-gray-50">
                        {product.sauces.map((sauce) => {
                            const qty = selectedSauces[sauce.id] || 0;
                            return (
                                <div
                                    key={sauce.id}
                                    className="flex items-center justify-between py-4 group">
                                    <span className="text-lg font-bold text-gray-700 transition-colors group-hover:text-black">
                                        {sauce.name}
                                    </span>

                                    <div className="flex items-center gap-4">
                                        <span className="text-lg font-black text-gray-900 group-hover:text-libero-red">
                                            + {sauce.price} {t('currency')}
                                        </span>

                                        <div className="flex items-center gap-3 bg-gray-50 p-1.5 rounded-2xl border border-gray-100">
                                            <button
                                                onClick={() =>
                                                    updateSauceQuantity(
                                                        sauce.id,
                                                        -1,
                                                    )
                                                }
                                                disabled={qty === 0}
                                                className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-gray-500 shadow-sm disabled:opacity-20 transition-all hover:text-red-500">
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
                                                className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-gray-500 shadow-sm transition-all hover:text-libero-red">
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
        </div>
    );
}
