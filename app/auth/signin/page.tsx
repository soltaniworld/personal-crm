import React from 'react';
import SignInForm from '../../components/SignInForm';

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <SignInForm />
      </div>
    </div>
  );
} 