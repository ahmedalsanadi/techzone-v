'use client';

import { Link } from '@/i18n/navigation';
import { useBranchStore } from '@/store/useBranchStore';
import type { LucideIcon } from 'lucide-react';

interface NavItemProps {
    label: string;
    href: string;
    icon: LucideIcon;
    isActive: boolean;
    alt?: string;
    id?: string;
    variant?: 'default' | 'sidebar';
}

export default function NavItem({
    label,
    href,
    icon,
    isActive,
    alt,
    id,
    variant = 'default',
}: NavItemProps) {
    const { setModalOpen } = useBranchStore();

    const handleClick = (e: React.MouseEvent) => {
        if (id === 'branches') {
            e.preventDefault();
            setModalOpen(true);
        }
    };

    const Icon = icon;
    const iconSize = variant === 'sidebar' ? 22 : 20;

    if (variant === 'sidebar') {
        return (
            <Link
                href={href}
                onClick={handleClick}
                className={`flex w-full gap-3 items-center py-3 px-4 rounded-2xl transition-all ${
                    isActive
                        ? 'bg-white/15 shadow-sm backdrop-blur-md'
                        : 'hover:bg-white/5'
                }`}
                aria-current={isActive ? 'page' : undefined}
                aria-label={alt || label}>
                <Icon
                    size={iconSize}
                    className="text-white opacity-90 shrink-0"
                    aria-hidden
                />
                <span
                    className={`text-base font-bold ${
                        isActive ? 'text-white' : 'text-white/70'
                    }`}>
                    {label}
                </span>
            </Link>
        );
    }

    return (
        <Link
            href={href}
            onClick={handleClick}
            className={`flex gap-2 items-center justify-center py-2 px-3 rounded-xl transition-all ${
                isActive ? 'bg-white shadow-sm' : 'hover:bg-white/10'
            }`}
            aria-current={isActive ? 'page' : undefined}
            aria-label={alt || label}>
            <Icon
                size={iconSize}
                className={`shrink-0 ${
                    isActive ? 'text-theme-primary' : 'text-white opacity-90'
                }`}
                aria-hidden
            />
            <span
                className={`text-sm font-semibold ${
                    isActive ? 'text-theme-primary' : 'text-white/90'
                }`}>
                {label}
            </span>
        </Link>
    );
}
