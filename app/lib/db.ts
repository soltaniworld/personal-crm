import { 
  collection, 
  addDoc, 
  getDoc, 
  getDocs, 
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  FirestoreError
} from 'firebase/firestore';
import { db, auth } from './firebase';

// Error handling utility
const handleFirestoreError = (error: FirestoreError, operation: string) => {
  if (error.code === 'permission-denied') {
    throw new Error(`Permission denied while ${operation}`);
  }
  throw new Error(`Error ${operation}: ${error.message}`);
};

export interface Contact {
  id?: string;
  name: string;
  email?: string;
  phone?: string;
  userId: string;
  interactions?: number;
  birthday?: Date;
  notes?: string;
}

export interface Interaction {
  id?: string;
  title: string;
  notes?: string;
  date: Date;
  userId: string;
  contactId?: string;
  contactName?: string;
  contactExists?: boolean;
}

// Contact Operations
export const addContact = async (contact: Contact): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, 'contacts'), contact);
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error as FirestoreError, 'adding contact');
    throw error;
  }
};

export const getContact = async (id: string): Promise<Contact | null> => {
  try {
    const docRef = doc(db, 'contacts', id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Contact;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error as FirestoreError, 'getting contact');
    throw error;
  }
};

export const getContacts = async (userId: string): Promise<Contact[]> => {
  try {
    const q = query(
      collection(db, 'contacts'),
      where('userId', '==', userId),
      orderBy('name')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Contact[];
  } catch (error) {
    handleFirestoreError(error as FirestoreError, 'getting contacts');
    throw error;
  }
};

export const updateContact = async (id: string, data: Partial<Contact>): Promise<void> => {
  try {
    const docRef = doc(db, 'contacts', id);
    await updateDoc(docRef, data);
  } catch (error) {
    handleFirestoreError(error as FirestoreError, 'updating contact');
    throw error;
  }
};

export const deleteContact = async (id: string): Promise<void> => {
  try {
    const docRef = doc(db, 'contacts', id);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error as FirestoreError, 'deleting contact');
    throw error;
  }
};

// Interaction Operations
export const addInteraction = async (interaction: Interaction): Promise<string> => {
  try {
    // Ensure date is converted to timestamp
    const interactionData = {
      ...interaction,
      date: interaction.date instanceof Date ? interaction.date : new Date(interaction.date)
    };
    
    const docRef = await addDoc(collection(db, 'interactions'), interactionData);
    
    // Update contact's interaction count if there's a contactId
    if (interaction.contactId) {
      await updateContactInteractionCount(interaction.contactId);
    }
    
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error as FirestoreError, 'adding interaction');
    throw error;
  }
};

export const getInteraction = async (id: string): Promise<Interaction | null> => {
  try {
    const docRef = doc(db, 'interactions', id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      // Convert Firestore Timestamp to Date
      const date = data.date?.toDate();
      return {
        id: docSnap.id,
        ...data,
        date: date || new Date()
      } as Interaction;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error as FirestoreError, 'getting interaction');
    throw error;
  }
};

export const getInteractions = async (userId: string): Promise<Interaction[]> => {
  try {
    const q = query(
      collection(db, 'interactions'),
      where('userId', '==', userId),
      orderBy('date', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      // Convert Firestore Timestamp to Date
      const date = data.date?.toDate();
      return {
        id: doc.id,
        ...data,
        date: date || new Date()
      };
    }) as Interaction[];
  } catch (error) {
    handleFirestoreError(error as FirestoreError, 'getting interactions');
    throw error;
  }
};

export const updateInteraction = async (id: string, data: Partial<Interaction>): Promise<void> => {
  try {
    const docRef = doc(db, 'interactions', id);
    await updateDoc(docRef, data);
  } catch (error) {
    handleFirestoreError(error as FirestoreError, 'updating interaction');
    throw error;
  }
};

export const deleteInteraction = async (id: string): Promise<void> => {
  try {
    const docRef = doc(db, 'interactions', id);
    const interaction = await getInteraction(id);
    
    await deleteDoc(docRef);
    
    // Update contact's interaction count if there's a contactId
    if (interaction?.contactId) {
      await updateContactInteractionCount(interaction.contactId);
    }
  } catch (error) {
    handleFirestoreError(error as FirestoreError, 'deleting interaction');
    throw error;
  }
};

// Helper function to update contact's interaction count
const updateContactInteractionCount = async (contactId: string): Promise<void> => {
  try {
    const q = query(
      collection(db, 'interactions'),
      where('contactId', '==', contactId)
    );
    
    const querySnapshot = await getDocs(q);
    const interactionCount = querySnapshot.size;
    
    const contactRef = doc(db, 'contacts', contactId);
    await updateDoc(contactRef, { interactions: interactionCount });
  } catch (error) {
    handleFirestoreError(error as FirestoreError, 'updating contact interaction count');
    throw error;
  }
};