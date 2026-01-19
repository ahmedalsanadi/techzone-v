//src/components/layouts/navbar.tsx
'use client';
import { usePathname } from '@/i18n/navigation';
import { Search, Menu } from 'lucide-react';
import { NAV_ITEMS } from '@/config/navigation';

import NavItem from './NavItem';
import { Input } from '../ui/Input';

import UserMenu from './UserMenu';
import CartDropdown from './CartDropdown';
import NotificationDropdown from './NotificationDropdown';
import LanguageSwitcher from './LanguageSwitcher';

import { useTranslations } from 'next-intl';
import { useUiStore } from '@/store/useUiStore';
import MobileSidebar from './MobileSidebar';
// import LogoImage from '@/components/layouts/LogoImage';
import { useStore } from '@/components/providers/StoreProvider';
// import { siteConfig } from '@/config/site';
// import FastoLogo from './FastoLogo';
import LogoImage from './LogoImage';

export default function Navbar() {
    const pathname = usePathname();
    const t = useTranslations('Navbar');
    const { toggleMobileMenu } = useUiStore();
    const { config } = useStore();

    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
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

                    {/* <FastoLogo
                        brandName="Fasto"
                        brandLogo="/images/svgs/logo-icon.svg"
                    /> */}
            </div>

            {/*-------- Navlist----------- */}
            <div className="hidden lg:flex items-center gap-2 pt-1 text-nowrap">
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
            </div>

            {/*-------- Search----------- */}
            <div className="hidden lg:flex items-center mt-2">
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
                    containerClassName="w-[356px]"
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
