import { ReactNode } from 'react';
import Sidebar from '@/components/Sidebar';
import ShopkeeperBottomNav from '@/components/admin/ShopkeeperBottomNav';
import DashboardHeader from '@/components/admin/DashboardHeader';
import QuickAddFab from '@/components/dashboard/QuickAddFab';
import { StoreProvider } from '@/context/StoreContext';

export default function ShopkeeperLayout({ children }: { children: ReactNode }) {
    return (
        <StoreProvider>
            <div className="flex h-screen overflow-hidden bg-background-light flex-col lg:flex-row">
                <Sidebar />
                <div className="flex-1 flex flex-col w-full overflow-hidden">
                    <DashboardHeader />
                    <main className="flex-1 p-4 lg:p-8 overflow-y-auto w-full pb-24 lg:pb-8">
                        <div className="container mx-auto max-w-7xl">
                            {children}
                        </div>
                    </main>
                </div>
                <ShopkeeperBottomNav />
                <QuickAddFab />
            </div>
        </StoreProvider>
    );
}
