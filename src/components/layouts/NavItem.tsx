'use client';

import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { useBranchStore } from '@/store/useBranchStore';

interface NavItemProps {
    label: string;
    href: string;
    icon: string;
    isActive: boolean;
    alt?: string;
    id?: string;
}

export default function NavItem({
    label,
    href,
    icon,
    isActive,
    alt,
    id,
}: NavItemProps) {
    const { setModalOpen } = useBranchStore();

    const handleClick = (e: React.MouseEvent) => {
        if (id === 'branches') {
            e.preventDefault();
            setModalOpen(true);
        }
    };

    return (
        <Link
            href={href}
            onClick={handleClick}
            className={`flex gap-2 items-center justify-center py-2 px-3 rounded-xl transition-all ${
                isActive
                    ? 'bg-white shadow-sm'
                    : 'hover:bg-white/10'
            }`}
            aria-current={isActive ? 'page' : undefined}>
            <Image
                src={icon}
                alt={alt || label}
                width={20}
                height={20}
                className={isActive ? 'brightness-0' : 'brightness-0 invert opacity-90'}
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