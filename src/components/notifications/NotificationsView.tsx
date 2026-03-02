'use client';

import { useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

type NotificationType = 'order' | 'promotion' | 'system';

export interface NotificationItem {
    id: string;
    type: NotificationType;
    title_en: string;
    title_ar: string;
    message_en: string;
    message_ar: string;
    type_label_en: string;
    type_label_ar: string;
    createdAt: string;
    isRead: boolean;
}

interface NotificationsViewProps {
    initialNotifications: NotificationItem[];
}

type FilterKey = 'all' | 'unread' | 'orders' | 'promotions' | 'system';

export default function NotificationsView({
    initialNotifications,
}: NotificationsViewProps) {
    const t = useTranslations('Notifications');
    const locale = useLocale();
    const isAr = locale === 'ar';

    const [notifications, setNotifications] = useState(initialNotifications);
    const [activeFilter, setActiveFilter] = useState<FilterKey>('all');

    const hasUnread = notifications.some((n) => !n.isRead);

    const filteredNotifications = useMemo(() => {
        return notifications.filter((notification) => {
            if (activeFilter === 'all') return true;
            if (activeFilter === 'unread') return !notification.isRead;
            if (activeFilter === 'orders') return notification.type === 'order';
            if (activeFilter === 'promotions')
                return notification.type === 'promotion';
            if (activeFilter === 'system') return notification.type === 'system';
            return true;
        });
    }, [notifications, activeFilter]);

    const handleMarkAllAsRead = () => {
        if (!hasUnread) return;
        setNotifications((prev) =>
            prev.map((n) => (n.isRead ? n : { ...n, isRead: true })),
        );
    };

    const handleToggleRead = (id: string) => {
        setNotifications((prev) =>
            prev.map((n) =>
                n.id === id ? { ...n, isRead: !n.isRead } : n,
            ),
        );
    };

    const filters: { key: FilterKey; label: string }[] = [
        { key: 'all', label: t('filterAll') },
        { key: 'unread', label: t('filterUnread') },
        { key: 'orders', label: t('filterOrders') },
        { key: 'promotions', label: t('filterPromotions') },
        { key: 'system', label: t('filterSystem') },
    ];

    return (
        <div className="space-y-6 py-2">
            <div className="flex items-center justify-between gap-3">
                <h1 className="text-xl sm:text-3xl font-bold">
                    {t('title')}
                </h1>
                {notifications.length > 0 && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleMarkAllAsRead}
                        disabled={!hasUnread}
                        className="text-sm text-theme-primary hover:text-theme-primary hover:bg-theme-primary/5">
                        {t('markAllAsRead')}
                    </Button>
                )}
            </div>

            <div className="flex flex-wrap gap-2">
                {filters.map((filter) => (
                    <button
                        key={filter.key}
                        type="button"
                        onClick={() => setActiveFilter(filter.key)}
                        className={cn(
                            'px-3 py-1.5 rounded-full border text-xs sm:text-sm font-medium transition-all',
                            activeFilter === filter.key
                                ? 'bg-theme-primary/10 text-theme-primary border-theme-primary'
                                : 'bg-white text-gray-600 border-gray-200 hover:border-theme-primary-border hover:text-theme-primary',
                        )}>
                        {filter.label}
                    </button>
                ))}
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                {filteredNotifications.length === 0 ? (
                    <div className="px-5 py-10 text-center text-gray-500 text-sm">
                        {notifications.length === 0
                            ? t('empty')
                            : t('noResults')}
                    </div>
                ) : (
                    <ul className="divide-y divide-gray-100">
                        {filteredNotifications.map((notification) => (
                            <li
                                key={notification.id}
                                className={cn(
                                    'px-4 py-3 sm:px-5 sm:py-4 flex items-start gap-3 sm:gap-4 transition-colors',
                                    notification.isRead
                                        ? 'bg-white hover:bg-gray-50'
                                        : 'bg-theme-primary/5 hover:bg-theme-primary/10',
                                )}>
                                <div className="mt-2">
                                    <span
                                        className={cn(
                                            'inline-block w-2 h-2 rounded-full',
                                            notification.isRead
                                                ? 'bg-gray-300'
                                                : 'bg-theme-primary',
                                        )}
                                    />
                                </div>
                                <div className="flex-1 min-w-0 space-y-1">
                                    <div className="flex flex-wrap items-center gap-2 justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                {isAr
                                                    ? notification.type_label_ar
                                                    : notification.type_label_en}
                                            </span>
                                        </div>
                                        <span className="text-xs text-gray-400">
                                            {notification.createdAt}
                                        </span>
                                    </div>
                                    <p className="text-sm font-semibold text-gray-900 line-clamp-1">
                                        {isAr
                                            ? notification.title_ar
                                            : notification.title_en}
                                    </p>
                                    <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">
                                        {isAr
                                            ? notification.message_ar
                                            : notification.message_en}
                                    </p>
                                </div>
                                <div className="flex flex-col items-end gap-2 ml-2">
                                    {!notification.isRead && (
                                        <span className="inline-flex items-center rounded-full bg-theme-primary/10 text-theme-primary text-[10px] font-semibold px-2 py-0.5">
                                            {t('new')}
                                        </span>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleToggleRead(notification.id)
                                        }
                                        className="text-[11px] text-gray-500 hover:text-theme-primary underline-offset-2 hover:underline">
                                        {notification.isRead
                                            ? t('markAsUnread')
                                            : t('markAsRead')}
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}

