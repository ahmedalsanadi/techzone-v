'use client';
import React, { useState } from 'react';

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
    Edit3,
} from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from '../ui/DropdownMenu';
import { useRouter } from '@/i18n/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { useCartStore } from '@/store/useCartStore';
import { authService } from '@/services/auth-service';

const UserMenu = () => {
    const t = useTranslations('UserMenu');
    const locale = useLocale();
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const {
        user,
        profile,
        isAuthenticated,
        logout: clearAuth,
    } = useAuthStore();
    const { setGuestMode, clearCart } = useCartStore();

    const handleLogout = async () => {
        setOpen(false);
        // CRITICAL: Call logout API FIRST while token is still in cookies
        // Then clear local state after the API call completes
        // This ensures the Authorization header can be set properly
        try {
            await authService.logout();
        } catch (error) {
            // Error already handled in authService.logout()
            // Continue to clear local state even if API call fails
        }

        // Clear local state after API call (cookies will be cleared here)
        clearAuth();

        // Switch cart back to guest mode and clear API cart
        setGuestMode(true);
        clearCart();

        // Refresh router to update any server-side state
        router.refresh();
    };

    const closeMenu = () => setOpen(false);

    return (
        <DropdownMenu
            dir={locale === 'ar' ? 'rtl' : 'ltr'}
            open={open}
            onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
                <button className="bg-white flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-black/5 shadow-sm cursor-pointer hover:bg-gray-50 transition-all active:scale-95 outline-none h-[38px] lg:h-[42px]">
                    <div className="size-[28px] lg:size-[32px] bg-red-50 rounded-full flex items-center justify-center border border-red-100 shadow-xs">
                        <User
                            size={16}
                            className="text-libero-red"
                            strokeWidth={2.5}
                        />
                    </div>
                    <span className="text-gray-900 font-bold text-[13px] whitespace-nowrap hidden lg:inline mx-1">
                        {isAuthenticated
                            ? user?.name?.split(' ')[0]
                            : t('guest')}
                    </span>
                    <ChevronDown
                        size={14}
                        className="text-gray-400 group-hover:text-libero-red transition-colors"
                    />
                </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
                align="end"
                sideOffset={8}
                className="w-[260px] p-0 rounded-[28px] shadow-2xl border-none overflow-hidden bg-white">
                {/* User Info Header Section */}
                <div className="relative p-4 bg-white">
                    {/* Edit Button */}
                    {isAuthenticated && (
                        <Link
                            href="/profile"
                            onClick={closeMenu}
                            className="absolute top-3 left-3 text-[11px] font-bold text-gray-400 hover:text-libero-red transition-colors bg-gray-50 px-2.5 py-1 rounded-full border border-gray-100 shadow-xs">
                            {t('profile')}
                        </Link>
                    )}

                    <div className="flex flex-col items-center text-center gap-3 mt-1.5">
                        {/* Avatar */}
                        <div className="size-16 bg-gray-50 rounded-full flex items-center justify-center border-2 border-white shadow-lg relative overflow-hidden group">
                            <div className="absolute inset-0 bg-libero-red/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <User
                                size={32}
                                className="text-libero-red"
                                strokeWidth={1.5}
                            />
                        </div>

                        {/* Text Details */}
                        <div className="flex flex-col gap-1">
                            <span className="text-base font-black text-gray-900 tracking-tight">
                                {isAuthenticated ? user?.name : t('guest')}
                            </span>

                            {isAuthenticated ? (
                                <>
                                    <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-400 font-medium">
                                        <Phone
                                            size={10}
                                            className="text-gray-300"
                                        />
                                        <span dir="ltr">{user?.phone}</span>
                                    </div>
                                    <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-400 font-medium">
                                        <Mail
                                            size={10}
                                            className="text-gray-300"
                                        />
                                        <span className="max-w-[160px] truncate">
                                            {user?.email}
                                        </span>
                                    </div>

                                    {/* Points Badge */}
                                    <div className="mt-1.5 inline-flex items-center gap-1.5 bg-[#FDEDEE] text-[#E03137] px-3 py-1 rounded-full border border-[#FBE3E4]">
                                        <Star
                                            size={10}
                                            fill="currentColor"
                                            strokeWidth={0}
                                        />
                                        <span className="text-[10px] font-black uppercase tracking-wide">
                                            {profile?.points || 0} نقطة مكتسبة
                                        </span>
                                    </div>
                                </>
                            ) : (
                                <span className="text-[11px] text-gray-400 font-medium">
                                    {t('guestSubtitle')}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="bg-gray-50/50 pt-1.5 px-1.5 pb-1.5">
                    {isAuthenticated ? (
                        <div className="grid grid-cols-1 gap-1">
                            {/* Menu Navigation Items */}
                            <div className="bg-white rounded-[22px] p-1 border border-gray-100/50 shadow-xs">
                                <DropdownMenuItem asChild>
                                    <Link
                                        href="/my-orders"
                                        onClick={closeMenu}
                                        className="py-2.5 px-3 rounded-[18px] gap-2.5 cursor-pointer group transition-all hover:bg-gray-50 flex items-center active:scale-[0.98]">
                                        <div className="size-8 rounded-lg bg-orange-50 flex items-center justify-center text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-all shadow-xs">
                                            <Package
                                                size={18}
                                                strokeWidth={2}
                                            />
                                        </div>
                                        <span className="text-[13px] font-bold text-gray-700">
                                            {t('myOrders')}
                                        </span>
                                    </Link>
                                </DropdownMenuItem>

                                <DropdownMenuItem asChild>
                                    <Link
                                        href="/profile?tab=addresses"
                                        onClick={closeMenu}
                                        className="py-2.5 px-3 rounded-[18px] gap-2.5 cursor-pointer group transition-all hover:bg-gray-50 flex items-center active:scale-[0.98]">
                                        <div className="size-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-all shadow-xs">
                                            <MapPin size={18} strokeWidth={2} />
                                        </div>
                                        <span className="text-[13px] font-bold text-gray-700">
                                            عناويني
                                        </span>
                                    </Link>
                                </DropdownMenuItem>

                                <DropdownMenuItem asChild>
                                    <Link
                                        href="/wallet"
                                        onClick={closeMenu}
                                        className="py-2.5 px-3 rounded-[18px] gap-2.5 cursor-pointer group transition-all hover:bg-gray-50 flex items-center active:scale-[0.98]">
                                        <div className="size-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-all shadow-xs">
                                            <Wallet size={18} strokeWidth={2} />
                                        </div>
                                        <span className="text-[13px] font-bold text-gray-700">
                                            {t('wallet')}
                                        </span>
                                    </Link>
                                </DropdownMenuItem>

                                <DropdownMenuItem asChild>
                                    <Link
                                        href="/wishlist"
                                        onClick={closeMenu}
                                        className="py-2.5 px-3 rounded-[18px] gap-2.5 cursor-pointer group transition-all hover:bg-gray-50 flex items-center active:scale-[0.98]">
                                        <div className="size-8 rounded-lg bg-pink-50 flex items-center justify-center text-pink-500 group-hover:bg-pink-500 group-hover:text-white transition-all shadow-xs">
                                            <Heart size={18} strokeWidth={2} />
                                        </div>
                                        <span className="text-[13px] font-bold text-gray-700">
                                            المفضلة
                                        </span>
                                    </Link>
                                </DropdownMenuItem>
                            </div>

                            {/* Sign Out Action */}
                            <DropdownMenuItem
                                onClick={handleLogout}
                                className="mt-1 py-2.5 px-3 rounded-[18px] gap-2.5 cursor-pointer group transition-all hover:bg-red-50 flex items-center text-red-600 active:scale-[0.98]">
                                <div className="size-8 rounded-lg bg-red-50 flex items-center justify-center text-red-500 group-hover:bg-red-600 group-hover:text-white transition-all shadow-xs">
                                    <LogOut size={18} strokeWidth={2} />
                                </div>
                                <span className="text-[13px] font-bold">
                                    {t('logout')}
                                </span>
                            </DropdownMenuItem>
                        </div>
                    ) : (
                        <div className="bg-white rounded-[22px] p-1 border border-gray-100/50 shadow-xs">
                            <DropdownMenuItem asChild>
                                <Link
                                    href="/auth"
                                    onClick={closeMenu}
                                    className="py-3 px-3 rounded-[18px] gap-3 cursor-pointer group transition-all hover:bg-blue-50 flex items-center w-full active:scale-[0.98]">
                                    <div className="size-9 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                                        <LogIn size={20} strokeWidth={2} />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[14px] font-black text-gray-800 leading-none mb-1">
                                            {t('signIn')}
                                        </span>
                                        <span className="text-[10px] font-medium text-gray-400">
                                            {t('guestSubtitle')}
                                        </span>
                                    </div>
                                </Link>
                            </DropdownMenuItem>
                        </div>
                    )}
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default UserMenu;
