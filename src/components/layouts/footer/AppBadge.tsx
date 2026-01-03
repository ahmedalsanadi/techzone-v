import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface AppBadgeProps {
    src: string;
    alt: string;
    href: string;
}

const AppBadge = ({ src, alt, href }: AppBadgeProps) => (
    <Link href={href}>
        <Image
            src={src}
            alt={alt}
            width={180}
            height={54}
            className="hover:scale-105 transition-transform"
        />
    </Link>
);

export default AppBadge;
