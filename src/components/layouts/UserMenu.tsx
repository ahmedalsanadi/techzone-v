'use client';
import React from 'react';

import {
    User,
    ChevronDown,
    Package,
    LogOut,
    LogIn,
    MapPin,
    Wallet,
    Heart,
    Star,
    Phone,
    Mail,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useRouter } from '@/i18n/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { useCartStore } from '@/store/useCartStore';
import { authService } from '@/services/auth-service';
import { Menu, MenuButton, MenuItem } from '@headlessui/react';
import { BaseMenuItems } from '../ui/BaseMenuItems';
import { Button } from '@/components/ui/Button';

const THEME_CLASSES: Record<
    string,
    { wrapper: string; link: string; label: string }
> = {
    orange: {
        wrapper: 'bg-orange-100 text-orange-600',
        link: 'hover:bg-orange-50',
        label: 'group-hover:text-orange-700',
    },
    blue: {
        wrapper: 'bg-blue-100 text-blue-600',
        link: 'hover:bg-blue-50',
        label: 'group-hover:text-blue-700',
    },
    emerald: {
        wrapper: 'bg-emerald-100 text-emerald-600',
        link: 'hover:bg-emerald-50',
        label: 'group-hover:text-emerald-700',
    },
    pink: {
        wrapper: 'bg-pink-100 text-pink-600',
        link: 'hover:bg-pink-50',
        label: 'group-hover:text-pink-700',
    },
    red: {
        wrapper: 'bg-red-100 text-red-600',
        link: 'hover:bg-red-50',
        label: 'group-hover:text-red-700',
    },
};

interface UserMenuNavItemProps {
    href?: string;
    onClick?: () => void;
    icon: LucideIcon;
    theme: keyof typeof THEME_CLASSES;
    label: string;
}

