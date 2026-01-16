'use client';

import {
    User,
    ChevronDown,
    Package,
    LogOut,
    CreditCard,
    LogIn,
    UserPlus,
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
import { authService } from '@/services/auth-service';

const UserMenu = () => {
    const t = useTranslations('UserMenu');
    const locale = useLocale();
    const router = useRouter();
    const { user, isAuthenticated, logout: clearAuth } = useAuthStore();

    const handleLogout = async () => {
        // Always clear local state first
        clearAuth();
        router.refresh();
        
        // Try to logout on server (but don't block if it fails)
        if (isAuthenticated) {
            try {
                await authService.logout();
            } catch (error) {
                // Ignore errors - we've already cleared local state
                console.warn('Logout API call failed, but local state cleared:', error);
            }
        }
    };

    return (
        <DropdownMenu dir={locale === 'ar' ? 'rtl' : 'ltr'}>
            <DropdownMenuTrigger asChild>
                <button className="bg-white flex items-center gap-2 px-1 py-1 lg:pr-3 rounded-full border border-black/5 shadow-sm cursor-pointer hover:bg-gray-50 transition-all active:scale-95 outline-none h-[38px] lg:h-[40px]">
                    <div className="relative">
                        <div className="size-[30px] lg:size-[32px] bg-gray-50 rounded-full flex items-center justify-center border border-gray-100 shadow-xs">
                            <User
                                size={16}
                                className="text-libero-red"
                                strokeWidth={2}
                            />
                        </div>
                        <div className="absolute -bottom-0.5 -right-0.5 size-3.5 bg-white rounded-full border border-gray-100 flex items-center justify-center shadow-xs">
                            <ChevronDown
                                size={10}
                                className="text-libero-red"
                                strokeWidth={3}
                            />
                        </div>
                    </div>
                    <span className="text-libero-red font-bold text-[13px] whitespace-nowrap hidden lg:inline mx-1">
                        {isAuthenticated ? user?.name : t('guest')}
                    </span>
                    <ChevronDown
                        size={14}
                        className="text-libero-red hidden lg:inline"
                    />
                </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
                align="end"
                className="w-[240px] p-2 rounded-2xl shadow-xl border-gray-100">
                {/* User Info Header */}
                <div className="px-3 py-4 flex flex-col items-center text-center gap-2">
                    <div className="size-14 bg-gray-50 rounded-full flex items-center justify-center border border-gray-100">
                        <User
                            size={28}
                            className="text-libero-red"
                            strokeWidth={1.5}
                        />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-black text-gray-900 leading-tight">
                            {isAuthenticated ? user?.name : t('guest')}
                        </span>
                        <span className="text-[11px] text-gray-400 font-medium">
                            {isAuthenticated ? user?.email : t('guestSubtitle')}
                        </span>
                    </div>
                </div>

                <DropdownMenuSeparator className="opacity-50" />

                {isAuthenticated ? (
                    <>
                        <div className="py-1">
                            <DropdownMenuItem asChild>
                                <Link
                                    href="/profile"
                                    className="py-2.5 px-3 rounded-xl gap-3 cursor-pointer group transition-colors hover:bg-gray-50 flex items-center">
                                    <div className="size-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                                        <User size={18} strokeWidth={2} />
                                    </div>
                                    <span className="text-[13px] font-bold text-gray-700">
                                        {t('profile')}
                                    </span>
                                </Link>
                            </DropdownMenuItem>

                            <DropdownMenuItem asChild>
                                <Link
                                    href="/my-orders"
                                    className="py-2.5 px-3 rounded-xl gap-3 cursor-pointer group transition-colors hover:bg-gray-50 flex items-center">
                                    <div className="size-8 rounded-lg bg-orange-50 flex items-center justify-center text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                                        <Package size={18} strokeWidth={2} />
                                    </div>
                                    <span className="text-[13px] font-bold text-gray-700">
                                        {t('myOrders')}
                                    </span>
                                </Link>
                            </DropdownMenuItem>
                        </div>

                        <DropdownMenuSeparator className="opacity-50" />

                        <div className="pt-1">
                            <DropdownMenuItem
                                onClick={handleLogout}
                                className="py-2.5 px-3 rounded-xl gap-3 cursor-pointer group transition-colors hover:bg-red-50 text-red-600 focus:text-red-600">
                                <div className="size-8 rounded-lg bg-red-50 flex items-center justify-center text-red-500 group-hover:bg-red-500 group-hover:text-white transition-colors">
                                    <LogOut size={18} strokeWidth={2} />
                                </div>
                                <span className="text-[13px] font-bold">
                                    {t('logout')}
                                </span>
                            </DropdownMenuItem>
                        </div>
                    </>
                ) : (
                    <div className="py-1">
                        <DropdownMenuItem asChild>
                            <Link
                                href="/auth"
                                className="py-2.5 px-3 rounded-xl gap-3 cursor-pointer group transition-colors hover:bg-purple-50 text-gray-700 flex items-center w-full">
                                <div className="size-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-500 group-hover:bg-purple-500 group-hover:text-white transition-colors">
                                    <LogIn size={18} strokeWidth={2} />
                                </div>
                                <span className="text-[13px] font-bold bottom-1 relative">
                                    {t('signIn')}
                                </span>
                            </Link>
                        </DropdownMenuItem>
                    </div>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default UserMenu;
