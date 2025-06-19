import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

function ContactDetails() {
  const { conversationId } = useParams();
  const [contact, setContact] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContact = async () => {
      setLoading(true);
      try {
        const convoDoc = await getDoc(doc(db, 'conversations', conversationId));
        const contactId = convoDoc.data()?.contactId;
        
        if (contactId) {
          const contactDoc = await getDoc(doc(db, 'contacts', contactId));
          setContact(contactDoc.data());
        } else {
          // If no contactId, use conversation data as contact info
          setContact({
            name: convoDoc.data()?.contactName || 'Unknown Contact',
            email: convoDoc.data()?.contactEmail || 'No email provided',
            phone: convoDoc.data()?.contactPhone || 'No phone provided',
            notes: convoDoc.data()?.notes || 'No notes'
          });
        }
      } catch (error) {
        console.error("Error fetching contact:", error);
      } finally {
        setLoading(false);
      }
    };
    
    if (conversationId) {
      fetchContact();
    }
  }, [conversationId]);

  if (loading) return (
    <div className="bg-white rounded shadow p-4">
      <p className="text-center text-gray-500">Loading contact information...</p>
    </div>
  );

  if (!contact) return (
    <div className="bg-white rounded shadow p-4">
      <p className="text-center text-gray-500">No contact information available</p>
    </div>
  );

  return (
    <div className="bg-white rounded shadow p-4">
      <h3 className="font-bold text-lg mb-4">Contact Information</h3>
      
      <div className="space-y-3">
        <div>
          <p className="text-sm text-gray-500">Name</p>
          <p className="font-medium">{contact.name}</p>
        </div>
        
        <div>
          <p className="text-sm text-gray-500">Email</p>
          <p className="font-medium">{contact.email}</p>
        </div>
        
        <div>
          <p className="text-sm text-gray-500">Phone</p>
          <p className="font-medium">{contact.phone}</p>
        </div>
        
        <div>
          <p className="text-sm text-gray-500">Notes</p>
          <p className="font-medium">{contact.notes}</p>
        </div>
      </div>
    </div>
  );
}

export default ContactDetails;