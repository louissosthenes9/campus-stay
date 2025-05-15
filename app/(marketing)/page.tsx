'use client';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Search,
  Star,
  ArrowRight,
  Shield,
  Clock,
} from 'lucide-react';
import Header from './Header';
import Footer from './Footer';
import Image from 'next/image';
import BookingProcess from './sections/BookingProcess';
import HeroSection from './sections/HeroSection';
import Testmonials from './sections/Testmonials';
import BrokerSection from './sections/BrokerSection';
import FeaturedListings from './sections/FeaturedListings';
import UniversitySection from './sections/UniversitySection';
import RoomSection from './sections/RoomSection';
import CallSection from './sections/CallSection';
import { useAuthContext } from '@/contexts/AuthContext';


export default function HomePage() {
  const {isAuthenticated, user} = useAuthContext()
  console.log("User Authenticated", user)

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />
      <main>
        {/* Sections for the main content*/}
        <HeroSection />
        <FeaturedListings />
        <UniversitySection/>
        <BookingProcess />
        <RoomSection />

        {
          isAuthenticated && user?.roles === 'student' ? (
            <div></div>
          ):(
            <BrokerSection />
          )
        }
       
         {
          isAuthenticated ? (
            <div></div>
          ):(
            <Testmonials />
          )
         }
        <CallSection />
    
      </main>
      <Footer />
    </div>
  );
}