"use client";

import React from 'react';
import { useAuth } from '../../lib/authContext';
import { addContact, Contact } from '../../lib/db';
import ContactForm from '../../components/ContactForm';
import ProtectedRoute from '../../components/ProtectedRoute';
import FirebaseConfigChecker from '../../components/FirebaseConfigChecker';

export default function NewContactPage() {
  const { user } = useAuth();

  const handleSubmit = async (data: Contact) => {
    if (!user) throw new Error('You must be logged in to add a contact');
    
    // Add user ID to the contact data
    const contactData: Contact = {
      ...data,
      userId: user.uid
    };
    
    await addContact(contactData);
  };

  return (
    <ProtectedRoute>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Add New Contact</h1>
        <FirebaseConfigChecker />
        <ContactForm onSubmit={handleSubmit} />
      </div>
    </ProtectedRoute>
  );
} 