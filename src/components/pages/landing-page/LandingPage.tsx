'use client';

import { useEffect } from 'react';
import { useUiStore } from '@/store/use-ui-store';

export default function LandingPage() {
    const { setShowSubHeader } = useUiStore();

    // Ensure SubHeader is shown on landing page
    useEffect(() => {
        setShowSubHeader(true);
        // Optional: return () => setShowSubHeader(false); if you want it hidden by default on other pages
    }, [setShowSubHeader]);

    return (
        <div className="py-8">
            {/* Landing page content goes here */}
            <h1 className="text-2xl font-bold">Welcome to Fasto</h1>
        </div>
    );
}
