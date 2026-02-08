//src/components/layouts/LogoImage.tsx
import Image from 'next/image';
import { Link } from '@/i18n/navigation';

interface LogoProps {
    brandName: string;
    brandLogo: string;
}

export default function LogoImage({ brandName, brandLogo }: LogoProps) {
    return (
        <Link href="/" className="flex items-center gap-1.5 md:gap-2">
            <div className="relative w-6 h-6 md:w-10 md:h-10">
                {brandLogo && (
                    <Image
                        src={brandLogo}
                        alt={brandName}
                        fill
                        priority
                        className="object-contain"
                    />
                )}
            </div>
            <p className="text-white text-lg md:text-[22px] font-medium leading-none">
                {brandName}
            </p>
        </Link>
    );
}
