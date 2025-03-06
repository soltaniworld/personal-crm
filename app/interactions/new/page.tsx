"use client";

import React from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '../../lib/authContext';
import { addInteraction, Interaction } from '../../lib/db';
import InteractionForm from '../../components/InteractionForm';
import ProtectedRoute from '../../components/ProtectedRoute';

export default function NewInteractionPage() {
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
    <ProtectedRoute>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Log New Interaction</h1>
        <InteractionForm 
          onSubmit={handleSubmit} 
          preselectedContactId={contactId || undefined}
        />
      </div>
    </ProtectedRoute>
  );
} 