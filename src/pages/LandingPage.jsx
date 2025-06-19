import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../store/useAuth';
import { FaInbox, FaUserFriends, FaRobot, FaComments, FaArrowRight, FaCheck, FaDatabase, FaCloud, FaSync } from 'react-icons/fa';
import HeroSection from '../components/HeroSection';
import { getPricingPlans, formatPrice } from '../services/pricingService';

const LandingPage = () => {
  const { isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [pricingPlans, setPricingPlans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch pricing plans
  useEffect(() => {
    const fetchPricingPlans = async () => {
      const { success, plans } = await getPricingPlans();
      if (success) {
        // Sort plans by order
        const sortedPlans = [...plans].sort((a, b) => a.order - b.order);
        setPricingPlans(sortedPlans);
      }
      setIsLoading(false);
    };
    
    fetchPricingPlans();
  }, []);

  // Redirect authenticated users to their appropriate dashboard
  const handleGetStarted = () => {
    if (isAuthenticated()) {
      if (isAdmin()) {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 py-6 px-6 md:px-12 bg-slate-900 bg-opacity-80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-white flex items-center gap-2">
            <span className="text-blue-500">Tari</span>Connect
          </Link>
          
          <div className="hidden md:flex items-center gap-8">
            <a href="#how-it-works" className="text-gray-300 hover:text-white transition-colors">How It Works</a>
            <a href="#features" className="text-gray-300 hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="text-gray-300 hover:text-white transition-colors">Pricing</a>
          </div>
          
          <div className="flex items-center gap-4">
            {isAuthenticated() ? (
              <Link 
                to={isAdmin() ? "/admin" : "/dashboard"} 
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full transition-colors"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className="text-gray-300 hover:text-white transition-colors">Login</Link>
                <Link to="/register" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full transition-colors">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <HeroSection onGetStarted={handleGetStarted} />

      {/* Platform Showcase */}
      <section className="py-20 px-6 bg-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">TariConnect Platform Showcase</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-6">
              Powered by a robust dual-database architecture for real-time communication and data persistence
            </p>
            <div className="w-20 h-1 bg-blue-500 mx-auto"></div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="order-2 lg:order-1">
              <h3 className="text-2xl font-bold mb-4 text-blue-400">Advanced Database Architecture</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="bg-blue-600 p-2 rounded-full mt-1">
                    <FaDatabase className="text-sm" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg">Firestore Database</h4>
                    <p className="text-gray-300">Secure document storage for structured data with powerful querying capabilities</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="bg-green-600 p-2 rounded-full mt-1">
                    <FaSync className="text-sm" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg">Realtime Database</h4>
                    <p className="text-gray-300">Instant messaging and real-time updates for seamless communication</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="bg-purple-600 p-2 rounded-full mt-1">
                    <FaCloud className="text-sm" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg">Hybrid Synchronization</h4>
                    <p className="text-gray-300">Automatic data syncing between databases for reliability and performance</p>
                  </div>
                </li>
              </ul>
            </div>
            
            <div className="order-1 lg:order-2">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur-sm"></div>
                <div className="relative bg-slate-900 rounded-2xl p-4 border border-slate-700">
                  <div className="bg-slate-800 rounded-xl p-3">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <div className="text-xs text-gray-400 ml-2">TariConnect Database Architecture</div>
                    </div>
                    <div className="bg-slate-900 rounded-lg p-4 overflow-hidden">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-blue-900 bg-opacity-30 p-4 rounded-lg border border-blue-700">
                          <h5 className="text-blue-400 font-mono text-sm mb-2">Firestore Collections</h5>
                          <ul className="text-xs text-blue-200 font-mono space-y-1">
                            <li>- users</li>
                            <li>- conversations</li>
                            <li>- messages</li>
                            <li>- tasks</li>
                            <li>- leads</li>
                            <li>- quotes</li>
                            <li>- invoices</li>
                          </ul>
                        </div>
                        <div className="bg-green-900 bg-opacity-30 p-4 rounded-lg border border-green-700">
                          <h5 className="text-green-400 font-mono text-sm mb-2">Realtime Database</h5>
                          <ul className="text-xs text-green-200 font-mono space-y-1">
                            <li>- presence/</li>
                            <li>- typing/</li>
                            <li>- messages/</li>
                            <li>- notifications/</li>
                            <li>- status/</li>
                          </ul>
                        </div>
                      </div>
                      <div className="mt-4 bg-purple-900 bg-opacity-20 p-3 rounded-lg border border-purple-700">
                        <h5 className="text-purple-400 font-mono text-sm mb-1">Sync Service</h5>
                        <div className="text-xs text-gray-300 font-mono">
                          <div className="animate-pulse">
                            Syncing data between databases... <span className="text-green-400">✓</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How TariConnect Works</h2>
            <div className="w-20 h-1 bg-blue-500 mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-800 p-6 rounded-xl">
              <div className="bg-blue-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4 text-2xl font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold mb-3">Connect Your Channels</h3>
              <p className="text-gray-300">
                Easily link all your social media accounts, SMS numbers, and other communication platforms in minutes.
              </p>
            </div>

            <div className="bg-slate-800 p-6 rounded-xl">
              <div className="bg-blue-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4 text-2xl font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold mb-3">Manage & Engage</h3>
              <p className="text-gray-300">
                View and respond to all customer interactions from a unified dashboard. Never miss a message again.
              </p>
            </div>

            <div className="bg-slate-800 p-6 rounded-xl">
              <div className="bg-blue-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4 text-2xl font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold mb-3">Grow & Optimize</h3>
              <p className="text-gray-300">
                Utilize AI insights, track lead progress, and optimize your customer communication for better results.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-slate-800 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Core Features to Elevate Your Business</h2>
            <div className="w-20 h-1 bg-blue-500 mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-slate-700 bg-opacity-50 p-6 rounded-xl">
              <div className="flex items-start gap-4">
                <div className="bg-blue-600 p-3 rounded-lg">
                  <FaInbox className="text-2xl" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Unified Inbox</h3>
                  <p className="text-gray-300">
                    Manage all customer conversations from social media, SMS, and more in one single, streamlined inbox.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-slate-700 bg-opacity-50 p-6 rounded-xl">
              <div className="flex items-start gap-4">
                <div className="bg-green-600 p-3 rounded-lg">
                  <FaUserFriends className="text-2xl" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Lead Management</h3>
                  <p className="text-gray-300">
                    Capture, track, and nurture leads effectively with our integrated CRM tools designed for growth.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-slate-700 bg-opacity-50 p-6 rounded-xl">
              <div className="flex items-start gap-4">
                <div className="bg-purple-600 p-3 rounded-lg">
                  <FaRobot className="text-2xl" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">AI-Powered Assistance</h3>
                  <p className="text-gray-300">
                    Leverage AI for smart replies, conversation prioritization, and automated tasks to boost team efficiency.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-slate-700 bg-opacity-50 p-6 rounded-xl">
              <div className="flex items-start gap-4">
                <div className="bg-orange-600 p-3 rounded-lg">
                  <FaComments className="text-2xl" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Team Collaboration</h3>
                  <p className="text-gray-300">
                    Assign conversations, share notes, and work together seamlessly to provide exceptional customer support.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Choose the plan that's right for your business
            </p>
            <div className="w-20 h-1 bg-blue-500 mx-auto mt-4"></div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {pricingPlans.map(plan => (
                <div 
                  key={plan.id} 
                  className={`${
                    plan.isPopular 
                      ? 'bg-gradient-to-b from-blue-600 to-purple-700 transform scale-105 shadow-xl' 
                      : 'bg-slate-800'
                  } rounded-xl overflow-hidden`}
                >
                  <div className={`p-6 border-b ${plan.isPopular ? 'border-blue-500' : 'border-slate-700'}`}>
                    <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                    <div className="flex items-end gap-1 mb-4">
                      <span className="text-4xl font-bold">{formatPrice(plan.price, plan.currency)}</span>
                      <span className={`${plan.isPopular ? 'text-blue-200' : 'text-gray-400'}`}>/{plan.billingPeriod}</span>
                    </div>
                    <p className={`${plan.isPopular ? 'text-blue-100' : 'text-gray-300'}`}>{plan.description}</p>
                  </div>
                  <div className="p-6">
                    <ul className="space-y-3">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <FaCheck className={`${plan.isPopular ? 'text-green-300' : 'text-green-500'} flex-shrink-0`} />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <button
                      onClick={handleGetStarted}
                      className={`w-full mt-6 ${
                        plan.isPopular 
                          ? 'bg-white text-blue-600 hover:bg-blue-50' 
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      } py-2 rounded-lg transition-colors`}
                    >
                      {plan.id === 'enterprise' ? 'Contact Sales' : 'Get Started'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to transform your customer communications?</h2>
          <p className="text-xl mb-8 text-white opacity-90">
            Join hundreds of businesses already using TariConnect to streamline their operations
          </p>
          <button 
            onClick={handleGetStarted}
            className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 inline-block"
          >
            Get Started Today
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <Link to="/" className="text-2xl font-bold">
                <span className="text-blue-500">Tari</span>Connect
              </Link>
              <p className="text-gray-400 mt-2">Streamline your customer communications</p>
            </div>
            
            <div className="flex flex-wrap gap-8 justify-center">
              <div>
                <h3 className="font-semibold mb-3">Product</h3>
                <ul className="space-y-2 text-gray-400">
                  <li><a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a></li>
                  <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                  <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-3">Company</h3>
                <ul className="space-y-2 text-gray-400">
                  <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-3">Support</h3>
                <ul className="space-y-2 text-gray-400">
                  <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-500">
            <p>&copy; {new Date().getFullYear()} TariConnect. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;