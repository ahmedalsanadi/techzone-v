import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { storeService } from '@/services/store-service';
import ProfileView from './ProfileView';
import Breadcrumbs from '@/components/ui/Breadcrumbs';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string }>;
}): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'Profile' });

    return {
        title: t('title') || 'Profile',
        description: t('description') || 'View and update your profile',
    };
}

export default async function ProfilePage({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'Profile' });

    // Fetch profile data on the server
    let initialProfile = null;
    try {
        initialProfile = await storeService.getProfile();
    } catch (error) {
        // Profile fetch failed - will be handled in the view
        console.error('Failed to fetch profile:', error);
    }

    const breadcrumbItems = [
        { label: t('home') || 'Home', href: '/' },
        { label: t('profile') || 'Profile' },
    ];

    return (
        <div className="space-y-6">
            <Breadcrumbs items={breadcrumbItems} />
            <ProfileView initialProfile={initialProfile} />
        </div>
    );
}
