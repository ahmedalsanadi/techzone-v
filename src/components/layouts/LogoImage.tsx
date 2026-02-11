//src/components/layouts/LogoImage.tsx
import Image from 'next/image';
import { Link } from '@/i18n/navigation';

interface LogoProps {
    brandName: string;
    brandLogo: string;
}

export default function LogoImage({ brandName, brandLogo }: LogoProps) {
    return (
        <Link href="/" className="flex items-center gap-1.5 md:gap-2 mt-1 ps-2 ">
            <div className="relative w-6 h-6 md:w-10 md:h-10 lg:w-16 lg:h-16">
                {brandLogo && (
                    <Image
                        src={brandLogo}
                        alt={brandName}
                        fill
                        priority
                        className="object-contain w-full h-full"
                    />
                )}
            </div>
            <p className="text-white text-lg md:text-[20px] font-medium leading-none align-middle mb-2">
                {brandName}
            </p>
        </Link>
    );
}
