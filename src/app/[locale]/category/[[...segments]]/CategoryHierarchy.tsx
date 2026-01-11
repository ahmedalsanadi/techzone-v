// src/app/[locale]/category/[[...segments]]/CategoryHierarchy.tsx
'use client';

import React, { useMemo, useEffect, useState } from 'react';
import CategoryCard from '@/components/ui/CategoryCard';
import type { Category } from '@/services/types';
import { getRootCategories, getCategoryUrl } from './utils';
import { TRANSITIONS } from './constants';

interface CategoryHierarchyProps {
    tree: Category[];
    categoryPath: Category[];
}

/**
 * Renders hierarchical category navigation showing all parent levels.
 * Optimized with memoization and smooth transitions.
 */
function CategoryHierarchy({ tree, categoryPath }: CategoryHierarchyProps) {
    const [isVisible, setIsVisible] = useState(true);
    const [prevCategoryPath, setPrevCategoryPath] =
        useState<Category[]>(categoryPath);

    // Detect category path changes for smooth transitions
    useEffect(() => {
        const pathChanged =
            prevCategoryPath.length !== categoryPath.length ||
            prevCategoryPath.some(
                (cat, idx) => cat.id !== categoryPath[idx]?.id,
            );

        if (pathChanged) {
            setTimeout(() => {
                setIsVisible(false);
            }, 0);
            const timer = setTimeout(() => {
                setIsVisible(true);
                setPrevCategoryPath(categoryPath);
            }, 50); // Brief delay for fade-out

            return () => clearTimeout(timer);
        }
    }, [categoryPath, prevCategoryPath]);

    // Memoize root categories - they don't change
    const rootCategories = useMemo(() => getRootCategories(tree), [tree]);

    // Memoize hierarchical levels rendering
    const levels = useMemo(() => {
        const renderedLevels: React.ReactElement[] = [];

        // Level 1: Always show root categories at the top
        if (rootCategories.length > 0) {
            const activeRootId = categoryPath[0]?.id.toString();
            renderedLevels.push(
                <div
                    key="root"
                    className="flex flex-wrap justify-center items-stretch gap-3 md:gap-4 overflow-x-auto pt-2 pb-4 scrollbar-hide border-b border-gray-100 mb-4 transition-opacity duration-300">
                    {rootCategories.map((c) => (
                        <CategoryCard
                            key={c.id}
                            label={c.name}
                            image={c.image_url || c.icon_url}
                            href={getCategoryUrl(c)}
                            isActive={c.id.toString() === activeRootId}
                        />
                    ))}
                </div>,
            );
        }

        // Level 2+: Show subcategories for each level in the path
        categoryPath.forEach((category, index) => {
            const subCats = category.children || [];
            if (subCats.length > 0) {
                const currentPath = categoryPath
                    .slice(0, index + 1)
                    .map((c) => c.slug || c.id.toString())
                    .join('/');

                const nextCategoryInPath = categoryPath[index + 1];
                const activeSubId = nextCategoryInPath?.id.toString();

                renderedLevels.push(
                    <div
                        key={`level-${index}`}
                        className="flex flex-wrap justify-center items-stretch gap-3 md:gap-4 overflow-x-auto pt-2 pb-4 scrollbar-hide animate-in fade-in slide-in-from-top-2 duration-300">
                        {subCats.map((c) => {
                            const subSlug = c.slug || c.id.toString();
                            const subPath = `${currentPath}/${subSlug}`;
                            const isActive = c.id.toString() === activeSubId;

                            return (
                                <CategoryCard
                                    key={c.id}
                                    label={c.name}
                                    image={c.image_url || c.icon_url}
                                    href={`/category/${subPath}`}
                                    isActive={isActive}
                                />
                            );
                        })}
                    </div>,
                );
            }
        });

        return renderedLevels;
    }, [rootCategories, categoryPath]);

    return (
        <div
            className={`transition-all ${
                isVisible
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-2'
            }`}
            style={{
                transitionDuration: `${TRANSITIONS.CATEGORY_SLIDE_DURATION}ms`,
            }}>
            {levels}
        </div>
    );
}

CategoryHierarchy.displayName = 'CategoryHierarchy';

export default React.memo(CategoryHierarchy);
