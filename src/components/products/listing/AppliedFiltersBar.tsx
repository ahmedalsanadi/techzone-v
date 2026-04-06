'use client';

import { useMemo } from 'react';
import type { ProductsFiltersVars } from '@/types/store';
import type { ProductsPageState } from '@/lib/products/listing/listing-state';
import { Button } from '@/components/ui/Button';
import { X } from 'lucide-react';
import { useTranslations } from 'next-intl';

function Chip({
    label,
    onRemove,
}: {
    label: string;
    onRemove: () => void;
}) {
    return (
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 text-gray-800 text-sm">
            <span className="truncate max-w-[240px]">{label}</span>
            <button
                type="button"
                onClick={onRemove}
                className="text-gray-500 hover:text-gray-900">
                <X className="w-4 h-4" />
            </button>
        </div>
    );
}

export function AppliedFiltersBar({
    state,
    vars,
    onResetAll,
    onClearSearch,
    onToggleCategory,
    onToggleBrand,
    onToggleCollection,
    onSetAvailability,
    onSetPriceRange,
    onToggleFlag,
    onClearAttribute,
    onToggleAttributeOption,
}: {
    state: ProductsPageState;
    vars?: ProductsFiltersVars;
    onResetAll: () => void;
    onClearSearch: () => void;
    onToggleCategory: (id: string) => void;
    onToggleBrand: (id: string) => void;
    onToggleCollection: (id: string) => void;
    onSetAvailability: (value?: 'in_stock' | 'out_of_stock' | 'low_stock') => void;
    onSetPriceRange: (min?: number, max?: number) => void;
    onToggleFlag: (key: 'has_discount' | 'has_variants' | 'is_featured' | 'is_latest') => void;
    onClearAttribute: (slug: string) => void;
    onToggleAttributeOption: (slug: string, value: string | number) => void;
}) {
    const t = useTranslations('Product');

    const lookups = useMemo(() => {
        const categories = new Map((vars?.categories ?? []).map((c) => [String(c.id), c.name]));
        const brands = new Map((vars?.brands ?? []).map((b) => [String(b.id), b.name]));
        const collections = new Map((vars?.collections ?? []).map((c) => [String(c.id), c.name]));
        const availability = new Map(
            (vars?.availability_status ?? []).map((a) => [a.value, a.arabic_label || a.label]),
        );
        const attributes = new Map((vars?.attributes ?? []).map((a) => [a.slug, a.name]));
        return { categories, brands, collections, availability, attributes };
    }, [vars]);

    const chips: Array<{ key: string; label: string; onRemove: () => void }> = [];
    const { filters } = state;

    if (filters.search.trim()) {
        chips.push({
            key: 'search',
            label: `${t('search') || 'Search'}: "${filters.search.trim()}"`,
            onRemove: onClearSearch,
        });
    }

    filters.categoryIds.forEach((id) => {
        chips.push({
            key: `cat:${id}`,
            label: lookups.categories.get(id) || `${t('categories') || 'Category'} #${id}`,
            onRemove: () => onToggleCategory(id),
        });
    });

    filters.brandIds.forEach((id) => {
        chips.push({
            key: `brand:${id}`,
            label: lookups.brands.get(id) || `${t('brands') || 'Brand'} #${id}`,
            onRemove: () => onToggleBrand(id),
        });
    });

    filters.collectionIds.forEach((id) => {
        chips.push({
            key: `col:${id}`,
            label: lookups.collections.get(id) || `${t('collections') || 'Collection'} #${id}`,
            onRemove: () => onToggleCollection(id),
        });
    });

    if (filters.availability) {
        chips.push({
            key: `availability:${filters.availability}`,
            label:
                (t('availability') || 'Availability') +
                `: ${lookups.availability.get(filters.availability) || filters.availability}`,
            onRemove: () => onSetAvailability(undefined),
        });
    }

    if (filters.min_price != null || filters.max_price != null) {
        const min = filters.min_price != null ? filters.min_price : '—';
        const max = filters.max_price != null ? filters.max_price : '—';
        chips.push({
            key: 'price',
            label: `${t('price_range') || 'Price'}: ${min} - ${max}`,
            onRemove: () => onSetPriceRange(undefined, undefined),
        });
    }

    (['is_featured', 'is_latest', 'has_discount', 'has_variants'] as const).forEach(
        (k) => {
            if (!filters[k]) return;
            const label =
                k === 'is_featured'
                    ? t('featured') || 'Featured'
                    : k === 'is_latest'
                      ? t('latest') || 'Latest'
                      : k === 'has_discount'
                        ? t('has_discount') || 'On sale'
                        : t('has_variants') || 'Has options';
            chips.push({
                key: `flag:${k}`,
                label,
                onRemove: () => onToggleFlag(k),
            });
        },
    );

    Object.entries(filters.attributes).forEach(([slug, values]) => {
        const attrName = lookups.attributes.get(slug) || slug;
        if (!values?.length) return;
        values.forEach((v) => {
            chips.push({
                key: `attr:${slug}:${String(v)}`,
                label: `${attrName}: ${String(v)}`,
                onRemove: () => onToggleAttributeOption(slug, v),
            });
        });
        chips.push({
            key: `attr-clear:${slug}`,
            label: `${attrName}: ${t('clear') || 'Clear'}`,
            onRemove: () => onClearAttribute(slug),
        });
    });

    if (chips.length === 0) return null;

    return (
        <div className="flex flex-wrap items-center gap-2">
            <div className="text-sm text-gray-500 mr-2">
                {t('appliedFilters') || 'Applied filters'}:
            </div>
            {chips.map((c) => (
                <Chip key={c.key} label={c.label} onRemove={c.onRemove} />
            ))}
            <Button variant="ghost" size="sm" onClick={onResetAll} className="ml-auto">
                {t('clear_all') || 'Clear All'}
            </Button>
        </div>
    );
}

