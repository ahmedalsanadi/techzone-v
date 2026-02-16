//src/services/cms-service.ts
import { fetchLibero } from '@/lib/api';
import { CMSPage } from '@/types/store';
import { CACHE_STRATEGY, CACHE_TAGS } from '@/config/cache';

/**
 * Service for CMS pages data fetching.
 */
export const cmsService = {
    /**
     * Get all CMS pages (minimal data).
     * Used for building menus and footers.
     */
    getPages: () =>
        fetchLibero<CMSPage[]>('/store/pages', {
            next: {
                revalidate: CACHE_STRATEGY.CMS_PAGES_LIST,
                tags: [CACHE_TAGS.CMS_PAGES],
            },
        }),

    /**
     * Get a single CMS page by Its slug (full data).
     */
    getPage: (slug: string) =>
        fetchLibero<CMSPage>(`/store/pages/${slug}`, {
            next: {
                revalidate: CACHE_STRATEGY.CMS_PAGE_SINGLE,
                tags: [CACHE_TAGS.CMS_PAGE(slug)],
            },
        }),
};
