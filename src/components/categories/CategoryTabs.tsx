// src/components/pages/products/CategoryTabs.tsx
'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Category } from '@/types/store';
import CategoryCard from '@/components/ui/CategoryCard';
import { useTranslations } from 'next-intl';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CategoryTabsProps {
    categories: Category[];
    activeCategoryId: string;
    onCategorySelect: (id: string) => void;
}

const CategoryTabs: React.FC<CategoryTabsProps> = ({
    categories,
    activeCategoryId,
}) => {
    const t = useTranslations('Category');
    const scrollRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);
    const [isOverflowing, setIsOverflowing] = useState(false);

    const updateScrollState = useCallback(() => {
        const el = scrollRef.current;
        if (!el) return;

        const { scrollWidth, clientWidth } = el;
        const overflows = scrollWidth > clientWidth + 2;
        setIsOverflowing(overflows);

        if (!overflows || el.children.length === 0) {
            setCanScrollLeft(false);
            setCanScrollRight(false);
            return;
        }

        const cr = el.getBoundingClientRect();
        const firstRect = el.children[0].getBoundingClientRect();
        const lastRect =
            el.children[el.children.length - 1].getBoundingClientRect();

        const leftEdge = Math.min(firstRect.left, lastRect.left);
        const rightEdge = Math.max(firstRect.right, lastRect.right);

        setCanScrollLeft(leftEdge < cr.left - 2);
        setCanScrollRight(rightEdge > cr.right + 2);
    }, []);

    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;

        updateScrollState();
        el.addEventListener('scroll', updateScrollState, { passive: true });

        const ro = new ResizeObserver(updateScrollState);
        ro.observe(el);

        return () => {
            el.removeEventListener('scroll', updateScrollState);
            ro.disconnect();
        };
    }, [updateScrollState, categories.length]);

    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;

        const idx =
            activeCategoryId === 'all'
                ? 0
                : categories.findIndex(
                      (c) => c.id.toString() === activeCategoryId,
                  ) + 1;

        const child = el.children[idx] as HTMLElement | undefined;
        if (!child) return;

        requestAnimationFrame(() => {
            const cr = el.getBoundingClientRect();
            const tr = child.getBoundingClientRect();

            if (tr.left < cr.left + 48 || tr.right > cr.right - 48) {
                child.scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest',
                    inline: 'center',
                });
            }
        });
    }, [activeCategoryId, categories]);

    const handleScroll = useCallback((direction: 'left' | 'right') => {
        const el = scrollRef.current;
        if (!el) return;

        const amount = el.clientWidth * 0.6;
        el.scrollBy({
            left: direction === 'right' ? amount : -amount,
            behavior: 'smooth',
        });
    }, []);

    return (
        <div className="relative">
            {/* Left edge: gradient + arrow (lg+ only) */}
            <div
                className={cn(
                    'hidden lg:flex absolute inset-y-0 left-0 z-10 items-center pointer-events-none transition-opacity duration-300',
                    canScrollLeft ? 'opacity-100' : 'opacity-0',
                )}
                aria-hidden={!canScrollLeft}>
                <div className="absolute inset-y-0 left-0 w-20 bg-linear-to-r from-white via-white/70 to-transparent" />
                <button
                    onClick={() => handleScroll('left')}
                    className={cn(
                        'pointer-events-auto relative ml-2 size-8 rounded-full bg-white/90 backdrop-blur-sm shadow-md border border-gray-200/60',
                        'flex items-center justify-center',
                        'hover:bg-white hover:shadow-lg hover:scale-110 active:scale-95 transition-all duration-200',
                        !canScrollLeft && 'pointer-events-none',
                    )}
                    aria-label="Scroll left"
                    tabIndex={canScrollLeft ? 0 : -1}>
                    <ChevronLeft size={16} className="text-gray-500" />
                </button>
            </div>

            {/* Scrollable tabs container */}
            <div
                ref={scrollRef}
                className={cn(
                    'flex items-center gap-3 md:gap-4 overflow-x-auto py-2 scrollbar-hide rtl justify-start px-4 -mx-4 md:mx-0',
                    !isOverflowing && 'lg:justify-center',
                )}>
                {/* All Products Tab */}
                <CategoryCard
                    label={t('all_products') || 'كل المنتجات'}
                    isMain={true}
                    isActive={activeCategoryId === 'all'}
                    href="/categories"
                    scroll={false}
                />

                {/* Category Tabs */}
                {categories.map((cat, index) => (
                    <CategoryCard
                        key={cat.id}
                        label={cat.name}
                        image={cat.icon_url || cat.image_url}
                        isActive={activeCategoryId === cat.id.toString()}
                        href={`/categories/${cat.slug || cat.id}`}
                        scroll={false}
                        index={index + 1}
                    />
                ))}
            </div>

            {/* Right edge: gradient + arrow (lg+ only) */}
            <div
                className={cn(
                    'hidden lg:flex absolute inset-y-0 right-0 z-10 items-center justify-end pointer-events-none transition-opacity duration-300',
                    canScrollRight ? 'opacity-100' : 'opacity-0',
                )}
                aria-hidden={!canScrollRight}>
                <div className="absolute inset-y-0 right-0 w-20 bg-linear-to-l from-white via-white/70 to-transparent" />
                <button
                    onClick={() => handleScroll('right')}
                    className={cn(
                        'pointer-events-auto relative mr-2 size-8 rounded-full bg-white/90 backdrop-blur-sm shadow-md border border-gray-200/60',
                        'flex items-center justify-center',
                        'hover:bg-white hover:shadow-lg hover:scale-110 active:scale-95 transition-all duration-200',
                        !canScrollRight && 'pointer-events-none',
                    )}
                    aria-label="Scroll right"
                    tabIndex={canScrollRight ? 0 : -1}>
                    <ChevronRight size={16} className="text-gray-500" />
                </button>
            </div>
        </div>
    );
};

export default CategoryTabs;
