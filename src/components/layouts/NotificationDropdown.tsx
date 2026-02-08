'use client';

import { Bell, BellOff, ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Menu, MenuButton, MenuItem } from '@headlessui/react';
import { BaseMenuItems } from '../ui/BaseMenuItems';
import { Link } from '@/i18n/navigation';

const NotificationDropdown = () => {
    const t = useTranslations('Notifications');
    // Placeholder count - in a real app this would come from a store/API
    const count = 0;

    return (
        <Menu as="div" className="relative inline-block text-left">
            <MenuButton className="relative p-2 text-white hover:bg-white/10 rounded-full transition-colors outline-none cursor-pointer">
                <Bell size={24} strokeWidth={1.5} />
                {count > 0 && (
                    <span className="absolute -top-1 -right-1 bg-yellow-400 text-gray-900 text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-theme-primary shadow-sm">
                        {count > 9 ? '9+' : count}
                    </span>
                )}
            </MenuButton>

            <BaseMenuItems
                anchor="bottom end"
                className="w-80 md:w-96 p-0 overflow-hidden rounded-2xl">
                {/* Header */}
                <div className="px-4 py-3 bg-linear-to-r from-gray-50 to-white border-b border-gray-100">
                    <h3 className="font-bold flex items-center gap-2 text-gray-900 text-base">
                        <Bell size={18} strokeWidth={2} />
                        {t('title')}
                    </h3>
                </div>

                {/* Notifications List */}
                <div className="max-h-96 overflow-y-auto p-3 scrollbar-hide">
                    {count === 0 ? (
                        <div className="text-center py-12">
                            <BellOff
                                size={48}
                                className="mx-auto text-gray-200 mb-3"
                                strokeWidth={1.5}
                            />
                            <p className="text-sm font-medium text-gray-400">
                                {t('empty')}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <p className="text-center text-xs text-gray-400 py-4">
                                No new notifications
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-100 bg-gray-50">
                    <Link
                        href="/notifications"
                        className="w-full bg-white text-gray-900 text-center font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all hover:bg-gray-100 border border-gray-200">
                        {t('viewAll')}
                        <ArrowRight size={18} className="rtl:rotate-180" />
                    </Link>
                </div>
            </BaseMenuItems>
        </Menu>
    );
};

export default NotificationDropdown;
