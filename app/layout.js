"use client";
import { Inter } from "next/font/google";
import { useState, useEffect } from 'react';
import "./globals.css";
import OnBoardingPopup from "./Components/OnBoardingPopup";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }) {
  const [showPopup, setShowPopup] = useState(false);
  
  useEffect(() => {
    // Check if userData exists in localStorage
    const userData = localStorage.getItem('userData');
    setShowPopup(!userData); // Show popup if userData doesn't exist
  }, []); // Empty dependency array means this runs once on mount

  return (
    <html lang="en">
      {showPopup && <OnBoardingPopup isOpen={true} onClose={() => setShowPopup(false)} />}
      <body className={inter.className}>{children}</body>
    </html>
  );
}