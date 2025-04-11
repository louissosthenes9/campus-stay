import Link from 'next/link';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="bg-gray-50 pt-12 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Image 
                src="/logo-placeholder.svg" 
                alt="Campus Stay Logo"
                width={32}
                height={32}
              />
              <span className="text-lg font-bold text-blue-600">CampusStay</span>
            </div>
            <p className="text-gray-600 mb-4">
              Find your perfect student accommodation near universities across Tanzania.
            </p>
            <div className="flex space-x-3">
              <a href="#" className="text-gray-500 hover:text-blue-600" aria-label="Facebook">
                <Facebook size={18} />
              </a>
              <a href="#" className="text-gray-500 hover:text-blue-600" aria-label="Twitter">
                <Twitter size={18} />
              </a>
              <a href="#" className="text-gray-500 hover:text-blue-600" aria-label="Instagram">
                <Instagram size={18} />
              </a>
              <a href="#" className="text-gray-500 hover:text-blue-600" aria-label="LinkedIn">
                <Linkedin size={18} />
              </a>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/properties" className="text-gray-600 hover:text-blue-600 text-sm">
                  Browse Properties
                </Link>
              </li>
              <li>
                <Link href="/universities" className="text-gray-600 hover:text-blue-600 text-sm">
                  Universities
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-gray-600 hover:text-blue-600 text-sm">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-gray-600 hover:text-blue-600 text-sm">
                  FAQs
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Support */}
          <div>
            <h3 className="font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/contact" className="text-gray-600 hover:text-blue-600 text-sm">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/help" className="text-gray-600 hover:text-blue-600 text-sm">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-600 hover:text-blue-600 text-sm">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-600 hover:text-blue-600 text-sm">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Contact Info */}
          <div>
            <h3 className="font-semibold mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <MapPin className="h-5 w-5 text-blue-600 mr-2 shrink-0" />
                <span className="text-sm text-gray-600">
                  123 University Way, Dar es Salaam, Tanzania
                </span>
              </li>
              <li className="flex items-center">
                <Phone className="h-5 w-5 text-blue-600 mr-2 shrink-0" />
                <a href="tel:+255123456789" className="text-sm text-gray-600 hover:text-blue-600">
                  +255 123 456 789
                </a>
              </li>
              <li className="flex items-center">
                <Mail className="h-5 w-5 text-blue-600 mr-2 shrink-0" />
                <a href="mailto:info@campusstay.com" className="text-sm text-gray-600 hover:text-blue-600">
                  info@campusstay.com
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Bottom Footer */}
        <div className="pt-6 border-t border-gray-200 mt-8">
          <div className="flex flex-col md:flex-row md:justify-between items-center">
            <p className="text-sm text-gray-500 mb-4 md:mb-0">
              © {new Date().getFullYear()} CampusStay. All rights reserved.
            </p>
            <div className="flex space-x-4">
              <Link href="/terms" className="text-sm text-gray-500 hover:text-blue-600">
                Terms of Service
              </Link>
              <Link href="/privacy" className="text-sm text-gray-500 hover:text-blue-600">
                Privacy Policy
              </Link>
              <Link href="/cookies" className="text-sm text-gray-500 hover:text-blue-600">
                Cookies Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
