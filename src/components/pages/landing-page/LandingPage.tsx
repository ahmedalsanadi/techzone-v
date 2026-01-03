'use client';

import { useEffect } from 'react';
// import { useUiStore } from '@/store/use-ui-store';
import HeroSlider from './HeroSlider';
import CategorySection from './CategorySection';
import PromotionsSection from './PromotionsSection';

export default function LandingPage() {
    // const { setShowSubHeader } = useUiStore();

    // // Ensure SubHeader is shown on landing page
    // useEffect(() => {
    //     setShowSubHeader(true);
    // }, [setShowSubHeader]);

    return (
        <div className="pb-12 bg-white">
            <HeroSlider />

            <div className="container mx-auto px-4 mt-8">
                <CategorySection />
                <PromotionsSection />

                {/* Other landing page content will go here */}
            </div>
        </div>
    );
}
