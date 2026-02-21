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
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            {(title || action) && (
                <div className="flex items-center justify-between mb-4">
                    {title && (
                        <h2 className="text-base font-bold text-gray-800">
                            {title}
                        </h2>
                    )}
                    {action}
                </div>
            )}

            {children}
        </div>
    );
}
