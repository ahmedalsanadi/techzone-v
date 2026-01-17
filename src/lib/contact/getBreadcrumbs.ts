/**
 * Utility to generate breadcrumbs for contact page
 */

import type { Branch } from '@/types/branches';

interface BreadcrumbItem {
    label: string;
    href: string;
    active?: boolean;
}

export function getContactBreadcrumbs(
    t: (key: string) => string,
    branch: Branch | null,
    branchId?: string,
): BreadcrumbItem[] {
    const items: BreadcrumbItem[] = [
        { label: t('home'), href: '/' },
        { label: t('title'), href: '/contact', active: !branch },
    ];

    if (branch) {
        items[1].active = false;
        items.push({
            label: branch.name,
            href: `/contact?branch_id=${branchId}`,
            active: true,
        });
    }

    return items;
}
