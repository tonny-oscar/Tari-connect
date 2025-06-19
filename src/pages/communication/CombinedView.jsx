import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { Link, useParams, useNavigate } from 'react-router-dom';
import Chat from './Chat';
import ContactDetails from '../../components/ContactDetails';
import Inbox from '../../components/Inbox';

function CombinedView() {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const [showContactDetails, setShowContactDetails] = useState(false);
  
  // If no conversation is selected, redirect to the first one
  useEffect(() => {
    if (!conversationId) {
      const fetchFirstConversation = async () => {
        const q = query(collection(db, 'conversations'), orderBy('lastUpdated', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
          if (!snapshot.empty) {
            navigate(`/combined/${snapshot.docs[0].id}`);
          }
          unsubscribe();
        });
      };
      fetchFirstConversation();
    }
  }, [conversationId, navigate]);

  return (
    <div className="grid grid-cols-12 gap-4">
      {/* Sidebar with conversations */}
      <div className="col-span-3 bg-white rounded shadow">
        <Inbox />
      </div>

      {/* Main content area */}
      <div className="col-span-9">
        <div className="flex justify-end mb-2">
          <button 
            onClick={() => setShowContactDetails(!showContactDetails)}
            className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
          >
            {showContactDetails ? 'Hide Contact Details' : 'Show Contact Details'}
          </button>
        </div>

        <div className="grid grid-cols-12 gap-4">
          {/* Chat area */}
          <div className={showContactDetails ? "col-span-8" : "col-span-12"}>
            {conversationId ? (
              <Chat />
            ) : (
              <div className="bg-white rounded shadow p-4 h-[500px] flex items-center justify-center">
                <p className="text-gray-500">Select a conversation to start chatting</p>
              </div>
            )}
          </div>

          {/* Contact details sidebar */}
          {showContactDetails && conversationId && (
            <div className="col-span-4">
              <ContactDetails />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CombinedView;