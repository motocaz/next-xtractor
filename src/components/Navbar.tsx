'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { SignedIn, SignedOut, UserButton, SignInButton } from '@clerk/nextjs';

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const mobileMenu = document.getElementById('mobile-menu');
      const mobileMenuButton = document.getElementById('mobile-menu-button');

      if (
        mobileMenu &&
        mobileMenuButton &&
        !mobileMenu.contains(target) &&
        !mobileMenuButton.contains(target) &&
        isMobileMenuOpen
      ) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="bg-[#09090b] border-b border-gray-700 sticky top-0 z-30">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="shrink-0 flex items-center cursor-pointer">
            <Link href="/" className="flex items-center">
              <Image
                src="/images/favicon.svg"
                alt="Xtractor PDF Logo"
                width={32}
                height={32}
                className="h-8 w-8"
              />
              <span className="text-white font-bold text-xl ml-2">
                Xtractor
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="nav-link">
              Home
            </Link>
            <Link href="/about" className="nav-link">
              About
            </Link>
            <Link href="/contact" className="nav-link">
              Contact
            </Link>
            <Link href="/#tools-header" className="nav-link">
              All Tools
            </Link>
            <div className="flex items-center">
              <SignedIn>
                <UserButton />
              </SignedIn>
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="inline-flex items-center px-4 py-2 rounded-lg bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-semibold transition-colors">
                    Sign In
                  </button>
                </SignInButton>
              </SignedOut>
            </div>
          </div>

          {/* Mobile Hamburger Button */}
          <div className="md:hidden flex items-center">
            <button
              id="mobile-menu-button"
              type="button"
              onClick={toggleMobileMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-fuchsia-500 transition-colors"
              aria-controls="mobile-menu"
              aria-expanded={isMobileMenuOpen}
            >
              <span className="sr-only">Open main menu</span>
              {/* Hamburger Icon */}
              <svg
                className={`block h-6 w-6 ${isMobileMenuOpen ? 'hidden' : ''}`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              {/* Close Icon */}
              <svg
                className={`block h-6 w-6 ${isMobileMenuOpen ? '' : 'hidden'}`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <div
        id="mobile-menu"
        className={`md:hidden bg-gray-800 border-t border-gray-700 ${
          isMobileMenuOpen ? '' : 'hidden'
        }`}
      >
        <div className="px-2 pt-2 pb-3 space-y-1 text-center">
          <Link
            href="/"
            className="mobile-nav-link"
            onClick={closeMobileMenu}
          >
            Home
          </Link>
          <Link
            href="/about"
            className="mobile-nav-link"
            onClick={closeMobileMenu}
          >
            About
          </Link>
          <Link
            href="/contact"
            className="mobile-nav-link"
            onClick={closeMobileMenu}
          >
            Contact
          </Link>
          <Link
            href="/#tools-header"
            className="mobile-nav-link"
            onClick={closeMobileMenu}
          >
            All Tools
          </Link>
          <div className="mt-4 flex justify-center">
            <SignedIn>
              <UserButton />
            </SignedIn>
            <SignedOut>
              <SignInButton mode="modal">
                <button className="inline-flex items-center px-4 py-2 rounded-lg bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-semibold transition-colors">
                  Sign In
                </button>
              </SignInButton>
            </SignedOut>
          </div>
        </div>
      </div>
    </nav>
  );
}

