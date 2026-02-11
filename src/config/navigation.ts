import type { LucideIcon } from 'lucide-react';
import { Home, LayoutGrid, Building2, Percent, ShoppingBag } from 'lucide-react';

export interface NavItemType {
    id: string;
    label: string;
    href: string;
    icon: LucideIcon;
    alt?: string;
}

export const NAV_ITEMS: NavItemType[] = [
    {
        id: 'home',
        label: 'الرئيسية',
        href: '/',
        icon: Home,
        alt: 'Home',
    },
    {
        id: 'categories',
        label: 'الأقسام',
        href: '/categories',
        icon: LayoutGrid,
        alt: 'Categories',
    },
    {
        id: 'branches',
        label: 'الفروع',
        href: '/branches',
        icon: Building2,
        alt: 'Branches',
    },
    {
        id: 'offers',
        label: 'العروض',
        href: '/offers',
        icon: Percent,
        alt: 'Offers',
    },
    {
        id: 'my-orders',
        label: 'طلباتي',
        href: '/my-orders',
        icon: ShoppingBag,
        alt: 'My Orders',
    },
];