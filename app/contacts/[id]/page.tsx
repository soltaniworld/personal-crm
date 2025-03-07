"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { getContact, Contact, getInteractions, Interaction, deleteContact } from '../../lib/db';
import ProtectedRoute from '../../components/ProtectedRoute';
import { useAuth } from '../../lib/authContext';

export default function ContactDetailPage() {
  const [contact, setContact] = useState<Contact | null>(null);
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [interactionsLoading, setInteractionsLoading] = useState(true);
  const [interactionsError, setInteractionsError] = useState<string | null>(null);
  const params = useParams();
  const router = useRouter();
  const contactId = params.id as string;
  const { user } = useAuth();

  useEffect(() => {
    const fetchContactData = async () => {
      try {
        setLoading(true);
        const contactData = await getContact(contactId);
        
        if (!contactData) {
          setError('Contact not found');
          return;
        }
        
        setContact(contactData);
      } catch (err: any) {
        setError('Failed to load contact details. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchContactData();
  }, [contactId]);

  // Separate effect for loading interactions
  useEffect(() => {
    const fetchInteractions = async () => {
      if (!user) return;
      
      try {
        setInteractionsLoading(true);
        setInteractionsError(null);
        
        const allInteractions = await getInteractions(user.uid);
        
        // Filter interactions for this contact
        const contactInteractions = allInteractions.filter(
          interaction => interaction.contactId === contactId
        );
        
        // Sort by date (newest first)
        contactInteractions.sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        
        setInteractions(contactInteractions);
      } catch (err: any) {
        setInteractionsError('Unable to load interactions. Please try again.');
      } finally {
        setInteractionsLoading(false);
      }
    };
    if (contact) {
      fetchInteractions();
    }
  }, [user, contactId, contact]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this contact?')) {
      return;
    }
    try {
      await deleteContact(contactId);
      router.push('/contacts');
    } catch (err) {
      setError('Failed to delete contact. Please try again.');
    }
  };

  const formatDate = (date?: Date) => {
    if (!date) return 'Not set';
    return format(date, 'MMMM d, yyyy');
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="text-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading contact details...</p>
        </div>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute>
        <div className="card text-center py-10">
          <p className="text-red-500 dark:text-red-400 mb-4 font-medium text-lg">{error}</p>
          
          <div className="mb-6 max-w-md mx-auto">
            <div className="bg-red-50 dark:bg-red-900/30 p-4 rounded border border-red-200 dark:border-red-800 text-left">
              <h3 className="font-medium text-red-800 dark:text-red-300 mb-2">Troubleshooting:</h3>
              <ul className="list-disc pl-5 text-sm text-red-700 dark:text-red-400 space-y-1">
                <li>Check that you have the correct contact ID</li>
                <li>Verify that you have permission to access this contact</li>
                <li>Try refreshing the page</li>
                <li>If the problem persists, try logging out and back in</li>
              </ul>
            </div>
          </div>
          
          <Link href="/contacts" className="btn-primary">
            Back to Contacts
          </Link>
        </div>
      </ProtectedRoute>
    );
  }

  if (!contact) {
    return (
      <ProtectedRoute>
        <div className="card text-center py-10">
          <p className="text-red-500 dark:text-red-400 mb-4 font-medium text-lg">Contact not found</p>
          
          <div className="mb-6 max-w-md mx-auto">
            <div className="bg-red-50 dark:bg-red-900/30 p-4 rounded border border-red-200 dark:border-red-800 text-left">
              <h3 className="font-medium text-red-800 dark:text-red-300 mb-2">Troubleshooting:</h3>
              <ul className="list-disc pl-5 text-sm text-red-700 dark:text-red-400 space-y-1">
                <li>Contact ID <span className="font-mono text-xs bg-red-100 dark:bg-red-800 p-1 rounded">{contactId}</span> could not be found</li>
                <li>The contact may have been deleted</li>
                <li>Verify that you have permission to access this contact</li>
              </ul>
            </div>
          </div>
          
          <Link href="/contacts" className="btn-primary">
            Back to Contacts
          </Link>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">{contact.name}</h1>
          <div className="space-x-2 flex">
            <Link href={`/interactions/new?contactId=${contactId}`} className="btn-primary inline-flex items-center justify-center h-10">
              Log Interaction
            </Link>
            <Link href={`/contacts/${contactId}/edit`} className="btn-secondary inline-flex items-center justify-center h-10">
              Edit
            </Link>
            <button onClick={handleDelete} className="btn-secondary bg-red-500 hover:bg-red-600 text-white inline-flex items-center justify-center h-10">
              Delete
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Contact Details</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                <p className="text-gray-700 dark:text-gray-300">{contact.email || <span className="text-gray-500 dark:text-gray-400">Not provided</span>}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
                <p className="text-gray-700 dark:text-gray-300">{contact.phone || <span className="text-gray-500 dark:text-gray-400">Not provided</span>}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Birthday</p>
                <p className="text-gray-700 dark:text-gray-300">{contact.birthday ? formatDate(contact.birthday) : <span className="text-gray-500 dark:text-gray-400">Not provided</span>}</p>
              </div>
              {contact.notes && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Notes</p>
                  <p className="whitespace-pre-line text-gray-700 dark:text-gray-300">{contact.notes}</p>
                </div>
              )}
            </div>
          </div>

          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Interactions</h2>
            </div>
            
            {interactionsLoading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600 mx-auto"></div>
                <p className="mt-2 text-gray-500 dark:text-gray-400">Loading interactions...</p>
              </div>
            ) : interactionsError ? (
              <div className="p-3 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-md mb-3">
                <p className="text-amber-700 dark:text-amber-400 text-sm">{interactionsError}</p>
                <p className="text-amber-600 dark:text-amber-500 text-xs mt-1">
                  <Link href={`/interactions/new?contactId=${contactId}`} className="underline">
                    You can still add new interactions
                  </Link>
                </p>
              </div>
            ) : interactions.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-gray-500 dark:text-gray-400">No interactions recorded yet.</p>
                <Link href={`/interactions/new?contactId=${contactId}`} className="mt-2 text-primary-600 dark:text-primary-400 underline block">
                  Log your first interaction with {contact.name}
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100 dark:bg-gray-700">
                    <tr>
                      <th className="py-2 px-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">Title</th>
                      <th className="py-2 px-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {interactions.map((interaction) => (
                      <tr key={interaction.id} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                        <td className="py-2 px-3 whitespace-nowrap">
                          <Link 
                            href={`/interactions/${interaction.id}`}
                            className="text-primary-600 dark:text-primary-400 hover:underline font-medium"
                          >
                            {interaction.title}
                          </Link>
                        </td>
                        <td className="py-2 px-3 whitespace-nowrap text-gray-700 dark:text-gray-300">
                          {format(new Date(interaction.date), 'MMM d, yyyy')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
        
        <div className="mt-6">
          <Link href="/contacts" className="text-primary-600 dark:text-primary-400 hover:underline">
            &larr; Back to Contacts
          </Link>
        </div>
      </div>
    </ProtectedRoute>
  );
}