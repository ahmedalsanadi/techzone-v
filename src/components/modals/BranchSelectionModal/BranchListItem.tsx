/**
 * Branch list item component
 */

import React from 'react';
import { Building2, Headphones, Clock } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { Branch } from '@/types/branches';
import { cn } from '@/lib/utils';

interface BranchListItemProps {
    branch: Branch;
    isHovered: boolean;
    onMouseEnter: () => void;
    onFocus: () => void;
    onClick: () => void;
    onKeyDown: (e: React.KeyboardEvent) => void;
    onWorkingHoursClick: (e: React.MouseEvent) => void;
    onContactClick: (e: React.MouseEvent) => void;
}

export const BranchListItem: React.FC<BranchListItemProps> = ({
    branch,
    isHovered,
    onMouseEnter,
    onFocus,
    onClick,
    onKeyDown,
    onWorkingHoursClick,
    onContactClick,
}) => {
    const t = useTranslations('Branches');

    return (
        <div
            data-branch-item
            tabIndex={0}
            onMouseEnter={onMouseEnter}
            onFocus={onFocus}
            onClick={onClick}
            onKeyDown={onKeyDown}
            className={cn(
                'group p-5 rounded-3xl border transition-all duration-300 cursor-pointer relative focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2',
                isHovered
                    ? 'border-red-100 bg-red-50/30 shadow-lg shadow-red-500/5 -translate-x-1'
                    : 'border-gray-50 bg-white hover:border-gray-200',
            )}
            role="option"
            aria-selected={isHovered}
            aria-label={`${branch.name || 'Branch'}, ${
                branch.is_open ? t('open') : t('closed')
            }`}>
            <div className="flex items-start justify-between">
                <div className="flex gap-4">
                    <div
                        className={cn(
                            'w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300',
                            isHovered
                                ? 'bg-red-500 text-white'
                                : 'bg-gray-50 text-gray-400 group-hover:bg-gray-100',
                        )}
                        aria-hidden="true">
                        <Building2 size={24} />
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900">
                            {branch.name || 'Branch'}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                            <span
                                className={cn(
                                    'text-[10px] font-black uppercase tracking-wider',
                                    branch.is_open
                                        ? 'text-green-500'
                                        : 'text-gray-400',
                                )}>
                                {branch.is_open ? t('open') : t('closed')}
                            </span>
                            <span
                                className="w-1 h-1 rounded-full bg-gray-200"
                                aria-hidden="true"
                            />
                            {branch.services && (
                                <span className="text-xs text-red-500 bg-red-50 px-2 py-0.5 rounded-full font-bold">
                                    {branch.services.shipping_enabled
                                        ? t('free_delivery')
                                        : t('delivery_with_fee', { fee: 5 })}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                    <div className="flex gap-2">
                        <button
                            onClick={onWorkingHoursClick}
                            className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all focus:outline-none focus:ring-2 focus:ring-red-500"
                            aria-label={`${t('view_working_hours') || 'View working hours'} - ${branch.name}`}
                            title={t('view_working_hours') || 'View working hours'}>
                            <Clock size={16} />
                        </button>
                        <button
                            onClick={onContactClick}
                            className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all focus:outline-none focus:ring-2 focus:ring-red-500"
                            aria-label={`${t('contact_branch') || 'Contact branch'} - ${branch.name}`}
                            title={t('contact_branch') || 'Contact branch'}>
                            <Headphones size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
