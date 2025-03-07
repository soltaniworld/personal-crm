"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { getInteraction, getContact, Interaction, deleteInteraction } from '../../lib/db';
import ProtectedRoute from '../../components/ProtectedRoute';

export default function InteractionDetailPage() {
  const [interaction, setInteraction] = useState<Interaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const params = useParams();
  const router = useRouter();
  const interactionId = params.id as string;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        console.log('Fetching interaction data for ID:', interactionId);
        // Fetch interaction details
        const interactionData = await getInteraction(interactionId);
        console.log('Interaction data response:', interactionData);
        
        if (!interactionData) {
          console.error('Interaction not found for ID:', interactionId);
          setError('Interaction not found');
          return;
        }
        
        let contactExists = false;
        
        // If we have a contactId, fetch the latest contact name from contacts collection
        if (interactionData.contactId) {
          try {
            const contact = await getContact(interactionData.contactId);
            if (contact) {
              // Update the interaction with the latest contact name
              interactionData.contactName = contact.name;
              contactExists = true;
            }
          } catch (err) {
            console.error('Error fetching contact for interaction:', err);
            // Continue even if we can't get the updated contact name
          }
        }
        
        setInteraction({...interactionData, contactExists});
        console.log('Interaction set successfully with updated contact name:', interactionData);
      } catch (err: any) {
        console.error('Error fetching interaction details:', err);
        setError('Failed to load interaction details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [interactionId]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this interaction?')) {
      return;
    }

    try {
      await deleteInteraction(interactionId);
      router.push('/interactions');
    } catch (err) {
      console.error('Error deleting interaction:', err);
      setError('Failed to delete interaction. Please try again.');
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="text-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading interaction details...</p>
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !interaction) {
    return (
      <ProtectedRoute>
        <div className="card text-center py-10">
          <p className="text-red-500 dark:text-red-400 mb-4">{error || 'Interaction not found'}</p>
          <Link href="/interactions" className="btn-primary">
            Back to Interactions
          </Link>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">{interaction.title}</h1>
          <div className="space-x-2">
            <Link href={`/interactions/${interactionId}/edit`} className="btn-secondary">
              Edit
            </Link>
            <button onClick={handleDelete} className="btn-secondary bg-red-500 hover:bg-red-600 text-white">
              Delete
            </button>
          </div>
        </div>

        <div className="card">
          <div className="mb-6">
            <p className="text-sm text-gray-500 dark:text-gray-400">Contact</p>
            {interaction.contactId ? (
              interaction.contactExists ? (
                <Link 
                  href={`/contacts/${interaction.contactId}`}
                  className="text-primary-600 dark:text-primary-400 hover:underline font-medium"
                >
                  {interaction.contactName || 'Unknown Contact'}
                </Link>
              ) : (
                <span className="text-gray-700 dark:text-gray-300">
                  {interaction.contactName || 'Deleted Contact'} <em className="text-gray-500 dark:text-gray-400 text-xs">(contact no longer exists)</em>
                </span>
              )
            ) : (
              <p className="text-gray-700 dark:text-gray-300">Unknown Contact</p>
            )}
          </div>
          
          <div className="mb-6">
            <p className="text-sm text-gray-500 dark:text-gray-400">Date</p>
            <p className="text-gray-700 dark:text-gray-300">{format(interaction.date, 'MMMM d, yyyy')}</p>
          </div>
          
          {interaction.notes && (
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Notes</p>
              <div 
                className="prose dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: interaction.notes }}
              />
            </div>
          )}
        </div>

        <div className="mt-6">
          <Link href="/interactions" className="text-primary-600 dark:text-primary-400 hover:underline">
            &larr; Back to Interactions
          </Link>
        </div>
      </div>
    </ProtectedRoute>
  );
}