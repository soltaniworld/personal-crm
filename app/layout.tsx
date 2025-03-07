import React from 'react';
import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AuthProvider } from './lib/authContext';
import Navbar from './components/Navbar';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#ffffff'
};

export const metadata: Metadata = {
  title: 'Personal CRM',
  description: 'Manage your personal and professional contacts efficiently with this CRM system',
  applicationName: 'Personal CRM',
  authors: [{ name: 'Your Name' }],
  keywords: ['CRM', 'contacts', 'personal management', 'networking'],
  manifest: '/manifest.json',
  icons: {
    icon: '/icon.png',
    apple: '/apple-icon.png',
  },
  openGraph: {
    type: 'website',
    title: 'Personal CRM',
    description: 'Manage your personal and professional contacts efficiently',
    siteName: 'Personal CRM',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="format-detection" content="telephone=no" />
      </head>
      <body>
        <AuthProvider>
          <Navbar />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}