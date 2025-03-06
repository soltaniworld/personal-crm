import React from 'react';
import Link from 'next/link';
import ProtectedRoute from './components/ProtectedRoute';
import RecentInteractions from './components/RecentInteractions';

export default function HomePage() {
  return (
    <ProtectedRoute>
      <div className="space-y-8">
        <div className="card">
          <h1 className="text-2xl font-bold mb-4">Welcome to Your Personal CRM</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Manage your personal and professional relationships in one place. Log interactions, 
            track important dates, and never forget a follow-up again.
          </p>
          
          <div className="flex flex-wrap gap-4 mt-6">
            <Link href="/contacts/new" className="btn-primary">
              Add New Contact
            </Link>
            <Link href="/interactions/new" className="btn-secondary">
              Log Interaction
            </Link>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Recent Interactions</h2>
            <RecentInteractions />
          </div>
          
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Upcoming Important Dates</h2>
            <p className="text-gray-500 dark:text-gray-400 italic">
              Upcoming birthdays and important dates will appear here.
            </p>
            <div className="mt-4">
              <Link href="/contacts" className="text-primary-600 dark:text-primary-400 hover:underline">
                View All Contacts
              </Link>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
} 