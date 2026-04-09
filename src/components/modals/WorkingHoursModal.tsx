import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { AlertCircle, Clock, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import React, { useMemo } from 'react';
import type { Branch, WorkingHoursSchedule } from '@/types/branches';
import { formatWorkingHoursDays } from '@/lib/branches';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

interface WorkingHoursModalProps {
    branch: Branch;
    onClose: () => void;
}

const WorkingHoursModal: React.FC<WorkingHoursModalProps> = ({
    branch,
    onClose,
}) => {
    const t = useTranslations('Branches');

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

    return (
        <Dialog
            open={true}
            as="div"
            className="relative z-60 focus:outline-none"
            onClose={onClose}>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300"
                aria-hidden="true"
            />

            <div className="fixed inset-0 z-60 w-screen overflow-y-auto">
                <div className="flex min-h-full items-center justify-center p-4">
                    <DialogPanel
                        transition
                        className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden duration-300 ease-out data-closed:scale-95 data-closed:opacity-0">
                        {/* Header */}
                        <div className="p-4 md:p-6 flex items-center justify-between border-b border-gray-50">
                            <div
                                className="w-8 h-8 md:w-10 md:h-10"
                                aria-hidden="true"
                            />
                            <DialogTitle
                                as="h3"
                                className="text-lg md:text-xl font-bold text-gray-800 flex items-center gap-2">
                                <Clock className="size-5 md:size-[20px] text-theme-primary" />
                                {t('working_hours')}
                            </DialogTitle>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={onClose}
                                className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gray-50 hover:bg-gray-100 hover:text-gray-600 shrink-0"
                                aria-label={t('close_modal') || 'Close modal'}>
                                <X className="size-5" />
                            </Button>
                        </div>

                        {/* Content */}
                        <div className="p-4 md:p-6 space-y-2 md:space-y-3 max-h-[70vh] md:max-h-[60vh] overflow-y-auto">
                            {branch.working_hours === null ? (
                                <div className="flex flex-col items-center justify-center p-8 text-center">
                                    <Clock className="w-12 h-12 text-theme-primary/40 mb-4" />
                                    <p className="text-sm font-bold text-gray-700">
                                        {t('always_open') || 'Always open'}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-2">
                                        {t('always_open_desc') ||
                                            'This branch is open 24/7.'}
                                    </p>
                                </div>
                            ) : schedule.length === 0 ? (
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
                    </DialogPanel>
                </div>
            </div>
        </Dialog>
    );
};

export default WorkingHoursModal;
