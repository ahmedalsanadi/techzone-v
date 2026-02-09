import createNextIntlPlugin from 'next-intl/plugin';
import type { NextConfig } from 'next';

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
            },
            {
                protocol: 'https',
                hostname: 'store-api.libro-shop.com',
            },
            {
                protocol: 'http',
                hostname: 'store-api.libro-shop.com',
            },
            {
                protocol: 'https',
                hostname: 'dashboard.libro-shop.com',
            },
            {
                protocol: 'http',
                hostname: 'dashboard.libro-shop.com',
            },
            {
                protocol: 'https',
                hostname: 'flagcdn.com',
            },
            {
                protocol: 'https',
                hostname: 'demo.myfatoorah.com',
            },
        ],
        formats: ['image/avif', 'image/webp'],
        deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
        minimumCacheTTL: 60,
    },
    // Enable compression
    compress: true,
};

export default withNextIntl(nextConfig);
