//src/components/layouts/navbar.tsx
'use client';
import { usePathname } from '@/i18n/navigation';
import { Search, Menu as MenuIcon, LogIn } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { NAV_ITEMS } from '@/config/navigation';

import NavItem from './NavItem';
import { Input } from '../ui/Input';

import { useLocale, useTranslations } from 'next-intl';
import { useUiStore } from '@/store/useUiStore';
import MobileSidebar from './MobileSidebar';
import { useStore } from '@/components/providers/StoreProvider';
import LogoImage from './LogoImage';
import { useMemo } from 'react';

import dynamic from 'next/dynamic';
import { useAuthStore } from '@/store/useAuthStore';

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

const PagesNavDropdown = dynamic(() => import('./PagesNavDropdown'), {
    ssr: false,
    loading: () => (
        <div
            className="flex items-center gap-2 py-2 px-3 text-sm font-semibold text-white rounded-lg min-w-[100px] h-9 bg-white/10 animate-pulse"
            aria-hidden
        />
    ),
});

export default function Navbar() {
    const pathname = usePathname();
    const t = useTranslations('Navbar');
    const locale = useLocale();
    const { toggleMobileMenu } = useUiStore();
    const { config, cmsPages } = useStore();
    const { isAuthenticated } = useAuthStore();
    const menuCMSPages = useMemo(
        () => cmsPages.filter((p) => p.show_in_menu),
        [cmsPages],
    );

    const pagesLabel = locale === 'ar' ? 'الصفحات' : 'Pages';

    return (
        <>
            {/* -------- Row 1: Brand, Search, Actions (balanced spacing) -------- */}
            <div className="flex items-center justify-between gap-4 min-h-12 mt-1.5">
                <div className="flex items-center gap-3 min-w-0 shrink-0">
                    <button
                        onClick={toggleMobileMenu}
                        className="lg:hidden p-2 text-white hover:bg-white/10 rounded-full transition-colors">
                        <MenuIcon size={24} strokeWidth={1.5} />
                    </button>
                    <LogoImage
                        brandName={config?.store?.name}
                        brandLogo={
                            config?.store?.logo_url ||
                            '/images/svgs/logo-icon.svg'
                        }
                    />
                </div>

                <div className="hidden lg:flex flex-1 justify-center min-w-0 max-w-md ">
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
                        containerClassName="w-full w-1/2"
                    />
                </div>

                <div className="relative flex items-center gap-2 min-h-10 shrink-0">
                    <div className="hidden lg:block">
                        <LanguageSwitcher />
                    </div>
                    <NotificationDropdown />
                    <CartDropdown />
                    {isAuthenticated ? (
                        <UserMenu />
                    ) : (
                        <Link
                            href="/auth"
                            aria-label={t('signIn')}
                            className="flex items-center justify-center gap-2 shrink-0 size-10 md:size-auto md:h-10 md:px-4 rounded-full md:rounded-lg bg-white/15 hover:bg-white/25 text-white font-semibold text-sm transition-colors">
                            <LogIn
                                size={20}
                                strokeWidth={2}
                                className="shrink-0"
                            />
                            <span className="hidden md:inline">
                                {t('signIn')}
                            </span>
                        </Link>
                    )}
                </div>
            </div>

            {/* -------- Row 2: Main nav links, centered (desktop only) -------- */}
            <div className="hidden lg:flex w-full items-center justify-center gap-1.5 pt-3 pb-1 border-t border-white/15 text-nowrap px-2 mt-2">
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
                    <PagesNavDropdown
                        pages={menuCMSPages}
                        pagesLabel={pagesLabel}
                    />
                )}
            </div>

            <MobileSidebar />
        </>
    );
}
