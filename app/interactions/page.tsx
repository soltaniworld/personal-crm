"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { useAuth } from '../lib/authContext';
import { getInteractions, Interaction, deleteInteraction } from '../lib/db';
import ProtectedRoute from '../components/ProtectedRoute';

// Function to create a truncated preview of rich text notes
const createNotesPreview = (notes: string | undefined, maxLength: number = 100) => {
  if (!notes) return null;
  
  // Create a temporary div to parse the HTML and extract text
  const div = document.createElement('div');
  div.innerHTML = notes;
  const textContent = div.textContent || div.innerText || '';
  
  // Create a truncated preview
  const truncated = textContent.length > maxLength 
    ? textContent.substring(0, maxLength) + '...' 
    : textContent;
  
  return truncated;
};

export default function InteractionsPage() {
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchInteractions = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        setError(null); // Clear any previous errors
        
        console.log('Starting to fetch interactions for user:', user.uid);
        const interactionsData = await getInteractions(user.uid);
        console.log('Interactions fetched successfully:', interactionsData.length);
        setInteractions(interactionsData);
      } catch (err: any) {
        console.error('Error in fetchInteractions:', err);
        
        // More informative error message based on the error type
        if (err.code) {
          switch(err.code) {
            case 'permission-denied':
              setError('Permission denied. Please check your Firestore security rules.');
              break;
            case 'unavailable':
              setError('Firebase service is unavailable. Please check your internet connection and try again.');
              break;
            case 'not-found':
              setError('The interactions collection was not found. Please check your Firestore setup.');
              break;
            default:
              setError(`Firebase error (${err.code}): ${err.message || 'Failed to load interactions'}`);
          }
        } else {
          setError(err.message || 'Failed to load interactions. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchInteractions();
  }, [user]);

  const handleDelete = async (interactionId: string) => {
    if (!window.confirm('Are you sure you want to delete this interaction?')) {
      return;
    }

    try {
      await deleteInteraction(interactionId);
      setInteractions(interactions.filter(interaction => interaction.id !== interactionId));
    } catch (err) {
      console.error('Error deleting interaction:', err);
      setError('Failed to delete interaction. Please try again.');
    }
  };

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
          <h1 className="text-2xl font-bold">Interactions</h1>
          <Link href="/interactions/new" className="btn-primary w-full sm:w-auto">
            Log New Interaction
          </Link>
        </div>

        {error && (
          <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded relative mb-4" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
            <button
              onClick={() => {
                setError(null);
                if (user) {
                  setLoading(true);
                  getInteractions(user.uid)
                    .then(data => {
                      setInteractions(data);
                      setError(null);
                    })
                    .catch(err => {
                      console.error('Error retrying interaction fetch:', err);
                      setError(err.message || 'Failed to load interactions on retry.');
                    })
                    .finally(() => {
                      setLoading(false);
                    });
                }
              }}
              className="ml-4 bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
            >
              Retry
            </button>
            <p className="text-sm mt-2 text-red-600 dark:text-red-400">
              Try checking your browser console (F12) for more detailed error information.
            </p>
          </div>
        )}

        {loading ? (
          <div className="text-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading interactions...</p>
          </div>
        ) : interactions.length === 0 ? (
          <div className="card text-center py-10">
            <p className="text-gray-500 dark:text-gray-400 mb-4">You don't have any interactions yet.</p>
            <Link href="/interactions/new" className="btn-primary inline-block">
              Log Your First Interaction
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <table className="min-w-full table-auto">
              <thead className="bg-gray-100 dark:bg-gray-700">
                <tr>
                  <th className="py-2 px-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">Title</th>
                  <th className="py-2 px-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">Contact</th>
                  <th className="py-2 px-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider max-w-[80px]">Date</th>
                  <th className="py-2 px-3 text-right text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {interactions.map((interaction) => (
                  <tr key={interaction.id} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                    <td className="py-2 px-3">
                      <Link 
                        href={`/interactions/${interaction.id}`}
                        className="text-primary-600 dark:text-primary-400 hover:underline font-medium"
                      >
                        <span className="line-clamp-1">{interaction.title}</span>
                      </Link>
                    </td>
                    <td className="py-2 px-3">
                      {interaction.contactName && interaction.contactId ? (
                        <Link 
                          href={`/contacts/${interaction.contactId}`}
                          className="text-primary-600 dark:text-primary-400 hover:underline"
                        >
                          <span className="line-clamp-1">{interaction.contactName}</span>
                        </Link>
                      ) : (
                        <span className="text-gray-500 dark:text-gray-400">Unknown</span>
                      )}
                    </td>
                    <td className="py-2 px-3 text-gray-700 dark:text-gray-300 max-w-[80px]">
                      {format(interaction.date, 'MM/dd/yy')}
                    </td>
                    <td className="py-2 px-3 text-right">
                      <div className="flex flex-wrap justify-end gap-2">
                        <Link 
                          href={`/interactions/${interaction.id}/edit`}
                          className="text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => interaction.id && handleDelete(interaction.id)}
                          className="text-red-600 dark:text-red-400 hover:underline"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}