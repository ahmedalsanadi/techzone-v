'use client';

import { X, Search } from 'lucide-react';
import { useUiStore } from '@/store/useUiStore';
import { NAV_ITEMS } from '@/config/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import NavItem from './NavItem';
import { Input } from '../ui/Input';

import NotificationDropdown from './NotificationDropdown';
import LanguageSwitcher from './LanguageSwitcher';
import LogoImage from '@/components/layouts/LogoImage';
import { useStore } from '@/components/providers/StoreProvider';
import { siteConfig } from '@/config/site';
import { useAuthStore } from '@/store/useAuthStore';
import { useCartStore } from '@/store/useCartStore';
import { useWishlistStore } from '@/store/useWishlistStore';
import { LogOut, LogIn } from 'lucide-react';

export default function MobileSidebar() {
    const { isMobileMenuOpen, setMobileMenuOpen } = useUiStore();
    const t = useTranslations('Navbar');
    const pathname = usePathname();
    const locale = useLocale();
    const isArabic = locale === 'ar';
    const { config, cmsPages } = useStore();
    const { isAuthenticated, user, logout } = useAuthStore();
    const { setGuestMode, clearCart } = useCartStore();
    const { setGuestMode: setWishlistGuestMode, clearWishlist } =
        useWishlistStore();

    const handleLogout = async () => {
        // Always clear local state first
        logout();
        // Try to logout on server if authenticated (but don't block)
        if (isAuthenticated) {
            const { authService } = await import('@/services/auth-service');
            authService.logout().catch(() => {
                // Ignore errors - we've already cleared local state
            });
        }
        // Switch cart and wishlist back to guest mode and clear API data
        setGuestMode(true);
        clearCart();
        setWishlistGuestMode(true);
        clearWishlist();
        setMobileMenuOpen(false);
    };
    if (!isMobileMenuOpen) return null;

    return (
        <div className="fixed inset-0 z-50 lg:hidden">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity"
                onClick={() => setMobileMenuOpen(false)}
            />

            {/* Sidebar */}
            <div
                className={`absolute top-0 ${
                    isArabic ? 'right-0' : 'left-0'
                } h-full w-[280px] bg-libero-red shadow-2xl transition-transform duration-300 ease-in-out flex flex-col`}>
                <div className="p-4 flex items-center justify-between border-b border-white/10 bg-libero-red text-white">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setMobileMenuOpen(false)}
                            className="p-1.5 hover:bg-white/10 rounded-full transition-colors">
                            <X size={24} />
                        </button>
                        <LogoImage
                            brandName={config?.store?.name || siteConfig.name}
                            brandLogo={
                                config?.store?.logo_url ||
                                '/images/svgs/logo-icon.svg'
                            }
                        />
                    </div>

                    <div className="flex items-center gap-1">
                        <LanguageSwitcher />
                        <NotificationDropdown />
                    </div>
                </div>

                <div className="p-4 flex flex-col gap-4 flex-1 overflow-y-auto">
                    {/* Search in Sidebar */}
                    <div className="mb-2">
                        <Input
                            type="text"
                            placeholder={t('searchPlaceholder')}
                            inputSize="md"
                            startIcon={
                                <Search size={20} className="text-white/40" />
                            }
                            containerClassName="w-full bg-white/5 border-white/10 focus-within:bg-white/10 focus-within:ring-white/20"
                            className="text-white placeholder:text-white/40"
                        />
                    </div>

                    {/* Navigation Items */}
                    <nav className="flex flex-col gap-1">
                        {NAV_ITEMS.map((item) => {
                            const isActive =
                                item.href === '/'
                                    ? pathname === '/'
                                    : pathname.startsWith(item.href);

                            return (
                                <div
                                    key={item.id}
                                    onClick={() => setMobileMenuOpen(false)}>
                                    <NavItem
                                        id={item.id}
                                        label={t(`nav.${item.id}`)}
                                        href={item.href}
                                        icon={item.icon}
                                        isActive={isActive}
                                        alt={item.alt}
                                    />
                                </div>
                            );
                        })}
                        {cmsPages
                            .filter((p) => p.show_in_menu)
                            .map((page) => (
                                <div
                                    key={page.id}
                                    onClick={() => setMobileMenuOpen(false)}>
                                    <NavItem
                                        id={String(page.id)}
                                        label={page.title}
                                        href={`/pages/${page.slug}`}
                                        icon="/images/svgs/4grid-squares-icon.svg"
                                        isActive={pathname.startsWith(
                                            `/pages/${page.slug}`,
                                        )}
                                    />
                                </div>
                            ))}
                    </nav>
                </div>

                {/* Bottom Footer or secondary links could go here if needed */}
                <div className="p-4 border-t border-white/10 mt-auto">
                    {isAuthenticated ? (
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-3 text-white hover:bg-white/10 rounded-xl transition-colors font-bold text-sm">
                            <LogOut size={20} />
                            {user?.name} - تسجيل الخروج
                        </button>
                    ) : (
                        <Link
                            href="/auth"
                            onClick={() => setMobileMenuOpen(false)}
                            className="w-full flex items-center gap-3 px-4 py-3 text-white hover:bg-white/10 rounded-xl transition-colors font-bold text-sm">
                            <LogIn size={20} />
                            تسجيل الدخول
                        </Link>
                    )}
                    <p className="text-white/40 text-[10px] text-center mt-4">
                        © {new Date().getFullYear()}{' '}
                        {config?.store?.name || siteConfig.name} Store
                    </p>
                </div>
            </div>
        </div>
    );
}
