import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../services/firebase';
import { sendMessage, listenToMessages, setTypingStatus, listenToTyping } from '../../services/chatService';
import { createMessageNotification } from '../../services/notificationService';
import { createTask } from '../../services/dataService';
import EmojiPicker from 'emoji-picker-react';
import { FaSmile, FaPaperclip, FaMicrophone, FaUser, FaTasks } from 'react-icons/fa';
import { ReactMediaRecorder } from 'react-media-recorder';
import TaskForm from '../../components/TaskForm';
import { useAuth } from '../../store/useAuth';

function Chat() {
  const { conversationId } = useParams();
  const scrollRef = useRef(null);
  const { user } = useAuth();

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [typingUsers, setTypingUsers] = useState([]);
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

  // Listen to real-time messages
  useEffect(() => {
    const unsubscribe = listenToMessages(conversationId, (messageList) => {
      setMessages(messageList);
    });
    
    return unsubscribe;
  }, [conversationId]);

  // Listen to typing indicators
  useEffect(() => {
    const unsubscribe = listenToTyping(conversationId, (typingList) => {
      // Filter out current user from typing list
      const otherUsersTyping = typingList.filter(t => t.userId !== user?.uid);
      setTypingUsers(otherUsersTyping);
    });
    
    // Clean up typing status when component unmounts
    return () => {
      unsubscribe();
      if (user?.uid) {
        setTypingStatus(conversationId, user.uid, false);
      }
    };
  }, [conversationId, user?.uid]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      setTimeout(() => {
        scrollRef.current.scrollTo({
          top: scrollRef.current.scrollHeight,
          behavior: 'smooth'
        });
      }, 100);
    }
  }, [messages]);

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

    const messageData = {
      text: newMessage,
      fileUrl: fileUrl || audioURL || null,
      sender: 'agent',
      senderName: user?.displayName || user?.email || 'Agent',
      senderId: user?.uid,
      status: 'sent'
    };

    const result = await sendMessage(conversationId, messageData);

    if (result.success) {
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

      // Stop typing indicator
      await setTypingStatus(conversationId, user?.uid, false);
    }
  };

  // Debounced typing indicator
  const typingTimeoutRef = useRef(null);
  
  const handleTyping = useCallback(async (e) => {
    setNewMessage(e.target.value);
    
    // Set typing indicator with debounce
    if (user?.uid) {
      await setTypingStatus(conversationId, user.uid, true);
      
      // Clear previous timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Set new timeout to clear typing status after 2 seconds of inactivity
      typingTimeoutRef.current = setTimeout(async () => {
        await setTypingStatus(conversationId, user.uid, false);
      }, 2000);
    }
  }, [conversationId, user]);

  return (
    <div className="bg-white rounded shadow h-full">
      {/* Chat header */}
      <div className="border-b p-3 flex justify-between items-center">
        <div className="font-medium">{contactName}</div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowCreateTask(true)}
            className="text-primary flex items-center gap-1 hover:text-primary-dark transition-colors"
          >
            <FaTasks />
          </button>
          <Link 
            to={`/contacts/${conversationId}`}
            className="text-primary flex items-center gap-1 hover:text-primary-dark transition-colors"
          >
            <FaUser />
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
      <div ref={scrollRef} className="h-[calc(100vh-200px)] min-h-[400px] overflow-y-scroll p-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`mb-3 p-2 rounded max-w-[75%] ${
              msg.senderId === user?.uid 
                ? 'ml-auto bg-primary/10 text-right' 
                : 'mr-auto bg-gray-100'
            }`}
          >
            <div className="text-xs text-gray-500 mb-1">
              {msg.senderName || msg.sender}
            </div>
            {msg.text && <p>{msg.text}</p>}
            {msg.fileUrl && (
              <div className="mt-2">
                {msg.fileUrl.endsWith('.mp3') ? (
                  <audio controls src={msg.fileUrl} className="max-w-full" />
                ) : (
                  <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    View File
                  </a>
                )}
              </div>
            )}
            <p className="text-xs text-gray-500 mt-1">
              {msg.status === 'seen' ? '✓✓ Seen' : msg.status === 'delivered' ? '✓✓ Delivered' : '✓ Sent'}
              {msg.timestamp && ` • ${new Date(msg.timestamp).toLocaleTimeString()}`}
            </p>
          </div>
        ))}
        
        {/* Typing indicators */}
        {typingUsers.length > 0 && (
          <div className="text-sm text-gray-500 italic mb-2">
            {typingUsers.length === 1 
              ? `${typingUsers[0].name || 'Someone'} is typing...` 
              : `${typingUsers.length} people are typing...`
            }
            <span className="inline-block animate-pulse">...</span>
          </div>
        )}
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
          className="flex-1 border p-2 rounded focus:ring-primary focus:border-primary"
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
          className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark transition-colors"
        >
          Send
        </button>
      </form>
    </div>
  );
}

export default Chat;