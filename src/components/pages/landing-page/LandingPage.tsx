'use client';

import Navbar from '@/components/layouts/Navbar';
import Image from 'next/image';
import Link from 'next/link';

export default function LandingPage() {

    return (
        <main>
            {/*-------- Red bg header ----------- */}
            <nav className="bg-libero-red h-[100px] ">
                <div className="relative container mx-auto p-4">
                    {/*-- Navbar---- */}
                     <Navbar />  
                </div>
            </nav>
        </main>
    );
}


