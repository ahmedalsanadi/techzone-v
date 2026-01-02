//src/components/layouts/Logo.tsx

import Image from "next/image";

interface LogoProps {
    brandName: string;
    brandLogo: string; // Path to the brand logo image
}
export default function Logo({ brandName, brandLogo }: LogoProps) {
    return (
        <div className="flex items-center gap-2">
            <Image
                src={brandLogo}
                alt={brandName}
                width={28}
                height={30}
            />
           <p className="text-amber-300 text-[28px] font-medium ">
                {brandName}
            </p>
        </div>
    );
}
