'use client';

import React, { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Product } from '@/lib/mock-data';
import { Share2, Heart, Flame, Clock, Info, Plus, Minus, Check, Trash2 } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import CurrencySymbol from '@/components/ui/CurrencySymbol';
import Breadcrumbs from '@/components/ui/Breadcrumbs';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

interface ProductDetailsProps {
    product: Product;
}

// CustomizationCard Component (used internally)
interface CustomizationCardProps {
    title: string;
    badge?: { text: string; variant: 'required' | 'optional' };
    description?: string;
    children: React.ReactNode;
}

const CustomizationCard = ({ title, badge, description, children }: CustomizationCardProps) => (
    <div className="border border-gray-100 rounded-2xl bg-white p-5 sm:p-6 flex flex-col gap-4 h-fit shadow-sm">
        <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2.5">
                    <h3 className="text-lg font-bold text-gray-900">{title}</h3>
                    {badge && (
                        <span className={cn(
                            "text-xs font-bold px-2.5 py-0.5 rounded-full",
                            badge.variant === 'required'
                                ? "bg-red-50 text-red-700"
                                : "bg-gray-100 text-gray-700"
                        )}>
                            {badge.text}
                        </span>
                    )}
                </div>
                {description && (
                    <p className="text-sm text-gray-500 font-medium">{description}</p>
                )}
            </div>
        </div>
        <div className="pt-1">{children}</div>
    </div>
);

