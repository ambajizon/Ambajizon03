'use client';

import { WifiOff } from 'lucide-react';

export default function OfflinePage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 text-center">
            <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mb-6">
                <WifiOff className="w-10 h-10 text-gray-500" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">You are Offline</h1>
            <p className="text-gray-600 mb-8 max-w-sm">
                Don't worry! Your order history and wishlist are safe. Checks your connection and try again.
            </p>
            <button
                onClick={() => window.location.reload()}
                className="bg-orange-600 text-white font-bold py-3 px-8 rounded-full shadow-lg active:scale-95 transition-transform"
            >
                Retry Connection
            </button>
        </div>
    );
}
