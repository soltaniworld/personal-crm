import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDoc,
  Timestamp,
  orderBy
} from 'firebase/firestore';
import { db } from './firebase';
import { auth } from './firebase';

// Types
export interface Contact {
  id?: string;
  userId: string;
  name: string;
  email?: string;
  phone?: string;
  birthday?: Date;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Interaction {
  id?: string;
  userId: string;
  contactId: string;
  contactName?: string; // Denormalized for easier display
  title: string;
  notes?: string;
  date: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

// Contacts
export const getContacts = async (userId: string): Promise<Contact[]> => {
  try {
    console.log('Fetching contacts for user:', userId);
    
    const contactsQuery = query(
      collection(db, 'contacts'),
      where('userId', '==', userId)
    );
    
    console.log('Query created, fetching documents...');
    const snapshot = await getDocs(contactsQuery);
    console.log('Documents fetched, count:', snapshot.docs.length);
    
    const contacts = snapshot.docs.map(doc => {
      const data = doc.data();
      console.log('Contact data:', { id: doc.id, ...data });
      
      return {
        ...data,
        id: doc.id,
        birthday: data.birthday ? (data.birthday instanceof Timestamp ? data.birthday.toDate() : new Date(data.birthday)) : undefined,
        createdAt: data.createdAt ? (data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt)) : new Date(),
        updatedAt: data.updatedAt ? (data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date(data.updatedAt)) : new Date(),
      } as Contact;
    });
    
    console.log('Processed contacts:', contacts.length);
    return contacts;
  } catch (error) {
    console.error('Error fetching contacts:', error);
    // Re-throw the error with more context
    throw new Error(`Failed to fetch contacts: ${error.message}`);
  }
};

export const getContact = async (contactId: string): Promise<Contact | null> => {
  try {
    console.log('Fetching contact with ID:', contactId);
    
    if (!contactId) {
      console.error('Invalid contact ID provided (empty)');
      throw new Error('Invalid contact ID provided');
    }
    
    const docRef = doc(db, 'contacts', contactId);
    console.log('Created docRef for Firestore:', docRef.path);
    
    const docSnap = await getDoc(docRef);
    console.log('Document exists?', docSnap.exists());
    
    if (!docSnap.exists()) {
      console.log('Contact not found for ID:', contactId);
      return null;
    }
    
    // Get the raw data first for logging
    const rawData = docSnap.data();
    console.log('Raw contact data from Firestore:', JSON.stringify(rawData, null, 2));
    
    // Create a basic contact with required fields
    let contact: Contact = {
      id: docSnap.id,
      userId: rawData.userId || '',
      name: rawData.name || 'Unnamed Contact'
    };
    
    // Safely add optional fields
    if (rawData.email !== undefined) contact.email = rawData.email;
    if (rawData.phone !== undefined) contact.phone = rawData.phone;
    if (rawData.notes !== undefined) contact.notes = rawData.notes;
    
    // Safely handle date fields with multiple fallbacks
    try {
      if (rawData.birthday) {
        if (rawData.birthday instanceof Timestamp) {
          contact.birthday = rawData.birthday.toDate();
        } else if (rawData.birthday.seconds && rawData.birthday.nanoseconds) {
          // Handle Firestore timestamp object structure
          contact.birthday = new Timestamp(
            rawData.birthday.seconds, 
            rawData.birthday.nanoseconds
          ).toDate();
        } else if (typeof rawData.birthday === 'string') {
          contact.birthday = new Date(rawData.birthday);
        }
        console.log('Processed birthday field:', contact.birthday);
      }
    } catch (err) {
      console.error('Error processing birthday field:', err);
      // Continue without the birthday field
    }
    
    // Handle created/updated dates
    try {
      if (rawData.createdAt) {
        if (rawData.createdAt instanceof Timestamp) {
          contact.createdAt = rawData.createdAt.toDate();
        } else if (rawData.createdAt.seconds && rawData.createdAt.nanoseconds) {
          contact.createdAt = new Timestamp(
            rawData.createdAt.seconds, 
            rawData.createdAt.nanoseconds
          ).toDate();
        } else if (typeof rawData.createdAt === 'string') {
          contact.createdAt = new Date(rawData.createdAt);
        } else {
          contact.createdAt = new Date();
        }
      } else {
        contact.createdAt = new Date();
      }
    } catch (err) {
      console.error('Error processing createdAt field:', err);
      contact.createdAt = new Date();
    }
    
    try {
      if (rawData.updatedAt) {
        if (rawData.updatedAt instanceof Timestamp) {
          contact.updatedAt = rawData.updatedAt.toDate();
        } else if (rawData.updatedAt.seconds && rawData.updatedAt.nanoseconds) {
          contact.updatedAt = new Timestamp(
            rawData.updatedAt.seconds, 
            rawData.updatedAt.nanoseconds
          ).toDate();
        } else if (typeof rawData.updatedAt === 'string') {
          contact.updatedAt = new Date(rawData.updatedAt);
        } else {
          contact.updatedAt = new Date();
        }
      } else {
        contact.updatedAt = new Date();
      }
    } catch (err) {
      console.error('Error processing updatedAt field:', err);
      contact.updatedAt = new Date();
    }
    
    console.log('Processed contact data:', contact);
    return contact;
  } catch (err) {
    console.error('Error in getContact function:', err);
    throw new Error(`Failed to retrieve contact: ${err.message}`);
  }
};

export const addContact = async (contact: Contact): Promise<string> => {
  try {
    console.log('Adding contact with data:', contact);
    
    const now = new Date();
    
    // Ensure userId is a string
    if (!contact.userId || typeof contact.userId !== 'string') {
      throw new Error('Invalid userId provided');
    }
    
    // Prepare the data for Firestore
    const contactData = {
      ...contact,
      // Ensure all optional fields are either properly defined or null (not undefined)
      name: contact.name.trim(),
      email: contact.email?.trim() || null,
      phone: contact.phone?.trim() || null,
      notes: contact.notes?.trim() || null,
      birthday: contact.birthday || null,
      createdAt: now,
      updatedAt: now
    };
    
    // Remove any undefined values
    Object.keys(contactData).forEach(key => {
      if (contactData[key] === undefined) {
        delete contactData[key];
      }
    });
    
    console.log('Prepared contact data for Firestore:', contactData);
    const docRef = await addDoc(collection(db, 'contacts'), contactData);
    console.log('Contact added with ID:', docRef.id);
    
    return docRef.id;
  } catch (error) {
    console.error('Error adding contact to Firestore:', error);
    
    if (error.message) {
      error.message = `Failed to add contact: ${error.message}`;
    }
    
    throw error;
  }
};

export const updateContact = async (contactId: string, contact: Partial<Contact>): Promise<void> => {
  const contactRef = doc(db, 'contacts', contactId);
  const now = new Date();
  
  await updateDoc(contactRef, {
    ...contact,
    updatedAt: now
  });
};

export const deleteContact = async (contactId: string): Promise<void> => {
  await deleteDoc(doc(db, 'contacts', contactId));
};

// Interactions
export const getInteractions = async (userId: string): Promise<Interaction[]> => {
  try {
    console.log('Fetching interactions for user:', userId);
    
    const interactionsQuery = query(
      collection(db, 'interactions'),
      where('userId', '==', userId)
      // Removing orderBy until we're sure the basic query works
    );
    
    console.log('Interactions query created, fetching documents...');
    const snapshot = await getDocs(interactionsQuery);
    console.log('Interaction documents fetched, count:', snapshot.docs.length);
    
    const interactions = snapshot.docs.map(doc => {
      const data = doc.data();
      console.log('Interaction data:', { id: doc.id, ...data });
      
      return {
        ...data,
        id: doc.id,
        date: data.date instanceof Timestamp ? data.date.toDate() : new Date(data.date),
        createdAt: data.createdAt ? (data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt)) : new Date(),
        updatedAt: data.updatedAt ? (data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date(data.updatedAt)) : new Date(),
      } as Interaction;
    });
    
    console.log('Processed interactions:', interactions.length);
    return interactions;
  } catch (error) {
    console.error('Error fetching interactions:', error);
    throw new Error(`Failed to fetch interactions: ${error.message}`);
  }
};

