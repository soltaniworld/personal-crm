import React from 'react';
import SignUpForm from '../../components/SignUpForm';

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <SignUpForm />
      </div>
    </div>
  );
} 