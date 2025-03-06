"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Contact } from '../lib/db';
import { format } from 'date-fns';

interface ContactFormProps {
  contact?: Contact;
  onSubmit: (data: Contact) => Promise<void>;
  isEditing?: boolean;
}

const ContactForm = ({ contact, onSubmit, isEditing = false }: ContactFormProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  
  const { register, handleSubmit, formState: { errors } } = useForm<Contact>({
    defaultValues: contact || {}
  });

  const formatDateForInput = (date?: Date) => {
    if (!date) return '';
    return format(date, 'yyyy-MM-dd');
  };

  const onFormSubmit = async (data: Contact) => {
    setLoading(true);
    setError(null);
    
    try {
      // Convert birthday string to Date if provided
      if (data.birthday && typeof data.birthday === 'string') {
        data.birthday = new Date(data.birthday);
      }
      
      await onSubmit(data);
      router.push('/contacts');
    } catch (err: any) {
      console.error('Error submitting contact:', err);
      
      // Provide more specific error messages based on error type
      if (err.code) {
        switch(err.code) {
          case 'permission-denied':
            setError('Permission denied. Please check if you are logged in and have the necessary permissions.');
            break;
          case 'unavailable':
            setError('Firebase service is currently unavailable. Please check your internet connection and try again.');
            break;
          case 'not-found':
            setError('The requested document was not found. It may have been deleted.');
            break;
          case 'cancelled':
            setError('The operation was cancelled. Please try again.');
            break;
          default:
            setError(`Firebase error: ${err.message || 'Failed to save contact. Please try again.'}`);
        }
      } else {
        setError(err.message || 'Failed to save contact. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2 className="text-xl font-semibold mb-6">
        {isEditing ? 'Edit Contact' : 'Add New Contact'}
      </h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit(onFormSubmit)}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
              Name *
            </label>
            <input
              className={`input-field ${errors.name ? 'border-red-500' : ''}`}
              id="name"
              type="text"
              placeholder="Full Name"
              {...register('name', { required: 'Name is required' })}
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
            )}
          </div>
          
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
              Email
            </label>
            <input
              className={`input-field ${errors.email ? 'border-red-500' : ''}`}
              id="email"
              type="email"
              placeholder="Email Address"
              {...register('email', { 
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address'
                }
              })}
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="phone">
              Phone
            </label>
            <input
              className="input-field"
              id="phone"
              type="tel"
              placeholder="Phone Number"
              {...register('phone')}
            />
          </div>
          
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="birthday">
              Birthday
            </label>
            <input
              className="input-field"
              id="birthday"
              type="date"
              {...register('birthday')}
              defaultValue={contact?.birthday ? formatDateForInput(contact.birthday) : ''}
            />
          </div>
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="notes">
            Notes
          </label>
          <textarea
            className="input-field"
            id="notes"
            rows={4}
            placeholder="Additional notes about this contact"
            {...register('notes')}
          ></textarea>
        </div>
        
        <div className="flex justify-between">
          <button
            type="button"
            onClick={() => router.back()}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Contact'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ContactForm; 