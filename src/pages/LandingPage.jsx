import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../store/useAuth';
import { useTheme } from '../store/useTheme';
import ThemeToggle from '../components/ThemeToggle';
import { 
  FaInbox, 
  FaUserFriends, 
  FaRobot, 
  FaComments, 
  FaArrowRight, 
  FaCheck, 
  FaDatabase, 
  FaCloud, 
  FaSync,
  FaChartLine,
  FaFileInvoiceDollar,
  FaBoxOpen,
  FaStar,
  FaQuoteLeft,
  FaPlay
} from 'react-icons/fa';
import { getPricingPlans, formatPrice } from '../services/pricingService';

const LandingPage = () => {
  const { isAuthenticated, isAdmin } = useAuth();
  const { initTheme } = useTheme();
  const navigate = useNavigate();
  const [pricingPlans, setPricingPlans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize theme on mount
  useEffect(() => {
    initTheme();
  }, [initTheme]);

  // Fetch pricing plans
  useEffect(() => {
    const fetchPricingPlans = async () => {
      const { success, plans } = await getPricingPlans();
      if (success) {
        const sortedPlans = [...plans].sort((a, b) => a.order - b.order);
        setPricingPlans(sortedPlans);
      }
      setIsLoading(false);
    };
    
    fetchPricingPlans();
  }, []);

  const handleGetStarted = () => {
    if (isAuthenticated()) {
      navigate(isAdmin() ? '/admin' : '/dashboard');
    } else {
      navigate('/register');
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <Link to="/" className="text-2xl font-bold flex items-center gap-2">
              <span className="text-primary">Tari</span>Connect
            </Link>
            
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-600 dark:text-gray-300 hover:text-primary transition-colors">Features</a>
              <a href="#pricing" className="text-gray-600 dark:text-gray-300 hover:text-primary transition-colors">Pricing</a>
              <a href="#testimonials" className="text-gray-600 dark:text-gray-300 hover:text-primary transition-colors">Reviews</a>
              <Link to="/free-trial" className="text-primary font-semibold hover:text-primary-dark transition-colors">Free Trial</Link>
            </div>
            
            <div className="flex items-center gap-4">
              <ThemeToggle />
              {isAuthenticated() ? (
                <Link 
                  to={isAdmin() ? "/admin" : "/dashboard"} 
                  className="bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-full transition-colors"
                >
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link to="/login" className="text-gray-600 dark:text-gray-300 hover:text-primary transition-colors">Login</Link>
                  <Link to="/register" className="bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-full transition-colors">
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
                Unify Your Business
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
                Streamline leads, quotes, invoices, and customer communications in one powerful platform. 
                Built for modern businesses that want to grow faster.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={handleGetStarted}
                  className="bg-primary hover:bg-primary-dark text-white px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                >
                  Start Free Trial <FaArrowRight />
                </button>
                <button className="border-2 border-gray-300 dark:border-gray-600 hover:border-primary dark:hover:border-primary text-gray-700 dark:text-gray-300 hover:text-primary px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 flex items-center justify-center gap-2">
                  <FaPlay /> Watch Demo
                </button>
              </div>
            </motion.div>
          </div>

          {/* Hero Image/Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative max-w-5xl mx-auto"
          >
            <div className="bg-gradient-to-r from-primary/20 to-primary-dark/20 rounded-3xl p-8 backdrop-blur-sm border border-gray-200 dark:border-gray-700">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden">
                <div className="bg-gray-100 dark:bg-gray-700 px-6 py-4 flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <div className="ml-4 text-sm text-gray-600 dark:text-gray-400">TariConnect Dashboard</div>
                </div>
                <div className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">247</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Total Leads</div>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">KSh 2.4M</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Revenue</div>
                    </div>
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">89</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Active Quotes</div>
                    </div>
                    <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">156</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Invoices</div>
                    </div>
                  </div>
                  <div className="h-32 bg-gradient-to-r from-primary/10 to-primary-dark/10 rounded-lg flex items-center justify-center">
                    <FaChartLine className="text-4xl text-primary opacity-50" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Everything You Need to Grow</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Powerful features designed to streamline your business operations and boost productivity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="bg-blue-100 dark:bg-blue-900 p-4 rounded-xl w-fit mb-6">
                <FaUserFriends className="text-2xl text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Lead Management</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Capture, track, and nurture leads with our intelligent CRM system. Convert more prospects into customers.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="bg-green-100 dark:bg-green-900 p-4 rounded-xl w-fit mb-6">
                <FaFileInvoiceDollar className="text-2xl text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Smart Invoicing</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Create professional invoices, track payments, and manage your cash flow with automated reminders.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="bg-purple-100 dark:bg-purple-900 p-4 rounded-xl w-fit mb-6">
                <FaRobot className="text-2xl text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold mb-4">AI Assistant</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Let AI handle routine tasks, generate content, and provide insights to help you make better decisions.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="bg-yellow-100 dark:bg-yellow-900 p-4 rounded-xl w-fit mb-6">
                <FaComments className="text-2xl text-yellow-600 dark:text-yellow-400" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Unified Communications</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Manage all customer conversations from multiple channels in one centralized inbox.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="bg-red-100 dark:bg-red-900 p-4 rounded-xl w-fit mb-6">
                <FaChartLine className="text-2xl text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Analytics & Reports</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Get detailed insights into your business performance with comprehensive analytics and reporting.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="bg-indigo-100 dark:bg-indigo-900 p-4 rounded-xl w-fit mb-6">
                <FaBoxOpen className="text-2xl text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Product Catalog</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Organize your products and services with detailed catalogs, pricing, and inventory management.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Loved by Businesses Worldwide</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              See what our customers have to say about TariConnect
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg"
            >
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <FaStar key={i} className="text-yellow-400" />
                ))}
              </div>
              <FaQuoteLeft className="text-primary text-2xl mb-4" />
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                "TariConnect transformed our business operations. We've increased our conversion rate by 40% and saved 10 hours per week on administrative tasks."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                  JD
                </div>
                <div className="ml-4">
                  <div className="font-semibold">John Doe</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">CEO, Tech Solutions</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg"
            >
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <FaStar key={i} className="text-yellow-400" />
                ))}
              </div>
              <FaQuoteLeft className="text-primary text-2xl mb-4" />
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                "The unified communication feature is a game-changer. We never miss a customer inquiry and our response time has improved dramatically."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                  SM
                </div>
                <div className="ml-4">
                  <div className="font-semibold">Sarah Miller</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Marketing Director</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg"
            >
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <FaStar key={i} className="text-yellow-400" />
                ))}
              </div>
              <FaQuoteLeft className="text-primary text-2xl mb-4" />
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                "Simple, powerful, and affordable. TariConnect has everything we need to manage our growing business efficiently."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                  MJ
                </div>
                <div className="ml-4">
                  <div className="font-semibold">Mike Johnson</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Small Business Owner</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-6 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Choose the plan that fits your business needs
            </p>
          </div>

          {isLoading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {pricingPlans.map(plan => (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className={`${
                    plan.isPopular 
                      ? 'bg-gradient-to-b from-primary to-primary-dark text-white transform scale-105 shadow-2xl' 
                      : 'bg-white dark:bg-gray-900 shadow-lg'
                  } rounded-2xl overflow-hidden relative`}
                >
                  {plan.isPopular && (
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      <div className="bg-yellow-400 text-yellow-900 px-4 py-1 rounded-full text-sm font-semibold">
                        Most Popular
                      </div>
                    </div>
                  )}
                  
                  <div className="p-8">
                    <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                    <div className="mb-6">
                      <span className="text-5xl font-bold">{formatPrice(plan.price, plan.currency)}</span>
                      <span className={`text-lg ${plan.isPopular ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'}`}>
                        /{plan.billingPeriod}
                      </span>
                    </div>
                    <p className={`mb-8 ${plan.isPopular ? 'text-white/90' : 'text-gray-600 dark:text-gray-300'}`}>
                      {plan.description}
                    </p>
                    
                    <ul className="space-y-4 mb-8">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center">
                          <FaCheck className={`mr-3 ${plan.isPopular ? 'text-white' : 'text-primary'}`} />
                          <span className={plan.isPopular ? 'text-white' : 'text-gray-700 dark:text-gray-300'}>
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                    
                    <button
                      onClick={handleGetStarted}
                      className={`w-full py-4 rounded-xl font-semibold transition-all ${
                        plan.isPopular 
                          ? 'bg-white text-primary hover:bg-gray-100' 
                          : 'bg-primary text-white hover:bg-primary-dark'
                      }`}
                    >
                      {plan.id === 'enterprise' ? 'Contact Sales' : 'Start Free Trial'}
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-primary to-primary-dark">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Transform Your Business?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of businesses already using TariConnect to streamline their operations and boost growth.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={handleGetStarted}
              className="bg-white text-primary hover:bg-gray-100 px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300"
            >
              Start Your Free Trial
            </button>
            <Link 
              to="/free-trial"
              className="border-2 border-white text-white hover:bg-white hover:text-primary px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-black text-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="text-2xl font-bold mb-4">
                <span className="text-primary">Tari</span>Connect
              </div>
              <p className="text-gray-400 mb-4">
                Streamline your business operations with our all-in-one platform.
              </p>
              <div className="flex space-x-4">
                <ThemeToggle className="text-gray-400 hover:text-white" />
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><Link to="/free-trial" className="hover:text-white transition-colors">Free Trial</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} TariConnect. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;