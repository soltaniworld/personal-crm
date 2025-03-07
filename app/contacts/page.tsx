"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../lib/authContext';
import { getContacts, Contact, deleteContact } from '../lib/db';
import ProtectedRoute from '../components/ProtectedRoute';

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchContacts = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        setError(null);
        
        console.log('Starting to fetch contacts for user:', user.uid);
        const contactsData = await getContacts(user.uid);
        console.log('Contacts fetched successfully:', contactsData.length);
        setContacts(contactsData);
      } catch (err: any) {
        console.error('Error in fetchContacts:', err);
        
        if (err.code) {
          switch(err.code) {
            case 'permission-denied':
              setError('Permission denied. Please check your Firestore security rules.');
              break;
            case 'unavailable':
              setError('Firebase service is unavailable. Please check your internet connection and try again.');
              break;
            case 'not-found':
              setError('The contacts collection was not found. Please check your Firestore setup.');
              break;
            default:
              setError(`Firebase error (${err.code}): ${err.message || 'Failed to load contacts'}`);
          }
        } else {
          setError(err.message || 'Failed to load contacts. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchContacts();
  }, [user]);

  const handleDelete = async (contactId: string) => {
    if (!window.confirm('Are you sure you want to delete this contact?')) {
      return;
    }

    try {
      await deleteContact(contactId);
      setContacts(contacts.filter(contact => contact.id !== contactId));
    } catch (err) {
      console.error('Error deleting contact:', err);
      setError('Failed to delete contact. Please try again.');
    }
  };

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Contacts</h1>
          <Link href="/contacts/new" className="btn-primary">
            Add New Contact
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
                  getContacts(user.uid)
                    .then(data => {
                      setContacts(data);
                      setError(null);
                    })
                    .catch(err => {
                      console.error('Error retrying contact fetch:', err);
                      setError(err.message || 'Failed to load contacts on retry.');
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
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading contacts...</p>
          </div>
        ) : contacts.length === 0 ? (
          <div className="card text-center py-10">
            <p className="text-gray-500 dark:text-gray-400 mb-4">You don't have any contacts yet.</p>
            <Link href="/contacts/new" className="btn-primary inline-block">
              Add Your First Contact
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-100 dark:bg-gray-700">
                <tr>
                  <th className="py-2 px-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">Name</th>
                  <th className="py-2 px-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">Email</th>
                  <th className="py-2 px-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">Phone</th>
                  <th className="py-2 px-3 text-center text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">Interactions</th>
                  <th className="py-2 px-3 text-right text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {contacts.map((contact) => (
                  <tr key={contact.id} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                    <td className="py-2 px-3 whitespace-nowrap">
                      <Link 
                        href={`/contacts/${contact.id}`}
                        className="text-primary-600 dark:text-primary-400 hover:underline font-medium"
                      >
                        {contact.name}
                      </Link>
                    </td>
                    <td className="py-2 px-3 whitespace-nowrap text-gray-700 dark:text-gray-300">
                      {contact.email || <span className="text-gray-500 dark:text-gray-400">-</span>}
                    </td>
                    <td className="py-2 px-3 whitespace-nowrap text-gray-700 dark:text-gray-300">
                      {contact.phone || <span className="text-gray-500 dark:text-gray-400">-</span>}
                    </td>
                    <td className="px-4 py-2 text-center">
                      {(!contact.interactions || contact.interactions === 0) && "Hasn't interacted yet"}
                      {contact.interactions === 1 && '1 interaction'}
                      {contact.interactions && contact.interactions > 1 && `${contact.interactions} interactions`}
                    </td>
                    <td className="py-2 px-3 whitespace-nowrap text-right space-x-2">
                      <Link 
                        href={`/contacts/${contact.id}/edit`}
                        className="text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => contact.id && handleDelete(contact.id)}
                        className="text-red-600 dark:text-red-400 hover:underline"
                      >
                        Delete
                      </button>
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