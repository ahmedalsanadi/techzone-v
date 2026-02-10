import { siteConfig } from '@/config/site';
import { getServerStoreConfig } from '@/services/store-config';
import { getTenantContext } from './get-tenant';

export async function resolveSiteIdentity() {
    const storeConfig = await getServerStoreConfig();
    const { origin } = await getTenantContext();

    const name = storeConfig?.store?.name || siteConfig.name;
    const description =
        storeConfig?.store?.description ||
        storeConfig?.store?.slogan ||
        siteConfig.description;
    const ogImage =
        storeConfig?.theme?.icon_url ||
        storeConfig?.theme?.logo_url ||
        storeConfig?.store?.logo_url ||
        siteConfig.ogImage;

    return {
        name,
        description,
        ogImage,
        url: origin || siteConfig.url,
    };
}
