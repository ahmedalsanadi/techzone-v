import React from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

import Link from 'next/link';

interface PaymentBadgeProps {
    src: string;
    altKey: string;
    width?: number;
    height?: number;
    className?: string;
    href?: string;
}

const PaymentBadge = ({
    src,
    altKey,
    width = 80,
    height = 40,
    className = 'h-9 w-auto',
    href,
}: PaymentBadgeProps) => {
    const t = useTranslations('Footer');

    const content = (
        <Image
            src={src}
            alt={altKey.startsWith('badges.') ? t(altKey) : altKey}
            width={width}
            height={height}
            className={className}
        />
    );

    if (href) {
        return (
            <Link href={href} target="_blank" rel="noopener noreferrer">
                {content}
            </Link>
        );
    }

    return content;
};

export default PaymentBadge;
