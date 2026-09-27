import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { NotificationProvider } from '@/context/NotificationContext';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CropSathiFloating } from '@/components/cropsathi/CropSathiFloating';

export const metadata: Metadata = {
  title: 'CropKart — B2B Agricultural Marketplace & CropSathi AI',
  description:
    'Direct B2B trade connecting farmers, wholesale buyers, and transporters with real-time mandi prices, quality verification samples, and CropSathi AI advisory.',
  keywords: [
    'agricultural marketplace',
    'farmers',
    'mandi prices',
    'b2b crops',
    'agritech',
    'cropsathi',
    'crop forecasting',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 antialiased">
        <AuthProvider>
          <NotificationProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
            <CropSathiFloating />
          </NotificationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
