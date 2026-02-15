//src/components/layouts/LogoImage.tsx
import Image from 'next/image';
import { Link } from '@/i18n/navigation';

interface LogoProps {
    brandName: string;
    brandLogo: string;
}

export default function LogoImage({ brandName, brandLogo }: LogoProps) {
    return (
        <Link
            href="/"
            className="flex items-center gap-2 md:gap-3 group transition-all duration-300">
            <div className="relative w-7 h-7 md:w-11 md:h-11 transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                {brandLogo && (
                    <Image
                        src={brandLogo}
                        alt={brandName}
                        fill
                        priority
                        className="object-contain w-full h-full drop-shadow-sm"
                    />
                )}
            </div>
            <span className="text-theme-secondary text-xl md:text-3xl font-black tracking-tighter leading-none align-middle drop-shadow-sm group-hover:drop-shadow-md transition-all">
                {brandName}
            </span>
        </Link>
    );
}
