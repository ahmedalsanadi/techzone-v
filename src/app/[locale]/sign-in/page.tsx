// src/app/[locale]/sign-in/page.tsx
// Redirect to unified auth page
import { redirect } from '@/i18n/navigation';

export default async function SigninPage({
    params,
    searchParams,
}: {
    params: Promise<{ locale: string }>;
    searchParams: Promise<{ redirect?: string }>;
}) {
    const { redirect: redirectTo } = await searchParams;
    
    // Redirect to unified auth page
    // next-intl redirect automatically handles locale prefix
    if (redirectTo) {
        redirect(`/auth?redirect=${encodeURIComponent(redirectTo)}` as any);
    } else {
        redirect('/auth' as any);
    }
}
