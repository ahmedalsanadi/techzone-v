import { setupLocale } from '@/i18n/setup-locale';
import LandingPage from '@/components/pages/landing-page/LandingPage';

export default async function HomePage({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    // Enable static rendering and validate locale
    setupLocale(locale);

    return <LandingPage />;
}
