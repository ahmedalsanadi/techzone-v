'use client';

import { X, Search, LogOut, LogIn, FileText } from 'lucide-react';
import { useUiStore } from '@/store/useUiStore';
import { NAV_ITEMS } from '@/config/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { Link, usePathname, useRouter } from '@/i18n/navigation';
import NavItem from './NavItem';
import { Input } from '../ui/Input';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import {
    Dialog,
    DialogPanel,
    Transition,
    TransitionChild,
} from '@headlessui/react';
import { cn } from '@/lib/utils';

import NotificationDropdown from './NotificationDropdown';
import LanguageSwitcher from './LanguageSwitcher';
import { useStore } from '@/components/providers/StoreProvider';
import { siteConfig } from '@/config/site';
import { useAuthStore } from '@/store/useAuthStore';
import { useCartStore } from '@/store/useCartStore';
import { useWishlistStore } from '@/store/useWishlistStore';

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

    const router = useRouter();
    const searchParams = useSearchParams();
    const [searchQuery, setSearchQuery] = useState(
        searchParams.get('search') || '',
    );

    // Update search query state when URL parameter changes
    useEffect(() => {
        const query = searchParams.get('search');
        if (query !== null) {
            setSearchQuery(query);
        } else {
            setSearchQuery('');
        }
    }, [searchParams]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            setMobileMenuOpen(false);
            router.push(
                `/products?search=${encodeURIComponent(searchQuery.trim())}`,
            );
        } else {
            setMobileMenuOpen(false);
            router.push('/products');
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSearch(e);
        }
    };

    const handleLogout = async () => {
        logout();
        if (isAuthenticated) {
            const { authService } = await import('@/services/auth-service');
            authService.logout().catch(() => {});
        }
        setGuestMode(true);
        clearCart();
        setWishlistGuestMode(true);
        clearWishlist();
        setMobileMenuOpen(false);
    };

    return (
        <Transition show={isMobileMenuOpen}>
            <Dialog
                as="div"
                className="relative z-50 lg:hidden"
                onClose={() => setMobileMenuOpen(false)}>
                {/* Backdrop */}
                <TransitionChild
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0">
                    <div
                        className="fixed inset-0 bg-black/40 backdrop-blur-[2px]"
                        aria-hidden="true"
                    />
                </TransitionChild>

                <div className="fixed inset-0 overflow-hidden">
                    <div className="absolute inset-0 overflow-hidden">
                        <div
                            className={cn(
                                'pointer-events-none fixed inset-y-0 flex max-w-full',
                                isArabic ? 'right-0' : 'left-0',
                            )}>
                            <TransitionChild
                                enter="transform transition ease-in-out duration-300 sm:duration-500"
                                enterFrom={
                                    isArabic
                                        ? 'translate-x-full'
                                        : '-translate-x-full'
                                }
                                enterTo="translate-x-0"
                                leave="transform transition ease-in-out duration-300 sm:duration-500"
                                leaveFrom="translate-x-0"
                                leaveTo={
                                    isArabic
                                        ? 'translate-x-full'
                                        : '-translate-x-full'
                                }>
                                <DialogPanel className="pointer-events-auto h-full w-[280px] bg-primary shadow-2xl flex flex-col">
                                    <div className="p-4 flex items-center justify-between border-b border-white/10 bg-primary-50 text-white">
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() =>
                                                    setMobileMenuOpen(false)
                                                }
                                                className="p-1.5 hover:bg-white/10 rounded-full transition-colors">
                                                <X size={24} />
                                            </button>
                                        </div>

                                        <div className="flex items-center gap-1">
                                            <LanguageSwitcher />
                                            <NotificationDropdown />
                                        </div>
                                    </div>

                                    <div className="p-4 flex flex-col gap-4 flex-1 overflow-y-auto">
                                        {/* Search in Sidebar */}
                                        <div className="mb-2">
                                            <form onSubmit={handleSearch}>
                                                <Input
                                                    type="text"
                                                    placeholder={t(
                                                        'searchPlaceholder',
                                                    )}
                                                    inputSize="md"
                                                    value={searchQuery}
                                                    onChange={(e) =>
                                                        setSearchQuery(
                                                            e.target.value,
                                                        )
                                                    }
                                                    onKeyDown={handleKeyDown}
                                                    startIcon={
                                                        <Search
                                                            size={18}
                                                            className="text-white/40"
                                                        />
                                                    }
                                                    endIcon={
                                                        <button
                                                            type="submit"
                                                            className={cn(
                                                                'p-1.5 rounded-lg transition-all active:scale-95',
                                                                searchQuery.trim()
                                                                    ? 'bg-white text-primary shadow-lg'
                                                                    : 'bg-white/10 text-white/40',
                                                            )}
                                                            aria-label={t(
                                                                'search',
                                                            )}
                                                            disabled={
                                                                !searchQuery.trim()
                                                            }>
                                                            <Search
                                                                size={18}
                                                                strokeWidth={
                                                                    2.5
                                                                }
                                                            />
                                                        </button>
                                                    }
                                                    containerClassName="w-full bg-white/5 border-white/10 focus-within:bg-white/10 focus-within:ring-white/20 px-1.5"
                                                    className="text-white placeholder:text-white/40 h-11"
                                                />
                                            </form>
                                        </div>

                                        {/* Navigation Items */}
                                        <nav className="flex flex-col justify-start items-start gap-1">
                                            {NAV_ITEMS.map((item) => {
                                                const isActive =
                                                    item.href === '/'
                                                        ? pathname === '/'
                                                        : pathname.startsWith(
                                                              item.href,
                                                          );

                                                return (
                                                    <div
                                                        key={item.id}
                                                        onClick={() =>
                                                            setMobileMenuOpen(
                                                                false,
                                                            )
                                                        }
                                                        className="w-full">
                                                        <NavItem
                                                            id={item.id}
                                                            label={t(
                                                                `nav.${item.id}`,
                                                            )}
                                                            href={item.href}
                                                            icon={item.icon}
                                                            isActive={isActive}
                                                            alt={item.alt}
                                                            variant="sidebar"
                                                        />
                                                    </div>
                                                );
                                            })}
                                            {cmsPages
                                                .filter((p) => p.show_in_menu)
                                                .map((page) => (
                                                    <div
                                                        key={page.id}
                                                        onClick={() =>
                                                            setMobileMenuOpen(
                                                                false,
                                                            )
                                                        }
                                                        className="w-full">
                                                        <NavItem
                                                            id={String(page.id)}
                                                            label={page.title}
                                                            href={`/pages/${page.slug}`}
                                                            icon={FileText}
                                                            isActive={pathname.startsWith(
                                                                `/pages/${page.slug}`,
                                                            )}
                                                            variant="sidebar"
                                                        />
                                                    </div>
                                                ))}
                                        </nav>
                                    </div>

                                    {/* Bottom Footer or secondary links */}
                                    <div className="p-4 border-t border-white/10 mt-auto bg-primary-50">
                                        {isAuthenticated ? (
                                            <button
                                                onClick={handleLogout}
                                                className="w-full flex items-center gap-3 px-4 py-3 text-white hover:bg-white/10 rounded-xl transition-colors font-bold text-sm">
                                                <LogOut size={20} />
                                                <span className="truncate">
                                                    {user?.name} -{' '}
                                                    {t('logout') ||
                                                        'تسجيل الخروج'}
                                                </span>
                                            </button>
                                        ) : (
                                            <Link
                                                href="/auth"
                                                onClick={() =>
                                                    setMobileMenuOpen(false)
                                                }
                                                className="w-full flex items-center gap-3 px-4 py-3 text-white hover:bg-white/10 rounded-xl transition-colors font-bold text-sm">
                                                <LogIn size={20} />
                                                {t('signIn') || 'تسجيل الدخول'}
                                            </Link>
                                        )}
                                        <p className="text-white/40 text-[10px] text-center mt-4 uppercase tracking-widest font-bold">
                                            © {new Date().getFullYear()}{' '}
                                            {config?.store?.name ||
                                                siteConfig.name}
                                        </p>
                                    </div>
                                </DialogPanel>
                            </TransitionChild>
                        </div>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
