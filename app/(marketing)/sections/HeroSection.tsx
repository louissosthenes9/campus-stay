'use client';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Search,
} from 'lucide-react';
import Image from 'next/image';
import { fadeIn, scaleIn, staggerContainer } from '@/utils/motion';
import { Property } from '@/types/properties';
import useProperty from '@/hooks/use-property';
import PropertySearch from '@/components/property/PropertySearch';
import { useRouter } from 'next/navigation';

export default function HeroSection({ properties }: { properties: Property[] }) {
  const router = useRouter();
  const handleSearchResults = (results: Property[]) => {
    // This will be handled by the search results page
  };
  return (
     <section id="home" className="py-16 md:py-24 bg-gradient-to-b from-card to-muted">
              <div className="container mx-auto px-16">
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <motion.div className="w-full md:w-1/2" variants={fadeIn} initial="initial" whileInView="whileInView">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                      Search, explore and <span className="text-primary">book your room!</span>
                    </h1>
                    <p className="text-lg md:text-xl text-muted-foreground mb-8">
                      Join thousands of students who found their ideal accommodation with CampusStay. Verified listings,
                      secure booking, and a stress-free housing experience.
                    </p>
                    
                    <PropertySearch 
                      className="mt-8"
                      onSearchResults={handleSearchResults}
                    />
     
                    <motion.div
                      className="grid grid-cols-2 md:grid-cols-4 gap-6"
                      variants={staggerContainer}
                      initial="initial"
                      whileInView="whileInView"
                    >
                      {[
                        { value: '10+', label: 'Universities' },
                        { value: '6', label: ' Major Cities' },
                        { value: '100+', label: 'Properties' },
                        // { value: '400+', label: '' },
                      ].map((stat, index) => (
                        <motion.div key={index} variants={fadeIn} className="text-center">
                          <p className="text-primary font-bold text-xl">{stat.value}</p>
                          <p className="text-sm text-muted-foreground">{stat.label}</p>
                        </motion.div>
                      ))}
                    </motion.div>
                  </motion.div>
                  <motion.div
                    className="w-full md:w-1/2"
                    variants={scaleIn}
                    initial="initial"
                    whileInView="whileInView"
                  >
                    <div className="relative rounded-xl overflow-hidden shadow-2xl">
                      <Image
                        src="/hero-3.jpg"
                        width={400}
                        height={200}
                        alt="Student searching for accommodation"
                        className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  </motion.div>
                </div>
              </div>
            </section>
  )
}
