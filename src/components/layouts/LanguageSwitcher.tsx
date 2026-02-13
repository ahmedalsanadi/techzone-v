'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import { Globe } from 'lucide-react';
import { Menu, MenuButton, MenuItem } from '@headlessui/react';
import { BaseMenuItems } from '../ui/BaseMenuItems';

const LanguageSwitcher = () => {
    const router = useRouter();
    const pathname = usePathname();
    const locale = useLocale();

    const changeLanguage = (newLanguage: string) => {
        if (newLanguage === locale) return;
        document.cookie = `NEXT_LOCALE=${newLanguage}; path=/;`;
        router.push(pathname, { locale: newLanguage });
        router.refresh();
    };

    return (
        <Menu as="div" className="relative inline-block ">
            <MenuButton className="relative  text-white hover:bg-white/10 rounded-md transition-colors outline-none">
                <Globe size={24} strokeWidth={1.5} />
            </MenuButton>

            <BaseMenuItems
                anchor="bottom end"
                className="min-w-[140px] rounded-lg p-1.5 flex flex-col gap-1">
                <MenuItem>
                    <button
                        onClick={() => changeLanguage('en')}
                        className={`flex w-full items-center rounded-md px-3 py-2 text-sm font-bold transition-all ${
                            locale === 'en'
                                ? 'bg-theme-primary text-white shadow-sm'
                                : 'text-gray-700 hover:bg-gray-50'
                        }`}>
                        English
                    </button>
                </MenuItem>
                <MenuItem>
                    <button
                        onClick={() => changeLanguage('ar')}
                        className={`flex w-full items-center rounded-md px-3 py-2 text-sm font-bold transition-all ${
                            locale === 'ar'
                                ? 'bg-theme-primary text-white shadow-sm'
                                : 'text-gray-700 hover:bg-gray-50'
                        }`}>
                        العربية
                    </button>
                </MenuItem>
            </BaseMenuItems>
        </Menu>
    );
};

export default LanguageSwitcher;
