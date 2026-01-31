//src/lib/tenant.ts
export type TenantSource = 'domain-map' | 'subdomain' | 'default' | 'none';

const RESERVED_SUBDOMAINS = new Set(['www', 'api']);

const isIpAddress = (host: string) =>
    /^\d{1,3}(\.\d{1,3}){3}$/.test(host);

export const normalizeHost = (host?: string | null) => {
    if (!host) return null;
    return host.split(':')[0]?.toLowerCase() || null;
};

export const getSubdomainFromHost = (host: string) => {
    if (!host || host === 'localhost' || isIpAddress(host)) return null;

    if (host.endsWith('.localhost')) {
        const parts = host.split('.');
        return parts.length >= 2 ? parts[0] : null;
    }

    const parts = host.split('.');
    if (parts.length >= 3) {
        const subdomain = parts[0];
        if (!RESERVED_SUBDOMAINS.has(subdomain)) return subdomain;
    }

    return null;
};

export const parseDomainMap = (raw?: string | null) => {
    if (!raw) return {};
    try {
        const parsed = JSON.parse(raw) as Record<string, string>;
        if (!parsed || typeof parsed !== 'object') return {};
        return parsed;
    } catch {
        return {};
    }
};

export const resolveStoreKeyFromHost = (
    host: string | null,
    options: {
        defaultStoreKey?: string;
        domainMap?: Record<string, string>;
        allowDefault?: boolean;
    } = {},
): { storeKey: string | null; source: TenantSource } => {
    const normalizedHost = normalizeHost(host);
    if (!normalizedHost) return { storeKey: null, source: 'none' };

    if (options.domainMap && options.domainMap[normalizedHost]) {
        return {
            storeKey: options.domainMap[normalizedHost],
            source: 'domain-map' as TenantSource,
        };
    }

    const subdomain = getSubdomainFromHost(normalizedHost);
    if (subdomain)
        return { storeKey: subdomain, source: 'subdomain' as TenantSource };

    if (options.allowDefault && options.defaultStoreKey) {
        return {
            storeKey: options.defaultStoreKey,
            source: 'default' as TenantSource,
        };
    }

    return { storeKey: null, source: 'none' as TenantSource };
};
