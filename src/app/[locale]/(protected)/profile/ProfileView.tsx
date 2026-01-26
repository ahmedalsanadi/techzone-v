'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/useAuthStore';
import { storeService } from '@/services/store-service';
import type { CustomerProfile, ProfileUpdateRequest } from '@/types/auth';
import ProfileForm from './ProfileForm';
import { Button } from '@/components/ui/Button';
import { User, Loader2 } from 'lucide-react';

interface ProfileViewProps {
    initialProfile: CustomerProfile | null;
}

export default function ProfileView({ initialProfile }: ProfileViewProps) {
    const t = useTranslations('Profile');
    const { profile, setProfile } = useAuthStore();
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState<ProfileUpdateRequest>({
        first_name: '',
        middle_name: '',
        last_name: '',
        email: '',
    });

    // Use profile from store if available, otherwise use initialProfile
    const currentProfile = profile || initialProfile;

    // Initialize form data from profile
    useEffect(() => {
        if (currentProfile) {
            setFormData({
                first_name: currentProfile.first_name || '',
                middle_name: currentProfile.middle_name || '',
                last_name: currentProfile.last_name || '',
                email: currentProfile.email || '',
            });
        }
    }, [currentProfile]);

    // Load profile if not available
    useEffect(() => {
        const loadProfile = async () => {
            if (!currentProfile && !isLoading) {
                setIsLoading(true);
                try {
                    const fetchedProfile = await storeService.getProfile();
                    setProfile(fetchedProfile);
                } catch (error) {
                    toast.error(
                        t('loadError') ||
                            'Failed to load profile. Please try again.',
                    );
                } finally {
                    setIsLoading(false);
                }
            }
        };

        loadProfile();
    }, [currentProfile, isLoading, setProfile, t]);

    const handleSave = async (data: ProfileUpdateRequest) => {
        setIsSaving(true);
        try {
            const updatedProfile = await storeService.updateProfile(data);
            setProfile(updatedProfile);
            setIsEditing(false);
            toast.success(t('updateSuccess') || 'Profile updated successfully');
        } catch (error: any) {
            const errorMessage =
                error?.message ||
                t('updateError') ||
                'Failed to update profile. Please try again.';
            toast.error(errorMessage);
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        // Reset form data to current profile
        if (currentProfile) {
            setFormData({
                first_name: currentProfile.first_name || '',
                middle_name: currentProfile.middle_name || '',
                last_name: currentProfile.last_name || '',
                email: currentProfile.email || '',
            });
        }
        setIsEditing(false);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-8 h-8 animate-spin text-theme-primary" />
                    <p className="text-gray-600">
                        {t('loading') || 'Loading profile...'}
                    </p>
                </div>
            </div>
        );
    }

    if (!currentProfile) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center space-y-4">
                    <User className="w-16 h-16 text-gray-400 mx-auto" />
                    <p className="text-gray-600">
                        {t('notFound') || 'Profile not found'}
                    </p>
                    <Button
                        onClick={() => window.location.reload()}
                        variant="outline">
                        {t('retry') || 'Retry'}
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="mt-4 space-y-4 md:space-y-8">
            {/* Header Section */}
            <div className="bg-white rounded-2xl md:rounded-3xl p-5 md:p-10 shadow-sm border border-gray-100 flex flex-col md:flex-row items-center md:items-end justify-between gap-6 overflow-hidden relative">
                <div className="absolute top-0 start-0 w-32 h-32 bg-theme-primary/5 rounded-full -ms-16 -mt-16" />

                <div className="flex flex-col items-center md:items-start text-center md:text-start relative z-10">
                    <div className="w-14 h-14 md:w-20 md:h-20 rounded-xl md:rounded-2xl bg-theme-primary/10 flex items-center justify-center mb-4 ring-4 md:ring-8 ring-theme-primary/5">
                        <User className="w-7 h-7 md:w-10 md:h-10 text-theme-primary" />
                    </div>
                    <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold md:font-black text-gray-900">
                        {isEditing ? t('edit') : t('title')}
                    </h1>
                    <p className="text-gray-500 text-sm md:text-base font-medium mt-1 md:mt-2 max-w-sm">
                        {t('subtitle')}
                    </p>
                </div>

                {!isEditing && (
                    <Button
                        onClick={() => setIsEditing(true)}
                        className="w-full md:w-auto h-11 md:h-12 px-8 md:px-10 rounded-xl bg-theme-primary hover:brightness-95 text-white font-bold text-sm md:text-md shadow-lg shadow-theme-primary/20 transition-all active:scale-95 relative z-10">
                        {t('edit')}
                    </Button>
                )}
            </div>

            {/* Profile Content */}
            <div className="bg-white rounded-2xl md:rounded-[40px] p-5 md:p-10 lg:p-12 shadow-sm border border-gray-100 min-h-[300px] md:min-h-[400px]">
                <ProfileForm
                    profile={currentProfile}
                    formData={formData}
                    onFormDataChange={setFormData}
                    isEditing={isEditing}
                    isLoading={isSaving}
                    onSave={handleSave}
                    onCancel={handleCancel}
                />
            </div>
        </div>
    );
}
