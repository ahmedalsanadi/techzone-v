'use client';

import { ChevronDown } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { Menu, MenuButton, MenuItem } from '@headlessui/react';
import { BaseMenuItems } from '@/components/ui/BaseMenuItems';
import type { CMSPage } from '@/types/store';

interface PagesNavDropdownProps {
    pages: CMSPage[];
    pagesLabel: string;
}

export default function PagesNavDropdown({
    pages,
    pagesLabel,
}: PagesNavDropdownProps) {
    if (!pages.length) return null;

    return (
        <Menu as="div" className="relative inline-block">
            <MenuButton className="flex items-center gap-2 py-2 px-3 text-sm font-semibold text-white hover:bg-white/10 transition-colors rounded-lg">
                <span>{pagesLabel}</span>
                <ChevronDown className="h-4 w-4 opacity-80" />
            </MenuButton>
            <BaseMenuItems
                anchor="bottom start"
                className="min-w-[220px] rounded-2xl p-2">
                {pages.map((page) => (
                    <MenuItem key={page.id}>
                        <Link
                            href={`/pages/${page.slug}`}
                            className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:text-gray-900">
                            {page.title}
                        </Link>
                    </MenuItem>
                ))}
            </BaseMenuItems>
        </Menu>
    );
}
