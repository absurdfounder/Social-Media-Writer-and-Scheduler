"use client";
import { Inter } from "next/font/google";
import "./globals.css";
import OnBoardingPopup from "./Components/OnBoardingPopup";

const inter = Inter({ subsets: ["latin"] });


export default function RootLayout({ children }) {
  return (
    <html lang="en">
           <OnBoardingPopup isOpen={true} onClose={() => {}} />

      <body className={inter.className}>{children}</body>
    </html>
  );
}
