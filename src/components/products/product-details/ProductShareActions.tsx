'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Share2, Heart } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface ActionButtonProps {
    icon: React.ElementType;
    label: string;
}

const ActionButton = React.memo(({ icon: Icon, label }: ActionButtonProps) => (
    <Button
        type="button"
        variant="outline"
        size="sm"
        className="rounded-md sm:rounded-xl shadow-sm group">
        <Icon className="w-4 h-4 sm:w-[18px] sm:h-[18px] text-gray-400 group-hover:text-theme-primary transition-colors" />
        <span className="text-xs sm:text-sm font-bold">{label}</span>
    </Button>
));

ActionButton.displayName = 'ActionButton';

export default function ProductShareActions() {
    const t = useTranslations('Product');

    const actions = React.useMemo(
        () => [
            { label: t('share'), icon: Share2 },
            { label: t('favorite'), icon: Heart },
        ],
        [t],
    );

    return (
        <div className="flex items-center justify-end gap-2 sm:gap-3">
            <div className="flex items-center gap-2 sm:gap-3">
                {actions.map((action, index) => (
                    <ActionButton key={index} {...action} />
                ))}
            </div>
            {/* Placeholder for Breadcrumbs logic if needed later */}
            <div className="hidden lg:flex items-center gap-2 text-sm text-gray-400 font-medium">
                {/* In a real app, breadcrumbs would be here */}
            </div>
        </div>
    );
}
