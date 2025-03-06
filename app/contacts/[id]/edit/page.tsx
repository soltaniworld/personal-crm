"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { getContact, updateContact, Contact } from '../../../lib/db';
import ContactForm from '../../../components/ContactForm';
import ProtectedRoute from '../../../components/ProtectedRoute';

export default function EditContactPage() {
  const [contact, setContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const params = useParams();
  const contactId = params.id as string;

  useEffect(() => {
    const fetchContact = async () => {
      try {
        setLoading(true);
        const contactData = await getContact(contactId);
        
        if (!contactData) {
          setError('Contact not found');
          return;
        }
        
        setContact(contactData);
      } catch (err: any) {
        console.error('Error fetching contact:', err);
        setError('Failed to load contact. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchContact();
  }, [contactId]);

  const handleSubmit = async (data: Contact) => {
    if (!contactId) throw new Error('Contact ID is required');
    
    await updateContact(contactId, data);
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="text-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading contact...</p>
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !contact) {
    return (
      <ProtectedRoute>
        <div className="card text-center py-10">
          <p className="text-red-500 mb-4">{error || 'Contact not found'}</p>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Edit Contact</h1>
        <ContactForm 
          contact={contact} 
          onSubmit={handleSubmit} 
          isEditing={true} 
        />
      </div>
    </ProtectedRoute>
  );
} 