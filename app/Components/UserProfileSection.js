"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { LogOut, ChevronDown } from 'lucide-react';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation'; // Changed from 'next/router'

const UserProfileSection = () => {
  const [user, setUser] = useState(null);
  const [showLogout, setShowLogout] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Only run on client side
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('userData');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    }
  }, []);

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('userData');
      localStorage.removeItem('authToken');
      
      toast.success('Successfully logged out! 👋', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      // Use window.location for hard refresh to login page
      window.location.href = '/login';
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="relative">
      <div className="p-4 border-t">
        <button 
          className="flex items-center space-x-2 w-full text-left hover:bg-gray-50 rounded-lg p-2 transition-colors duration-200"
          onClick={() => setShowLogout(!showLogout)}
        >
          {user.photoURL ? (
            <Image 
              src={user.photoURL}
              alt="User avatar" 
              width={32} 
              height={32} 
              className="rounded-full"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
              {user.displayName?.charAt(0) || user.email?.charAt(0)}
            </div>
          )}
          <div className="flex-grow">
            <span className="block font-medium text-sm">{user.displayName || 'User'}</span>
            <span className="block text-xs text-gray-500">{user.email}</span>
          </div>
          <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${showLogout ? 'transform rotate-180' : ''}`} />
        </button>

        {showLogout && (
          <button
            onClick={handleLogout}
            className="absolute bottom-full left-0 w-full bg-white shadow-lg rounded-lg p-2 mb-1 flex items-center space-x-2 text-red-500 hover:bg-red-50 transition-colors duration-200"
          >
            <LogOut className="h-4 w-4" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default UserProfileSection;