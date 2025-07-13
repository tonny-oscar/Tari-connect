import React, { useState, useEffect } from 'react';
import { FaRobot, FaPlus, FaCog, FaPaperPlane, FaBrain, FaComments, FaTrash, FaTimes } from 'react-icons/fa';
import { sendToAI } from '../../services/aiService';

const FrostAI = () => {
  const [activeTab, setActiveTab] = useState('chatbot');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { role: 'assistant', content: '❄️ Hello! I\'m Frost AI, your intelligent assistant. How can I help you today?' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [aiLanguage, setAiLanguage] = useState('en');
  const [aiStyle, setAiStyle] = useState('professional');
  const [templates, setTemplates] = useState([]);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [newTemplate, setNewTemplate] = useState({ name: '', content: '', category: 'general' });



  useEffect(() => {
    // Load saved AI settings
    const savedAiLanguage = localStorage.getItem('aiLanguage');
    const savedAiStyle = localStorage.getItem('aiStyle');
    const savedTemplates = localStorage.getItem('templates');
    
    if (savedAiLanguage) setAiLanguage(savedAiLanguage);
    if (savedAiStyle) setAiStyle(savedAiStyle);
    if (savedTemplates) setTemplates(JSON.parse(savedTemplates));
  }, []);

  const addTemplate = () => {
    if (!newTemplate.name || !newTemplate.content) return;
    const template = { ...newTemplate, id: Date.now() };
    const updated = [...templates, template];
    setTemplates(updated);
    localStorage.setItem('templates', JSON.stringify(updated));
    setNewTemplate({ name: '', content: '', category: 'general' });
    setShowTemplateModal(false);
  };

  const deleteTemplate = (id) => {
    const updated = templates.filter(t => t.id !== id);
    setTemplates(updated);
    localStorage.setItem('templates', JSON.stringify(updated));
  };

  const tabs = [
    { id: 'chatbot', name: 'Chat', icon: FaBrain },
    { id: 'templates', name: 'Templates', icon: FaComments },
    { id: 'settings', name: 'Settings', icon: FaCog }
  ];



  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = { role: 'user', content: input, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    try {
      // Send to real AI service
      const aiResponse = await sendToAI(currentInput, aiLanguage, aiStyle);
      
      const aiReply = { 
        role: 'assistant', 
        content: aiResponse.message,
        timestamp: new Date(),
        isRealAI: aiResponse.success
      };
      setMessages((prev) => [...prev, aiReply]);
    } catch (err) {
      console.error('AI error:', err);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: '❄️ I\'m having trouble connecting right now. Please try again in a moment.', timestamp: new Date() },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl">
              <FaRobot className="text-white" />
            </div>
            Frost AI
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2 text-lg">
            ❄️ Your intelligent business assistant
          </p>
        </div>
        <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
          <FaPlus className="mr-2" /> New Chat
        </button>
      </div>

      {/* Tabs */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-3">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'bg-green-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon className="w-4 h-4" />
                {tab.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
        {activeTab === 'chatbot' && (
          <div className="h-96 flex flex-col">
            <div className="flex-1 p-4 overflow-y-auto bg-gray-50 dark:bg-gray-900">
              <div className="space-y-4">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg ${
                      msg.role === 'user' 
                        ? 'bg-green-600 text-white' 
                        : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600'
                    }`}>
                      <p className="text-sm">{msg.content}</p>
                      {msg.timestamp && (
                        <div className="flex items-center justify-between mt-1">
                          <p className={`text-xs opacity-70 ${
                            msg.role === 'user' ? 'text-green-100' : 'text-gray-500 dark:text-gray-400'
                          }`}>
                            {msg.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white dark:bg-gray-700 px-4 py-3 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-600">
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-green-500 border-t-transparent"></div>
                        <span className="text-gray-600 dark:text-gray-400 text-sm">AI is thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Ask Frost AI anything..."
                  disabled={isLoading}
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || isLoading}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FaPaperPlane />
                </button>
              </div>
            </div>
          </div>
        )}



        {activeTab === 'templates' && (
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Response Templates</h3>
              <button 
                onClick={() => setShowTemplateModal(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <FaPlus /> Add Template
              </button>
            </div>
            
            {templates.length === 0 ? (
              <div className="text-center py-12">
                <FaComments className="mx-auto text-4xl text-gray-400 mb-4" />
                <p className="text-gray-600 dark:text-gray-400 mb-4">No templates created yet</p>
                <button 
                  onClick={() => setShowTemplateModal(true)}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Create First Template
                </button>
              </div>
            ) : (
              <div className="grid gap-4">
                {templates.map(template => (
                  <div key={template.id} className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-700">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-green-700 dark:text-green-300">{template.name}</h4>
                          <span className="bg-green-600 text-white px-2 py-1 rounded text-xs">
                            {template.category}
                          </span>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300">{template.content}</p>
                      </div>
                      <button 
                        onClick={() => deleteTemplate(template.id)}
                        className="text-red-500 hover:text-red-700 p-2"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Frost AI Settings</h3>
            
            <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg border border-green-200 dark:border-green-700">
              <h4 className="text-lg font-semibold text-green-700 dark:text-green-300 mb-4">
                Language & Style
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Language</label>
                  <select 
                    value={aiLanguage}
                    onChange={(e) => setAiLanguage(e.target.value)}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Style</label>
                  <select 
                    value={aiStyle}
                    onChange={(e) => setAiStyle(e.target.value)}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="professional">Professional</option>
                    <option value="friendly">Friendly</option>
                    <option value="casual">Casual</option>
                  </select>
                </div>
              </div>
              
              <button 
                onClick={() => {
                  localStorage.setItem('aiLanguage', aiLanguage);
                  localStorage.setItem('aiStyle', aiStyle);
                  alert('Settings saved!');
                }}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors mt-4"
              >
                Save Settings
              </button>
            </div>
          </div>
        )}
      </div>


      {/* Template Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Add Template</h3>
              <button onClick={() => setShowTemplateModal(false)} className="text-gray-500 hover:text-gray-700">
                <FaTimes />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Template Name</label>
                <input
                  type="text"
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate({...newTemplate, name: e.target.value})}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="e.g., Welcome Message"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                <select
                  value={newTemplate.category}
                  onChange={(e) => setNewTemplate({...newTemplate, category: e.target.value})}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="general">General</option>
                  <option value="support">Support</option>
                  <option value="sales">Sales</option>
                  <option value="followup">Follow-up</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Content</label>
                <textarea
                  value={newTemplate.content}
                  onChange={(e) => setNewTemplate({...newTemplate, content: e.target.value})}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  rows="4"
                  placeholder="Template content..."
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowTemplateModal(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={addTemplate}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Add Template
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FrostAI;