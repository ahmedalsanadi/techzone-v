import { headers } from 'next/headers';
import { env } from '@/config/env';
import {
    parseDomainMap,
    resolveStoreKeyFromHost,
    type TenantSource,
} from './resolve';

export type TenantRequestInfo = {
    host: string | null;
    origin: string;
    storeKey: string | null;
    source: TenantSource;
};

const getForwardedHost = (raw?: string | null) => {
    if (!raw) return null;
    const [host] = raw.split(',');
    return host?.trim() || null;
};

export async function getRequestHost(): Promise<string | null> {
    const h = await headers();
    return getForwardedHost(h.get('x-forwarded-host')) || h.get('host');
}

export async function getRequestOrigin(): Promise<string> {
    const h = await headers();
    const protocol =
        h.get('x-forwarded-proto') || (env.isProd ? 'https' : 'http');
    const host = getForwardedHost(h.get('x-forwarded-host')) || h.get('host');

    if (!host) {
        return env.siteUrl || 'http://localhost:3000';
    }

    return `${protocol}://${host}`;
}

export async function getTenantContext(): Promise<TenantRequestInfo> {
    const host = await getRequestHost();
    const { storeKey, source } = resolveStoreKeyFromHost(host, {
        defaultStoreKey: env.storeDefaultKey || env.liberoApiKey,
        domainMap: parseDomainMap(env.storeDomainMap),
        allowDefault: env.isDev || env.allowDefaultStoreKeyInProd,
        allowDefaultOnPlatformHosts: env.allowDefaultStoreKeyOnPlatformHosts,
    });

    return {
        host,
        origin: await getRequestOrigin(),
        storeKey,
        source,
    };
}
