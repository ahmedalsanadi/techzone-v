import { siteConfig } from '@/config/site';
import { getServerStoreConfig } from '@/services/store-config';
import { getTenantContext } from './get-tenant';

/**
 * Canonical site URL for metadata / sitemap.
 *
 * Multi-tenant: derives from the **request** (`x-forwarded-host` / `host` → origin), so each
 * custom domain or subdomain gets its own `https://…` — do **not** set one global
 * `NEXT_PUBLIC_SITE_URL` per tenant; keep it as dev/fallback only (see `env.siteUrl`).
 *
 * Ops note: curl/health checks to `127.0.0.1` still produce a loopback origin in XML; crawlers and
 * real users hit the public domain and get correct absolute URLs.
 */
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
