import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../store/useAuth';
import { useTheme } from '../store/useTheme';
import ThemeToggle from '../components/ThemeToggle';
import ContactModal from '../components/ContactModal';
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
import { getPricingPlansWithCurrency, formatPrice } from '../services/pricingService';

const LandingPage = () => {
  const { isAuthenticated, isAdmin } = useAuth();
  const { initTheme } = useTheme();
  const navigate = useNavigate();
  const [pricingPlans, setPricingPlans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showContactModal, setShowContactModal] = useState(false);
  const [currency, setCurrency] = useState('KSh');

  // Initialize theme on mount
  useEffect(() => {
    initTheme();
  }, [initTheme]);

  // Fetch pricing plans
  useEffect(() => {
    const fetchPricingPlans = async () => {
      const { success, plans } = await getPricingPlansWithCurrency(currency);
      if (success) {
        const sortedPlans = [...plans].sort((a, b) => a.order - b.order);
        setPricingPlans(sortedPlans);
      }
      setIsLoading(false);
    };
    
    fetchPricingPlans();
  }, [currency]);

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
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 shadow-lg border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex justify-between items-center">
            <Link to="/" className="text-2xl font-bold flex items-center gap-2">
              <span className="text-primary">Tari</span><span className="text-gray-900 dark:text-white">Connect</span>
            </Link>
            
            <div className="hidden md:flex items-center gap-6">
              <a href="#features" className="text-gray-700 dark:text-gray-300 hover:text-primary transition-colors font-medium">Features</a>
              <a href="#pricing" className="text-gray-700 dark:text-gray-300 hover:text-primary transition-colors font-medium">Pricing</a>
              <a href="#testimonials" className="text-gray-700 dark:text-gray-300 hover:text-primary transition-colors font-medium">Reviews</a>
              <button onClick={() => setShowContactModal(true)} className="text-gray-700 dark:text-gray-300 hover:text-primary transition-colors font-medium">Contact</button>
              <Link to="/free-trial" className="text-primary font-semibold hover:text-primary-dark transition-colors">Free Trial</Link>
            </div>
            
            <div className="flex items-center gap-3">
              <ThemeToggle />
              {isAuthenticated() ? (
                <Link 
                  to={isAdmin() ? "/admin" : "/dashboard"} 
                  className="bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-full transition-colors font-medium shadow-md"
                >
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link to="/login" className="text-gray-700 dark:text-gray-300 hover:text-primary transition-colors font-medium">Login</Link>
                  <Link to="/register" className="bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-full transition-colors font-medium shadow-md">
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-20 px-4 sm:px-6 bg-gradient-to-br from-white via-gray-50 to-primary/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-6 text-gray-900 dark:text-white leading-tight">
                Unify Your <span className="bg-gradient-to-r from-primary via-primary-light to-accent bg-clip-text text-transparent">Business</span>
              </h1>
              <p className="text-lg sm:text-xl md:text-2xl text-gray-700 dark:text-gray-300 mb-8 max-w-4xl mx-auto leading-relaxed">
                Streamline leads, quotes, invoices, and customer communications in one powerful platform. 
                Built for modern businesses that want to grow faster.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button
                  onClick={handleGetStarted}
                  className="w-full sm:w-auto bg-primary hover:bg-primary-dark text-white px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Start Free Trial <FaArrowRight className="text-sm" />
                </button>
                <button className="w-full sm:w-auto border-2 border-primary hover:border-primary-dark hover:bg-primary/10 text-gray-800 dark:text-gray-200 hover:text-primary-dark px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-md">
                  <FaPlay className="text-sm" /> Watch Demo
                </button>
              </div>
            </motion.div>
          </div>

          {/* Hero Image/Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative max-w-6xl mx-auto"
          >
            <div className="bg-gradient-to-r from-primary/5 via-primary-light/5 to-accent/5 dark:from-primary/10 dark:via-primary-light/10 dark:to-accent/10 rounded-3xl p-4 sm:p-8 backdrop-blur-sm border border-primary/10 dark:border-primary/20 shadow-xl">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
                <div className="bg-gray-50 dark:bg-gray-700 px-4 sm:px-6 py-3 sm:py-4 flex items-center gap-2 border-b border-gray-200 dark:border-gray-600">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <div className="ml-4 text-sm font-medium text-gray-700 dark:text-gray-300">TariConnect Dashboard</div>
                </div>
                <img src="/dashboard-preview.svg" alt="TariConnect Dashboard Preview" className="w-full h-auto" />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 sm:py-20 px-4 sm:px-6 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-900 dark:text-white">Everything You Need to Grow</h2>
            <p className="text-lg sm:text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Powerful features designed to streamline your business operations and boost productivity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-primary/20"
            >
              <div className="bg-primary/10 p-4 rounded-xl w-fit mb-6">
                <FaUserFriends className="text-2xl text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900">Lead Management</h3>
              <p className="text-gray-700 leading-relaxed">
                Capture, track, and nurture leads with our intelligent CRM system. Convert more prospects into customers.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-accent/20"
            >
              <div className="bg-accent/10 p-4 rounded-xl w-fit mb-6">
                <FaFileInvoiceDollar className="text-2xl text-accent" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900">Smart Invoicing</h3>
              <p className="text-gray-700 leading-relaxed">
                Create professional invoices, track payments, and manage your cash flow with automated reminders.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-primary-light/20"
            >
              <div className="bg-primary-light/10 p-4 rounded-xl w-fit mb-6">
                <FaRobot className="text-2xl text-primary-light" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900">AI Assistant</h3>
              <p className="text-gray-700 leading-relaxed">
                Let AI handle routine tasks, generate content, and provide insights to help you make better decisions.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-primary-dark/20"
            >
              <div className="bg-primary-dark/10 p-4 rounded-xl w-fit mb-6">
                <FaComments className="text-2xl text-primary-dark" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900">Unified Communications</h3>
              <p className="text-gray-700 leading-relaxed">
                Manage all customer conversations from multiple channels in one centralized inbox.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-accent/20"
            >
              <div className="bg-accent/10 p-4 rounded-xl w-fit mb-6">
                <FaChartLine className="text-2xl text-accent" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900">Analytics & Reports</h3>
              <p className="text-gray-700 leading-relaxed">
                Get detailed insights into your business performance with comprehensive analytics and reporting.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-primary/20"
            >
              <div className="bg-primary/10 p-4 rounded-xl w-fit mb-6">
                <FaBoxOpen className="text-2xl text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900">Product Catalog</h3>
              <p className="text-gray-700 leading-relaxed">
                Organize your products and services with detailed catalogs, pricing, and inventory management.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-16 sm:py-20 px-4 sm:px-6 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-900 dark:text-white">Loved by Businesses Worldwide</h2>
            <p className="text-lg sm:text-xl text-gray-700">
              See what our customers have to say about TariConnect
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300"
            >
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <FaStar key={i} className="text-yellow-400" />
                ))}
              </div>
              <FaQuoteLeft className="text-primary text-2xl mb-4" />
              <p className="text-gray-700 mb-6 leading-relaxed">
                "TariConnect transformed our business operations. We've increased our conversion rate by 40% and saved 10 hours per week on administrative tasks."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                  JD
                </div>
                <div className="ml-4">
                  <div className="font-semibold text-gray-900">John Doe</div>
                  <div className="text-sm text-gray-600">Tech Solutions</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300"
            >
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <FaStar key={i} className="text-yellow-400" />
                ))}
              </div>
              <FaQuoteLeft className="text-primary text-2xl mb-4" />
              <p className="text-gray-700 mb-6 leading-relaxed">
                "The unified communication feature is a game-changer. We never miss a customer inquiry and our response time has improved dramatically."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                  SM
                </div>
                <div className="ml-4">
                  <div className="font-semibold text-gray-900">Sarah Miller</div>
                  <div className="text-sm text-gray-600">Director</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300"
            >
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <FaStar key={i} className="text-yellow-400" />
                ))}
              </div>
              <FaQuoteLeft className="text-primary text-2xl mb-4" />
              <p className="text-gray-700 mb-6 leading-relaxed">
                "Simple, powerful, and affordable. TariConnect has everything we need to manage our growing business efficiently."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                  MJ
                </div>
                <div className="ml-4">
                  <div className="font-semibold text-gray-900">Mike Johnson</div>
                  <div className="text-sm text-gray-600">Business Owner</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-16 sm:py-20 px-4 sm:px-6 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-900 dark:text-white">Simple, Transparent Pricing</h2>
            <p className="text-lg sm:text-xl text-gray-700 mb-6">
              Choose the plan that fits your business needs
            </p>
            <div className="flex justify-center gap-2">
              <button
                onClick={() => setCurrency('KSh')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  currency === 'KSh' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                KSh (Kenyan Shilling)
              </button>
              <button
                onClick={() => setCurrency('USD')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  currency === 'USD' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                USD (US Dollar)
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              {pricingPlans.map(plan => (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className={`${
                    plan.isPopular 
                      ? 'bg-primary text-white transform scale-105 shadow-2xl border-2 border-primary-light' 
                      : 'bg-white shadow-lg border border-gray-200 hover:border-primary/30 hover:shadow-xl'
                  } rounded-2xl overflow-hidden relative transition-all duration-300`}
                >
                  {plan.isPopular && (
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      <div className="bg-yellow-400 text-yellow-900 px-4 py-1 rounded-full text-sm font-semibold">
                        Most Popular
                      </div>
                    </div>
                  )}
                  
                  <div className="p-6 sm:p-8">
                    <h3 className={`text-2xl font-bold mb-2 ${plan.isPopular ? 'text-white' : 'text-gray-900'}`}>{plan.name}</h3>
                    <div className="mb-6">
                      <span className="text-5xl font-bold">{formatPrice(plan.price, plan.currency)}</span>
                      <span className={`text-lg ${plan.isPopular ? 'text-white/80' : 'text-gray-500'}`}>
                        /{plan.billingPeriod}
                      </span>
                    </div>
                    <p className={`mb-8 leading-relaxed ${plan.isPopular ? 'text-white/90' : 'text-gray-700'}`}>
                      {plan.description}
                    </p>
                    
                    <ul className="space-y-4 mb-8">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center">
                          <FaCheck className={`mr-3 ${plan.isPopular ? 'text-white' : 'text-primary'}`} />
                          <span className={`${plan.isPopular ? 'text-white' : 'text-gray-800'} leading-relaxed`}>
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                    
                    <button
                      onClick={handleGetStarted}
                      className={`w-full py-4 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg ${
                        plan.isPopular 
                          ? 'bg-white text-primary hover:bg-gray-50 border border-white/20' 
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
      <section className="py-16 sm:py-20 px-4 sm:px-6 bg-gradient-to-r from-primary via-primary-light to-accent">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 leading-tight">
            Ready to Transform Your Business?
          </h2>
          <p className="text-lg sm:text-xl mb-8 opacity-90 leading-relaxed">
            Join thousands of businesses already using TariConnect to streamline their operations and boost growth.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button 
              onClick={handleGetStarted}
              className="w-full sm:w-auto bg-white text-primary hover:bg-gray-50 px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl border border-white/20"
            >
              Start Your Free Trial
            </button>
            <Link 
              to="/free-trial"
              className="w-full sm:w-auto border-2 border-white text-white hover:bg-white hover:text-primary px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 text-center"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            <div className="sm:col-span-2 md:col-span-1">
              <div className="text-2xl font-bold mb-4">
                <span className="text-primary">Tari</span>Connect
              </div>
              <p className="text-gray-300 mb-4 leading-relaxed">
                Streamline your business operations with our all-in-one platform.
              </p>
              <div className="flex space-x-4">
                <ThemeToggle className="text-gray-400 hover:text-white" />
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4 text-white">Product</h3>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#features" className="hover:text-primary transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-primary transition-colors">Pricing</a></li>
                <li><Link to="/free-trial" className="hover:text-primary transition-colors">Free Trial</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4 text-white">Company</h3>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#" className="hover:text-primary transition-colors">About</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Careers</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4 text-white">Support</h3>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#" className="hover:text-primary transition-colors">Help Center</a></li>
                <li><button onClick={() => setShowContactModal(true)} className="hover:text-primary transition-colors text-left">Contact</button></li>
                <li><a href="#" className="hover:text-primary transition-colors">Privacy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-300">
            <p>&copy; {new Date().getFullYear()} TariConnect. All rights reserved.</p>
          </div>
        </div>
      </footer>
      
      <ContactModal isOpen={showContactModal} onClose={() => setShowContactModal(false)} />
    </div>
  );
};

export default LandingPage;