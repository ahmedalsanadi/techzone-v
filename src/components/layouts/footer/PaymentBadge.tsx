import React from 'react';
import Image from 'next/image';

interface PaymentBadgeProps {
    src: string;
    alt: string;
    width?: number;
    height?: number;
    className?: string;
}

const PaymentBadge = ({
    src,
    alt,
    width = 80,
    height = 40,
    className = 'h-9 w-auto',
}: PaymentBadgeProps) => (
    <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={className}
    />
);

export default PaymentBadge;
