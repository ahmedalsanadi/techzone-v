//src/components/layouts/Logo.tsx

import Image from 'next/image';

interface LogoProps {
    brandName: string;
    brandLogo: string; // Path to the brand logo image
}
export default function Logo({ brandName, brandLogo }: LogoProps) {
    return (
        <div className="flex items-center gap-1.5 md:gap-2">
            <Image
                src={brandLogo}
                alt={brandName}
                width={24}
                height={26}
                className="md:w-7 md:h-7.5"
            />
            <p className="text-amber-300 text-xl md:text-[28px] font-medium leading-none">
                {brandName}
            </p>
        </div>
    );
}
