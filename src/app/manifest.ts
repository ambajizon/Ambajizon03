import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'ShaktiQR - Your Store, Online.',
        short_name: 'ShaktiQR',
        description: 'Your own online store. Delivery anywhere in India.',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#ea580c',
        icons: [
            {
                src: '/icon.png', // We'll need to ensure this exists or use a fallback
                sizes: '192x192',
                type: 'image/png',
            },
            {
                src: '/icon.png',
                sizes: '512x512',
                type: 'image/png',
            },
        ],
    };
}
