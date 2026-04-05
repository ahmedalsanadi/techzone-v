'use client';

import React from 'react';
import { Controller, type Control } from 'react-hook-form';
import { Label } from '@/components/ui/LabelField';
import type { ComplaintFormValues } from '@/types/complaints';
import { COMPLAINT_PRIORITIES } from './options';
import { SECTION_CARD_CLASS } from './section-styles';

export interface ComplaintPriorityFieldProps {
    control: Control<ComplaintFormValues>;
    t: (key: string) => string;
}

/**
 * Priority radio group. Not memoized: it uses Controller and must re-render when the form
 * re-renders so the selected value updates. Memo would block updates because control and t are stable.
 */
export function ComplaintPriorityField({ control, t }: ComplaintPriorityFieldProps) {
    return (
        <div className={SECTION_CARD_CLASS}>
            <Label className="text-base font-bold text-gray-900 block mb-4 text-start">
                {t('priorityLabel')}
            </Label>
            <Controller
                name="priority"
                control={control}
                render={({ field }) => (
                    <div className="flex flex-wrap gap-4">
                        {COMPLAINT_PRIORITIES.map((p) => (
                            <label
                                key={p}
                                className="flex items-center gap-2 cursor-pointer"
                            >
                                <input
                                    id={`complaint-priority-${p}`}
                                    name={field.name}
                                    type="radio"
                                    value={p}
                                    checked={field.value === p}
                                    onChange={() => field.onChange(p)}
                                    onBlur={field.onBlur}
                                    className="w-4 h-4 rounded-full border-2 border-gray-200 text-theme-primary focus:ring-theme-primary"
                                />
                                <span className="text-sm font-medium text-gray-700">
                                    {t(`priorities.${p}`)}
                                </span>
                            </label>
                        ))}
                    </div>
                )}
            />
        </div>
    );
}
