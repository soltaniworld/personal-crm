"use client";

import { useState, useEffect } from 'react';

const FirebaseConfigChecker = () => {
  const [configStatus, setConfigStatus] = useState<'checking' | 'valid' | 'invalid'>('checking');
  const [missingEnvVars, setMissingEnvVars] = useState<string[]>([]);
  const [isCollapsed, setIsCollapsed] = useState(true);

  useEffect(() => {
    const checkFirebaseConfig = () => {
      const requiredEnvVars = [
        'NEXT_PUBLIC_FIREBASE_API_KEY',
        'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
        'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
        'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
        'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
        'NEXT_PUBLIC_FIREBASE_APP_ID'
      ];

      const missing = requiredEnvVars.filter(
        varName => !process.env[varName] || process.env[varName] === 'your-api-key'
      );

      setMissingEnvVars(missing);
      setConfigStatus(missing.length === 0 ? 'valid' : 'invalid');
    };

    checkFirebaseConfig();
  }, []);

  if (configStatus === 'checking') {
    return <p>Checking Firebase configuration...</p>;
  }

  if (configStatus === 'valid') {
    return null; // Don't show anything if config is valid
  }

  return (
    <div className="p-2 bg-yellow-50 border border-yellow-300 text-yellow-700 rounded mb-4 text-sm">
      <div className="flex justify-between items-center cursor-pointer" onClick={() => setIsCollapsed(!isCollapsed)}>
        <h3 className="font-medium flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Firebase Configuration Notice
        </h3>
        <button 
          className="text-yellow-700 hover:text-yellow-900" 
          onClick={(e) => {
            e.stopPropagation();
            setIsCollapsed(!isCollapsed);
          }}
        >
          {isCollapsed ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          )}
        </button>
      </div>
      
      {!isCollapsed && (
        <div className="mt-2">
          <p>Some Firebase configuration variables are missing or have default values, but the app appears to be working. If you encounter issues, check these variables:</p>
          <ul className="list-disc ml-6 mt-1">
            {missingEnvVars.map(varName => (
              <li key={varName}>{varName}</li>
            ))}
          </ul>
          <p className="mt-1 text-xs">
            You can safely ignore this message if your app is functioning correctly.
          </p>
        </div>
      )}
    </div>
  );
};

export default FirebaseConfigChecker; 