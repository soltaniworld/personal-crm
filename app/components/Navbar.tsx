"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../lib/authContext';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  const isActive = (path: string) => pathname === path;

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Failed to sign out', error);
    }
  };

  // Don't show navbar on auth pages
  if (pathname === '/auth/signin' || pathname === '/auth/signup') {
    return null;
  }

  return (
    <nav className="bg-primary-600 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 text-xl font-bold">
              Personal CRM
            </Link>
            
            {user && (
              <div className="hidden md:block ml-10">
                <div className="flex space-x-4">
                  <Link 
                    href="/" 
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      isActive('/') 
                        ? 'bg-primary-700 text-white' 
                        : 'hover:bg-primary-500'
                    }`}
                  >
                    Home
                  </Link>
                  <Link 
                    href="/contacts" 
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      isActive('/contacts') || pathname.startsWith('/contacts/')
                        ? 'bg-primary-700 text-white' 
                        : 'hover:bg-primary-500'
                    }`}
                  >
                    Contacts
                  </Link>
                  <Link 
                    href="/interactions" 
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      isActive('/interactions') || pathname.startsWith('/interactions/')
                        ? 'bg-primary-700 text-white' 
                        : 'hover:bg-primary-500'
                    }`}
                  >
                    Interactions
                  </Link>
                </div>
              </div>
            )}
          </div>
          
          {user && (
            <div className="hidden md:block">
              <button 
                onClick={handleSignOut}
                className="px-3 py-2 rounded-md text-sm font-medium hover:bg-primary-500"
              >
                Sign Out
              </button>
            </div>
          )}
          
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-primary-500 focus:outline-none"
            >
              <svg
                className="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && user && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link 
              href="/" 
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive('/') 
                  ? 'bg-primary-700 text-white' 
                  : 'hover:bg-primary-500'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              href="/contacts" 
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive('/contacts') || pathname.startsWith('/contacts/')
                  ? 'bg-primary-700 text-white' 
                  : 'hover:bg-primary-500'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Contacts
            </Link>
            <Link 
              href="/interactions" 
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive('/interactions') || pathname.startsWith('/interactions/')
                  ? 'bg-primary-700 text-white' 
                  : 'hover:bg-primary-500'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Interactions
            </Link>
            <button 
              onClick={() => {
                handleSignOut();
                setIsMenuOpen(false);
              }}
              className="block w-full text-left px-3 py-2 rounded-md text-base font-medium hover:bg-primary-500"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar; 