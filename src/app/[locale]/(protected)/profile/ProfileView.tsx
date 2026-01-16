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
            toast.success(
                t('updateSuccess') || 'Profile updated successfully',
            );
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
                    <Loader2 className="w-8 h-8 animate-spin text-libero-red" />
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
        <div className="mt-8 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-gray-900">
                        {t('title') || 'Profile'}
                    </h1>
                    <p className="text-gray-600 mt-2">
                        {t('subtitle') ||
                            'View and manage your personal information'}
                    </p>
                </div>
                {!isEditing && (
                    <Button
                        onClick={() => setIsEditing(true)}
                        variant="default">
                        {t('edit') || 'Edit Profile'}
                    </Button>
                )}
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
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