export const getContactInteractions = async (contactId: string): Promise<Interaction[]> => {
  try {
    console.log('Fetching interactions for contact ID:', contactId);
    
    if (!contactId) {
      console.error('Invalid contact ID provided');
      return [];
    }
    
    const interactionsQuery = query(
      collection(db, 'interactions'),
      where('contactId', '==', contactId),
      orderBy('date', 'desc')
    );
    
    console.log('Interactions query created, fetching documents...');
    const snapshot = await getDocs(interactionsQuery);
    console.log('Interaction documents fetched, count:', snapshot.docs.length);
    
    const interactions = snapshot.docs.map(doc => {
      try {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          date: data.date instanceof Timestamp ? data.date.toDate() : new Date(data.date),
          createdAt: data.createdAt ? (data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt)) : new Date(),
          updatedAt: data.updatedAt ? (data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date(data.updatedAt)) : new Date(),
        } as Interaction;
      } catch (err) {
        console.error('Error processing interaction document:', err, doc.id);
        return null;
      }
    }).filter(Boolean) as Interaction[];
    
    console.log('Processed interactions:', interactions.length);
    return interactions;
  } catch (err) {
    console.error('Error fetching contact interactions:', err);
    throw new Error(`Failed to fetch interactions for contact: ${err.message}`);
  }
};

