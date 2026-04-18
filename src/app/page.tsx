// src/app/page.tsx
import { redirect } from 'next/navigation';
import { routing } from '@/i18n/routing';

// This handles the root URL (/) and redirects to the default locale
export default function RootPage() {
    redirect(`/${routing.defaultLocale}`);
}