import React, { useState } from 'react';
import { FaRobot, FaPlus, FaCog } from 'react-icons/fa';

const AIAgent = () => {
  const [activeTab, setActiveTab] = useState('auto-replies');
  
  const tabs = [
    { id: 'auto-replies', name: 'Auto Replies' },
    { id: 'chatbots', name: 'Chatbots' },
    { id: 'templates', name: 'Response Templates' },
    { id: 'settings', name: 'AI Settings' }
  ];

  return (
    <div className="h-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">AI Agent Tools</h1>
          <p className="text-gray-600">Configure AI-powered features to automate your communications</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-blue-700 transition-colors">
          <FaPlus /> Create Auto Reply
        </button>
      </div>
      
      {/* Tabs */}
      <div className="mb-6 border-b">
        <div className="flex space-x-4">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`py-2 px-4 border-b-2 ${
                activeTab === tab.id 
                  ? 'border-blue-600 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.name}
            </button>
          ))}
        </div>
      </div>
      
      {/* Content */}
      <div className="bg-white rounded-lg shadow p-6">
        {activeTab === 'auto-replies' && (
          <div>
            <div className="text-center py-12">
              <FaRobot className="mx-auto text-6xl text-gray-400 mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">Set up automated responses</h3>
              <p className="text-gray-600 max-w-md mx-auto mb-6">
                Create rules to automatically respond to customer messages based on keywords, time of day, or customer status.
              </p>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2 mx-auto hover:bg-blue-700 transition-colors">
                <FaPlus /> Create Auto Reply
              </button>
            </div>
          </div>
        )}
        
        {activeTab === 'chatbots' && (
          <div>
            <div className="text-center py-12">
              <FaRobot className="mx-auto text-6xl text-gray-400 mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">Configure AI Chatbots</h3>
              <p className="text-gray-600 max-w-md mx-auto mb-6">
                Set up intelligent chatbots to handle common customer inquiries and collect information.
              </p>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2 mx-auto hover:bg-blue-700 transition-colors">
                <FaPlus /> Create Chatbot
              </button>
            </div>
          </div>
        )}
        
        {activeTab === 'templates' && (
          <div>
            <div className="text-center py-12">
              <FaRobot className="mx-auto text-6xl text-gray-400 mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">Response Templates</h3>
              <p className="text-gray-600 max-w-md mx-auto mb-6">
                Create reusable response templates that can be quickly inserted into conversations.
              </p>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2 mx-auto hover:bg-blue-700 transition-colors">
                <FaPlus /> Create Template
              </button>
            </div>
          </div>
        )}
        
        {activeTab === 'settings' && (
          <div>
            <div className="text-center py-12">
              <FaCog className="mx-auto text-6xl text-gray-400 mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">AI Settings</h3>
              <p className="text-gray-600 max-w-md mx-auto mb-6">
                Configure AI behavior, language preferences, and integration settings.
              </p>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2 mx-auto hover:bg-blue-700 transition-colors">
                <FaCog /> Configure Settings
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIAgent;