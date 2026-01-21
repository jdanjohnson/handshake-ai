import type { Metadata } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import BottomNav from '@/components/common/bottom-nav';

export const metadata: Metadata = {
  title: 'Handshake Legal',
  description: 'Simple, secure digital agreements.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={cn('font-body antialiased min-h-screen flex flex-col bg-background')}>
        <main className="flex-grow pb-20">{children}</main>
        <BottomNav />
        <Toaster />
      </body>
    </html>
  );
}