export default function FigmaDesign({ product }: ProductDetailsProps) {
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

    const handleAddToCart = () => {
        console.log('Added to cart:', {
            product,
            selectedVariety,
            selectedAddons,
            selectedSauces,
            quantity,
            totalPrice: calculateTotalPrice(),
        });
    };

    // ProductShareActions Component (inline)
    const ProductShareActions = () => {
        const actions = [
            { label: t('share'), icon: Share2 },
            { label: t('favorite'), icon: Heart },
        ];

        const ActionButton = ({ icon: Icon, label }: { icon: React.ElementType; label: string }) => (
            <button className="bg-white border border-gray-100 text-gray-600 hover:bg-gray-50 flex items-center gap-1.5 sm:gap-2.5 px-3 py-2 sm:px-5 sm:py-2.5 rounded-md sm:rounded-xl transition-all group shadow-sm cursor-pointer">
                <Icon className="w-4 h-4 sm:w-[18px] sm:h-[18px] text-gray-400 group-hover:text-libero-red transition-colors" />
                <span className="text-xs sm:text-sm font-bold">{label}</span>
            </button>
        );

        return (
            <div className="flex items-center justify-end gap-2 sm:gap-3">
                <div className="flex items-center gap-2 sm:gap-3">
                    {actions.map((action, index) => (
                        <ActionButton key={index} {...action} />
                    ))}
                </div>
                <div className="hidden lg:flex items-center gap-2 text-sm text-gray-400 font-medium">
                    {/* Breadcrumbs placeholder */}
                </div>
            </div>
        );
    };

    // ProductInfo Component (inline)
    const ProductInfo = () => {
        const infoItems = [
            {
                icon: Flame,
                value: `${selectedVariety.calories || product.calories} ${t('calories')}`,
                iconColor: 'text-orange-500',
            },
            {
                icon: Clock,
                value: `${selectedVariety.prepTime || product.prepTime} ${t('prepTime')}`,
                iconColor: 'text-blue-500',
            },
        ];

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
                <div className="space-y-5 ">
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 leading-tight">
                        {product.name}
                    </h1>
                    <p className="text-gray-500 font-medium leading-relaxed text-base max-w-2xl">
                        {product.description}
                    </p>
                </div>

                <div className="flex items-center gap-4 justify-start ">
                    {infoItems.map((item, index) => (
                        <InfoItem key={index} {...item} />
                    ))}
                </div>
            </>
        );
    };

    // ProductAllergies Component (inline)
    const ProductAllergies = () => {
        if (!product.allergies || product.allergies.length === 0) return null;

        const AllergyItem = ({ allergy }: { allergy: any }) => (
            <div className="flex items-center gap-2 group transition-all">
                <span className="text-xs font-bold text-gray-400 group-hover:text-gray-600">
                    {allergy.name}
                </span>
                <span className="text-xl group-hover:scale-110 transition-transform">
                    {allergy.icon}
                </span>
            </div>
        );

        return (
            <div className="space-y-4 pt-4">
                <div className="flex items-center gap-2 text-gray-900 justify-start">
                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                        <Info size={18} />
                    </div>
                    <h3 className="text-base font-bold">{t('allergies')}</h3>
                </div>

                <div className="flex flex-wrap gap-6 justify-start">
                    {product.allergies.map((allergy, idx) => (
                        <AllergyItem key={idx} allergy={allergy} />
                    ))}
                </div>
            </div>
        );
    };

    // ProductActionBar Component (inline)
    const ProductActionBar = () => {
        const QtyButton = ({ icon: Icon, onClick, disabled }: { icon: React.ElementType; onClick: () => void; disabled?: boolean }) => (
            <button
                onClick={onClick}
                disabled={disabled}
                className="w-9 h-9 rounded-lg bg-white flex items-center justify-center text-gray-600 hover:text-[#B44B3A] transition-all shadow-sm disabled:opacity-30 active:scale-95 cursor-pointer">
                <Icon className="w-3.5 h-3.5" strokeWidth={3} />
            </button>
        );

        const handleIncrement = () => setQuantity((prev) => prev + 1);
        const handleDecrement = () => setQuantity((prev) => Math.max(1, prev - 1));

        return (
            <div className="border-t border-gray-200 pt-8 mt-auto">
                <div className="flex items-center justify-end gap-4">
                    {/* Quantity Selector */}
                    <div className="flex items-center bg-[#F1F3F5] rounded-lg p-1.5 shadow-inner">
                        <QtyButton
                            icon={Minus}
                            onClick={handleDecrement}
                            disabled={quantity <= 1}
                        />
                        <span className="w-12 text-center text-lg font-bold text-gray-800">
                            {quantity}
                        </span>

                        <QtyButton icon={Plus} onClick={handleIncrement} />
                    </div>

                    {/* Add to Cart Button */}
                    <button
                        onClick={handleAddToCart}
                        className="flex items-center justify-between gap-12 max-w-[260px] bg-[#B44B3A] hover:bg-[#A04234] text-white
                         px-5 py-2.5 rounded-lg transition-all active:scale-[0.98] shadow-lg shadow-[#B44B3A]/10 group cursor-pointer">
                        <span className="text-sm sm:text-lg font-bold">
                            {t('addToCart')}
                        </span>
                        <div className="flex items-center gap-2 sm:gap-2.5">
                            {selectedVariety.originalPrice && (
                                <div className="flex items-center gap-1 opacity-60">
                                    <span className="text-[10px] sm:text-sm line-through font-bold">
                                        {selectedVariety.originalPrice * quantity}
                                    </span>
                                    <CurrencySymbol className="brightness-0 invert w-2.5 h-2.5" />
                                </div>
                            )}

                            <div className="flex items-center gap-1">
                                <span className="text-base sm:text-xl font-black">
                                    {calculateTotalPrice()}
                                </span>
                                <CurrencySymbol className="brightness-0 invert w-3.5 h-3.5 sm:w-5 sm:h-5" />
                            </div>
                        </div>
                    </button>
                </div>
            </div>
        );
    };

    // ProductGallery Component (inline)
    const ProductGallery = () => (
        <div className="relative w-full aspect-video md:aspect-square rounded-3xl overflow-hidden group">
            <Swiper
                modules={[Navigation, Pagination]}
                navigation={{
                    nextEl: '.swiper-button-next-custom',
                    prevEl: '.swiper-button-prev-custom',
                }}
                pagination={{ clickable: true }}
                className="w-full h-full">
                {product.images.map((image, index) => (
                    <SwiperSlide key={index}>
                        <div className="relative w-full h-full">
                            <Image
                                src={image}
                                alt={`Product image ${index + 1}`}
                                fill
                                className="object-cover"
                                priority={index === 0}
                            />
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>

            {/* Custom Navigation Arrows */}
            <button className="swiper-button-prev-custom absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/50 hover:bg-white/80 rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round">
                    <path d="m15 18-6-6 6-6" />
                </svg>
            </button>
            <button className="swiper-button-next-custom absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/50 hover:bg-white/80 rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round">
                    <path d="m9 18 6-6-6-6" />
                </svg>
            </button>

            <style jsx global>{`
                .swiper-pagination-bullet {
                    background: white !important;
                    opacity: 0.5;
                }
                .swiper-pagination-bullet-active {
                    background: #f04e30 !important;
                    opacity: 1;
                }
            `}</style>
        </div>
    );

    // SizeSelector Component (inline)
    const SizeSelector = () => {
        const VarietyItem = ({ v, isSelected }: { v: any; isSelected: boolean }) => (
            <label className="flex items-center justify-between py-3 cursor-pointer group hover:bg-gray-50 -mx-2 px-2 rounded-xl transition-colors">
                <div className="flex items-center gap-3">
                    <div
                        className={cn(
                            'w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all',
                            isSelected
                                ? 'border-libero-red bg-white'
                                : 'border-gray-200 group-hover:border-gray-300',
                        )}>
                        {isSelected && (
                            <div className="w-2.5 h-2.5 rounded-full bg-libero-red shadow-[0_0_8px_rgba(180,75,58,0.3)]" />
                        )}
                    </div>
                    <div className="flex flex-col gap-0.5">
                        <span
                            className={cn(
                                'text-md font-bold transition-colors',
                                isSelected ? 'text-gray-900' : 'text-gray-700',
                            )}>
                            {v.name}
                        </span>
                        {(v.calories || v.prepTime) && (
                            <div className="flex items-center gap-2 mt-0.5">
                                {v.calories && (
                                    <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100/50">
                                        {v.calories} {t('calories')}
                                    </span>
                                )}
                                {v.prepTime && (
                                    <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100/50">
                                        {v.prepTime} {t('prepTime')}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex flex-col items-end">
                        <div className="flex items-center gap-1">
                            <span className="text-md font-bold text-gray-900 leading-none">
                                {v.price}
                            </span>
                            <CurrencySymbol className="w-3.5 h-3.5" />
                        </div>
                        {v.originalPrice && (
                            <div className="flex items-center gap-1 opacity-60">
                                <span className="text-[12px] text-gray-500 line-through font-semibold leading-none">
                                    {v.originalPrice}
                                </span>
                                <CurrencySymbol className="w-3 h-3" />
                            </div>
                        )}
                    </div>
                </div>

                <input
                    type="radio"
                    className="hidden"
                    checked={isSelected}
                    onChange={() => setSelectedVarietyId(v.id)}
                />
            </label>
        );

        return (
            <CustomizationCard
                title={t('size')}
                badge={{ text: t('required'), variant: 'required' }}>
                <div className="flex flex-col divide-y divide-gray-50">
                    {product.varieties.map((v) => (
                        <VarietyItem
                            key={v.id}
                            v={v}
                            isSelected={selectedVarietyId === v.id}
                        />
                    ))}
                </div>
            </CustomizationCard>
        );
    };

    // AddonSelector Component (inline)
    const AddonSelector = () => {
        const AddonItem = ({ addon, isSelected }: { addon: any; isSelected: boolean }) => (
            <label className="flex items-center justify-between py-3 cursor-pointer group hover:bg-gray-50/50 -mx-2 px-2 rounded-xl transition-colors">
                <div className="flex items-center gap-3">
                    <div
                        className={cn(
                            'w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all',
                            isSelected
                                ? 'border-libero-red bg-libero-red text-white'
                                : 'border-gray-200 group-hover:border-gray-300',
                        )}>
                        {isSelected && <Check size={14} strokeWidth={3} />}
                    </div>
                    <span
                        className={cn(
                            'text-md font-bold transition-colors',
                            isSelected ? 'text-gray-900' : 'text-gray-700',
                        )}>
                        {addon.name}
                    </span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="text-md font-bold text-gray-900 leading-none">
                        + {addon.price}
                    </span>
                    <CurrencySymbol className="w-4 h-4" />
                </div>
                <input
                    type="checkbox"
                    className="hidden"
                    checked={isSelected}
                    onChange={() => toggleAddon(addon.id)}
                />
            </label>
        );

        return (
            <CustomizationCard
                title={t('addons')}
                badge={{ text: t('optional'), variant: 'optional' }}
                description={t('maxAddons', {
                    max: 8,
                    current: selectedAddons.length,
                })}>
                <div className="flex flex-col divide-y divide-gray-50">
                    {product.addons.map((addon) => (
                        <AddonItem
                            key={addon.id}
                            addon={addon}
                            isSelected={selectedAddons.includes(addon.id)}
                        />
                    ))}
                </div>
            </CustomizationCard>
        );
    };

    // SauceSelector Component (inline)
    const SauceSelector = () => {
        const SauceItem = ({ sauce, qty }: { sauce: any; qty: number }) => (
            <div className="flex items-center justify-between py-3 group hover:bg-gray-50/50 -mx-2 px-2 rounded-xl transition-colors">
                <span className="text-sm sm:text-base font-bold text-gray-700 transition-colors group-hover:text-gray-900">
                    {sauce.name}
                </span>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                        <span className="text-md font-bold text-gray-800 leading-none">
                            + {sauce.price}
                        </span>
                        <CurrencySymbol className="w-4 h-4" />
                    </div>

                    <div className="flex items-center gap-2 bg-[#F1F3F5] p-1 rounded-lg shadow-inner">
                        <button
                            onClick={() => updateSauceQuantity(sauce.id, -1)}
                            className={cn(
                                'w-7 h-7 rounded-md bg-white flex items-center justify-center transition-all shadow-sm active:scale-95',
                                qty === 0
                                    ? 'opacity-30 cursor-not-allowed'
                                    : 'text-gray-600 hover:text-red-500',
                            )}
                            disabled={qty === 0}>
                            {qty === 1 ? (
                                <Trash2 size={13} />
                            ) : (
                                <Minus size={13} strokeWidth={3} />
                            )}
                        </button>
                        <span className="w-5 text-center font-bold text-base text-gray-800">
                            {qty}
                        </span>
                        <button
                            onClick={() => updateSauceQuantity(sauce.id, 1)}
                            className="w-7 h-7 rounded-md bg-white flex items-center justify-center text-gray-600 hover:text-libero-red transition-all shadow-sm active:scale-95">
                            <Plus size={13} strokeWidth={3} />
                        </button>
                    </div>
                </div>
            </div>
        );

        return (
            <CustomizationCard
                title={t('sauce')}
                badge={{ text: t('optional'), variant: 'optional' }}>
                <div className="flex flex-col divide-y divide-gray-50">
                    {product.sauces.map((sauce) => (
                        <SauceItem
                            key={sauce.id}
                            sauce={sauce}
                            qty={selectedSauces[sauce.id] || 0}
                        />
                    ))}
                </div>
            </CustomizationCard>
        );
    };

    return (
        <div className="flex flex-col gap-16 pb-24 relative pt-4 px-2 md:px-4">
            <div className="flex flex-col gap-6">
                {/* Breadcrumbs */}
                <Breadcrumbs
                    items={[
                        { label: t('home'), href: '/' },
                        { label: t('products'), href: '/products' },
                        { label: product.name },
                    ]}
                />

                {/* Top Section: Info & Image */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-stretch">
                    {/* Info Column */}
                    <div className="lg:col-span-7 flex flex-col gap-8 order-2 ">
                        <ProductShareActions />
                        <ProductInfo />
                        <ProductAllergies />
                        <ProductActionBar />
                    </div>

                    {/* Gallery Column */}
                    <div className="lg:col-span-5 order-1 ">
                        <div className="sticky top-24">
                            <ProductGallery />
                        </div>
                    </div>
                </div>
            </div>

            {/* Customization Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <SizeSelector />
                <AddonSelector />
                <SauceSelector />
            </div>
        </div>
    );
}