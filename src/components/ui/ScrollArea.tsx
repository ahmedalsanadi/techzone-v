'use client';

import * as React from 'react';

const ScrollArea = ({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) => <div className={`overflow-auto ${className}`}>{children}</div>;

export { ScrollArea };
