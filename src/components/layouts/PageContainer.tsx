'use client';

import { useUiStore } from '@/store/use-ui-store';
import Navbar from './Navbar';
import SubHeader from './SubHeader';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

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

    return (
        <main className="min-h-screen">
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
            <div className="container mx-auto px-4">{children}</div>
        </main>
    );
}
