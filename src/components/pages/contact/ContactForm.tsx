/**
 * Contact form component
 */

import React from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';

export const ContactForm: React.FC = () => {
    const t = useTranslations('Contact');

    return (
        <div className="bg-white rounded-3xl p-8 md:p-10 shadow-sm border border-gray-100 h-full">
            <form className="space-y-8">
                <div className="space-y-6">
                    {/* Email */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 block text-start">
                            {t('form.email')}
                        </label>
                        <input
                            type="email"
                            placeholder={t('form.placeholder_email')}
                            className="w-full h-14 px-6 rounded-2xl bg-gray-50/50 border border-gray-100 focus:border-[#B44734]/30 focus:ring-4 focus:ring-[#B44734]/5 outline-none transition-all text-start"
                        />
                    </div>

                    {/* Subject */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 block text-start">
                            {t('form.subject')}
                        </label>
                        <input
                            type="text"
                            placeholder={t('form.placeholder_subject')}
                            className="w-full h-14 px-6 rounded-2xl bg-gray-50/50 border border-gray-100 focus:border-[#B44734]/30 focus:ring-4 focus:ring-[#B44734]/5 outline-none transition-all text-start"
                        />
                    </div>

                    {/* Message */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 block text-start">
                            {t('form.message')}
                        </label>
                        <textarea
                            rows={8}
                            className="w-full p-6 rounded-2xl bg-gray-50/50 border border-gray-100 focus:border-[#B44734]/30 focus:ring-4 focus:ring-[#B44734]/5 outline-none transition-all resize-none text-start"
                        />
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <Button
                        type="submit"
                        className="h-10 px-14 rounded-lg bg-[#B44734] hover:bg-[#9E3E2D] text-white font-bold text-md shadow-lg shadow-[#B44734]/20 transition-all active:scale-95">
                        {t('form.send')}
                    </Button>
                </div>
            </form>
        </div>
    );
};
