"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { useAuth } from '../lib/authContext';
import { getInteractions, Interaction } from '../lib/db';

// Function to create a truncated preview of rich text notes
const createNotesPreview = (notes: string | undefined, maxLength: number = 75) => {
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

const RecentInteractions = () => {
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [visibleInteractions, setVisibleInteractions] = useState<Interaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const interactionsPerPage = 10;
  const { user } = useAuth();

  useEffect(() => {
    const fetchInteractions = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        setError(null);
        
        console.log('Starting to fetch interactions for home page:', user.uid);
        const interactionsData = await getInteractions(user.uid);
        console.log('Home page interactions fetched successfully:', interactionsData.length);
        
        // Sort interactions by date (most recent first)
        const sortedInteractions = interactionsData.sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        
        setInteractions(sortedInteractions);
        setVisibleInteractions(sortedInteractions.slice(0, interactionsPerPage));
      } catch (err: any) {
        console.error('Error fetching home page interactions:', err);
        setError(err.message || 'Failed to load interactions');
      } finally {
        setLoading(false);
      }
    };

    fetchInteractions();
  }, [user]);

  const loadMoreInteractions = () => {
    const nextPage = page + 1;
    const nextInteractions = interactions.slice(0, nextPage * interactionsPerPage);
    setVisibleInteractions(nextInteractions);
    setPage(nextPage);
  };

  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-2 text-gray-500 dark:text-gray-400">Loading interactions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-4">
        <p className="text-red-500 dark:text-red-400">{error}</p>
        <button 
          onClick={() => {
            setLoading(true);
            setError(null);
            if (user) {
              getInteractions(user.uid)
                .then(data => {
                  const sortedData = data.sort((a, b) => 
                    new Date(b.date).getTime() - new Date(a.date).getTime()
                  );
                  setInteractions(sortedData);
                  setVisibleInteractions(sortedData.slice(0, interactionsPerPage));
                })
                .catch(err => setError(err.message))
                .finally(() => setLoading(false));
            }
          }}
          className="mt-2 text-primary-600 dark:text-primary-400 underline"
        >
          Retry
        </button>
      </div>
    );
  }

  if (visibleInteractions.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-gray-500 dark:text-gray-400">No interactions yet.</p>
        <Link href="/interactions/new" className="mt-2 text-primary-600 dark:text-primary-400 underline block">
          Log your first interaction
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="overflow-x-auto -mx-4 sm:mx-0">
        <table className="w-full table-auto">
          <thead className="bg-gray-100 dark:bg-gray-700">
            <tr>
              <th className="py-2 px-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">Title</th>
              <th className="py-2 px-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">Contact</th>
              <th className="py-2 px-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider max-w-[80px]">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {visibleInteractions.map((interaction) => (
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {interactions.length > visibleInteractions.length && (
        <div className="text-center mt-4">
          <button
            onClick={loadMoreInteractions}
            className="text-primary-600 dark:text-primary-400 hover:underline"
          >
            Load More
          </button>
        </div>
      )}
    </div>
  );
};

export default RecentInteractions;