// src/app/[locale]/my-orders/utils/components/ReportProblemForm.tsx
'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export const ReportProblemForm: React.FC = () => {
    const t = useTranslations('ReportProblem');
    const [problemType, setProblemType] = useState<string>('');

    const problemTypes = [
        { id: 'type1', label: t('types.type1') },
        { id: 'type2', label: t('types.type2') },
        { id: 'type3', label: t('types.type3') },
        { id: 'type4', label: t('types.type4') },
        { id: 'type5', label: t('types.type5') },
    ];

    return (
        <form className="space-y-6">
            {/* Box 1: Select Type */}
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100">
                <label className="text-base font-bold text-gray-900 block mb-6 text-start">
                    {t('problemType')}
                </label>
                <div className="space-y-0 divide-y divide-gray-50">
                    {problemTypes.map((type) => (
                        <label
                            key={type.id}
                            className="flex items-center justify-between py-4 cursor-pointer group transition-colors">
                            <span className="text-gray-600 font-medium group-hover:text-theme-primary transition-colors">
                                {type.label}
                            </span>
                            <div className="relative flex items-center justify-center">
                                <input
                                    type="radio"
                                    name="problemType"
                                    value={type.id}
                                    checked={problemType === type.id}
                                    onChange={(e) =>
                                        setProblemType(e.target.value)
                                    }
                                    className="peer appearance-none w-6 h-6 rounded-full border-2 border-gray-200 checked:border-theme-primary transition-all cursor-pointer"
                                />
                                <div className="absolute w-3 h-3 rounded-full bg-theme-primary scale-0 peer-checked:scale-100 transition-transform" />
                            </div>
                        </label>
                    ))}
                </div>
            </div>

            {/* Box 2: Description */}
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100">
                <label className="text-base font-bold text-gray-900 block mb-6 text-start">
                    {t('problemDescription')}
                </label>
                <textarea
                    rows={6}
                    placeholder={t('problemDescription')}
                    className="w-full p-6 rounded-2xl bg-gray-50/50 border border-gray-100 focus:border-theme-primary-border focus:ring-4 focus:ring-theme-primary/5 outline-none transition-all resize-none text-start"
                />
            </div>

            {/* Box 3: Image Upload */}
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100">
                <label className="text-base font-bold text-gray-900 block mb-6 text-start">
                    {t('addImages')}
                </label>
                <div className="relative group flex flex-col items-center justify-center border-2 border-dashed border-gray-100 rounded-3xl bg-gray-50/30 py-12 px-6 hover:border-theme-primary/30 transition-all cursor-pointer">
                    <input
                        type="file"
                        multiple
                        className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <ImageIcon className="w-8 h-8 text-gray-400 group-hover:text-theme-primary transition-colors" />
                    </div>
                    <p className="text-sm font-medium text-gray-500">
                        {t('uploadDesc')}
                    </p>
                </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-4">
                <Button
                    type="submit"
                    className="h-12 px-14 rounded-xl bg-theme-primary hover:brightness-[0.95] text-white font-bold text-md shadow-lg shadow-theme-primary/20 transition-all active:scale-95">
                    {t('submit')}
                </Button>
            </div>
        </form>
    );
};
