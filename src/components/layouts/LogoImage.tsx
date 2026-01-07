//src/components/layouts/Logo.tsx

import DynamicImage from '@/components/ui/DynamicImage';
import { Link } from '@/i18n/navigation';

interface LogoProps {
    brandName: string;
    brandLogo: string;
}

export default function LogoImage({ brandName, brandLogo }: LogoProps) {
    const FallbackLogo = (
        <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-amber-500">
            <path d="m8 3 4 8 5-5 5 15H2L8 3z" />
        </svg>
    );

    return (
        <Link href="/" className="flex items-center gap-1.5 md:gap-2">
            <div className="relative w-6 h-6 md:w-8 md:h-8">
                <DynamicImage
                    src={brandLogo}
                    alt={brandName}
                    fill
                    className="object-contain"
                    fallbackComponent={FallbackLogo}
                />
            </div>
            <p className="text-amber-300 text-xl md:text-[28px] font-medium leading-none">
                {brandName}
            </p>
        </Link>
    );
}
