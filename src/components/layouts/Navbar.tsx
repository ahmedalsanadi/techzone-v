'use client';
import Image from 'next/image';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { NAV_ITEMS } from '@/config/navigation';
import Logo from './Logo';
import { usePathname } from 'next/navigation';
import NavItem from './NavItem';
import { Input } from '../ui/Input';

import UserMenu from './UserMenu';
import CartDropdown from './CartDropdown';
import NotificationDropdown from './NotificationDropdown';
import LanguageSwitcher from './LanguageSwitcher';

import { useTranslations } from 'next-intl';

export default function Navbar() {
    const pathname = usePathname();
    const t = useTranslations('Navbar');

    return (
        <div className="flex items-center justify-between">
            {/*-------- logo----------- */}
            <Logo brandName="Fasto" brandLogo="/images/svgs/logo-icon.svg" />

            {/*-------- Navlist----------- */}
            <div className="flex items-center gap-2 pt-1">
                {NAV_ITEMS.map((item) => {
                    const isActive =
                        item.href === '/'
                            ? pathname === '/'
                            : pathname.startsWith(item.href);

                    return (
                        <NavItem
                            key={item.id}
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
                <LanguageSwitcher />
                <NotificationDropdown />
                <CartDropdown />
                <UserMenu />
            </div>
        </div>
    );
}
