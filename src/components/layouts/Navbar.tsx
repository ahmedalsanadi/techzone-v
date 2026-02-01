//src/components/layouts/navbar.tsx
'use client';
import { usePathname } from '@/i18n/navigation';
import { Search, Menu, ChevronDown } from 'lucide-react';
import { NAV_ITEMS } from '@/config/navigation';

import NavItem from './NavItem';
import { Input } from '../ui/Input';

import UserMenu from './UserMenu';
import CartDropdown from './CartDropdown';
import NotificationDropdown from './NotificationDropdown';
import LanguageSwitcher from './LanguageSwitcher';

import { useLocale, useTranslations } from 'next-intl';
import { useUiStore } from '@/store/useUiStore';
import MobileSidebar from './MobileSidebar';
// import LogoImage from '@/components/layouts/LogoImage';
import { useStore } from '@/components/providers/StoreProvider';
// import { siteConfig } from '@/config/site';
// import FastoLogo from './FastoLogo';
import LogoImage from './LogoImage';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '../ui/DropdownMenu';
import { Link } from '@/i18n/navigation';

export default function Navbar() {
    const pathname = usePathname();
    const t = useTranslations('Navbar');
    const locale = useLocale();
    const { toggleMobileMenu } = useUiStore();
    const { config, cmsPages } = useStore();
    const menuCMSPages = cmsPages.filter((p) => p.show_in_menu);
    const pagesLabel = locale === 'ar' ? 'الصفحات' : 'Pages';

    return (
        <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
                {/*-------- Hamburger (Mobile Only) ----------- */}
                <button
                    onClick={toggleMobileMenu}
                    className="lg:hidden p-2 text-white hover:bg-white/10 rounded-full transition-colors">
                    <Menu size={24} strokeWidth={1.5} />
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
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-semibold text-white hover:bg-white/10 transition-colors">
                                <span>{pagesLabel}</span>
                                <ChevronDown className="h-4 w-4 opacity-80" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            align="start"
                            className="min-w-[220px] rounded-2xl border border-gray-100 bg-white p-2 shadow-xl">
                            {menuCMSPages.map((page) => (
                                <Link
                                    key={page.id}
                                    href={`/${page.slug}`}
                                    className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:text-gray-900">
                                    {page.title}
                                </Link>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
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
