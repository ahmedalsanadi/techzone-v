'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { StoreConfig } from '@/services/types';
import AuthContainer from '@/components/auth/AuthContainer';
import PhoneInput from '@/components/ui/PhoneInput';
import { useRouter } from '@/i18n/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { storeService } from '@/services/store-service';
import { toast } from 'sonner';

interface SignupContentProps {
    config: StoreConfig;
    locale: string;
}

export default function SignupContent({ config, locale }: SignupContentProps) {
    const t = useTranslations('Signup');
    const router = useRouter();
    const { user, updateUser } = useAuthStore();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        first_name: '',
        middle_name: '',
        last_name: '',
        phone: user?.phone || '',
        email: user?.email || '',
    });

    useEffect(() => {
        if (user) {
            setFormData((prev) => ({
                ...prev,
                phone: user.phone || '',
                email: user.email || '',
            }));
        }
    }, [user]);

    const handleRegisterSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const updatedProfile = await storeService.updateProfile({
                first_name: formData.first_name,
                middle_name: formData.middle_name,
                last_name: formData.last_name,
                email: formData.email,
            });

            // Update local store user info
            updateUser({
                name: updatedProfile.full_name,
                email: updatedProfile.email,
            });

            toast.success(t('profileUpdated') || 'تم تحديث الملف الشخصي بنجاح');
            router.replace('/');
        } catch (error: any) {
            toast.error(error.message || 'Error updating profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthContainer config={config} locale={locale} title={t('title')}>
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <p className="text-xl font-black text-[#2D3142] text-start">
                    {t('subtitle')}
                </p>

                <form onSubmit={handleRegisterSubmit} className="space-y-6">
                    {/* First Name Input */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 block text-start">
                            {t('firstName') || 'الاسم الأول'}
                        </label>
                        <input
                            type="text"
                            required
                            placeholder="احمد"
                            className="w-full h-16 px-6 rounded-2xl bg-[#F4F7FA] border border-[#E2E8F0] focus:border-[#B44734]/30 focus:ring-4 focus:ring-[#B44734]/5 outline-none transition-all font-bold text-lg text-[#2D3142] text-start"
                            value={formData.first_name}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    first_name: e.target.value,
                                })
                            }
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Middle Name */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 block text-start">
                                {t('middleName') || 'اسم الأب'}
                            </label>
                            <input
                                type="text"
                                className="w-full h-16 px-6 rounded-2xl bg-[#F4F7FA] border border-[#E2E8F0] focus:border-[#B44734]/30 focus:ring-4 focus:ring-[#B44734]/5 outline-none transition-all font-bold text-lg text-[#2D3142] text-start"
                                value={formData.middle_name}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        middle_name: e.target.value,
                                    })
                                }
                            />
                        </div>
                        {/* Last Name */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 block text-start">
                                {t('lastName') || 'اللقب'}
                            </label>
                            <input
                                type="text"
                                className="w-full h-16 px-6 rounded-2xl bg-[#F4F7FA] border border-[#E2E8F0] focus:border-[#B44734]/30 focus:ring-4 focus:ring-[#B44734]/5 outline-none transition-all font-bold text-lg text-[#2D3142] text-start"
                                value={formData.last_name}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        last_name: e.target.value,
                                    })
                                }
                            />
                        </div>
                    </div>

                    <PhoneInput
                        label={t('phone')}
                        value={formData.phone}
                        onChange={() => {}} // Phone is fixed after OTP
                        required
                        disabled
                        inputClassName="bg-gray-100 text-gray-400"
                    />

                    {/* Email Input */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 block text-start">
                            {t('email')}
                        </label>
                        <input
                            type="email"
                            placeholder="someone@gmail.com"
                            className="w-full h-16 px-6 rounded-2xl bg-[#F4F7FA] border border-[#E2E8F0] focus:border-[#B44734]/30 focus:ring-4 focus:ring-[#B44734]/5 outline-none transition-all font-bold text-lg text-[#2D3142] text-start"
                            value={formData.email}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    email: e.target.value,
                                })
                            }
                        />
                    </div>

                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full h-16 rounded-2xl text-white font-black text-2xl shadow-xl transition-all active:scale-[0.98] mt-6 bg-libero-red shadow-libero-red/20">
                        {loading ? (
                            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            t('submit')
                        )}
                    </Button>
                </form>
            </div>
        </AuthContainer>
    );
}
