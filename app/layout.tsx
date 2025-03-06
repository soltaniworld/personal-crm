import React from 'react';
import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from './lib/authContext';
import Navbar from './components/Navbar';

export const metadata: Metadata = {
  title: 'Personal CRM',
  description: 'Manage your personal and professional contacts with this CRM',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
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