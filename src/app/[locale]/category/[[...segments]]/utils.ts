// src/app/[locale]/category/[[...segments]]/utils.ts
import type { Category } from '@/services/types';

/**
 * Builds the full path from root to current category based on URL segments.
 */
export function buildCategoryPath(
    tree: Category[],
    segments: string[],
): Category[] {
    const path: Category[] = [];
    let currentLevel = tree;

    for (const slug of segments) {
        const found = currentLevel.find((c) => c.slug && c.slug === slug);
        if (found) {
            path.push(found);
            currentLevel = found.children || [];
        } else {
            break;
        }
    }

    return path;
}

/**
 * Traverses the tree based on the URL segments to find the target category.
 */
export function findCategoryByPath(
    nodes: Category[],
    segments: string[],
): Category | null {
    let currentLevel = nodes;
    let found: Category | null = null;
    for (const slug of segments) {
        found = currentLevel.find((c) => c.slug === slug) || null;
        if (!found) return null;
        currentLevel = found.children || [];
    }
    return found;
}

/**
 * Gets root categories (categories with no parent).
 */
export function getRootCategories(tree: Category[]): Category[] {
    return tree.filter(
        (cat) => cat.parent_id === null || cat.parent_id === undefined,
    );
}

/**
 * Generates a category URL path from category path array.
 */
export function getCategoryUrl(
    category: Category,
    basePath: string = '',
): string {
    const slug = category.slug || category.id.toString();
    return basePath ? `/category/${basePath}/${slug}` : `/category/${slug}`;
}

/**
 * Normalizes URL segments from useParams.
 */
export function normalizeSegments(
    segments: string | string[] | undefined,
): string[] {
    if (!segments) return [];
    return Array.isArray(segments) ? segments : [segments];
}
