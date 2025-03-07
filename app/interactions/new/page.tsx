"use client";
import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '../../lib/authContext';
import { addInteraction, Interaction } from '../../lib/db';
import InteractionForm from '../../components/InteractionForm';
import ProtectedRoute from '../../components/ProtectedRoute';

function NewInteractionContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const contactId = searchParams.get('contactId');

  const handleSubmit = async (data: Interaction) => {
    if (!user) throw new Error('You must be logged in to add an interaction');
    
    // Add user ID to the interaction data
    const interactionData: Interaction = {
      ...data,
      userId: user.uid
    };
    
    await addInteraction(interactionData);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Log New Interaction</h1>
      <InteractionForm 
        onSubmit={handleSubmit} 
        preselectedContactId={contactId || undefined}
      />
    </div>
  );
}

export default function NewInteractionPage() {
  return (
    <ProtectedRoute>
      <Suspense fallback={
        <div className="max-w-2xl mx-auto text-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      }>
        <NewInteractionContent />
      </Suspense>
    </ProtectedRoute>
  );
}