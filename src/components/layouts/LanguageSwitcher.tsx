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
            <MenuButton className="relative inline-flex items-center justify-center size-10 text-white hover:bg-white/10 rounded-md transition-colors outline-none">
                <Globe size={24} strokeWidth={1.5} className="shrink-0" />
            </MenuButton>

            <BaseMenuItems
                anchor="bottom end"
                className="min-w-[140px] rounded-lg p-1.5 flex flex-col gap-1">
                <MenuItem>
                    {({ focus }) => (
                        <button
                            onClick={() => changeLanguage('en')}
                            className={`flex w-full items-center rounded-md px-3 py-2 text-sm font-bold transition-all duration-200 ${
                                locale === 'en'
                                    ? 'bg-theme-primary text-white shadow-sm'
                                    : `text-gray-700 hover:bg-theme-primary/10 hover:text-theme-primary focus:bg-theme-primary/10 focus:text-theme-primary ${focus ? 'bg-theme-primary/10 text-theme-primary' : ''}`
                            }`}>
                            English
                        </button>
                    )}
                </MenuItem>
                <MenuItem>
                    {({ focus }) => (
                        <button
                            onClick={() => changeLanguage('ar')}
                            className={`flex w-full items-center rounded-md px-3 py-2 text-sm font-bold transition-all duration-200 ${
                                locale === 'ar'
                                    ? 'bg-theme-primary text-white shadow-sm'
                                    : `text-gray-700 hover:bg-theme-primary/10 hover:text-theme-primary focus:bg-theme-primary/10 focus:text-theme-primary ${focus ? 'bg-theme-primary/10 text-theme-primary' : ''}`
                            }`}>
                            العربية
                        </button>
                    )}
                </MenuItem>
            </BaseMenuItems>
        </Menu>
    );
};

export default LanguageSwitcher;
