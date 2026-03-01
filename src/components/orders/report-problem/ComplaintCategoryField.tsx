'use client';

import React from 'react';
import { Controller, type Control, type FieldErrors } from 'react-hook-form';
import { Label } from '@/components/ui/LabelField';
import type { ComplaintFormValues } from './types';
import { SECTION_CARD_CLASS, CATEGORIES } from './constants';

export interface ComplaintCategoryFieldProps {
    control: Control<ComplaintFormValues>;
    errors: FieldErrors<ComplaintFormValues>;
    t: (key: string) => string;
    vt: (key: string) => string;
}

/**
 * Category radio group. Not memoized: it uses Controller and must re-render when the form
 * re-renders so the selected value updates. Memo would block updates because control/t are stable.
 */
export function ComplaintCategoryField({
    control,
    errors,
    t,
    vt,
}: ComplaintCategoryFieldProps) {
    return (
        <div className={SECTION_CARD_CLASS}>
            <Label className="text-base font-bold text-gray-900 block mb-6 text-start">
                {t('problemType')}
            </Label>
            <Controller
                name="category"
                control={control}
                render={({ field }) => (
                    <div className="space-y-0 divide-y divide-gray-50">
                        {CATEGORIES.map((cat) => (
                            <label
                                key={cat}
                                className="flex items-center justify-between py-4 cursor-pointer group transition-colors"
                            >
                                <span className="text-gray-600 font-medium group-hover:text-theme-primary transition-colors">
                                    {t(`categories.${cat}`)}
                                </span>
                                <div className="relative flex items-center justify-center">
                                    <input
                                        id={`complaint-category-${cat}`}
                                        name={field.name}
                                        type="radio"
                                        value={cat}
                                        checked={field.value === cat}
                                        onChange={() => field.onChange(cat)}
                                        onBlur={field.onBlur}
                                        className="peer appearance-none w-6 h-6 rounded-full border-2 border-gray-200 checked:border-theme-primary transition-all cursor-pointer"
                                    />
                                    <div className="absolute w-3 h-3 rounded-full bg-theme-primary scale-0 peer-checked:scale-100 transition-transform" />
                                </div>
                            </label>
                        ))}
                    </div>
                )}
            />
            {errors.category && (
                <p className="text-xs text-red-500 font-medium mt-2 text-start px-1">
                    {vt(errors.category.message as string)}
                </p>
            )}
        </div>
    );
}
