// Chat.jsx
import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  doc,
  updateDoc,
  getDoc,
  setDoc,
  where,
  getDocs
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../services/firebase';
import { createMessageNotification } from '../services/notificationService';
import { createTask } from '../services/dataService';
import EmojiPicker from 'emoji-picker-react';
import { FaSmile, FaPaperclip, FaMicrophone, FaUser, FaTasks } from 'react-icons/fa';
import { ReactMediaRecorder } from 'react-media-recorder';
import TaskForm from '../components/TaskForm';

function Chat() {
  const { conversationId } = useParams();
  const scrollRef = useRef(null);

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [file, setFile] = useState(null);
  const [audioURL, setAudioURL] = useState(null);
  const [contactName, setContactName] = useState('');
  const [contactId, setContactId] = useState('');
  const [showCreateTask, setShowCreateTask] = useState(false);

  // Fetch contact info
  useEffect(() => {
    const fetchContactInfo = async () => {
      const convoDoc = await getDoc(doc(db, 'conversations', conversationId));
      if (convoDoc.exists()) {
        const data = convoDoc.data();
        setContactName(data.contactName || 'Unknown Contact');
        setContactId(data.contactId || '');
      }
    };
    fetchContactInfo();
  }, [conversationId]);

  useEffect(() => {
    const q = query(
      collection(db, `conversations/${conversationId}/messages`),
      orderBy('timestamp', 'asc')
    );
    const unsub = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setMessages(msgs);
    });
    return () => unsub();
  }, [conversationId]);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [messages]);

  useEffect(() => {
    const typingDoc = doc(db, 'conversations', conversationId, 'status', 'typing');
    const unsub = onSnapshot(typingDoc, (snap) => {
      setIsTyping(snap.exists() && snap.data().agentTyping);
    });
    return () => unsub();
  }, [conversationId]);

  useEffect(() => {
    const markSeen = async () => {
      const q = query(
        collection(db, `conversations/${conversationId}/messages`),
        where("status", "in", ["sent", "delivered"])
      );
      const snapshot = await getDocs(q);
      snapshot.forEach(async (docSnap) => {
        await updateDoc(docSnap.ref, { status: "seen" });
      });
    };
    markSeen();
  }, [messages, conversationId]);

  const handleEmojiClick = (emoji) => {
    setNewMessage((prev) => prev + emoji.emoji);
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const uploadFile = async () => {
    if (!file) return null;
    const storageRef = ref(storage, `chat_uploads/${Date.now()}_${file.name}`);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    return url;
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() && !file && !audioURL) return;

    let fileUrl = null;
    if (file) fileUrl = await uploadFile();

    await addDoc(collection(db, `conversations/${conversationId}/messages`), {
      text: newMessage,
      fileUrl: fileUrl || audioURL || null,
      sender: 'agent',
      timestamp: serverTimestamp(),
      status: 'sent'
    });

    await updateDoc(doc(db, 'conversations', conversationId), {
      lastUpdated: serverTimestamp(),
      lastMessage: newMessage || 'Media'
    });

    // Create notification for the contact if they have a user account
    if (contactId) {
      await createMessageNotification(
        contactId,
        'Agent',
        newMessage || 'Sent a file'
      );
    }

    setNewMessage('');
    setFile(null);
    setAudioURL(null);
    setShowEmojiPicker(false);

    await setDoc(doc(db, 'conversations', conversationId, 'status', 'typing'), {
      agentTyping: false,
    });
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    setTyping(true);
    setDoc(doc(db, 'conversations', conversationId, 'status', 'typing'), {
      agentTyping: true,
    });

    setTimeout(() => {
      setTyping(false);
      setDoc(doc(db, 'conversations', conversationId, 'status', 'typing'), {
        agentTyping: false,
      });
    }, 3000);
  };

  return (
    <div className="bg-white rounded shadow h-full">
      {/* Chat header */}
      <div className="border-b p-3 flex justify-between items-center">
        <div className="font-medium">{contactName}</div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowCreateTask(!showCreateTask)}
            className="text-blue-600 flex items-center gap-1 hover:text-blue-800 transition-colors"
          >
            <FaTasks /> Create Task
          </button>
          <Link 
            to={`/contact/${conversationId}`}
            className="text-blue-600 flex items-center gap-1 hover:text-blue-800 transition-colors"
          >
            <FaUser /> Contact Info
          </Link>
        </div>
      </div>

      {/* Create Task Form */}
      {showCreateTask && (
        <TaskForm 
          conversationId={conversationId} 
          contactName={contactName} 
          onClose={() => setShowCreateTask(false)} 
        />
      )}

      {/* Messages area */}
      <div ref={scrollRef} className="h-[500px] overflow-y-scroll p-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`mb-3 p-2 rounded max-w-[75%] ${msg.sender === 'agent' ? 'ml-auto bg-blue-100 text-right' : 'mr-auto bg-gray-100'}`}
          >
            {msg.text && <p>{msg.text}</p>}
            {msg.fileUrl && (
              <div className="mt-2">
                {msg.fileUrl.endsWith('.mp3') ? (
                  <audio controls src={msg.fileUrl} className="max-w-full" />
                ) : (
                  <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    View File
                  </a>
                )}
              </div>
            )}
            <p className="text-xs text-gray-500 mt-1">
              {msg.status === 'seen' ? '✓✓ Seen' : msg.status === 'delivered' ? '✓✓ Delivered' : '✓ Sent'}
              {msg.timestamp && ` • ${new Date(msg.timestamp.toDate()).toLocaleTimeString()}`}
            </p>
          </div>
        ))}
        {isTyping && <p className="italic text-gray-500">User is typing...</p>}
      </div>

      {/* Message input */}
      <form onSubmit={handleSend} className="border-t p-3 flex items-center gap-2 relative">
        <button 
          type="button" 
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className="text-gray-600 hover:text-gray-800 transition-colors"
        >
          <FaSmile className="text-xl" />
        </button>

        {showEmojiPicker && (
          <div className="absolute bottom-16 left-0 z-20">
            <EmojiPicker onEmojiClick={handleEmojiClick} />
          </div>
        )}

        <input
          type="text"
          value={newMessage}
          onChange={handleTyping}
          placeholder="Type a message"
          className="flex-1 border p-2 rounded focus:ring-blue-500 focus:border-blue-500"
        />

        <input type="file" id="fileInput" onChange={handleFileChange} className="hidden" />
        <label htmlFor="fileInput" className="cursor-pointer">
          <FaPaperclip className="text-xl text-gray-600 hover:text-gray-800 transition-colors" />
        </label>

        <ReactMediaRecorder
          audio
          render={({ startRecording, stopRecording, mediaBlobUrl }) => (
            <button
              type="button"
              onMouseDown={startRecording}
              onMouseUp={() => {
                stopRecording();
                setAudioURL(mediaBlobUrl);
              }}
              className="text-gray-600 hover:text-gray-800 transition-colors"
            >
              <FaMicrophone className="text-xl" />
            </button>
          )}
        />

        <button 
          type="submit" 
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
        >
          Send
        </button>
      </form>
    </div>
  );
}

export default Chat;