'use client';

import Navbar from '@/components/layouts/Navbar';
import SubHeader from '@/components/layouts/SubHeader';
import Image from 'next/image';
import Link from 'next/link';

export default function LandingPage() {

    return (
        <main>
            {/*-------- Red bg header ----------- */}
            <nav className="bg-libero-red h-[140px] ">
                <div className="relative container mx-auto p-4">
                    {/*-- Navbar---- */}
                     <Navbar />  

                     <SubHeader />
                </div>
            </nav>
        </main>
    );
}


