import React, { useState } from 'react';
import { FaQuestionCircle, FaSearch, FaEnvelope, FaPhone, FaComments, FaBook } from 'react-icons/fa';

const Support = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('faq');
  
  const tabs = [
    { id: 'faq', name: 'FAQs', icon: <FaQuestionCircle /> },
    { id: 'contact', name: 'Contact Us', icon: <FaEnvelope /> },
    { id: 'docs', name: 'Documentation', icon: <FaBook /> }
  ];

  const faqs = [
    {
      question: 'How do I connect my social media accounts?',
      answer: 'You can connect your social media accounts by going to Settings > Integrations and clicking on the "Connect" button next to the platform you want to integrate with. Follow the authentication steps to complete the connection.'
    },
    {
      question: 'How do I create a new invoice?',
      answer: 'To create a new invoice, navigate to the Invoices section and click on the "Create Invoice" button in the top right corner. Fill in the customer details, add line items, set the due date, and click "Save" to generate the invoice.'
    },
    {
      question: 'Can I customize the appearance of my quotes and invoices?',
      answer: 'Yes, you can customize the appearance of your quotes and invoices by going to Settings > Company Profile. Upload your company logo, set your company details, and choose a color scheme that matches your brand.'
    },
    {
      question: 'How do I add team members to my account?',
      answer: 'To add team members, go to Settings > User Management and click on the "Invite User" button. Enter their email address, select their role (Admin or Agent), and they will receive an invitation to join your team.'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept credit cards (Visa, Mastercard, American Express), PayPal, and bank transfers. You can manage your payment methods in Settings > Billing.'
    },
    {
      question: 'How do I set up automated responses?',
      answer: 'To set up automated responses, go to the AI Agent section and click on the "Create Auto Reply" button. Define the trigger conditions (keywords, time of day, etc.) and the response message that should be sent.'
    }
  ];

  const filteredFaqs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Support Center</h1>
        <p className="text-gray-600">Find answers to common questions or contact our support team</p>
      </div>
      
      {/* Search */}
      <div className="mb-6 relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <FaSearch className="text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search for help..."
          className="pl-10 pr-4 py-3 border border-gray-300 rounded-md w-full focus:ring-blue-500 focus:border-blue-500 text-lg"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      {/* Tabs */}
      <div className="mb-6 border-b">
        <div className="flex space-x-4">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`py-2 px-4 border-b-2 flex items-center gap-2 ${
                activeTab === tab.id 
                  ? 'border-blue-600 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.icon} {tab.name}
            </button>
          ))}
        </div>
      </div>
      
      {/* Content */}
      <div className="bg-white rounded-lg shadow">
        {activeTab === 'faq' && (
          <div className="divide-y">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-2">Frequently Asked Questions</h2>
              <p className="text-gray-600">Find answers to the most common questions</p>
            </div>
            
            {searchTerm && filteredFaqs.length === 0 ? (
              <div className="p-6 text-center">
                <FaQuestionCircle className="mx-auto text-4xl text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900">No results found</h3>
                <p className="mt-1 text-gray-500">
                  Try adjusting your search term or contact our support team for assistance
                </p>
              </div>
            ) : (
              filteredFaqs.map((faq, index) => (
                <div key={index} className="p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">{faq.question}</h3>
                  <p className="text-gray-600">{faq.answer}</p>
                </div>
              ))
            )}
          </div>
        )}
        
        {activeTab === 'contact' && (
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Contact Our Support Team</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-blue-50 p-6 rounded-lg text-center">
                <FaEnvelope className="mx-auto text-3xl text-blue-600 mb-3" />
                <h3 className="font-medium mb-2">Email Support</h3>
                <p className="text-gray-600 mb-3">Get a response within 24 hours</p>
                <a href="mailto:support@tariconnect.com" className="text-blue-600 font-medium">support@tariconnect.com</a>
              </div>
              
              <div className="bg-green-50 p-6 rounded-lg text-center">
                <FaPhone className="mx-auto text-3xl text-green-600 mb-3" />
                <h3 className="font-medium mb-2">Phone Support</h3>
                <p className="text-gray-600 mb-3">Available Mon-Fri, 9am-5pm</p>
                <a href="tel:+254123456789" className="text-green-600 font-medium">+254 123 456 789</a>
              </div>
              
              <div className="bg-purple-50 p-6 rounded-lg text-center">
                <FaComments className="mx-auto text-3xl text-purple-600 mb-3" />
                <h3 className="font-medium mb-2">Live Chat</h3>
                <p className="text-gray-600 mb-3">Chat with our support team</p>
                <button className="text-purple-600 font-medium">Start Chat</button>
              </div>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="font-medium mb-4">Send us a message</h3>
              <form>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Your email"
                    />
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="How can we help you?"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                  <textarea
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    rows="4"
                    placeholder="Please describe your issue in detail"
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Send Message
                </button>
              </form>
            </div>
          </div>
        )}
        
        {activeTab === 'docs' && (
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Documentation</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border rounded-lg p-6">
                <h3 className="font-medium text-lg mb-3">Getting Started Guide</h3>
                <p className="text-gray-600 mb-4">Learn the basics of TariConnect and set up your account</p>
                <a href="#" className="text-blue-600 font-medium hover:underline">Read Guide →</a>
              </div>
              
              <div className="border rounded-lg p-6">
                <h3 className="font-medium text-lg mb-3">API Documentation</h3>
                <p className="text-gray-600 mb-4">Integrate TariConnect with your existing systems</p>
                <a href="#" className="text-blue-600 font-medium hover:underline">View API Docs →</a>
              </div>
              
              <div className="border rounded-lg p-6">
                <h3 className="font-medium text-lg mb-3">Video Tutorials</h3>
                <p className="text-gray-600 mb-4">Watch step-by-step tutorials on using TariConnect</p>
                <a href="#" className="text-blue-600 font-medium hover:underline">Watch Videos →</a>
              </div>
              
              <div className="border rounded-lg p-6">
                <h3 className="font-medium text-lg mb-3">Feature Guides</h3>
                <p className="text-gray-600 mb-4">Detailed guides for each TariConnect feature</p>
                <a href="#" className="text-blue-600 font-medium hover:underline">Browse Guides →</a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Support;