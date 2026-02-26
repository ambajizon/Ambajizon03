import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Suspense } from 'react';
import { Toaster } from 'react-hot-toast';
import Analytics from '@/components/Analytics';
import SWRegister from '@/components/SWRegister';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Ambajizon ShopVCard",
  description: "SaaS Platform for Shopkeepers",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=block" rel="stylesheet" />
      </head>
      <body className={`${inter.className} antialiased`}>
        <SWRegister />
        <Suspense fallback={null}>
          <Analytics />
        </Suspense>
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#1A237E', // Store primary proxy
              color: '#fff',
              fontWeight: '500',
              borderRadius: '8px',
            },
            success: {
              iconTheme: { primary: '#fff', secondary: '#1A237E' }
            }
          }}
        />
        {children}
      </body>
    </html>
  );
}
