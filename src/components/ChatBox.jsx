import React, { useEffect, useRef, useState } from 'react';
import { db } from '../services/firebase';
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import useAuth from '../store/useAuth';

const ChatBox = ({ conversationId }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    const q = query(
      collection(db, `conversations/${conversationId}/messages`),
      orderBy('timestamp')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [conversationId]);

  const sendMessage = async () => {
    if (!message.trim()) return;

    await addDoc(collection(db, `conversations/${conversationId}/messages`), {
      sender: user.uid,
      content: message,
      type: 'text',
      timestamp: serverTimestamp(),
      seenBy: [user.uid],
    });

    setMessage('');
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="flex flex-col h-full border rounded p-3">
      <div className="flex-1 overflow-y-auto space-y-2">
        {messages.map((msg) => (
          <div key={msg.id} className={`p-2 ${msg.sender === user.uid ? 'text-right' : 'text-left'}`}>
            <span className="bg-gray-200 p-1 rounded">{msg.content}</span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="mt-2 flex">
        <input
          type="text"
          className="flex-1 border p-2 rounded-l"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
        />
        <button
          className="bg-primary text-white p-2 rounded-r hover:bg-primary-dark transition-colors"
          onClick={sendMessage}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatBox;
