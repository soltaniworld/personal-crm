"use client";

import React, { useState, useEffect, useMemo, Fragment } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';
import { Interaction, Contact, getContacts, addContact } from '../lib/db';
import { useAuth } from '../lib/authContext';
import dynamic from 'next/dynamic';
import { Combobox, Dialog, Transition } from '@headlessui/react';

// Import React Quill dynamically to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
import 'react-quill/dist/quill.snow.css';

interface InteractionFormProps {
  interaction?: Interaction;
  onSubmit: (data: Interaction) => Promise<void>;
  isEditing?: boolean;
  preselectedContactId?: string;
}

interface NewContactData {
  name: string;
  email?: string;
  phone?: string;
}

const InteractionForm = ({ 
  interaction, 
  onSubmit, 
  isEditing = false,
  preselectedContactId
}: InteractionFormProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [notes, setNotes] = useState(interaction?.notes || '');
  const [query, setQuery] = useState('');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isCreatingNewContact, setIsCreatingNewContact] = useState(false);
  const [newContactData, setNewContactData] = useState<NewContactData>({ name: '' });
  const [isNewContactDialogOpen, setIsNewContactDialogOpen] = useState(false);
  const router = useRouter();
  const { user } = useAuth();
  
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<Interaction>({
    defaultValues: {
      ...interaction,
      contactId: preselectedContactId || interaction?.contactId || '',
      date: interaction?.date ? new Date(interaction.date) : new Date()
    }
  });

  const contactId = watch('contactId');

  // Format today's date and set it as default
  useEffect(() => {
    // Format the date for the input field - must be in YYYY-MM-DD format for the date input
    if (interaction?.date) {
      // When editing an existing interaction, format the date properly
      const dateObj = new Date(interaction.date);
      const formattedDate = format(dateObj, 'yyyy-MM-dd');
      
      // Update the actual DOM input value 
      const dateInput = document.getElementById('date') as HTMLInputElement;
      if (dateInput) {
        dateInput.value = formattedDate;
      }
    } else {
      // For new interactions
      const today = new Date();
      const formattedDate = format(today, 'yyyy-MM-dd');
      setValue('date', today);
      
      // Update the actual DOM input value
      const dateInput = document.getElementById('date') as HTMLInputElement;
      if (dateInput) {
        dateInput.value = formattedDate;
      }
    }
  }, [setValue, interaction]);

  useEffect(() => {
    const fetchContacts = async () => {
      if (!user) return;
      
      try {
        const contactsData = await getContacts(user.uid);
        setContacts(contactsData);
        
        // If we have a contactId (either from editing or preselected), find and set the selected contact
        if (contactId) {
          const contact = contactsData.find(c => c.id === contactId);
          if (contact) {
            setSelectedContact(contact);
            // Make sure query is populated with contact name for display purposes
            setQuery(contact.name);
          }
        }
      } catch (err: any) {
        console.error('Error fetching contacts:', err);
        setError('Failed to load contacts. Please try again.');
      }
    };
    fetchContacts();
  }, [user, contactId]);

  const filteredContacts = useMemo(() => {
    if (!query) return contacts;
    const lowerQuery = query.toLowerCase();
    return contacts.filter(contact => 
      contact.name.toLowerCase().includes(lowerQuery)
    );
  }, [contacts, query]);

  // Check if the current query doesn't match any existing contacts
  const isNewContact = useMemo(() => {
    if (!query.trim()) return false;
    return !contacts.some(contact => 
      contact.name.toLowerCase() === query.toLowerCase()
    );
  }, [contacts, query]);

  const openNewContactDialog = () => {
    setNewContactData({ name: query.trim() });
    setIsNewContactDialogOpen(true);
  };

  const handleCreateContact = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Create the new contact with additional fields
      const newContact: Contact = {
        name: newContactData.name,
        email: newContactData.email || undefined,
        phone: newContactData.phone || undefined,
        userId: user.uid
      };
      
      const newContactId = await addContact(newContact);
      
      // Update the form with the new contact
      setValue('contactId', newContactId);
      setSelectedContact({ ...newContact, id: newContactId });
      setQuery(newContact.name);
      
      // Close the dialog
      setIsNewContactDialogOpen(false);
      
      // Add the new contact to the contacts list
      setContacts(prev => [...prev, { ...newContact, id: newContactId }]);
      
      console.log('Created new contact with ID:', newContactId);
    } catch (err) {
      console.error('Error creating new contact:', err);
      setError('Failed to create new contact. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onFormSubmit = async (data: any) => {
    setLoading(true);
    setError(null);
    
    try {
      // Convert date string to Date
      if (data.date && typeof data.date === 'string') {
        data.date = new Date(data.date);
      }
      
      // Add notes from React Quill
      data.notes = notes;
      
      // Add user ID
      if (!isEditing && user) {
        data.userId = user.uid;
      }

      // If creating a new contact
      if (isNewContact && !data.contactId && user) {
        try {
          // Create the new contact
          const newContact: Contact = {
            name: query.trim(),
            userId: user.uid
          };
          
          const newContactId = await addContact(newContact);
          data.contactId = newContactId;
          data.contactName = query.trim();
          
          console.log('Created new contact with ID:', newContactId);
        } catch (err) {
          console.error('Error creating new contact:', err);
          setError('Failed to create new contact. Please try again.');
          setLoading(false);
          return;
        }
      }
      
      await onSubmit(data as Interaction);
      router.push('/interactions');
    } catch (err: any) {
      console.error('Error submitting interaction:', err);
      setError(err.message || 'Failed to save interaction. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-gray-100">
        {isEditing ? 'Edit Interaction' : 'Log New Interaction'}
      </h2>
      
      {error && (
        <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit(onFormSubmit)}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="title">
              Title *
            </label>
            <input
              className={`input-field ${errors.title ? 'border-red-500' : ''} dark:bg-gray-800 dark:text-gray-100`}
              id="title"
              type="text"
              placeholder="Interaction Title"
              {...register('title', { required: 'Title is required' })}
            />
            {errors.title && (
              <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>
            )}
          </div>
          
          <div>
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="contactId">
              Contact *
            </label>
            <div className="relative">
              {!preselectedContactId && (
                <Combobox value={selectedContact} onChange={(contact: Contact | null) => {
                  if (contact) {
                    // If this is a new contact (without an ID), open the dialog
                    if (!contact.id) {
                      openNewContactDialog();
                    } else {
                      setSelectedContact(contact);
                      setValue('contactId', contact.id || '');
                      setQuery(contact.name);
                    }
                  }
                }}>
                  <div className="relative">
                    <Combobox.Input
                      className={`input-field ${errors.contactId ? 'border-red-500' : ''} dark:bg-gray-800 dark:text-gray-100`}
                      onChange={(e) => {
                        setQuery(e.target.value);
                        if (!e.target.value) {
                          setValue('contactId', '');
                          setSelectedContact(null);
                        }
                      }}
                      displayValue={(contact: Contact | null) => contact?.name || query}
                      placeholder="Type to search or create a new contact"
                    />
                    <Combobox.Options className="combobox-options">
                      {filteredContacts.map((contact) => (
                        <Combobox.Option
                          key={contact.id}
                          value={contact}
                          className={({ active }) =>
                            `combobox-option ${active ? 'combobox-option-active' : 'combobox-option-inactive'} dark:bg-gray-800 dark:text-gray-100`
                          }
                        >
                          {contact.name}
                        </Combobox.Option>
                      ))}
                      {isNewContact && (
                        <Combobox.Option
                          value={{ name: query, userId: user?.uid || '' }}
                          className="combobox-new-option dark:bg-gray-800 dark:text-gray-100"
                        >
                          <span className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Create new contact: "{query}"
                          </span>
                        </Combobox.Option>
                      )}
                    </Combobox.Options>
                  </div>
                </Combobox>
              )}
              
              {preselectedContactId && (
                <div className="input-field flex items-center text-gray-700 dark:text-gray-100">
                  {selectedContact ? selectedContact.name : 'Loading contact...'}
                </div>
              )}
              
              {errors.contactId && !isNewContact && (
                <p className="text-red-500 text-xs mt-1">{errors.contactId.message}</p>
              )}
            </div>
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="date">
            Date *
          </label>
          <input
            className={`input-field ${errors.date ? 'border-red-500' : ''} dark:bg-gray-800 dark:text-gray-100`}
            id="date"
            type="date"
            {...register('date', { required: 'Date is required' })}
          />
          {errors.date && (
            <p className="text-red-500 text-xs mt-1">{errors.date.message}</p>
          )}
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="notes">
            Notes
          </label>
          <div className="quill-container">
            <ReactQuill
              theme="snow"
              value={notes}
              onChange={setNotes}
              placeholder="Enter details about this interaction..."
            />
          </div>
        </div>
        
        <div className="flex justify-between mt-8">
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
            {loading ? 'Saving...' : 'Save Interaction'}
          </button>
        </div>
      </form>

      {/* New Contact Dialog */}
      <Transition appear show={isNewContactDialogOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => setIsNewContactDialogOpen(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100"
                  >
                    Create New Contact
                  </Dialog.Title>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500 dark:text-gray-300">
                      Enter the details for the new contact.
                    </p>
                  </div>

                  <div className="mt-4">
                    <div className="mb-4">
                      <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="contactName">
                        Name *
                      </label>
                      <input
                        className="input-field dark:bg-gray-700 dark:text-gray-100"
                        id="contactName"
                        type="text"
                        value={newContactData.name}
                        onChange={(e) => setNewContactData({...newContactData, name: e.target.value})}
                        placeholder="Contact Name"
                      />
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="contactEmail">
                        Email
                      </label>
                      <input
                        className="input-field dark:bg-gray-700 dark:text-gray-100"
                        id="contactEmail"
                        type="email"
                        value={newContactData.email || ''}
                        onChange={(e) => setNewContactData({...newContactData, email: e.target.value})}
                        placeholder="Email Address"
                      />
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="contactPhone">
                        Phone
                      </label>
                      <input
                        className="input-field dark:bg-gray-700 dark:text-gray-100"
                        id="contactPhone"
                        type="tel"
                        value={newContactData.phone || ''}
                        onChange={(e) => setNewContactData({...newContactData, phone: e.target.value})}
                        placeholder="Phone Number"
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <p className="text-sm text-gray-500 italic">
                      Couldn&apos;t find the contact? Click &quot;New Contact&quot; to add them.
                    </p>
                  </div>

                  <div className="mt-4 flex justify-end space-x-3">
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => setIsNewContactDialogOpen(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="btn-primary"
                      onClick={handleCreateContact}
                      disabled={loading || !newContactData.name.trim()}
                    >
                      {loading ? 'Creating...' : 'Create Contact'}
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
};

export default InteractionForm;