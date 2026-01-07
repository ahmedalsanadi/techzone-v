import { siteConfig } from '@/config/site';
import { getTenantFromHeaders } from './get-tenant';

export async function resolveSiteIdentity() {
  const tenant = await getTenantFromHeaders(); 

  return {
    name: tenant.name ?? siteConfig.name,
    description: tenant.description ?? siteConfig.description,
    ogImage: tenant.ogImage ?? siteConfig.ogImage,
    url: siteConfig.url,
  };
}
