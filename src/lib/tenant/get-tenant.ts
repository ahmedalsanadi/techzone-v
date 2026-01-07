import { headers } from 'next/headers';

export type TenantHeaders = {
  name?: string;
  description?: string;
  ogImage?: string;
};

export async function getTenantFromHeaders(): Promise<TenantHeaders> {
  const h = await headers(); // ✅ ReadonlyHeaders

  return {
    name: h.get('x-tenant-name') ?? undefined,
    description: h.get('x-tenant-description') ?? undefined,
    ogImage: h.get('x-tenant-og') ?? undefined,
  };
}
