'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Checkbox } from '@/components/ui/CheckboxField';
import type { ProductsFiltersVars } from '@/types/store';
import type { ProductsPageState } from '../types';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronUp } from 'lucide-react';

function parseNumberOrUndefined(value: string): number | undefined {
    const trimmed = value.trim();
    if (!trimmed) return undefined;
    const n = Number(trimmed);
    return Number.isFinite(n) ? n : undefined;
}

export function ProductsFiltersSidebar({
    vars,
    isLoading,
    state,
    onReset,
    onSearchChange,
    onToggleCategory,
    onToggleBrand,
    onToggleCollection,
    onToggleFlag,
    onSetAvailability,
    onSetPriceRange,
    onToggleAttributeOption,
    onClearAttribute,
}: {
    vars: ProductsFiltersVars | undefined;
    isLoading?: boolean;
    state: ProductsPageState;
    onReset: () => void;
    onSearchChange: (value: string) => void;
    onToggleCategory: (id: string) => void;
    onToggleBrand: (id: string) => void;
    onToggleCollection: (id: string) => void;
    onToggleFlag: (
        key: 'has_discount' | 'has_variants' | 'is_featured' | 'is_latest',
    ) => void;
    onSetAvailability: (
        value?: 'in_stock' | 'out_of_stock' | 'low_stock',
    ) => void;
    onSetPriceRange: (min?: number, max?: number) => void;
    onToggleAttributeOption: (slug: string, value: string | number) => void;
    onClearAttribute: (slug: string) => void;
}) {
    const t = useTranslations('Product');
    const [searchDraft, setSearchDraft] = useState(() => state.filters.search);
    const [minDraft, setMinDraft] = useState<string>(() =>
        state.filters.min_price != null ? String(state.filters.min_price) : '',
    );
    const [maxDraft, setMaxDraft] = useState<string>(() =>
        state.filters.max_price != null ? String(state.filters.max_price) : '',
    );

    const [collapsed, setCollapsed] = useState<Record<string, boolean>>({
        search: false,
        categories: false,
        price: false,
        quick: false,
        availability: false,
    });

    const toggleCollapsed = (key: string) => {
        setCollapsed((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    // Note: drafts are reset by parent changing the component key on URL navigation.

    // Debounce search
    useEffect(() => {
        // Prevent pagination/reset loops: only fire when the draft differs from applied state.
        if (searchDraft === state.filters.search) return;
        const id = window.setTimeout(() => onSearchChange(searchDraft), 350);
        return () => window.clearTimeout(id);
    }, [searchDraft, state.filters.search, onSearchChange]);

    const priceBounds = useMemo(() => {
        const min = vars?.min_price ?? 0;
        const max = vars?.max_price ?? 1000;
        return { min, max };
    }, [vars?.min_price, vars?.max_price]);

    const applyPrice = () => {
        onSetPriceRange(
            parseNumberOrUndefined(minDraft),
            parseNumberOrUndefined(maxDraft),
        );
    };

    return (
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between gap-3">
                <div className="text-lg font-semibold text-gray-900">
                    {t('filters') || 'Filters'}
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onReset}
                    className="text-red-500 hover:text-red-600">
                    {t('clear_all') || 'Clear All'}
                </Button>
            </div>

            <div className="space-y-3">
                <button
                    onClick={() => toggleCollapsed('search')}
                    className="flex items-center justify-between w-full text-sm font-medium text-gray-800 hover:text-primary transition-colors">
                    <span>{t('search') || 'Search'}</span>
                    {collapsed.search ? (
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                    ) : (
                        <ChevronUp className="w-4 h-4 text-gray-400" />
                    )}
                </button>
                {!collapsed.search && (
                    <Input
                        value={searchDraft}
                        onChange={(e) => setSearchDraft(e.target.value)}
                        placeholder={
                            t('searchPlaceholder') || 'Search products...'
                        }
                        variant="default"
                        inputSize="md"
                        containerClassName="rounded-xl border-gray-200 shadow-none bg-gray-50/50"
                    />
                )}
            </div>

            <div className="space-y-3">
                <button
                    onClick={() => toggleCollapsed('categories')}
                    className="flex items-center justify-between w-full text-sm font-medium text-gray-800 hover:text-primary transition-colors">
                    <span>{t('categories') || 'Categories'}</span>
                    {collapsed.categories ? (
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                    ) : (
                        <ChevronUp className="w-4 h-4 text-gray-400" />
                    )}
                </button>
                {!collapsed.categories && (
                    <div className="space-y-2 max-h-64 overflow-auto pr-2 custom-scrollbar">
                        {isLoading ? (
                            <>
                                {Array.from({ length: 6 }).map((_, i) => (
                                    <div
                                        key={i}
                                        className="flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-6 h-6 bg-gray-100 rounded-md animate-pulse" />
                                            <div className="h-4 bg-gray-100 rounded animate-pulse w-32" />
                                        </div>
                                        <div className="h-3 bg-gray-100 rounded animate-pulse w-6" />
                                    </div>
                                ))}
                            </>
                        ) : (
                            <>
                                {(vars?.categories ?? []).map((cat) => {
                                    const id = String(cat.id);
                                    const checked =
                                        state.filters.categoryIds.includes(id);
                                    return (
                                        <label
                                            key={cat.id}
                                            className="flex items-center justify-between gap-3 cursor-pointer select-none group">
                                            <div className="flex items-center gap-3">
                                                <Checkbox
                                                    checked={checked}
                                                    onCheckedChange={() =>
                                                        onToggleCategory(id)
                                                    }
                                                />
                                                <span
                                                    className={cn(
                                                        'text-sm transition-colors',
                                                        checked
                                                            ? 'text-primary font-medium'
                                                            : 'text-gray-600 group-hover:text-gray-900',
                                                    )}>
                                                    {cat.name}
                                                </span>
                                            </div>
                                            <span className="text-xs text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded">
                                                {cat.count}
                                            </span>
                                        </label>
                                    );
                                })}
                                {!vars?.categories?.length ? (
                                    <div className="text-sm text-gray-400 py-2">
                                        {t('noCategories') || 'No categories'}
                                    </div>
                                ) : null}
                            </>
                        )}
                    </div>
                )}
            </div>

            <div className="space-y-3">
                <button
                    onClick={() => toggleCollapsed('price')}
                    className="flex items-center justify-between w-full text-sm font-medium text-gray-800 hover:text-primary transition-colors">
                    <span>{t('price_range') || 'Price range'}</span>
                    {collapsed.price ? (
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                    ) : (
                        <ChevronUp className="w-4 h-4 text-gray-400" />
                    )}
                </button>
                {!collapsed.price && (
                    <div className="space-y-4 pt-1">
                        <div className="grid grid-cols-2 gap-3">
                            <Input
                                type="number"
                                min={priceBounds.min}
                                max={priceBounds.max}
                                value={minDraft}
                                onChange={(e) => setMinDraft(e.target.value)}
                                placeholder={`${t('min') || 'Min'} (${priceBounds.min})`}
                                containerClassName="rounded-xl border-gray-200 shadow-none bg-gray-50/30"
                                inputSize="md"
                            />
                            <Input
                                type="number"
                                min={priceBounds.min}
                                max={priceBounds.max}
                                value={maxDraft}
                                onChange={(e) => setMaxDraft(e.target.value)}
                                placeholder={`${t('max') || 'Max'} (${priceBounds.max})`}
                                containerClassName="rounded-xl border-gray-200 shadow-none bg-gray-50/30"
                                inputSize="md"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outlineTint"
                                size="sm"
                                onClick={applyPrice}
                                className="flex-1">
                                {t('apply') || 'Apply'}
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    setMinDraft('');
                                    setMaxDraft('');
                                    onSetPriceRange(undefined, undefined);
                                }}
                                className="text-gray-400 hover:text-gray-600">
                                {t('reset') || 'Reset'}
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            <div className="space-y-3">
                <button
                    onClick={() => toggleCollapsed('quick')}
                    className="flex items-center justify-between w-full text-sm font-medium text-gray-800 hover:text-primary transition-colors">
                    <span>{t('quick_filters') || 'Quick filters'}</span>
                    {collapsed.quick ? (
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                    ) : (
                        <ChevronUp className="w-4 h-4 text-gray-400" />
                    )}
                </button>
                {!collapsed.quick && (
                    <div className="space-y-2 pt-1">
                        <label className="flex items-center justify-between gap-3 cursor-pointer select-none group">
                            <div className="flex items-center gap-3">
                                <Checkbox
                                    checked={!!state.filters.is_featured}
                                    onCheckedChange={() =>
                                        onToggleFlag('is_featured')
                                    }
                                />
                                <span className="text-sm text-gray-600 group-hover:text-gray-900">
                                    {t('featured') || 'Featured'}
                                </span>
                            </div>
                        </label>
                        <label className="flex items-center justify-between gap-3 cursor-pointer select-none group">
                            <div className="flex items-center gap-3">
                                <Checkbox
                                    checked={!!state.filters.is_latest}
                                    onCheckedChange={() =>
                                        onToggleFlag('is_latest')
                                    }
                                />
                                <span className="text-sm text-gray-600 group-hover:text-gray-900">
                                    {t('latest') || 'Latest'}
                                </span>
                            </div>
                        </label>
                        <label className="flex items-center justify-between gap-3 cursor-pointer select-none group">
                            <div className="flex items-center gap-3">
                                <Checkbox
                                    checked={!!state.filters.has_discount}
                                    onCheckedChange={() =>
                                        onToggleFlag('has_discount')
                                    }
                                />
                                <span className="text-sm text-gray-600 group-hover:text-gray-900">
                                    {t('has_discount') || 'On sale'}
                                </span>
                            </div>
                        </label>
                        <label className="flex items-center justify-between gap-3 cursor-pointer select-none group">
                            <div className="flex items-center gap-3">
                                <Checkbox
                                    checked={!!state.filters.has_variants}
                                    onCheckedChange={() =>
                                        onToggleFlag('has_variants')
                                    }
                                />
                                <span className="text-sm text-gray-600 group-hover:text-gray-900">
                                    {t('has_variants') || 'Has options'}
                                </span>
                            </div>
                        </label>
                    </div>
                )}
            </div>

            <div className="space-y-3">
                <button
                    onClick={() => toggleCollapsed('availability')}
                    className="flex items-center justify-between w-full text-sm font-medium text-gray-800 hover:text-primary transition-colors">
                    <span>{t('availability') || 'Availability'}</span>
                    {collapsed.availability ? (
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                    ) : (
                        <ChevronUp className="w-4 h-4 text-gray-400" />
                    )}
                </button>
                {!collapsed.availability && (
                    <div className="space-y-2 pt-1">
                        <label className="flex items-center justify-between gap-3 cursor-pointer select-none group">
                            <div className="flex items-center gap-3">
                                <span
                                    className={cn(
                                        'w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors',
                                        state.filters.availability == null
                                            ? 'border-primary'
                                            : 'border-gray-200 group-hover:border-gray-300',
                                    )}>
                                    <span
                                        className={cn(
                                            'w-2.5 h-2.5 rounded-full transition-all',
                                            state.filters.availability == null
                                                ? 'bg-primary scale-100'
                                                : 'bg-transparent scale-0',
                                        )}
                                    />
                                </span>
                                <input
                                    className="sr-only"
                                    type="radio"
                                    name="availability"
                                    checked={state.filters.availability == null}
                                    onChange={() =>
                                        onSetAvailability(undefined)
                                    }
                                />
                                <span
                                    className={cn(
                                        'text-sm transition-colors',
                                        state.filters.availability == null
                                            ? 'text-primary font-medium'
                                            : 'text-gray-600 group-hover:text-gray-900',
                                    )}>
                                    {t('all') || 'All'}
                                </span>
                            </div>
                        </label>
                        {(vars?.availability_status ?? []).map((opt) => {
                            const checked =
                                state.filters.availability === opt.value;
                            return (
                                <label
                                    key={opt.value}
                                    className="flex items-center justify-between gap-3 cursor-pointer select-none group">
                                    <div className="flex items-center gap-3">
                                        <span
                                            className={cn(
                                                'w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors',
                                                checked
                                                    ? 'border-primary'
                                                    : 'border-gray-200 group-hover:border-gray-300',
                                            )}>
                                            <span
                                                className={cn(
                                                    'w-2.5 h-2.5 rounded-full transition-all',
                                                    checked
                                                        ? 'bg-primary scale-100'
                                                        : 'bg-transparent scale-0',
                                                )}
                                            />
                                        </span>
                                        <input
                                            className="sr-only"
                                            type="radio"
                                            name="availability"
                                            checked={checked}
                                            onChange={() =>
                                                onSetAvailability(
                                                    (opt.value as
                                                        | 'in_stock'
                                                        | 'out_of_stock'
                                                        | 'low_stock') ??
                                                        undefined,
                                                )
                                            }
                                        />
                                        <span
                                            className={cn(
                                                'text-sm transition-colors',
                                                checked
                                                    ? 'text-primary font-medium'
                                                    : 'text-gray-600 group-hover:text-gray-900',
                                            )}>
                                            {opt.arabic_label || opt.label}
                                        </span>
                                    </div>
                                    <span className="text-xs text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded">
                                        {opt.count}
                                    </span>
                                </label>
                            );
                        })}
                        {!vars?.availability_status?.length ? (
                            <div className="text-sm text-gray-400 py-2">
                                {t('notAvailable') || 'Not available'}
                            </div>
                        ) : null}
                    </div>
                )}
            </div>

            {/* Dynamic attributes */}
            {(vars?.attributes?.length ?? 0) > 0 ? (
                <details className="group" open>
                    <summary className="cursor-pointer list-none flex items-center justify-between w-full text-sm font-medium text-gray-800 hover:text-primary transition-colors">
                        <span>{t('attributes') || 'Attributes'}</span>
                        <ChevronDown className="w-4 h-4 text-gray-400 group-open:rotate-180 transition-transform" />
                    </summary>
                    <div className="mt-3 space-y-4">
                        {vars!.attributes.map((attr) => {
                            const selected =
                                state.filters.attributes[attr.slug] || [];
                            return (
                                <div
                                    key={attr.slug}
                                    className="border border-gray-100 rounded-xl p-3">
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="text-sm font-medium text-gray-800">
                                            {attr.name}
                                        </div>
                                        {selected.length ? (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() =>
                                                    onClearAttribute(attr.slug)
                                                }>
                                                {t('clear') || 'Clear'}
                                            </Button>
                                        ) : null}
                                    </div>
                                    <div className="mt-2 space-y-2 max-h-48 overflow-auto pr-2 custom-scrollbar">
                                        {attr.options.map((opt) => {
                                            const checked = selected.some(
                                                (v) =>
                                                    String(v) ===
                                                    String(opt.value),
                                            );
                                            return (
                                                <label
                                                    key={String(opt.value)}
                                                    className="flex items-center justify-between gap-3 cursor-pointer select-none">
                                                    <div className="flex items-center gap-3">
                                                        <Checkbox
                                                            checked={checked}
                                                            onCheckedChange={() =>
                                                                onToggleAttributeOption(
                                                                    attr.slug,
                                                                    opt.value,
                                                                )
                                                            }
                                                        />
                                                        <span className="text-sm text-gray-700">
                                                            {String(opt.value)}
                                                        </span>
                                                    </div>
                                                    <span className="text-xs text-gray-400">
                                                        {opt.count}
                                                    </span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </details>
            ) : null}

            {/* Optional groups: brands / collections */}
            {(vars?.brands?.length ?? 0) > 0 ? (
                <details className="group">
                    <summary className="cursor-pointer list-none flex items-center justify-between w-full text-sm font-medium text-gray-800 hover:text-primary transition-colors">
                        <span>{t('brands') || 'Brands'}</span>
                        <ChevronDown className="w-4 h-4 text-gray-400 group-open:rotate-180 transition-transform" />
                    </summary>
                    <div className="mt-3 space-y-2 max-h-56 overflow-auto pr-2 custom-scrollbar">
                        {vars!.brands.map((b) => {
                            const id = String(b.id);
                            const checked = state.filters.brandIds.includes(id);
                            return (
                                <label
                                    key={b.id}
                                    className="flex items-center justify-between gap-3 cursor-pointer select-none">
                                    <div className="flex items-center gap-3">
                                        <Checkbox
                                            checked={checked}
                                            onCheckedChange={() =>
                                                onToggleBrand(id)
                                            }
                                        />
                                        <span className="text-sm text-gray-700">
                                            {b.name}
                                        </span>
                                    </div>
                                    <span className="text-xs text-gray-400">
                                        {b.count}
                                    </span>
                                </label>
                            );
                        })}
                    </div>
                </details>
            ) : null}

            {(vars?.collections?.length ?? 0) > 0 ? (
                <details className="group">
                    <summary className="cursor-pointer list-none flex items-center justify-between w-full text-sm font-medium text-gray-800 hover:text-primary transition-colors">
                        <span>{t('collections') || 'Collections'}</span>
                        <ChevronDown className="w-4 h-4 text-gray-400 group-open:rotate-180 transition-transform" />
                    </summary>
                    <div className="mt-3 space-y-2 max-h-56 overflow-auto pr-2 custom-scrollbar">
                        {vars!.collections.map((c) => {
                            const id = String(c.id);
                            const checked =
                                state.filters.collectionIds.includes(id);
                            return (
                                <label
                                    key={c.id}
                                    className="flex items-center justify-between gap-3 cursor-pointer select-none">
                                    <div className="flex items-center gap-3">
                                        <Checkbox
                                            checked={checked}
                                            onCheckedChange={() =>
                                                onToggleCollection(id)
                                            }
                                        />
                                        <span className="text-sm text-gray-700">
                                            {c.name}
                                        </span>
                                    </div>
                                    <span className="text-xs text-gray-400">
                                        {c.count}
                                    </span>
                                </label>
                            );
                        })}
                    </div>
                </details>
            ) : null}
        </div>
    );
}
