'use client';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Search,
} from 'lucide-react';
import Image from 'next/image';
import { fadeIn, scaleIn, staggerContainer } from '@/utils/motion';
export default function HeroSection() {
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
                    <div className="bg-card rounded-full shadow-lg flex items-center p-2 mb-8 border border-border">
                      <Search className="mx-3 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder="Search by city, university or property"
                        className="border-0 focus:ring-0 bg-transparent"
                      />
                      <Button size="sm" className="btn-primary rounded-full">
                        <Search className="h-5 w-5" />
                      </Button>
                    </div>
                    <motion.div
                      className="grid grid-cols-2 md:grid-cols-4 gap-6"
                      variants={staggerContainer}
                      initial="initial"
                      whileInView="whileInView"
                    >
                      {[
                        { value: '10+ years', label: 'Experience' },
                        { value: '20+', label: 'Cities' },
                        { value: '1000+', label: 'Properties' },
                        { value: '400+', label: 'Brokers' },
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
                        src="/student-room.jpg"
                        width={600}
                        height={400}
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
