'use client';

import { FormEvent } from 'react';
import { useTranslations } from 'next-intl';
import type { CustomerProfile, ProfileUpdateRequest } from '@/types/auth';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Label } from '@/components/ui/LabelField';
import { Loader2 } from 'lucide-react';

interface ProfileFormProps {
    profile: CustomerProfile;
    formData: ProfileUpdateRequest;
    onFormDataChange: (
        data:
            | ProfileUpdateRequest
            | ((prev: ProfileUpdateRequest) => ProfileUpdateRequest),
    ) => void;
    isEditing: boolean;
    isLoading: boolean;
    onSave: (data: ProfileUpdateRequest) => void;
    onCancel: () => void;
}

export default function ProfileForm({
    profile,
    formData,
    onFormDataChange,
    isEditing,
    isLoading,
    onSave,
    onCancel,
}: ProfileFormProps) {
    const t = useTranslations('Profile');

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!formData.first_name.trim()) {
            return;
        }
        onSave(formData);
    };

    const updateField = (field: keyof ProfileUpdateRequest, value: string) => {
        onFormDataChange({
            ...formData,
            [field]: value,
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 md:space-y-12">
            {/* Personal Information Section */}
            <div className="space-y-6 md:space-y-8">
                <div className="flex items-center gap-3">
                    <div className="w-1.5 h-5 md:h-6 bg-theme-primary rounded-full" />
                    <h2 className="text-lg md:text-xl font-bold text-gray-900">
                        {t('title')}
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 md:gap-y-10">
                    {/* First Name */}
                    <div className="space-y-2 md:space-y-3">
                        <Label className="text-[11px] md:text-sm font-bold text-gray-400 uppercase tracking-widest pl-1">
                            {t('firstName')} *
                        </Label>
                        {isEditing ? (
                            <Input
                                type="text"
                                required
                                value={formData.first_name}
                                onChange={(e) =>
                                    updateField('first_name', e.target.value)
                                }
                                placeholder={t('firstNamePlaceholder')}
                                containerClassName="h-12 md:h-14 rounded-xl bg-gray-50 border-gray-100 focus-within:border-theme-primary-border focus-within:ring-4 focus-within:ring-theme-primary/5 px-4 md:px-5"
                                className="font-semibold text-base md:text-lg text-gray-800"
                            />
                        ) : (
                            <div className="h-12 md:h-14 flex items-center px-4 md:px-5 rounded-xl bg-gray-50/50 border border-transparent font-semibold md:font-bold text-base md:text-xl text-gray-900">
                                {profile.first_name}
                            </div>
                        )}
                    </div>

                    {/* Last Name */}
                    <div className="space-y-2 md:space-y-3">
                        <Label className="text-[11px] md:text-sm font-bold text-gray-400 uppercase tracking-widest pl-1">
                            {t('lastName')}
                        </Label>
                        {isEditing ? (
                            <Input
                                type="text"
                                value={formData.last_name || ''}
                                onChange={(e) =>
                                    updateField('last_name', e.target.value)
                                }
                                placeholder={t('lastNamePlaceholder')}
                                containerClassName="h-12 md:h-14 rounded-xl bg-gray-50 border-gray-100 focus-within:border-theme-primary-border focus-within:ring-4 focus-within:ring-theme-primary/5 px-4 md:px-5"
                                className="font-semibold text-base md:text-lg text-gray-800"
                            />
                        ) : (
                            <div className="h-12 md:h-14 flex items-center px-4 md:px-5 rounded-xl bg-gray-50/50 border border-transparent font-semibold md:font-bold text-base md:text-xl text-gray-900">
                                {profile.last_name || '-'}
                            </div>
                        )}
                    </div>

                    {/* Middle Name */}
                    <div className="space-y-2 md:space-y-3">
                        <Label className="text-[11px] md:text-sm font-bold text-gray-400 uppercase tracking-widest pl-1">
                            {t('middleName')}
                        </Label>
                        {isEditing ? (
                            <Input
                                type="text"
                                value={formData.middle_name || ''}
                                onChange={(e) =>
                                    updateField('middle_name', e.target.value)
                                }
                                placeholder={t('middleNamePlaceholder')}
                                containerClassName="h-12 md:h-14 rounded-xl bg-gray-50 border-gray-100 focus-within:border-theme-primary-border focus-within:ring-4 focus-within:ring-theme-primary/5 px-4 md:px-5"
                                className="font-semibold text-base md:text-lg text-gray-800"
                            />
                        ) : (
                            <div className="h-12 md:h-14 flex items-center px-4 md:px-5 rounded-xl bg-gray-50/50 border border-transparent font-semibold md:font-bold text-base md:text-xl text-gray-900">
                                {profile.middle_name || '-'}
                            </div>
                        )}
                    </div>

                    {/* Email */}
                    <div className="space-y-2 md:space-y-3">
                        <Label className="text-[11px] md:text-sm font-bold text-gray-400 uppercase tracking-widest pl-1">
                            {t('email')}
                        </Label>
                        {isEditing ? (
                            <Input
                                type="email"
                                value={formData.email || ''}
                                onChange={(e) =>
                                    updateField('email', e.target.value)
                                }
                                placeholder={t('emailPlaceholder')}
                                containerClassName="h-12 md:h-14 rounded-xl bg-gray-50 border-gray-100 focus-within:border-theme-primary-border focus-within:ring-4 focus-within:ring-theme-primary/5 px-4 md:px-5"
                                className="font-semibold text-base md:text-lg text-gray-800"
                            />
                        ) : (
                            <div className="h-12 md:h-14 flex items-center px-4 md:px-5 rounded-xl bg-gray-50/50 border border-transparent font-semibold md:font-bold text-base md:text-xl text-gray-900 lg:truncate overflow-hidden">
                                {profile.email || '-'}
                            </div>
                        )}
                    </div>

                    {/* Phone Number (Full Width in its row) */}
                    <div className="space-y-2 md:space-y-3 md:col-span-2">
                        <Label className="text-[11px] md:text-sm font-bold text-gray-400 uppercase tracking-widest pl-1">
                            {t('phone')}
                        </Label>
                        <div className="h-12 md:h-14 flex items-center px-4 md:px-5 rounded-xl bg-gray-100/80 border border-gray-200/50 font-semibold md:font-bold text-base md:text-xl text-gray-400 cursor-not-allowed">
                            {profile.phone}
                        </div>
                    </div>
                </div>
            </div>

            {/* Account Stats Section */}
            {!isEditing && (
                <div className="space-y-6 md:space-y-8 pt-8 md:pt-10 border-t border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="w-1.5 h-5 md:h-6 bg-theme-primary rounded-full" />
                        <h2 className="text-lg md:text-xl font-bold text-gray-900">
                            {t('subtitle')}
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                        <div className="bg-theme-primary/5 p-5 md:p-8 rounded-2xl md:rounded-3xl border border-theme-primary/10 transition-all hover:shadow-md hover:shadow-theme-primary/5 group">
                            <p className="text-[11px] md:text-sm font-bold text-theme-primary/60 uppercase tracking-widest mb-1 md:mb-2">
                                {t('points')}
                            </p>
                            <p className="text-2xl md:text-4xl font-black text-theme-primary ">
                                {profile.points}
                            </p>
                        </div>
                        <div className="bg-gray-50 p-5 md:p-8 rounded-2xl md:rounded-3xl border border-gray-100 transition-all hover:shadow-md hover:shadow-gray-100 group">
                            <p className="text-[11px] md:text-sm font-bold text-gray-400 uppercase tracking-widest mb-1 md:mb-2">
                                {t('totalOrders')}
                            </p>
                            <p className="text-2xl md:text-4xl font-black text-gray-900">
                                {profile.total_orders}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Form Actions */}
            {isEditing && (
                <div className="flex flex-col sm:flex-row items-center justify-end gap-3 md:gap-4 pt-6 md:pt-8 border-t border-gray-100">
                    <Button
                        type="button"
                        variant="ghost"
                        size="xl"
                        onClick={onCancel}
                        disabled={isLoading}
                        className="w-full sm:w-auto font-normal">
                        {t('cancel')}
                    </Button>
                    <Button
                        type="submit"
                        variant="primary"
                        size="xl"
                        disabled={isLoading || !formData.first_name.trim()}
                        className="w-full sm:w-auto active:scale-95">
                        {isLoading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                {t('saving')}
                            </>
                        ) : (
                            t('save')
                        )}
                    </Button>
                </div>
            )}
        </form>
    );
}