export const getInteraction = async (interactionId: string): Promise<Interaction | null> => {
  try {
    console.log('Fetching interaction with ID:', interactionId);
    
    if (!interactionId) {
      console.error('Invalid interaction ID provided:', interactionId);
      return null;
    }
    
    const docRef = doc(db, 'interactions', interactionId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      console.log('Interaction not found for ID:', interactionId);
      return null;
    }
    
    const data = docSnap.data();
    console.log('Raw interaction data from Firestore:', data);
    
    // Safely convert date fields with proper error handling
    let date;
    try {
      date = data.date instanceof Timestamp ? data.date.toDate() : new Date(data.date);
    } catch (err) {
      console.error('Error converting date field:', err);
      date = new Date(); // Default to current date if conversion fails
    }
    
    const interaction = {
      ...data,
      id: docSnap.id,
      date: date,
      createdAt: data.createdAt ? (data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt)) : new Date(),
      updatedAt: data.updatedAt ? (data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date(data.updatedAt)) : new Date(),
    } as Interaction;
    
    console.log('Processed interaction data:', interaction);
    return interaction;
  } catch (err) {
    console.error('Error in getInteraction function:', err);
    throw new Error(`Failed to retrieve interaction: ${err.message}`);
  }
};

export const addInteraction = async (interaction: Interaction): Promise<string> => {
  try {
    console.log('Adding interaction with data:', interaction);
    
    const now = new Date();
    
    // Ensure userId is a string
    if (!interaction.userId || typeof interaction.userId !== 'string') {
      throw new Error('Invalid userId provided');
    }
    
    // Ensure contactId is a string
    if (!interaction.contactId || typeof interaction.contactId !== 'string') {
      throw new Error('Invalid contactId provided');
    }
    
    // Get contact name for denormalization if not provided
    let contactName = interaction.contactName;
    if (interaction.contactId && !contactName) {
      try {
        const contact = await getContact(interaction.contactId);
        if (contact) {
          contactName = contact.name;
        }
      } catch (err) {
        console.warn('Could not fetch contact name for denormalization:', err);
      }
    }
    
    // Prepare the data for Firestore
    const interactionData = {
      ...interaction,
      // Ensure all required fields are properly defined
      title: interaction.title.trim(),
      contactName: contactName || null,
      notes: interaction.notes?.trim() || null,
      date: interaction.date || now,
      createdAt: now,
      updatedAt: now
    };
    
    // Remove any undefined values
    Object.keys(interactionData).forEach(key => {
      if (interactionData[key] === undefined) {
        delete interactionData[key];
      }
    });
    
    console.log('Prepared interaction data for Firestore:', interactionData);
    const docRef = await addDoc(collection(db, 'interactions'), interactionData);
    console.log('Interaction added with ID:', docRef.id);
    
    return docRef.id;
  } catch (error) {
    console.error('Error adding interaction to Firestore:', error);
    
    if (error.message) {
      error.message = `Failed to add interaction: ${error.message}`;
    }
    
    throw error;
  }
};

export const updateInteraction = async (interactionId: string, interaction: Partial<Interaction>): Promise<void> => {
  const interactionRef = doc(db, 'interactions', interactionId);
  const now = new Date();
  
  // Update contact name if contact has changed
  if (interaction.contactId) {
    const contact = await getContact(interaction.contactId);
    if (contact) {
      interaction.contactName = contact.name;
    }
  }
  
  await updateDoc(interactionRef, {
    ...interaction,
    updatedAt: now
  });
};

export const deleteInteraction = async (interactionId: string): Promise<void> => {
  await deleteDoc(doc(db, 'interactions', interactionId));
};

export const getRawContactData = async (contactId: string): Promise<any> => {
  try {
    console.log('Fetching raw contact data for ID:', contactId);
    
    if (!contactId) {
      console.error('Invalid contact ID provided (empty)');
      throw new Error('Invalid contact ID provided');
    }
    
    const docRef = doc(db, 'contacts', contactId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      console.log('Contact not found for ID:', contactId);
      return null;
    }
    
    // Return the raw data with ID added
    const rawData = docSnap.data();
    return {
      id: docSnap.id,
      ...rawData
    };
  } catch (err) {
    console.error('Error in getRawContactData function:', err);
    throw new Error(`Failed to retrieve raw contact data: ${err.message}`);
  }
}; 