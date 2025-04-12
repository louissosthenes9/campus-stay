'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import Image from 'next/image';

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Image 
              src="/logo-placeholder.svg" 
              alt="Campus Stay Logo"
              width={40}
              height={40}
            />
            <span className="text-xl font-bold text-blue-600">CampusStay</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/properties" className="text-gray-700 hover:text-blue-600 text-sm font-medium">
              Properties
            </Link>
            <Link href="/universities" className="text-gray-700 hover:text-blue-600 text-sm font-medium">
              Universities
            </Link>
            <Link href="/about" className="text-gray-700 hover:text-blue-600 text-sm font-medium">
              About
            </Link>
            <Link href="/contact" className="text-gray-700 hover:text-blue-600 text-sm font-medium">
              Contact
            </Link>
          </nav>

          {/* Auth Buttons (Desktop) */}
          <div className="hidden md:flex items-center space-x-3">
            <Button variant="outline" size="sm" className="text-blue-600 border-blue-600">
              Log in
            </Button>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
              Sign up
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-gray-700" 
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100">
            <nav className="flex flex-col space-y-4">
              <Link href="/properties" className="text-gray-700 hover:text-blue-600 font-medium py-2">
                Properties
              </Link>
              <Link href="/universities" className="text-gray-700 hover:text-blue-600 font-medium py-2">
                Universities
              </Link>
              <Link href="/about" className="text-gray-700 hover:text-blue-600 font-medium py-2">
                About
              </Link>
              <Link href="/contact" className="text-gray-700 hover:text-blue-600 font-medium py-2">
                Contact
              </Link>
            </nav>
            
            <div className="flex flex-col space-y-3 mt-4 pt-4 border-t border-gray-100">
              <Button variant="outline" className="w-full text-blue-600 border-blue-600">
                Log in
              </Button>
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                Sign up
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
