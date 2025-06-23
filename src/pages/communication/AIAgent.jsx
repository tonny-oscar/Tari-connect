import React, { useState, useEffect } from 'react';
import { FaRobot, FaPlus, FaCog, FaPaperPlane, FaStar, FaBrain, FaComments, FaLightbulb, FaTrash, FaTimes } from 'react-icons/fa';
import { useLanguage } from '../../store/useLanguage';

const AIAgent = () => {
  const { language, setLanguage, t } = useLanguage();
  const [activeTab, setActiveTab] = useState('chatbot');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { role: 'assistant', content: '👋 Hello! I\'m your AI assistant. How can I help you today?' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [aiLanguage, setAiLanguage] = useState('en');
  const [aiStyle, setAiStyle] = useState('professional');
  const [autoReplies, setAutoReplies] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [showAutoReplyModal, setShowAutoReplyModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [newAutoReply, setNewAutoReply] = useState({ keyword: '', response: '', active: true });
  const [newTemplate, setNewTemplate] = useState({ name: '', content: '', category: 'general' });

  useEffect(() => {
    // Load saved AI settings
    const savedAiLanguage = localStorage.getItem('aiLanguage');
    const savedAiStyle = localStorage.getItem('aiStyle');
    const savedAutoReplies = localStorage.getItem('autoReplies');
    const savedTemplates = localStorage.getItem('templates');
    
    if (savedAiLanguage) setAiLanguage(savedAiLanguage);
    if (savedAiStyle) setAiStyle(savedAiStyle);
    if (savedAutoReplies) setAutoReplies(JSON.parse(savedAutoReplies));
    if (savedTemplates) setTemplates(JSON.parse(savedTemplates));
  }, []);

  const addAutoReply = () => {
    if (!newAutoReply.keyword || !newAutoReply.response) return;
    const reply = { ...newAutoReply, id: Date.now() };
    const updated = [...autoReplies, reply];
    setAutoReplies(updated);
    localStorage.setItem('autoReplies', JSON.stringify(updated));
    setNewAutoReply({ keyword: '', response: '', active: true });
    setShowAutoReplyModal(false);
  };

  const deleteAutoReply = (id) => {
    const updated = autoReplies.filter(r => r.id !== id);
    setAutoReplies(updated);
    localStorage.setItem('autoReplies', JSON.stringify(updated));
  };

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
    { id: 'chatbot', name: '🤖 AI Chat', icon: FaBrain },
    { id: 'auto-replies', name: '⚡ Auto Replies', icon: FaLightbulb },
    { id: 'templates', name: '📝 Templates', icon: FaComments },
    { id: 'settings', name: '⚙️ Settings', icon: FaCog }
  ];

  const checkAutoReply = (userInput) => {
    const activeAutoReplies = autoReplies.filter(reply => reply.active);
    
    for (const reply of activeAutoReplies) {
      const keywords = reply.keyword.toLowerCase().split(',').map(k => k.trim());
      const inputLower = userInput.toLowerCase();
      
      // Check if any keyword is found in the user input
      const foundKeyword = keywords.some(keyword => 
        inputLower.includes(keyword) || 
        keyword.includes(inputLower) ||
        inputLower.split(' ').some(word => word === keyword)
      );
      
      if (foundKeyword) {
        return reply.response;
      }
    }
    return null;
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = { role: 'user', content: input, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    try {
      // First check for auto replies
      const autoReplyResponse = checkAutoReply(currentInput);
      
      if (autoReplyResponse) {
        // Use auto reply with minimal delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const aiReply = { 
          role: 'assistant', 
          content: `⚡ ${autoReplyResponse}`,
          timestamp: new Date(),
          isAutoReply: true
        };
        setMessages((prev) => [...prev, aiReply]);
        return;
      }
      
      // If no auto reply found, use AI responses
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const responses = {
        en: {
          professional: [
            `Thank you for your inquiry regarding "${currentInput}". I recommend focusing on strategic business objectives.`,
            `Based on your question about "${currentInput}", here's my professional assessment...`,
            `I've analyzed your request about "${currentInput}". The optimal approach would be...`
          ],
          friendly: [
            `Great question about "${currentInput}"! I'd love to help you with that.`,
            `Thanks for asking about "${currentInput}"! Here's what I think...`,
            `That's interesting! Regarding "${currentInput}", I suggest...`
          ],
          casual: [
            `Cool question about "${currentInput}"! Here's the deal...`,
            `So you're asking about "${currentInput}"? No problem, here's my take...`,
            `Got it! About "${currentInput}" - here's what I'd do...`
          ]
        }
      };
      
      const langResponses = responses[aiLanguage] || responses.en;
      const styleResponses = langResponses[aiStyle] || langResponses.professional;
      const randomResponse = styleResponses[Math.floor(Math.random() * styleResponses.length)];
      
      const aiReply = { 
        role: 'assistant', 
        content: randomResponse,
        timestamp: new Date()
      };
      setMessages((prev) => [...prev, aiReply]);
    } catch (err) {
      console.error('AI error:', err);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: '❌ Something went wrong. Please try again.', timestamp: new Date() },
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
            <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl">
              <FaStar className="text-white" />
            </div>
            AI Agent
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2 text-lg">
            ✨ Intelligent automation for your business communications
          </p>
        </div>
        <button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl flex items-center gap-2 hover:from-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 shadow-lg">
          <FaPlus /> New Agent
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
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg transform scale-105'
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:shadow-md border border-gray-200 dark:border-gray-700'
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
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {activeTab === 'chatbot' && (
          <div className="h-96 flex flex-col">
            <div className="flex-1 p-6 overflow-y-auto bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900/20">
              <div className="space-y-4">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-lg ${
                      msg.role === 'user' 
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white' 
                        : msg.isAutoReply
                        ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-2 border-yellow-300'
                        : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600'
                    }`}>
                      <p className="text-sm">{msg.content}</p>
                      {msg.timestamp && (
                        <div className="flex items-center justify-between mt-1">
                          <p className={`text-xs opacity-70 ${
                            msg.role === 'user' ? 'text-blue-100' : 
                            msg.isAutoReply ? 'text-yellow-100' : 'text-gray-500 dark:text-gray-400'
                          }`}>
                            {msg.timestamp.toLocaleTimeString()}
                          </p>
                          {msg.isAutoReply && (
                            <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded-full ml-2">
                              Auto Reply
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white dark:bg-gray-700 px-4 py-3 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-600">
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-purple-500 border-t-transparent"></div>
                        <span className="text-gray-600 dark:text-gray-400 text-sm">AI is thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="p-6 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  className="flex-1 px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  placeholder="💬 Try: hello, pricing, support, or ask anything..."
                  disabled={isLoading}
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || isLoading}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg flex items-center gap-2"
                >
                  <FaPaperPlane className={isLoading ? 'animate-pulse' : ''} />
                  {isLoading ? 'Sending...' : 'Send'}
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'auto-replies' && (
          <div className="p-8">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">⚡ Auto Replies</h3>
              <button 
                onClick={() => setShowAutoReplyModal(true)}
                className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-3 rounded-xl flex items-center gap-2 hover:from-yellow-600 hover:to-orange-600 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                <FaPlus /> Add Auto Reply
              </button>
            </div>
            
            {autoReplies.length === 0 ? (
              <div className="text-center py-16">
                <FaLightbulb className="mx-auto text-6xl text-yellow-400 mb-4" />
                <p className="text-gray-600 dark:text-gray-400 mb-6">No auto replies configured yet</p>
                <button 
                  onClick={() => setShowAutoReplyModal(true)}
                  className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-3 rounded-xl"
                >
                  Create First Auto Reply
                </button>
              </div>
            ) : (
              <div className="grid gap-4">
                {autoReplies.map(reply => (
                  <div key={reply.id} className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 p-6 rounded-xl border border-yellow-200 dark:border-yellow-700">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                            {reply.keyword}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            reply.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {reply.active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300">{reply.response}</p>
                      </div>
                      <button 
                        onClick={() => deleteAutoReply(reply.id)}
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

        {activeTab === 'templates' && (
          <div className="p-8">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">📝 Templates</h3>
              <button 
                onClick={() => setShowTemplateModal(true)}
                className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-6 py-3 rounded-xl flex items-center gap-2 hover:from-green-600 hover:to-blue-600 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                <FaPlus /> Add Template
              </button>
            </div>
            
            {templates.length === 0 ? (
              <div className="text-center py-16">
                <FaComments className="mx-auto text-6xl text-green-400 mb-4" />
                <p className="text-gray-600 dark:text-gray-400 mb-6">No templates created yet</p>
                <button 
                  onClick={() => setShowTemplateModal(true)}
                  className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-6 py-3 rounded-xl"
                >
                  Create First Template
                </button>
              </div>
            ) : (
              <div className="grid gap-4">
                {templates.map(template => (
                  <div key={template.id} className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 p-6 rounded-xl border border-green-200 dark:border-green-700">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-green-700 dark:text-green-300">{template.name}</h4>
                          <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs">
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
          <div className="p-8">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">⚙️ AI Configuration</h3>
                <p className="text-gray-600 dark:text-gray-400 text-lg">
                  Fine-tune your AI assistant's behavior and capabilities
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-8 rounded-2xl border border-green-200 dark:border-green-700">
                  <h4 className="text-xl font-semibold text-green-700 dark:text-green-300 mb-4 flex items-center gap-2">
                    🌍 Language & Tone
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">AI Language</label>
                      <select 
                        value={aiLanguage}
                        onChange={(e) => setAiLanguage(e.target.value)}
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="en">🇺🇸 English</option>
                        <option value="es">🇪🇸 Español</option>
                        <option value="fr">🇫🇷 Français</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Communication Style</label>
                      <select 
                        value={aiStyle}
                        onChange={(e) => setAiStyle(e.target.value)}
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="professional">👔 Professional</option>
                        <option value="friendly">😊 Friendly</option>
                        <option value="casual">😎 Casual</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="text-center mt-12">
                <button 
                  onClick={() => {
                    localStorage.setItem('aiLanguage', aiLanguage);
                    localStorage.setItem('aiStyle', aiStyle);
                    alert('✅ Configuration saved successfully!');
                  }}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-4 rounded-xl flex items-center gap-3 mx-auto hover:from-blue-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-105 shadow-xl"
                >
                  <FaCog /> Save Configuration
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Auto Reply Modal */}
      {showAutoReplyModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Add Auto Reply</h3>
              <button onClick={() => setShowAutoReplyModal(false)} className="text-gray-500 hover:text-gray-700">
                <FaTimes className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Keyword</label>
                <input
                  type="text"
                  value={newAutoReply.keyword}
                  onChange={(e) => setNewAutoReply({...newAutoReply, keyword: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="e.g., hello, pricing, support"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Response</label>
                <textarea
                  value={newAutoReply.response}
                  onChange={(e) => setNewAutoReply({...newAutoReply, response: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  rows="3"
                  placeholder="Automated response message..."
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="active"
                  checked={newAutoReply.active}
                  onChange={(e) => setNewAutoReply({...newAutoReply, active: e.target.checked})}
                />
                <label htmlFor="active" className="text-sm text-gray-700 dark:text-gray-300">Active</label>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowAutoReplyModal(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={addAutoReply}
                  className="bg-yellow-500 text-white px-6 py-2 rounded-lg hover:bg-yellow-600"
                >
                  Add Reply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Template Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Add Template</h3>
              <button onClick={() => setShowTemplateModal(false)} className="text-gray-500 hover:text-gray-700">
                <FaTimes className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Template Name</label>
                <input
                  type="text"
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate({...newTemplate, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="e.g., Welcome Message"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category</label>
                <select
                  value={newTemplate.category}
                  onChange={(e) => setNewTemplate({...newTemplate, category: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="general">General</option>
                  <option value="support">Support</option>
                  <option value="sales">Sales</option>
                  <option value="followup">Follow-up</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Content</label>
                <textarea
                  value={newTemplate.content}
                  onChange={(e) => setNewTemplate({...newTemplate, content: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  rows="4"
                  placeholder="Template content..."
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowTemplateModal(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={addTemplate}
                  className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600"
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

export default AIAgent;