function UserMenuNavItem({
    href,
    onClick,
    icon: Icon,
    theme,
    label,
}: UserMenuNavItemProps) {
    const classes = THEME_CLASSES[theme];
    const content = (
        <>
            <div
                className={`size-9 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform shrink-0 ${classes.wrapper}`}>
                <Icon size={18} strokeWidth={2} />
            </div>
            <span
                className={`text-sm font-semibold text-gray-700 ${classes.label}`}>
                {label}
            </span>
        </>
    );

    if (onClick) {
        return (
            <MenuItem>
                <Button
                    type="button"
                    variant="ghost"
                    onClick={onClick}
                    className={`w-full flex items-center justify-start gap-3 px-3 py-2.5 rounded-xl h-auto ${classes.link} text-red-600`}>
                    {content}
                </Button>
            </MenuItem>
        );
    }

    return (
        <MenuItem>
            <Link
                href={href!}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group ${classes.link}`}>
                {content}
            </Link>
        </MenuItem>
    );
}

const UserMenu = () => {
    const t = useTranslations('UserMenu');
    const router = useRouter();
    const {
        user,
        profile,
        isAuthenticated,
        logout: clearAuth,
    } = useAuthStore();
    const { setGuestMode, clearCart } = useCartStore();

    const firstName =
        (user?.name || '')
            .trim()
            .split(/\s+/)
            .filter(Boolean)[0] || '';

    const handleLogout = async () => {
        try {
            await authService.logout();
        } catch (error) {
            console.error(error);
        }

        clearAuth();
        setGuestMode(true);
        clearCart();
        router.refresh();
    };

    return (
        <Menu as="div" className="relative inline-block pe-2">

            <MenuButton
                className="group relative flex items-center justify-center md:justify-start gap-2
                           rounded-full md:rounded-xl border border-gray-200 bg-white shadow-sm
                           hover:bg-gray-50 transition-colors outline-none
                           size-9 md:h-10 md:w-auto md:px-3"
            >
                {/* Avatar Circle — smaller on mobile */}
                <div
                    className="size-6 md:size-7 rounded-full
                               bg-linear-to-br from-gray-50 to-gray-100
                               flex items-center justify-center
                               border-2 border-gray-200 shrink-0"
                >
                    <User
                        className="size-3.5 md:size-4 text-gray-600"
                        strokeWidth={2.5}
                    />
                </div>

                {/* Name: show first name on md+ only */}
                {isAuthenticated && firstName && (
                    <span className="hidden md:inline text-sm font-semibold text-gray-800 max-w-[140px] truncate pointer-events-none">
                        {firstName}
                    </span>
                )}

                {/* Chevron Badge — Mobile only, now contained inside the button */}
                <span
                    className="absolute md:hidden  bottom-0 end-0 size-4 md:size-4 rounded-full
                               bg-white border border-gray-300
                               flex items-center justify-center
                             "
                >
                    <ChevronDown
                        className=" size-2.5 md:size-2.5 text-gray-600
                                   transition-transform group-data-open:rotate-180"
                    />
                </span>
            </MenuButton>

            <BaseMenuItems
                anchor="bottom end"
                className="w-72 p-0 rounded-2xl overflow-hidden">
                {/* User Info Header Section */}
                <div className="relative px-5 pt-5 pb-4 bg-linear-to-br from-gray-50 to-white border-b border-gray-100">
                    {/* Edit Button */}
                    {isAuthenticated && (
                        <MenuItem>
                            <Link
                                href="/profile"
                                className="absolute top-3 end-3 text-xs font-semibold text-gray-500 hover:text-theme-primary transition-colors bg-white px-3 py-1.5 rounded-full border border-gray-200 hover:border-theme-primary/30 shadow-sm">
                                {t('profile')}
                            </Link>
                        </MenuItem>
                    )}

                    <div className="flex flex-col items-center text-center gap-3 mt-2">
                        {/* Avatar */}
                        <div className="size-16 bg-linear-to-br from-theme-primary/10 to-theme-primary/5 rounded-full flex items-center justify-center border-2 border-white shadow-lg">
                            <User
                                size={28}
                                className="text-theme-primary"
                                strokeWidth={2}
                            />
                        </div>

                        {/* Text Details */}
                        <div className="flex flex-col gap-1.5">
                            <span className="text-base font-bold text-gray-900">
                                {isAuthenticated ? user?.name : t('guest')}
                            </span>

                            {isAuthenticated ? (
                                <>
                                    <div className="flex items-center justify-center gap-1.5 text-xs text-gray-500">
                                        <Phone size={12} className="text-gray-400" />
                                        <span dir="ltr" className="font-medium">
                                            {user?.phone}
                                        </span>
                                    </div>
                                    {user?.email && (
                                        <div className="flex items-center justify-center gap-1.5 text-xs text-gray-500">
                                            <Mail size={12} className="text-gray-400" />
                                            <span className="max-w-[180px] truncate font-medium">
                                                {user?.email}
                                            </span>
                                        </div>
                                    )}

                                    {/* Points Badge */}
                                    <div className="mt-2 inline-flex max-w-[160px] mx-auto items-center gap-1.5 bg-theme-primary/10 text-theme-primary px-3 py-1.5 rounded-full border border-theme-primary/20">
                                        <Star
                                            size={12}
                                            fill="currentColor"
                                            strokeWidth={0}
                                        />
                                        <span className="text-xs font-bold">
                                            {profile?.points || 0} {t('pointsEarned')}
                                        </span>
                                    </div>
                                </>
                            ) : (
                                <span className="text-xs text-gray-500 font-medium">
                                    {t('guestSubtitle')}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="p-2">
                    {isAuthenticated ? (
                        <div className="flex flex-col gap-1">
                            {[
                                {
                                    href: '/my-orders',
                                    icon: Package,
                                    theme: 'orange' as const,
                                    labelKey: 'myOrders',
                                },
                                {
                                    href: '/my-addresses',
                                    icon: MapPin,
                                    theme: 'blue' as const,
                                    labelKey: 'myAddresses',
                                },
                                {
                                    href: '/wallet',
                                    icon: Wallet,
                                    theme: 'emerald' as const,
                                    labelKey: 'wallet',
                                },
                                {
                                    href: '/wishlist',
                                    icon: Heart,
                                    theme: 'pink' as const,
                                    labelKey: 'favorites',
                                },
                            ].map((item) => (
                                <UserMenuNavItem
                                    key={item.href}
                                    href={item.href}
                                    icon={item.icon}
                                    theme={item.theme}
                                    label={t(item.labelKey)}
                                />
                            ))}

                            <div className="h-px bg-gray-100 my-1" />

                            <UserMenuNavItem
                                icon={LogOut}
                                theme="red"
                                label={t('logout')}
                                onClick={handleLogout}
                            />
                        </div>
                    ) : (
                        <MenuItem>
                            <Link
                                href="/auth"
                                className="flex items-center justify-center gap-3 w-full py-3 px-4 bg-linear-to-r from-theme-primary to-theme-primary/90 text-white rounded-xl transition-all hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] font-semibold">
                                <LogIn size={18} strokeWidth={2.5} />
                                <span>{t('signIn')}</span>
                            </Link>
                        </MenuItem>
                    )}
                </div>
            </BaseMenuItems>
        </Menu>
    );
};

export default UserMenu;