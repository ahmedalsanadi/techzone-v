'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import { Button } from '@/components/ui/Button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '../ui/DropdownMenu';

const LanguageSwitcher = () => {
    const router = useRouter();
    const pathname = usePathname();
    const locale = useLocale();

    const changeLanguage = (newLanguage: string) => {
        // Check if the language is actually changing to avoid unnecessary re-renders/pushes
        if (newLanguage === locale) return;

        document.cookie = `NEXT_LOCALE=${newLanguage}; path=/;`;

        // next-intl's useRouter.push handles the locale prefixing automatically
        // if configured in navigation.ts
        router.push(pathname, { locale: newLanguage });
        router.refresh();
    };

    const languageLabels = {
        ar: 'العربية',
        en: 'English',
    };

    return (
        <DropdownMenu dir={locale === 'ar' ? 'rtl' : 'ltr'}>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                    {languageLabels[locale as keyof typeof languageLabels] ||
                        languageLabels.en}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => changeLanguage('en')}>
                    English
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => changeLanguage('ar')}>
                    العربية
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default LanguageSwitcher;
