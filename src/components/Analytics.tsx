'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

export default function Analytics() {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        const url = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '');
        console.log(`[AmbajiAnalytics] PageView: ${url} at ${new Date().toISOString()}`);

        // MVP: Simulate sending to a real service
        // window.gtag('event', 'page_view', { page_path: url });

    }, [pathname, searchParams]);

    return null; // Component renders nothing visually
}
