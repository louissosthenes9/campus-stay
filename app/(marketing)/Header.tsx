'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useAuthContext } from '@/contexts/AuthContext';

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuthContext();
  
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };



  const navLinks = [
    { name: 'Home', href: '#home' },
    { name: 'Listings', href: '#listings' },
    { name: 'Universities', href: '#universities' },
    { name: 'Contact', href: '#contact' },
  ];

  return (
    <header className="bg-card shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Image src="/logo.png" alt="Campus Stay Logo" width={40} height={40} />
            <div className="text-2xl font-bold">
              campus<span className="text-primary">Stay</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-foreground hover:text-primary text-sm font-medium transition-colors duration-300"
              >
                {link.name}
              </a>
            ))}
          </nav>

          {/* Auth Buttons (Desktop) */}
          <div className="hidden md:flex items-center space-x-3">
            {isAuthenticated ? (
              <Button
                variant="outline"
                className="text-primary font-bold"
                onClick={logout}
              >
                Logout
              </Button>
            ) : (
              <>
                <div className="border-2 border-primary rounded-full hover:bg-indigo-300 transition-all duration-200">
                  <Link
                    href="/login"
                    className="btn-outline text-primary font-bold px-8 py-2 block"
                  >
                    Sign in
                  </Link>
                </div>
                <Link
                  href="/signup"
                  className="btn-primary bg-indigo-600 text-white py-2 px-8 rounded-full font-bold hover:bg-indigo-700 transition-all duration-200"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-foreground"
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <motion.div
            className="md:hidden py-4 border-t border-border"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <nav className="flex flex-col space-y-4">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-foreground hover:text-primary font-medium py-2 transition-colors duration-300"
                  onClick={toggleMobileMenu}
                >
                  {link.name}
                </a>
              ))}
            </nav>
            <div className="flex flex-col space-y-3 mt-4 pt-4 border-t border-border">
              {isAuthenticated ? (
                <Button
                  variant="outline"
                  className="text-primary font-bold w-full"
                  onClick={() => {
                    logout();
                    toggleMobileMenu();
                  }}
                >
                  Logout
                </Button>
              ) : (
                <>
                  <div className="border-2 border-primary rounded-full hover:bg-indigo-300 transition-all duration-200">
                    <Link
                      href="/login"
                      className="btn-outline text-primary font-bold py-2 block text-center"
                      onClick={toggleMobileMenu}
                    >
                      Sign in
                    </Link>
                  </div>
                  <Link
                    href="/signup"
                    className="btn-primary bg-indigo-600 text-white py-2 px-4 rounded-full font-medium text-center transition-all duration-200 hover:bg-indigo-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-opacity-50"
                    onClick={toggleMobileMenu}
                  >
                    Sign up
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </header>
  );
}