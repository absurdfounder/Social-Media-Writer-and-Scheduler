"use client"

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Building2, Users, MessageCircle, Brain, Menu, X, Twitter, ScanFace,
  TrendingUp, Search, Bell, ChevronDown, Shapes, Book, Settings2,
  DollarSign, Chrome, Handshake, Heart, Check, Calendar, CheckCircle2, LaughIcon
} from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Modal Component
const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-6 w-6" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

// Billing Modal Component
const BillingModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const plans = [
    {
      name: "Basic Plan",
      description: "Perfect for individuals and small projects",
      price: "$20/mo",
      billedAs: "Billed $240 annually",
      popular: false,
      features: [
        "Basic feature 1",
        "Basic feature 2",
        "Basic feature 3",
        "Basic feature 4",
        "Basic feature 5"
      ]
    },
    {
      name: "Pro Plan",
      description: "Best value for power users",
      price: "$79",
      originalPrice: "$289",
      billedAs: "One-time payment",
      popular: true,
      features: [
        "All Basic features",
        "Pro feature 1",
        "Pro feature 2",
        "Pro feature 3",
        "Pro feature 4"
      ]
    }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-6xl bg-white rounded-lg shadow-xl">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-xl font-bold">Choose Your Plan</h2>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="p-6">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-blue-700">
                Choose Your Perfect Plan
              </h3>
              <p className="text-gray-600 mt-2">Unlock all features with our premium plans</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl m-auto">
              {plans.map((plan) => (
                <div key={plan.name} className={`relative rounded-lg border p-6 ${plan.popular ? 'border-2 border-blue-500' : ''}`}>
                  {plan.popular && (
                    <div className="absolute top-4 right-4 bg-blue-500 text-white px-3 py-1 rounded-full text-sm">
                      Popular
                    </div>
                  )}
                  <div className="mb-4">
                    <h3 className="text-xl font-semibold">{plan.name}</h3>
                    <p className="text-gray-500">{plan.description}</p>
                  </div>
                  <div className="mb-6">
                    <div className="flex items-center gap-2">
                      {plan.originalPrice && (
                        <p className="text-3xl text-gray-400 line-through">{plan.originalPrice}</p>
                      )}
                      <p className="text-3xl font-bold">{plan.price}</p>
                    </div>
                    <p className="text-sm text-gray-500">{plan.billedAs}</p>
                  </div>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2">
                        <Check className="h-5 w-5 text-blue-500" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <button className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${plan.popular
                      ? 'bg-blue-500 hover:bg-blue-600 text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                    }`}>
                    Get Started
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Feedback Modal Component
const FeedbackModal = ({ isOpen, onClose }) => {
  const [selectedTab, setSelectedTab] = useState('feedback');

  const handleScheduleCall = () => {
    window.open('https://calendly.com/your-calendar-link', '_blank');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Share Your Feedback">
      <div className="flex flex-col space-y-6 max-h-[80vh]">
        <div className="flex rounded-lg bg-gray-100 p-1">
          <button
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${selectedTab === 'feedback'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
              }`}
            onClick={() => setSelectedTab('feedback')}
          >
            Share Feedback
          </button>
          <button
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${selectedTab === 'call'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
              }`}
            onClick={() => setSelectedTab('call')}
          >
            Schedule Call
          </button>
        </div>

        {selectedTab === 'feedback' ? (
          <div className="h-[500px] overflow-hidden rounded-lg border border-gray-200">
            <iframe
              src="https://forms.your-feedback-form.com"
              width="100%"
              height="100%"
              frameBorder="0"
              marginHeight="0"
              marginWidth="0"
              title="Feedback Form"
            />
          </div>
        ) : (
          <div className="space-y-6 p-4">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100">
                <Calendar className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Schedule a 1-on-1 Call</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Book a personal call to discuss features, provide feedback, or get help with your workflow.
                </p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-900">What to expect:</h4>
              <ul className="mt-2 space-y-2">
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-600">30-minute personalized discussion</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-600">Direct access to me.</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-600">Opportunity to influence our roadmap</span>
                </li>
              </ul>
            </div>
            <button
              onClick={handleScheduleCall}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg transition-colors"
            >
              Schedule Your Call
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
};

// Import your components
import Reddit_hub from './dashboard_pages/Reddit_hub';
import KnowledgeWall from './dashboard_pages/KnowledgeWall';
import BrandTraning from './dashboard_pages/BrandTraning';
import MemeEditor from './dashboard_pages/MemeEditor';
import LedgerCheck from './dashboard_pages/LedgerCheck';
import AgingReport from './dashboard_pages/AgingReport';
import CollectionThisWeek from './dashboard_pages/CollectionThisWeek';
import ThreadWriter from './dashboard_pages/ThreadReply';
import VideoScriptConstructor from './dashboard_pages/VideoConstruct';
import OnBoardingPopup from './Components/OnBoardingPopup';
import UserProfileSection from './Components/UserProfileSection';
import ApiKeyManager from './Components/ApiKeyManager';

// Component for subscription banner
const SubscriptionBanner = ({ onUpgrade }) => {
  const [trialStatus, setTrialStatus] = useState(null);

  useEffect(() => {
    const checkTrialStatus = () => {
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      const subscription = userData.subscription;

      if (subscription?.isTrialing) {
        const trialEndDate = new Date(subscription.trialEndDate);
        const now = new Date();

        if (now > trialEndDate) {
          setTrialStatus(null);
          return;
        }

        setTrialStatus({
          status: 'trialing',
          daysLeft: Math.ceil((trialEndDate - now) / (1000 * 60 * 60 * 24))
        });
      }
    };

    checkTrialStatus();
    const interval = setInterval(checkTrialStatus, 60000);
    return () => clearInterval(interval);
  }, []);

  // Return null if there's no trial or if status isn't 'trialing'
  if (!trialStatus || trialStatus.status !== 'trialing') {
    return null;
  }

  return (
    <div className="text-sm text-blue-800 rounded-md border border-blue-300 p-2 flex justify-between bg-blue-50 text-center items-center max-w-7xl m-auto">
      <p>Trial period: <b>{trialStatus.daysLeft}</b> days remaining</p>
      <button
        onClick={onUpgrade}
        className="ml-2 hover:text-blue-900 transition-colors font-bold bg-blue-200 p-2 rounded-md"
      >
        Upgrade now
      </button>
    </div>
  );
};

// Navigation item components
const NavItem = ({ icon: Icon, label, active, onClick }) => (
  <button
    className={`flex items-center w-full px-4 py-2 rounded-lg transition-colors duration-200 
      ${active ? 'bg-blue-100 text-blue-500' : 'text-gray-500 hover:bg-gray-100'}`}
    onClick={onClick}
  >
    <Icon className="mr-3 h-5 w-5" />
    <span className="font-medium">{label}</span>
  </button>
);

const MobileNavItem = ({ icon: Icon, label, active, onClick }) => (
  <button
    className={`flex flex-col items-center justify-center p-2 
      ${active ? 'text-blue-500' : 'text-gray-500'}`}
    onClick={onClick}
  >
    <Icon size={20} />
    <span className="text-xs mt-1">{label}</span>
  </button>
);

// Main Dashboard Component
export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [logoSrc, setLogoSrc] = useState('/logo.png');
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isBillingOpen, setIsBillingOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isHowToUseOpen, setIsHowToUseOpen] = useState(false);

  // Navigation items configuration
  const mainNavItems = [
    { icon: Twitter, label: 'Build On X', id: 'dashboard' },
    { icon: TrendingUp, label: 'Go Viral', id: 'videoconstructor' },
    { icon: MessageCircle, label: 'Reddit', id: 'partylist-db' },
    { icon: Brain, label: 'Preach', id: 'ledger-db' },
    { icon: Shapes, label: 'Trained On', id: 'BrandTraning' },
    { icon: LaughIcon, label: 'Meme Editor', id: 'MemeEditor' },
  ];

  const bottomNavItems = [
    { icon: Book, label: 'How to Use', id: 'how-to-use' },
    { icon: Settings2, label: 'Settings', id: 'settings' },
    /* { icon: DollarSign, label: 'Billing', id: 'billing' },
     { icon: Chrome, label: 'Extension', id: 'extension' }, 
     { icon: Handshake, label: 'Affiliate', id: 'affiliate' },
     { icon: Heart, label: 'Feedback', id: 'feedback' }*/
  ];

  useEffect(() => {
    const checkLoginState = async () => {
      try {
        setIsLoading(true);
        const key = localStorage.getItem('apiKey');
        const userData = localStorage.getItem('userData');
        const isValid = key && userData;
        setIsAuthenticated(isValid);
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error('Error checking login state:', error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkLoginState();
    const handleLogin = () => checkLoginState();
    window.addEventListener('userLoggedIn', handleLogin);
    return () => window.removeEventListener('userLoggedIn', handleLogin);
  }, []);

  const handleNavItemClick = (id) => {
    switch (id) {
      case 'settings':
        setIsSettingsOpen(true);
        break;
      case 'billing':
        setIsBillingOpen(true);
        break;
      case 'feedback':
        setIsFeedbackOpen(true);
        break;
      case 'how-to-use':
        setIsHowToUseOpen(true);
        break;
      case 'extension':
        window.open('https://chrome.google.com/webstore/category/extensions', '_blank');
        break;
      case 'affiliate':
        window.open('https://your-affiliate-program-link.com', '_blank');
        break;
      default:
        setActiveTab(id);
    }
    setIsMobileMenuOpen(false);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <ThreadWriter />;
      case 'videoconstructor':
        return <VideoScriptConstructor />;
      case 'partylist-db':
        return <Reddit_hub />;
      case 'ledger-db':
        return <KnowledgeWall />;
      case 'BrandTraning':
        return <BrandTraning />;
      case 'MemeEditor':
        return <MemeEditor />;
      default:
        return <div className="text-center text-gray-500">Select a tab</div>;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      <ToastContainer />
      <div className="flex h-screen overflow-hidden">
        {/* Mobile menu overlay */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside className={`fixed inset-y-0 left-0 z-20 w-64 bg-white transform 
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} 
          md:relative md:translate-x-0 transition duration-200 ease-in-out flex flex-col`}>
          <div className="p-6 flex justify-between items-center">
            <Image
              src={logoSrc}
              alt="Logo"
              width={200}
              height={50}
              onError={() => setLogoSrc('/logo.png')}
            />
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="md:hidden text-gray-500 hover:text-gray-700"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Main navigation */}
          <nav className="mt-6 px-6 space-y-1 flex-grow">
            {mainNavItems.map((item) => (
              <NavItem
                key={item.id}
                icon={item.icon}
                label={item.label}
                active={activeTab === item.id}
                onClick={() => handleNavItemClick(item.id)}
              />
            ))}
          </nav>

          {/* Bottom navigation */}
          <div className="px-6 space-y-1 mb-8">
            <ApiKeyManager />
            {bottomNavItems.map((item) => (
              <NavItem
                key={item.id}
                icon={item.icon}
                label={item.label}
                active={activeTab === item.id}
                onClick={() => handleNavItemClick(item.id)}
              />
            ))}
            <UserProfileSection />
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-100 rounded-md">
          <SubscriptionBanner onUpgrade={() => handleNavItemClick('billing')} />
          <div className="mt-4 pb-20 md:pb-6 rounded-xl max-w-7xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">
              {[...mainNavItems, ...bottomNavItems].find(item => item.id === activeTab)?.label}
            </h2>
            {renderContent()}
          </div>
        </main>
      </div>

      {/* Mobile navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white shadow-md">
        <div className="flex justify-around p-2">
          {mainNavItems.map((item) => (
            <MobileNavItem
              key={item.id}
              icon={item.icon}
              label={item.label}
              active={activeTab === item.id}
              onClick={() => handleNavItemClick(item.id)}
            />
          ))}
          <MobileNavItem
            icon={Menu}
            label="More"
            active={false}
            onClick={() => setIsMobileMenuOpen(true)}
          />
        </div>
      </nav>

      {/* Modals */}
      {/* Modals */}
      <OnBoardingPopup isOpen={isPopupOpen} onClose={() => setIsPopupOpen(false)} />
      <BillingModal isOpen={isBillingOpen} onClose={() => setIsBillingOpen(false)} />
      <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} />

      {/* How to Use Modal */}
      <Modal isOpen={isHowToUseOpen} onClose={() => setIsHowToUseOpen(false)} title="How to Use">
        <div className="py-4">
          <iframe
            className="w-full aspect-video"
            src="https://www.youtube.com/embed/your-video-id"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      </Modal>
    </div>
  );
}