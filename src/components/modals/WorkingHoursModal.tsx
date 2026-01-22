'use client';

import React, { useCallback, useEffect, useRef, useMemo } from 'react';
import { X, Clock, AlertCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { Branch, WorkingHoursSchedule } from '@/types/branches';
import { cn } from '@/lib/utils';
import { formatWorkingHoursDays } from '@/lib/branches';

interface WorkingHoursModalProps {
    branch: Branch;
    onClose: () => void;
}

const WorkingHoursModal: React.FC<WorkingHoursModalProps> = ({
    branch,
    onClose,
}) => {
    const t = useTranslations('Branches');
    const modalRef = useRef<HTMLDivElement>(null);
    const closeButtonRef = useRef<HTMLButtonElement>(null);

    // Convert branch working hours to display format
    const schedule = useMemo<WorkingHoursSchedule[]>(() => {
        if (!branch.working_hours) {
            return [];
        }

        try {
            return formatWorkingHoursDays(branch.working_hours);
        } catch (error) {
            // Handle invalid working hours data gracefully
            if (process.env.NODE_ENV === 'development') {
                console.warn(
                    'Invalid working hours data for branch:',
                    branch.id,
                    error,
                );
            }
            return [];
        }
    }, [branch.working_hours, branch.id]);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        closeButtonRef.current?.focus();

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [onClose]);

    // Focus trap
    useEffect(() => {
        const handleTabKey = (e: KeyboardEvent) => {
            if (e.key !== 'Tab' || !modalRef.current) return;

            const focusableElements =
                modalRef.current.querySelectorAll<HTMLElement>(
                    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
                );
            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];

            if (e.shiftKey) {
                if (document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement?.focus();
                }
            } else {
                if (document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement?.focus();
                }
            }
        };

        document.addEventListener('keydown', handleTabKey);
        return () => {
            document.removeEventListener('keydown', handleTabKey);
        };
    }, []);

    const handleBackdropClick = useCallback(
        (e: React.MouseEvent) => {
            if (e.target === e.currentTarget) {
                onClose();
            }
        },
        [onClose],
    );

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-60 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={handleBackdropClick}
                role="presentation"
                aria-hidden="true"
            />

            {/* Modal */}
            <div
                ref={modalRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="working-hours-title"
                className="fixed inset-0 z-60 flex items-center justify-center p-4 pointer-events-none"
                onClick={handleBackdropClick}>
                <div className="bg-white w-full max-w-md rounded-3xl md:rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 pointer-events-auto">
                    {/* Header */}
                    <div className="p-4 md:p-6 flex items-center justify-between border-b border-gray-50">
                        <div
                            className="w-8 h-8 md:w-10 md:h-10"
                            aria-hidden="true"
                        />
                        <h3
                            id="working-hours-title"
                            className="text-lg md:text-xl font-bold text-gray-800 flex items-center gap-2">
                            <Clock className="size-5 md:size-[20px] text-theme-primary" />
                            {t('working_hours')}
                        </h3>
                        <button
                            ref={closeButtonRef}
                            onClick={onClose}
                            className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-full bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-all focus:outline-none focus:ring-2 focus:ring-theme-primary focus:ring-offset-2"
                            aria-label={t('close_modal') || 'Close modal'}>
                            <X size={20} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-4 md:p-6 space-y-2 md:space-y-3 max-h-[70vh] md:max-h-[60vh] overflow-y-auto">
                        {schedule.length === 0 ? (
                            <div className="flex flex-col items-center justify-center p-8 text-center">
                                <AlertCircle className="w-12 h-12 text-gray-300 mb-4" />
                                <p className="text-sm text-gray-500">
                                    {t('no_working_hours_available') ||
                                        'Working hours not available'}
                                </p>
                            </div>
                        ) : (
                            schedule.map((item, idx) => (
                                <div
                                    key={`${item.day}-${idx}`}
                                    className="flex items-center justify-between py-2 md:py-3 px-3 md:px-4 rounded-xl md:rounded-2xl bg-gray-50/50 hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                                    <span className="font-bold text-sm md:text-base text-gray-700">
                                        {t(`days.${item.day}`) || item.day}
                                    </span>
                                    <div
                                        dir="ltr"
                                        className="flex gap-1.5 md:gap-2 flex-wrap justify-end">
                                        {item.hours.map((h, i) => (
                                            <span
                                                key={i}
                                                className={cn(
                                                    'px-2 md:px-3 py-0.5 md:py-1 rounded-full text-[10px] md:text-xs font-bold border',
                                                    item.closed
                                                        ? 'bg-gray-100 text-gray-400 border-gray-200'
                                                        : 'bg-theme-primary/10 text-theme-primary border-theme-primary-border',
                                                )}>
                                                {h === 'Closed'
                                                    ? t('closed')
                                                    : h}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default WorkingHoursModal;
