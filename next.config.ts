//next.config.ts
import createNextIntlPlugin from 'next-intl/plugin';
import type { NextConfig } from 'next';

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
    // Allow dev server to be accessed from LAN (e.g. phone at 192.168.1.2) and localhost
    allowedDevOrigins: [
        'localhost',
        'fasto.vercel.app',
        'http://store-api.libro-shop.com',
        'https://store-api.libro-shop.com',
        'localhost:3000',
        '127.0.0.1',
        '192.168.1.2',
        // Add other LAN IPs if you open the app from another device, e.g. '192.168.1.3'
    ],
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
        deviceSizes: [375, 640, 750, 828, 1080, 1200],
        // Include category/product thumbnail sizes (56, 80, 104) for optimal delivery
        imageSizes: [
            16, 32, 40, 48, 56, 64,70, 80, 90, 96, 104, 128, 256, 384, 512, 768,
            1024,
        ],
        minimumCacheTTL: 60,
    },
    // Enable compression
    compress: true,
};

export default withNextIntl(nextConfig);
