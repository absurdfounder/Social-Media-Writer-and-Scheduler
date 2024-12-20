"use client"

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Building2, Users, MessageCircle, Brain, Menu, X, Twitter, ScanFace, TrendingUp, Search, Bell, ChevronDown, Shapes } from 'lucide-react';
import Reddit_hub from './dashboard_pages/Reddit_hub';
import KnowledgeWall from './dashboard_pages/KnowledgeWall';
import BrandTraning from './dashboard_pages/BrandTraning';
import LedgerCheck from './dashboard_pages/LedgerCheck';
import AgingReport from './dashboard_pages/AgingReport';
import CollectionThisWeek from './dashboard_pages/CollectionThisWeek';
import ThreadWriter from './dashboard_pages/ThreadReply';
import VideoScriptConstructor from './dashboard_pages/VideoConstruct';
import OnBoardingPopup from './Components/OnBoardingPopup';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import UserProfileSection from './Components/UserProfileSection';
import ApiKeyManager from './Components/ApiKeyManager';

const NavItem = ({ icon: Icon, label, active, onClick }) => (
  <button
    className={`flex items-center w-full px-4 py-2 rounded-lg transition-colors duration-200 ${
      active ? 'bg-blue-100 text-blue-500' : 'text-gray-500 hover:bg-gray-100'
    }`}
    onClick={onClick}
  >
    <Icon className="mr-3 h-5 w-5" />
    <span className="font-medium">{label}</span>
  </button>
);

const MobileNavItem = ({ icon: Icon, label, active, onClick }) => (
  <button
    className={`flex flex-col items-center justify-center p-2 ${
      active ? 'text-blue-500' : 'text-gray-500'
    }`}
    onClick={onClick}
  >
    <Icon size={20} />
    <span className="text-xs mt-1">{label}</span>
  </button>
);

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [logoSrc, setLogoSrc] = useState('/logo.png');
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkLoginState = async () => {
      try {
        setIsLoading(true);
        
        // Check both localStorage items
        const key = localStorage.getItem('anthropicKey');
        const userData = localStorage.getItem('userData');
        
        const isValid = key && key.startsWith('sk-') && userData;
        setIsAuthenticated(isValid);
        
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error('Error checking login state:', error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };
  
    // Run immediately
    checkLoginState();
  
    // Add listener for login events
    const handleLogin = () => checkLoginState();
    window.addEventListener('userLoggedIn', handleLogin);
    
    return () => window.removeEventListener('userLoggedIn', handleLogin);
  }, []);

  const navItems = [
    { icon: Twitter, label: 'Build On X', id: 'dashboard' },
    { icon: TrendingUp, label: 'Go Viral', id: 'videoconstructor' },
    { icon: MessageCircle, label: 'Reddit', id: 'partylist-db' },
    { icon: Brain, label: 'Preach', id: 'ledger-db' },
    { icon: Shapes, label: 'Trained On', id: 'BrandTraning' },
  ];

  const handleConfigureTrainingData = () => {
    setActiveTab('BrandTraning');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <ThreadWriter onConfigureTrainingData={handleConfigureTrainingData} />;
      case 'videoconstructor':
        return <VideoScriptConstructor />;
      case 'partylist-db':
        return <Reddit_hub />;
      case 'ledger-db':
        return <KnowledgeWall />;
      case 'BrandTraning':
        return <BrandTraning />;
      case 'ledger-check':
        return <LedgerCheck />;
      case 'aging-report':
        return <AgingReport />;
      case 'collection-this-week':
        return <CollectionThisWeek />;
      default:
        return <div className="text-center text-gray-500">Select a tab</div>;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your workspace...Time to Outshine</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      <ToastContainer />
      <div className="flex h-screen overflow-hidden">
        {/* Overlay */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>
        )}

        {/* Sidebar */}
        <aside 
          className={`fixed inset-y-0 left-0 z-10 w-64 bg-white transform ${
            isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          } md:relative md:translate-x-0 transition duration-200 ease-in-out flex flex-col`}
        >
          <div className="p-6 flex justify-between items-center">
            <Image
              src={logoSrc}
              alt="Logo"
              width={200}
              height={50}
              onError={() => {
                console.error(`Failed to load image: ${logoSrc}`);
                setLogoSrc('logo.png');
              }}
            />
            <button 
              onClick={() => setIsMobileMenuOpen(false)} 
              className="md:hidden text-gray-500 hover:text-gray-500"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav className="mt-6 px-6 space-y-1 flex-grow">
            {navItems.map((item) => (
              <NavItem
                key={item.id}
                icon={item.icon}
                label={item.label}
                active={activeTab === item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsMobileMenuOpen(false);
                }}
              />
            ))}
          </nav>

          <div className='mb-2'>
            <ApiKeyManager />
          </div>
          <UserProfileSection />
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-100 rounded-md">
          <div className="mt-4 pb-20 md:pb-6 rounded-xl max-w-7xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">
              {navItems.find(item => item.id === activeTab)?.label}
            </h2>
            {renderContent()}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white shadow-md">
        <div className="flex justify-around p-2">
          {navItems.map((item) => (
            <MobileNavItem
              key={item.id}
              icon={item.icon}
              label={item.label}
              active={activeTab === item.id}
              onClick={() => setActiveTab(item.id)}
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
    </div>
  );
}