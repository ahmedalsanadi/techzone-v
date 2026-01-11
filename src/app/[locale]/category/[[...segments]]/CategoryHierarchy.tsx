// src/app/[locale]/category/[[...segments]]/CategoryHierarchy.tsx
'use client';

import React, { useMemo } from 'react';
import CategoryCard from '@/components/ui/CategoryCard';
import type { Category } from '@/services/types';
import { getRootCategories, getCategoryUrl } from './utils';

interface CategoryHierarchyProps {
    tree: Category[];
    categoryPath: Category[];
}

/**
 * Renders hierarchical category navigation showing all parent levels.
 * Optimized with memoization and smooth transitions using key-based remounting.
 * The key prop triggers React to remount the component, which naturally triggers CSS animations.
 */
function CategoryHierarchy({ tree, categoryPath }: CategoryHierarchyProps) {
    // Generate a unique key for the current path to trigger animations on change
    const pathKey = useMemo(
        () => categoryPath.map((c) => c.id).join('-') || 'root',
        [categoryPath],
    );

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
                    className="flex items-stretch gap-3 md:gap-4 overflow-x-auto pb-4 pt-2 scrollbar-hide border-b border-gray-100 mb-4 transition-opacity duration-300 justify-start lg:justify-center px-4 -mx-4 md:mx-0"
                    style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-x' }}>
                    {rootCategories.map((c) => (
                        <div key={c.id} className="shrink-0">
                            <CategoryCard
                                label={c.name}
                                image={c.image_url || c.icon_url}
                                href={getCategoryUrl(c)}
                                isActive={c.id.toString() === activeRootId}
                            />
                        </div>
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
                        className="flex items-stretch gap-3 md:gap-4 overflow-x-auto pb-4 pt-2 scrollbar-hide animate-in fade-in slide-in-from-top-2 duration-300 justify-start lg:justify-center px-4 -mx-4 md:mx-0"
                        style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-x' }}>
                        {subCats.map((c) => {
                            const subSlug = c.slug || c.id.toString();
                            const subPath = `${currentPath}/${subSlug}`;
                            const isActive = c.id.toString() === activeSubId;

                            return (
                                <div key={c.id} className="shrink-0">
                                    <CategoryCard
                                        label={c.name}
                                        image={c.image_url || c.icon_url}
                                        href={`/category/${subPath}`}
                                        isActive={isActive}
                                    />
                                </div>
                            );
                        })}
                    </div>,
                );
            }
        });

        return renderedLevels;
    }, [rootCategories, categoryPath]);

    // Use key prop to trigger remount and animation when path changes
    return (
        <div
            key={pathKey}
            className="animate-in fade-in slide-in-from-top-2 duration-300">
            {levels}
        </div>
    );
}

CategoryHierarchy.displayName = 'CategoryHierarchy';

export default React.memo(CategoryHierarchy);
