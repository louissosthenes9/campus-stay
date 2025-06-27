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
import FeaturedListings from './sections/FeaturedListings';
import UniversitySection from './sections/UniversitySection';
import RoomSection from './sections/RoomSection';
import CallSection from './sections/CallSection';
import { useAuthContext } from '@/contexts/AuthContext';
import useProperty from '@/hooks/use-property';


export default function HomePage() {
  const {isAuthenticated, user} = useAuthContext()
  const {properties} = useProperty();

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />
      <main>
        {/* Sections for the main content*/}
        <HeroSection />
        <FeaturedListings properties = {properties}/>
        <UniversitySection/>
        <BookingProcess />
        <RoomSection />
       
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