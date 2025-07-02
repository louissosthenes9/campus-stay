'use client';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Menu, X, User, ChevronDown } from 'lucide-react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthContext } from '@/contexts/AuthContext';

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuthContext();
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleProfileDropdown = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileDropdownRef.current && event.target instanceof Node && !profileDropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    setIsProfileDropdownOpen(false);
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
              <div className="relative" ref={profileDropdownRef}>
                <Button
                  variant="outline"
                  className="text-primary font-bold flex items-center space-x-2"
                  onClick={toggleProfileDropdown}
                >
                  <User size={16} />
                  <span>Profile</span>
                  <ChevronDown size={16} className={`transition-transform duration-200 ${isProfileDropdownOpen ? 'rotate-180' : ''}`} />
                </Button>
                
                <AnimatePresence>
                  {isProfileDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg py-2 z-50"
                    >
                      <Link
                        href="/profile"
                        className="flex items-center space-x-2 px-4 py-2 text-foreground hover:bg-muted transition-colors duration-200"
                        onClick={() => setIsProfileDropdownOpen(false)}
                      >
                        <User size={16} />
                        <span>My Profile</span>
                      </Link>
                      <hr className="my-1 border-border" />
                      <button
                        onClick={handleLogout}
                        className="flex items-center space-x-2 px-4 py-2 text-foreground hover:bg-muted transition-colors duration-200 w-full text-left"
                      >
                        <X size={16} />
                        <span>Logout</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
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
                <>
                  <Link
                    href="/profile"
                    className="flex items-center space-x-2 text-primary font-bold py-2 border-2 border-primary rounded-full text-center justify-center hover:bg-indigo-300 transition-all duration-200"
                    onClick={toggleMobileMenu}
                  >
                    <User size={16} />
                    <span>My Profile</span>
                  </Link>
                  <Button
                    variant="outline"
                    className="text-foreground font-bold w-full"
                    onClick={() => {
                      handleLogout();
                      toggleMobileMenu();
                    }}
                  >
                    Logout
                  </Button>
                </>
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