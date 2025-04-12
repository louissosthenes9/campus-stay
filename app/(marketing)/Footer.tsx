import Link from 'next/link';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="bg-gradient-to-b from-indigo-950 to-indigo-900 pt-12 pb-6 text-primary-foreground">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Image
                src="/logo.png"
                alt="Campus Stay Logo"
                width={32}
                height={32}
              />
              <span className="text-lg font-bold text-primary">CampusStay</span>
            </div>
            <p className="text-muted-foreground mb-4">
              Find your perfect student accommodation near universities across Tanzania.
            </p>
            <div className="flex space-x-3">
              {[
                { icon: <Facebook size={18} />, label: 'Facebook' },
                { icon: <Twitter size={18} />, label: 'Twitter' },
                { icon: <Instagram size={18} />, label: 'Instagram' },
                { icon: <Linkedin size={18} />, label: 'LinkedIn' },
              ].map((social, index) => (
                <a
                  key={index}
                  href="#"
                  className="text-muted-foreground hover:text-primary transition-colors duration-300"
                  aria-label={social.label}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4 text-primary-foreground">Quick Links</h3>
            <ul className="space-y-2">
              {[
                { href: '#listings', label: 'Browse Properties' },
                { href: '#universities', label: 'Universities' },
                { href: '/blog', label: 'Blog' },
                { href: '/faq', label: 'FAQs' },
              ].map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground hover:text-primary text-sm transition-colors duration-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold mb-4 text-primary-foreground">Support</h3>
            <ul className="space-y-2">
              {[
                { href: '#contact', label: 'Contact Us' },
                { href: '/help', label: 'Help Center' },
                { href: '/terms', label: 'Terms of Service' },
                { href: '/privacy', label: 'Privacy Policy' },
              ].map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground hover:text-primary text-sm transition-colors duration-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold mb-4 text-primary-foreground">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <MapPin className="h-5 w-5 text-primary mr-2 shrink-0" />
                <span className="text-sm text-muted-foreground">
                  123 University Way, Dar es Salaam, Tanzania
                </span>
              </li>
              <li className="flex items-center">
                <Phone className="h-5 w-5 text-primary mr-2 shrink-0" />
                <a
                  href="tel:+255123456789"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors duration-300"
                >
                  +255 123 456 789
                </a>
              </li>
              <li className="flex items-center">
                <Mail className="h-5 w-5 text-primary mr-2 shrink-0" />
                <a
                  href="mailto:info@campusstay.com"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors duration-300"
                >
                  info@campusstay.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="pt-6 border-t border-border mt-8">
          <div className="flex flex-col md:flex-row md:justify-between items-center">
            <p className="text-sm text-muted-foreground mb-4 md:mb-0">
              2025 CampusStay. All rights reserved.
            </p>
            <div className="flex space-x-4">
              {[
                { href: '/terms', label: 'Terms of Service' },
                { href: '/privacy', label: 'Privacy Policy' },
                { href: '/cookies', label: 'Cookies Policy' },
              ].map((link, index) => (
                <Link
                  key={index}
                  href={link.href}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors duration-300"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}