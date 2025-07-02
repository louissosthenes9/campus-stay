'use client';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Header from './Header';
import Footer from './Footer';
import Image from 'next/image';
import BookingProcess from './sections/BookingProcess';
import HeroSection from './sections/HeroSection';
import Testmonials from './sections/Testmonials';
import FeaturedListings from './sections/FeaturedListings';
import RoomSection from './sections/RoomSection';
import CallSection from './sections/CallSection';
import { useAuthContext } from '@/contexts/AuthContext';
import useProperty from '@/hooks/use-property';
import useFavourite from '@/hooks/use-favourite';


export default function HomePage() {
  const {isAuthenticated, user} = useAuthContext()
  const {properties} = useProperty();
  const {favorites} = useFavourite();
  console.log('Properties:', properties);
  console.log('Favorites:', favorites);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />
      <main>
        {/* Sections for the main content*/}
        <HeroSection  properties = {properties}/>
        <FeaturedListings properties = {properties} favourites={favorites}/>
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