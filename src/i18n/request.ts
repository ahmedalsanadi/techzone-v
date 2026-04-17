import { getRequestConfig } from 'next-intl/server';
import { hasLocale, IntlErrorCode } from 'next-intl';
import { routing } from './routing';

const isDev = process.env.NODE_ENV === 'development';

export default getRequestConfig(async ({ requestLocale }) => {
    // Typically corresponds to the `[locale]` segment
    const requested = await requestLocale;
    const locale = hasLocale(routing.locales, requested)
        ? requested
        : routing.defaultLocale;

    const messages = (await import(`../messages/${locale}.json`)).default;

    if (!isDev) {
        return { locale, messages };
    }

    return {
        locale,
        messages,
        onError(error) {
            if (error.code === IntlErrorCode.MISSING_MESSAGE) {
                console.error('[next-intl] Missing message:', error.message);
            } else {
                console.error('[next-intl]', error);
            }
        },
        getMessageFallback({
            namespace,
            key,
            error,
        }: {
            namespace?: string;
            key: string;
            error: { code?: IntlErrorCode | string };
        }) {
            const path = [namespace, key].filter(Boolean).join('.');
            if (error.code === IntlErrorCode.MISSING_MESSAGE) {
                return `[Missing: ${path}]`;
            }
            return path;
        },
    };
});
