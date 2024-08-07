"use client"


import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { DollarSign, List, Database, FileSpreadsheet, CheckSquare, Clock, Calendar, Menu, X, Sun, Moon, Bell, Search, ChevronDown } from 'lucide-react';
import MainDashboard from './dashboard_pages/MainDashboard';
import BuyerList from './dashboard_pages/BuyerList';
import Ledger from './dashboard_pages/Ledger';
import Commissions from './dashboard_pages/Commissions';
import LedgerCheck from './dashboard_pages/LedgerCheck';
import AgingReport from './dashboard_pages/AgingReport';
import CollectionThisWeek from './dashboard_pages/CollectionThisWeek';
import ThreadWriter from './dashboard_pages/MainDashboard';

const NavItem = ({ icon: Icon, label, active, onClick }) => (
  <button
    className={`flex items-center w-full px-4 py-2 rounded-lg transition-colors duration-200 ${
      active 
        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200' 
        : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
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
      active ? 'text-blue-500' : 'text-gray-500 dark:text-gray-400'
    }`}
    onClick={onClick}
  >
    <Icon size={24} />
    <span className="text-xs mt-1">{label}</span>
  </button>
);

const ThemeToggle = ({ isDark, setIsDark }) => (
  <button 
    onClick={() => setIsDark(!isDark)}
    className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
  >
    {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
  </button>
);

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isDark, setIsDark] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [logoSrc, setLogoSrc] = useState('/logo.png');

  useEffect(() => {
    // Check for user's preference in localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
      setIsDark(true);
    } else if (savedTheme === 'dark') {
      setIsDark(false);
    } else {
      // If no preference is saved, check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: light)').matches;
      setIsDark(prefersDark);
    }
  }, []);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      setLogoSrc('/logodark.png');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      setLogoSrc('/logo.png');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const navItems = [
    { icon: DollarSign, label: 'Build On X', id: 'dashboard' },
    { icon: Database, label: 'X Founders', id: 'commissions' },
    { icon: List, label: 'Reddit', id: 'partylist-db' },
    { icon: FileSpreadsheet, label: 'Ask AI', id: 'ledger-db' }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <ThreadWriter />;
      case 'partylist-db':
        return <BuyerList />;
      case 'ledger-db':
        return <Ledger />;
      case 'commissions':
        return <Commissions />;
      case 'ledger-check':
        return <LedgerCheck />;
      case 'aging-report':
        return <AgingReport />;
      case 'collection-this-week':
        return <CollectionThisWeek />;
      default:
        return <div className="text-center text-gray-500 dark:text-gray-400">Select a tab</div>;
    }
  };

  return (
    <div className={`min-h-screen ${isDark ? 'dark' : ''}`}>
      <div className="bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen">
        <div className="flex h-screen overflow-hidden">
          {/* Sidebar */}
          <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition duration-200 ease-in-out`}>
            <div className="p-6 flex justify-between items-center">
              <Image 
                src={logoSrc}
                alt="Logo"
                width={150}
                height={50}
                onError={() => {
                  console.error(`Failed to load image: ${logoSrc}`);
                  setLogoSrc('logo.png'); // Fallback to default logo
                }}
              />
              <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                <X className="h-6 w-6" />
              </button>
            </div>
            <nav className="mt-6 px-6 space-y-1">
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
          </aside>

          {/* Main Content */}
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-gray-900">
            {/* Top bar */}
            <header className="">
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center space-x-4">
                  <button 
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 md:hidden"
                  >
                    <Menu className="h-6 w-6" />
                  </button>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search..."
                      className="pl-10 pr-4 py-2 rounded-md bg-gray-100 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <button className="relative p-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
                    <Bell className="h-6 w-6" />
                    <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white dark:ring-gray-800"></span>
                  </button>
                  <div className="relative">
                    <button className="flex items-center space-x-2 text-sm focus:outline-none">
                      <Image 
                        src="/userimage.png" 
                        alt="User avatar" 
                        width={32} 
                        height={32} 
                        className="rounded-full"
                      />
                      <span className="hidden md:inline-block font-medium">John Doe</span>
                      <ChevronDown className="h-4 w-4 text-gray-400" />
                    </button>
                    {/* Dropdown menu would go here */}
                  </div>
                  <ThemeToggle isDark={isDark} setIsDark={setIsDark} />
                </div>
              </div>
            </header>

            {/* Page content */}
            <div className="p-6 pb-20 md:pb-6 rounded-xl">
              <h2 className="text-2xl font-bold mb-6">{navItems.find(item => item.id === activeTab)?.label}</h2>
              {renderContent()}
            </div>
          </main>
        </div>

        {/* Mobile Bottom Navigation */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 shadow-md">
          <div className="flex justify-around p-2">
            {navItems.slice(0, 4).map((item) => (
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
    </div>
  );
}