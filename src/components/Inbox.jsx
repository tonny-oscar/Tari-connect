import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Link, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';

function Inbox() {
  const [conversations, setConversations] = useState([]);
  const { conversationId } = useParams();

  useEffect(() => {
    const q = query(collection(db, 'conversations'), orderBy('lastUpdated', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setConversations(list);
    });
    return () => unsub();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Conversations</h2>
      {conversations.length === 0 ? (
        <p className="text-gray-500">No conversations yet</p>
      ) : (
        <ul className="space-y-2">
          {conversations.map(conv => (
            <li 
              key={conv.id} 
              className={`p-3 rounded ${conversationId === conv.id ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
            >
              <Link 
                to={`/combined/${conv.id}`} 
                className="block"
              >
                <div className="font-medium">{conv.contactName || 'Unknown User'}</div>
                <div className="text-sm text-gray-600 truncate">
                  {conv.lastMessage || 'No messages'}
                </div>
                {conv.lastUpdated && (
                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(conv.lastUpdated.toDate()).toLocaleString()}
                  </div>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Inbox;