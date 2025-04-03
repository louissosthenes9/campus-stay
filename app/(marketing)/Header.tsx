import { useState } from "react";
import {Menu, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  return (
    <header className="w-full border-b border-gray-200 bg-white sticky top-0 z-50">
    <div className="container mx-auto px-4 py-4 flex justify-between items-center">
      <motion.div 
        className="flex items-center" 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }}
      >
        <h1 className="text-2xl font-bold text-black mr-2">Campus<span className="text-blue-600">Stay</span></h1>
      </motion.div>
      
      {/* Desktop Navigation */}
      <nav className="hidden md:flex space-x-6 items-center">
        <a href="#how-it-works" className="text-gray-700 hover:text-blue-600 transition duration-200">How It Works</a>
        <a href="#for-brokers" className="text-gray-700 hover:text-blue-600 transition duration-200">For brokers</a>
        <a href="#testimonials" className="text-gray-700 hover:text-blue-600 transition duration-200">Testimonials</a>
        <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white">Log In</Button>
        <Button className="bg-blue-600 text-white hover:bg-blue-700">Get Started</Button>
      </nav>
      
      {/* Mobile hamburger */}
      <div className="md:hidden">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Menu"
        >
          {isMenuOpen ? <X /> : <Menu />}
        </Button>
      </div>
    </div>
    
    {/* Mobile menu */}
    {isMenuOpen && (
      <motion.div 
        className="md:hidden bg-white"
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "auto", opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
      >
        <div className="container mx-auto px-4 py-4 flex flex-col space-y-4">
          <a href="#how-it-works" className="text-gray-700 hover:text-blue-600 transition duration-200 py-2">How It Works</a>
          <a href="#for-brokers" className="text-gray-700 hover:text-blue-600 transition duration-200 py-2">For brokers</a>
          <a href="#testimonials" className="text-gray-700 hover:text-blue-600 transition duration-200 py-2">Testimonials</a>
          <Button variant="outline" className="w-full border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white">Log In</Button>
          <Button className="w-full bg-blue-600 text-white hover:bg-blue-700">Get Started</Button>
        </div>
      </motion.div>
    )}
  </header>

  )
}
