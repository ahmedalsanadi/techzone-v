import React from 'react';
import { Utensils } from 'lucide-react';

export default function Loading() {
    return (
        <div className="fixed inset-0 z-9999 flex flex-col items-center justify-center bg-white/90 backdrop-blur-md">
            <div className="relative flex items-center justify-center">
                {/* Background decorative circles */}
                <div className="absolute w-32 h-32 bg-[#B44734]/5 rounded-full animate-pulse" />
                <div className="absolute w-24 h-24 bg-[#B44734]/10 rounded-full animate-ping [animation-duration:3s]" />

                {/* Spinning loader ring */}
                <div className="w-20 h-20 border-[3px] border-gray-100 border-t-[#B44734] rounded-full animate-spin [animation-duration:0.8s]" />

                {/* Central Icon */}
                <div className="absolute flex items-center justify-center">
                    <Utensils
                        size={32}
                        className="text-[#B44734] animate-bounce"
                    />
                </div>
            </div>

            {/* Branding Text */}
            <div className="mt-8 flex flex-col items-center gap-3">
                <div className="flex items-center gap-2">
                    <span className="text-2xl font-black text-gray-900 tracking-tighter uppercase italic">
                        Fasto
                    </span>
                </div>

                {/* Loading Dots */}
                <div className="flex gap-1.5 items-center bg-gray-50 px-4 py-1.5 rounded-full border border-gray-100 shadow-sm">
                    <div className="w-2 h-2 bg-[#B44734] rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <div className="w-2 h-2 bg-[#B44734] rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <div className="w-2 h-2 bg-[#B44734] rounded-full animate-bounce" />
                </div>
            </div>

            {/* Minimalist Progress Indicator at Bottom */}
            <div className="absolute bottom-10 w-48 h-1 bg-gray-100 rounded-full overflow-hidden">
                <div className="w-full h-full bg-[#B44734] origin-left animate-loading-progress" />
            </div>
        </div>
    );
}
