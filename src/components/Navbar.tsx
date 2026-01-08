"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { SignedIn, SignedOut, UserButton, SignInButton } from "@clerk/nextjs";
import ThemeToggle from "@/components/ThemeToggle";

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const mobileMenu = document.getElementById("mobile-menu");
      const mobileMenuButton = document.getElementById("mobile-menu-button");

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
      document.addEventListener("click", handleClickOutside);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="bg-background border-b border-border sticky top-0 z-30">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="shrink-0 flex items-center cursor-pointer">
            <Link href="/" className="flex items-center">
              <Image
                src="/images/favicon.svg"
                alt="Xtractor PDF Logo"
                width={32}
                height={32}
                className="h-8 w-8"
              />
              <span className="text-foreground font-bold text-xl ml-2">
                Xtractor
              </span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className="text-foreground hover:bg-accent hover:text-foreground px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Home
            </Link>
            <Link
              href="/pricing"
              className="text-foreground hover:bg-accent hover:text-foreground px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Pricing
            </Link>
            <Link
              href="/about"
              className="text-foreground hover:bg-accent hover:text-foreground px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              About
            </Link>
            <Link
              href="/contact"
              className="text-foreground hover:bg-accent hover:text-foreground px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Contact
            </Link>
            <Link
              href="/#tools-header"
              className="text-foreground hover:bg-accent hover:text-foreground px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              All Tools
            </Link>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <SignedIn>
                <UserButton />
              </SignedIn>
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="inline-flex items-center px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-semibold transition-colors">
                    Sign In
                  </button>
                </SignInButton>
              </SignedOut>
            </div>
          </div>

          <div className="md:hidden flex items-center">
            <button
              id="mobile-menu-button"
              type="button"
              onClick={toggleMobileMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary transition-colors"
              aria-controls="mobile-menu"
              aria-expanded={isMobileMenuOpen}
            >
              <span className="sr-only">Open main menu</span>
              <svg
                className={`block h-6 w-6 ${isMobileMenuOpen ? "hidden" : ""}`}
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
              <svg
                className={`block h-6 w-6 ${isMobileMenuOpen ? "" : "hidden"}`}
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

      <div
        id="mobile-menu"
        className={`md:hidden bg-muted border-t border-border ${
          isMobileMenuOpen ? "" : "hidden"
        }`}
      >
        <div className="px-2 pt-2 pb-3 space-y-1 text-center">
          <Link
            href="/"
            className="text-foreground hover:bg-accent hover:text-foreground block px-3 py-2 rounded-md text-base font-medium transition-colors"
            onClick={closeMobileMenu}
          >
            Home
          </Link>
          <Link
            href="/pricing"
            className="text-foreground hover:bg-accent hover:text-foreground block px-3 py-2 rounded-md text-base font-medium transition-colors"
            onClick={closeMobileMenu}
          >
            Pricing
          </Link>
          <Link
            href="/about"
            className="text-foreground hover:bg-accent hover:text-foreground block px-3 py-2 rounded-md text-base font-medium transition-colors"
            onClick={closeMobileMenu}
          >
            About
          </Link>
          <Link
            href="/contact"
            className="text-foreground hover:bg-accent hover:text-foreground block px-3 py-2 rounded-md text-base font-medium transition-colors"
            onClick={closeMobileMenu}
          >
            Contact
          </Link>
          <Link
            href="/#tools-header"
            className="text-foreground hover:bg-accent hover:text-foreground block px-3 py-2 rounded-md text-base font-medium transition-colors"
            onClick={closeMobileMenu}
          >
            All Tools
          </Link>
          <div className="mt-4 flex flex-col items-center gap-4">
            <ThemeToggle />
            <SignedIn>
              <UserButton />
            </SignedIn>
            <SignedOut>
              <SignInButton mode="modal">
                <button className="inline-flex items-center px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-semibold transition-colors">
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
