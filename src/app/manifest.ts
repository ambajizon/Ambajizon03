import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Ambajizon - The Ambaji Marketplace',
        short_name: 'Ambajizon',
        description: 'Buy authentic Prasad, Jewelry, and more from Ambaji',
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
