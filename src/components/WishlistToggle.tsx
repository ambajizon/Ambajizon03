'use client';

import { useWishlist } from '@/context/WishlistContext';
import { Heart } from 'lucide-react';
import { motion } from 'framer-motion';

export default function WishlistToggle({ productId }: { productId: string }) {
    const { isInWishlist, toggleWishlist } = useWishlist();
    const active = isInWishlist(productId);

    return (
        <motion.button
            whileTap={{ scale: 0.8 }}
            onClick={() => toggleWishlist(productId)}
            className={`p-2 rounded-full shadow-sm backdrop-blur-sm transition-colors ${active ? 'bg-red-50 text-red-500' : 'bg-white/90 text-gray-800'}`}
        >
            <Heart className={`w-5 h-5 ${active ? 'fill-current' : ''}`} />
        </motion.button>
    );
}
