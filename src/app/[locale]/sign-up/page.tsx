// src/app/[locale]/sign-up/page.tsx
// Redirect to unified auth page
import { redirect } from '@/i18n/navigation';

export default async function SignupPage({
    params,
    searchParams,
}: {
    params: Promise<{ locale: string }>;
    searchParams: Promise<{ redirect?: string }>;
}) {
    const { redirect: redirectTo } = await searchParams;
    
    // Redirect to unified auth page with signup step
    // next-intl redirect automatically handles locale prefix
    if (redirectTo) {
        redirect(`/auth?step=signup&redirect=${encodeURIComponent(redirectTo)}` as any);
    } else {
        redirect('/auth?step=signup' as any);
    }
}
