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

    const isAuthPage = pathname?.includes('/auth');

    if (isAuthPage) {
        return (
            <main className="min-h-screen flex flex-col relative overflow-x-hidden">
                <div className="flex-1">{children}</div>
            </main>
        );
    }

    return (
        <main className="min-h-screen flex flex-col relative">
            {/*-------- Theme primary bg header - fixed height so blue bar never grows; z-20 so it stays above content ----------- */}
            <nav
                className={`bg-theme-primary transition-all duration-300 relative z-20 overflow-visible flex flex-col shrink-0 ${
                    showSubHeader
                        ? 'h-[190px] lg:h-[160px]'
                        : 'min-h-[75px] lg:min-h-[120px]'
                }`}>
                <div className="container mx-auto px-4 py-1 flex-1 flex flex-col min-h-0">
                    <Navbar />
                    {showSubHeader && <SubHeader />}
                </div>
            </nav>
            {/*-------- Content overlaps bottom of nav when subheader shown so half of subheader sits on white ----------- */}
            <div
                className={`container mx-auto px-4 flex-1 ${showSubHeader ? '-mt-16 lg:-mt-12 pt-16 lg:pt-12 bg-white' : ''}`}>
                <div className="flex flex-col gap-4 min-h-screen py-1">
                    {children}
                </div>
            </div>
            <FloatingButtons />
            <Footer />
        </main>
    );
}
