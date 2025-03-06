"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { getInteraction, updateInteraction, Interaction } from '../../../lib/db';
import InteractionForm from '../../../components/InteractionForm';
import ProtectedRoute from '../../../components/ProtectedRoute';

export default function EditInteractionPage() {
  const [interaction, setInteraction] = useState<Interaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const params = useParams();
  const interactionId = params.id as string;

  useEffect(() => {
    const fetchInteraction = async () => {
      try {
        setLoading(true);
        const interactionData = await getInteraction(interactionId);
        
        if (!interactionData) {
          setError('Interaction not found');
          return;
        }
        
        setInteraction(interactionData);
      } catch (err: any) {
        console.error('Error fetching interaction:', err);
        setError('Failed to load interaction. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchInteraction();
  }, [interactionId]);

  const handleSubmit = async (data: Interaction) => {
    if (!interactionId) throw new Error('Interaction ID is required');
    
    await updateInteraction(interactionId, data);
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="text-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading interaction...</p>
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !interaction) {
    return (
      <ProtectedRoute>
        <div className="card text-center py-10">
          <p className="text-red-500 mb-4">{error || 'Interaction not found'}</p>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Edit Interaction</h1>
        <InteractionForm 
          interaction={interaction} 
          onSubmit={handleSubmit} 
          isEditing={true} 
        />
      </div>
    </ProtectedRoute>
  );
} 