//src/components/layouts/NavItem.tsx
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
    id?: string; // Add id to identify branches nav item
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
    const activeStyles = 'bg-white rounded-lg shadow-xl border border-white/20';
    const inactiveStyles =
        'rounded-lg cursor-pointer hover:bg-white/10 transition-colors group border border-transparent';

    const textActiveStyles = 'text-libero-red font-bold';
    const textInactiveStyles = 'text-white group-hover:font-bold';

    const iconFilter = isActive
        ? 'invert(32%) sepia(34%) saturate(1476%) hue-rotate(326deg) brightness(89%) contrast(88%)'
        : 'brightness-0 invert';

    // Handle branches click - open modal instead of navigating
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
            className={`flex gap-2 items-center justify-center py-1.5 px-3 ${
                isActive ? activeStyles : inactiveStyles
            }`}
            aria-current={isActive ? 'page' : undefined}>
            <Image
                src={icon}
                alt={alt || label}
                width={20}
                height={20}
                style={isActive ? { filter: iconFilter } : undefined}
                className={!isActive ? iconFilter : ''}
            />
            <span
                className={`text-sm text-center text-nowrap inline-flex flex-col items-center ${
                    isActive ? textActiveStyles : textInactiveStyles
                }`}>
                <span
                    className="h-0 overflow-hidden invisible font-bold"
                    aria-hidden="true">
                    {label}
                </span>
                {label}
            </span>
        </Link>
    );
}
