import { ReactNode } from 'react';

interface CheckoutCardProps {
    title?: string;
    action?: ReactNode;
    children: ReactNode;
}

export default function CheckoutCard({
    title,
    action,
    children,
}: CheckoutCardProps) {
    return (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
            {(title || action) && (
                <div className="flex items-center justify-between mb-6">
                    {title && (
                        <h2 className="text-xl font-bold">{title}</h2>
                    )}
                    {action}
                </div>
            )}

            {children}
        </div>
    );
}
