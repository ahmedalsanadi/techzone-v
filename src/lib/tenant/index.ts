// Client-safe tenant resolution only. Server-only helpers are in get-tenant.ts and resolve-site.ts.
export {
    resolveTenant,
    resolveStoreKeyFromHost,
    parseDomainMap,
    normalizeHost,
    getSubdomainFromHost,
    isPlatformHost,
    type TenantSource,
} from './resolve';
