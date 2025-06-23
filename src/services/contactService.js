import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

export const submitContactForm = async (formData) => {
  try {
    const contactData = {
      ...formData,
      createdAt: serverTimestamp(),
      status: 'new'
    };

    const docRef = await addDoc(collection(db, 'contacts'), contactData);
    
    return {
      success: true,
      id: docRef.id
    };
  } catch (error) {
    console.error('Error submitting contact form:', error);
    return {
      success: false,
      error: error.message
    };
  }
};