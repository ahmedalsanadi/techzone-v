//src/components/layouts/PageContainer.tsx
'use client';

import { useUiStore } from '@/store/useUiStore';
import Navbar from './Navbar';
import SubHeader from './SubHeader';
import Footer from './Footer';
import { useEffect } from 'react';
import { usePathname } from '@/i18n/navigation';
import FloatingButtons from './FloatingButtons';

export default function PageContainer({
    children,
}: {
    children: React.ReactNode;
}) {
    const { showSubHeader, setMobileMenuOpen } = useUiStore();
    const pathname = usePathname();

    // Close mobile menu on route change
    useEffect(() => {
        setMobileMenuOpen(false);
    }, [pathname, setMobileMenuOpen]);

    const isAuthPage =
        pathname?.includes('/signup') ||
        pathname?.includes('/signin') ||
        pathname?.includes('/sign-in');

    if (isAuthPage) {
        return (
            <main className="min-h-screen flex flex-col relative overflow-x-hidden">
                <div className="flex-1">{children}</div>
            </main>
        );
    }

    return (
        <main className="min-h-screen flex flex-col relative">
            {/*-------- Red bg header ----------- */}
            <nav
                className={`bg-libero-red transition-all duration-300 ${
                    showSubHeader ? 'h-[190px] lg:h-[140px]' : 'h-[75px]'
                } flex flex-col`}>
                <div className="container mx-auto px-4 py-4 flex-1 flex flex-col">
                    <Navbar />
                    {showSubHeader && <SubHeader />}
                </div>
            </nav>
            <div className="container mx-auto px-4 flex-1">{children}</div>
            <FloatingButtons />
            <Footer />
        </main>
    );
}
