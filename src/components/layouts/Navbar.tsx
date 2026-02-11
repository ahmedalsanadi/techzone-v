//src/components/layouts/navbar.tsx
'use client';
import { usePathname } from '@/i18n/navigation';
import { Search, Menu as MenuIcon, ChevronDown } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { NAV_ITEMS } from '@/config/navigation';

import NavItem from './NavItem';
import { Input } from '../ui/Input';

import { useLocale, useTranslations } from 'next-intl';
import { useUiStore } from '@/store/useUiStore';
import MobileSidebar from './MobileSidebar';
import { useStore } from '@/components/providers/StoreProvider';
import LogoImage from './LogoImage';
import { Menu, MenuButton, MenuItem } from '@headlessui/react';
import { BaseMenuItems } from '../ui/BaseMenuItems';
import { useMemo } from 'react';

import dynamic from 'next/dynamic';

// --- Dynamic Imports with Skeletons ---

const LanguageSwitcher = dynamic(() => import('./LanguageSwitcher'), {
    ssr: false,
    loading: () => (
        <div className="p-2 w-10 h-10 rounded-full bg-white/5 animate-pulse" />
    ),
});

const NotificationDropdown = dynamic(() => import('./NotificationDropdown'), {
    ssr: false,
    loading: () => (
        <div className="p-2 w-10 h-10 rounded-full bg-white/5 animate-pulse" />
    ),
});

const CartDropdown = dynamic(() => import('./CartDropdown'), {
    ssr: false,
    loading: () => (
        <div className="p-2 w-10 h-10 rounded-full bg-white/5 animate-pulse" />
    ),
});

const UserMenu = dynamic(() => import('./UserMenu'), {
    ssr: false,
    loading: () => (
        <div className="px-3 py-1.5 w-[140px] h-10 rounded-full bg-white/10 animate-pulse hidden lg:block" />
    ),
});

export default function Navbar() {
    const pathname = usePathname();
    const t = useTranslations('Navbar');
    const locale = useLocale();
    const { toggleMobileMenu } = useUiStore();
    const { config, cmsPages } = useStore();

    const menuCMSPages = useMemo(
        () => cmsPages.filter((p) => p.show_in_menu),
        [cmsPages],
    );

    const pagesLabel = locale === 'ar' ? 'الصفحات' : 'Pages';

    return (
        <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
                {/*-------- Hamburger (Mobile Only) ----------- */}
                <button
                    onClick={toggleMobileMenu}
                    className="lg:hidden p-2 text-white hover:bg-white/10 rounded-full transition-colors">
                    <MenuIcon size={24} strokeWidth={1.5} />
                </button>

                {/*-------- logo----------- */}
                <LogoImage
                    brandName={config?.store?.name}
                    brandLogo={
                        config?.store?.logo_url || '/images/svgs/logo-icon.svg'
                    }
                />
            </div>
            {/*-------- Navlist----------- */}
            <div className="hidden lg:flex flex-1 items-center justify-center gap-1.5 pt-1 text-nowrap">
                {NAV_ITEMS.map((item) => {
                    const isActive =
                        item.href === '/'
                            ? pathname === '/'
                            : pathname.startsWith(item.href);

                    return (
                        <NavItem
                            key={item.id}
                            id={item.id}
                            label={t(`nav.${item.id}`)}
                            href={item.href}
                            icon={item.icon}
                            isActive={isActive}
                            alt={item.alt}
                        />
                    );
                })}

                {menuCMSPages.length > 0 && (
                    <Menu as="div" className="relative inline-block">
                        <MenuButton className="flex items-center gap-2 py-2 px-3 text-sm font-semibold text-white hover:bg-white/10 transition-colors rounded-lg">
                            <span>{pagesLabel}</span>
                            <ChevronDown className="h-4 w-4 opacity-80" />
                        </MenuButton>
                        <BaseMenuItems
                            anchor="bottom start"
                            className="min-w-[220px] rounded-2xl p-2">
                            {menuCMSPages.map((page) => (
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
                )}
            </div>
            {/*-------- Search----------- */}
            <div className="hidden lg:flex items-center mt-1">
                <Input
                    type="text"
                    placeholder={t('searchPlaceholder')}
                    inputSize="md"
                    startIcon={
                        <Search
                            size={22}
                            strokeWidth={1.5}
                            className="opacity-40"
                        />
                    }
                    containerClassName="w-[270px] xl:w-[340px]"
                />
            </div>
            <div className="relative flex items-center gap-2 h-8">
                <div className="hidden lg:block">
                    <LanguageSwitcher />
                </div>
                <NotificationDropdown />
                <CartDropdown />
                <UserMenu />
            </div>
            {/*-------- Mobile Sidebar ----------- */}
            <MobileSidebar />
        </div>
    );
}
