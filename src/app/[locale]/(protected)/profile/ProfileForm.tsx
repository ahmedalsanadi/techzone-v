'use client';

import { FormEvent } from 'react';
import { useTranslations } from 'next-intl';
import type { CustomerProfile, ProfileUpdateRequest } from '@/types/auth';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import PhoneInput from '@/components/ui/PhoneInput';
import { Label } from '@/components/ui/LabelField';
import { Loader2 } from 'lucide-react';

interface ProfileFormProps {
    profile: CustomerProfile;
    formData: ProfileUpdateRequest;
    onFormDataChange: (data: ProfileUpdateRequest) => void;
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
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name Display (Read-only) */}
            {!isEditing && (
                <div className="space-y-2">
                    <Label className="text-xs font-bold text-gray-400">
                        {t('fullName') || 'Full Name'}
                    </Label>
                    <div className="text-lg font-bold text-gray-900">
                        {profile.full_name}
                    </div>
                </div>
            )}

            {/* First Name */}
            <div className="space-y-2">
                <Label className="text-xs font-bold text-gray-400">
                    {t('firstName') || 'First Name'} *
                </Label>
                {isEditing ? (
                    <Input
                        type="text"
                        required
                        value={formData.first_name}
                        onChange={(e) => updateField('first_name', e.target.value)}
                        placeholder={t('firstNamePlaceholder') || 'أحمد'}
                        variant="default"
                        inputSize="lg"
                        containerClassName="h-16 rounded-2xl bg-[#F4F7FA] border-[#E2E8F0] focus-within:border-theme-primary-border focus-within:ring-4 focus-within:ring-theme-primary/5 px-6"
                        className="font-bold text-lg text-[#2D3142]"
                    />
                ) : (
                    <div className="text-lg font-bold text-gray-900">
                        {profile.first_name}
                    </div>
                )}
            </div>

            {/* Middle Name and Last Name Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Middle Name */}
                <div className="space-y-2">
                    <Label className="text-xs font-bold text-gray-400">
                        {t('middleName') || 'Middle Name'}
                    </Label>
                    {isEditing ? (
                        <Input
                            type="text"
                            value={formData.middle_name || ''}
                            onChange={(e) =>
                                updateField('middle_name', e.target.value)
                            }
                            placeholder={t('middleNamePlaceholder') || 'محمد'}
                            variant="default"
                            inputSize="lg"
                            containerClassName="h-16 rounded-2xl bg-[#F4F7FA] border-[#E2E8F0] focus-within:border-theme-primary-border focus-within:ring-4 focus-within:ring-theme-primary/5 px-6"
                            className="font-bold text-lg text-[#2D3142]"
                        />
                    ) : (
                        <div className="text-lg font-bold text-gray-900">
                            {profile.middle_name || '-'}
                        </div>
                    )}
                </div>

                {/* Last Name */}
                <div className="space-y-2">
                    <Label className="text-xs font-bold text-gray-400">
                        {t('lastName') || 'Last Name'}
                    </Label>
                    {isEditing ? (
                        <Input
                            type="text"
                            value={formData.last_name || ''}
                            onChange={(e) =>
                                updateField('last_name', e.target.value)
                            }
                            placeholder={t('lastNamePlaceholder') || 'العلي'}
                            variant="default"
                            inputSize="lg"
                            containerClassName="h-16 rounded-2xl bg-[#F4F7FA] border-[#E2E8F0] focus-within:border-theme-primary-border focus-within:ring-4 focus-within:ring-theme-primary/5 px-6"
                            className="font-bold text-lg text-[#2D3142]"
                        />
                    ) : (
                        <div className="text-lg font-bold text-gray-900">
                            {profile.last_name || '-'}
                        </div>
                    )}
                </div>
            </div>

            {/* Phone (Read-only) */}
            <div className="space-y-2">
                <Label className="text-xs font-bold text-gray-400">
                    {t('phone') || 'Phone Number'}
                </Label>
                <PhoneInput
                    label=""
                    value={profile.phone}
                    onChange={() => {}}
                    required
                    disabled
                    inputClassName="bg-gray-100 text-gray-400"
                />
            </div>

            {/* Email */}
            <div className="space-y-2">
                <Label className="text-xs font-bold text-gray-400">
                    {t('email') || 'Email'}
                </Label>
                {isEditing ? (
                    <Input
                        type="email"
                        value={formData.email || ''}
                        onChange={(e) => updateField('email', e.target.value)}
                        placeholder={t('emailPlaceholder') || 'someone@example.com'}
                        variant="default"
                        inputSize="lg"
                        containerClassName="h-16 rounded-2xl bg-[#F4F7FA] border-[#E2E8F0] focus-within:border-theme-primary-border focus-within:ring-4 focus-within:ring-theme-primary/5 px-6"
                        className="font-bold text-lg text-[#2D3142]"
                    />
                ) : (
                    <div className="text-lg font-bold text-gray-900">
                        {profile.email || '-'}
                    </div>
                )}
            </div>

            {/* Additional Info (Read-only) */}
            {!isEditing && (
                <div className="pt-6 border-t border-gray-200 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label className="text-xs font-bold text-gray-400">
                                {t('points') || 'Loyalty Points'}
                            </Label>
                            <div className="text-lg font-bold text-gray-900">
                                {profile.points}
                            </div>
                        </div>
                        <div>
                            <Label className="text-xs font-bold text-gray-400">
                                {t('totalOrders') || 'Total Orders'}
                            </Label>
                            <div className="text-lg font-bold text-gray-900">
                                {profile.total_orders}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Action Buttons */}
            {isEditing && (
                <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onCancel}
                        disabled={isLoading}>
                        {t('cancel') || 'Cancel'}
                    </Button>
                    <Button
                        type="submit"
                        variant="default"
                        disabled={isLoading || !formData.first_name.trim()}>
                        {isLoading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                {t('saving') || 'Saving...'}
                            </>
                        ) : (
                            t('save') || 'Save Changes'
                        )}
                    </Button>
                </div>
            )}
        </form>
    );
}
