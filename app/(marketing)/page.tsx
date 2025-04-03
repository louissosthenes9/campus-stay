'use client';
import { motion } from 'framer-motion';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Home, Building, MapPin, Star, ArrowRight} from 'lucide-react';
import Header from './Header';
import Footer from './Footer';
import Image from 'next/image';

export default function HomePage() {
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <Header />
      <main>
        {/* Hero Section */}
        <section className="py-12 md:py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center">
              <motion.div 
                className="w-full md:w-1/2 mb-8 md:mb-0"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                  Find Your Perfect <span className="text-blue-600">Student Housing</span> Near Campus
                </h1>
                <p className="text-lg md:text-xl text-gray-700 mb-8">
                  Join thousands of students who found their ideal accommodation with CampusStay. 
                  Verified listings, secure booking, and a stress-free housing experience.
                </p>
                
                <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                  <Button size="lg" className="bg-blue-600 text-white hover:bg-blue-700">
                    Get Started <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                  <Button size="lg" variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white">
                    List Your Property
                  </Button>
                </div>
              </motion.div>
              
              <motion.div 
                className="w-full md:w-1/2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className="relative rounded-xl overflow-hidden shadow-xl">
                  <div className="aspect-w-16 aspect-h-9 h-80">
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <Image
                        src="/appartments.jpeg" 
                        width={500}
                        height={500}
                        alt="Student apartment near campus" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
                    <div className="text-white">
                      <div className="flex items-center mb-2">
                        <Star className="text-yellow-400 w-5 h-5 mr-1" fill="currentColor" />
                        <Star className="text-yellow-400 w-5 h-5 mr-1" fill="currentColor" />
                        <Star className="text-yellow-400 w-5 h-5 mr-1" fill="currentColor" />
                        <Star className="text-yellow-400 w-5 h-5 mr-1" fill="currentColor" />
                        <Star className="text-yellow-400 w-5 h-5 mr-1" fill="currentColor" />
                        <span className="ml-2">5.0 (120 reviews)</span>
                      </div>
                      <h3 className="text-xl font-semibold">Modern Studio Apartment</h3>
                      <p>Just 5 minutes from Kairuki college</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
        
        {/* Search Section */}
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <motion.div 
              className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-2xl font-bold mb-6 text-center">Find Your Perfect Campus Stay</h2>
              <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3 text-gray-400" />
                  <Input 
                    type="text" 
                    placeholder="University or College" 
                    className="pl-10 py-6 border-gray-300"
                  />
                </div>
                <div className="flex-1 relative">
                  <MapPin className="absolute left-3 top-3 text-gray-400" />
                  <Input 
                    type="text" 
                    placeholder="Location" 
                    className="pl-10 py-6 border-gray-300"
                  />
                </div>
                <Button className="py-6 bg-blue-600 text-white hover:bg-blue-700">
                  Search Now
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
        
        {/* Features Section */}
        <section id="how-it-works" className="py-16 md:py-24 bg-white">
          <div className="container mx-auto px-4">
            <motion.div 
              className="max-w-3xl mx-auto text-center mb-12"
              variants={fadeIn}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">How CampusStay Works</h2>
              <p className="text-lg text-gray-700">
                Finding student accommodation has never been easier. Our platform connects students with verified brokers and properties near their campus.
              </p>
            </motion.div>
            
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
            >
              <motion.div 
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
                variants={fadeIn}
              >
                <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center text-blue-600 mb-4">
                  <Search className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Search</h3>
                <p className="text-gray-700">
                  Browse thousands of verified properties near universities and colleges across the country.
                </p>
              </motion.div>
              
              <motion.div 
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
                variants={fadeIn}
              >
                <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center text-blue-600 mb-4">
                  <Home className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Book</h3>
                <p className="text-gray-700">
                  Schedule virtual tours and secure your ideal accommodation with our secure booking system.
                </p>
              </motion.div>
              
              <motion.div 
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
                variants={fadeIn}
              >
                <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center text-blue-600 mb-4">
                  <MapPin className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Move In</h3>
                <p className="text-gray-700">
                  Get all the support you need from our dedicated team as you move into your new home.
                </p>
              </motion.div>
            </motion.div>
          </div>
        </section>
        
        {/* Landlord Section */}
        <section id="for-brokers" className="py-16 md:py-24 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center">
              <motion.div 
                className="w-full md:w-1/2 mb-8 md:mb-0 md:pr-12"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl md:text-4xl font-bold mb-6">For Property Owners & brokers</h2>
                <p className="text-lg text-gray-700 mb-6">
                  List your properties on CampusStay and connect with thousands of students looking for quality accommodation near their campus.
                </p>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-start">
                    <div className="bg-blue-100 rounded-full p-1 mt-1 mr-3">
                      <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-gray-700">Reach thousands of verified student tenants</span>
                  </li>
                  <li className="flex items-start">
                    <div className="bg-blue-100 rounded-full p-1 mt-1 mr-3">
                      <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-gray-700">Secure payments and verified bookings</span>
                  </li>
                  <li className="flex items-start">
                    <div className="bg-blue-100 rounded-full p-1 mt-1 mr-3">
                      <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-gray-700">Dedicated support from our landlord success team</span>
                  </li>
                </ul>
                <Button className="bg-blue-600 text-white hover:bg-blue-700">
                  List Your Property <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </motion.div>
              
              <motion.div 
                className="w-full md:w-1/2"
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center mb-6">
                    <Building className="w-8 h-8 text-blue-600 mr-3" />
                    <h3 className="text-xl font-semibold">Broker&appos;s Dashboard</h3>
                  </div>
                  <div className="aspect-w-16 aspect-h-9 mb-6">
                    <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                      <Image 
                        width={500}
                        height={500}
                        src="/planner.jpeg" 
                        alt="Broker's  dashboard" 
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <span className="font-medium">Total Properties</span>
                      <span className="font-bold">12</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <span className="font-medium">Active Contants</span>
                      <span className="font-bold">8</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <span className="font-medium">Average Rating</span>
                      <div className="flex items-center">
                        <span className="font-bold mr-2">4.8</span>
                        <Star className="w-4 h-4 text-yellow-400" fill="currentColor" />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
        
        {/* Testimonials */}
        <section id="testimonials" className="py-16 md:py-24 bg-white">
          <div className="container mx-auto px-4">
            <motion.div 
              className="max-w-3xl mx-auto text-center mb-12"
              variants={fadeIn}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our Users Say</h2>
              <p className="text-lg text-gray-700">
                Thousands of students have found their perfect accommodation through CampusStay.
              </p>
            </motion.div>
            
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
            >
              <motion.div variants={fadeIn}>
                <Card>
                  <CardHeader>
                    <div className="flex items-center">
                      <div className="w-12 h-12 rounded-full bg-gray-200 mr-4"></div>
                      <div>
                        <CardTitle>Emiliana mchina</CardTitle>
                        <CardDescription>University of Dar es Salaam</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex mb-3">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" />
                      ))}
                    </div>
                    <p className="text-gray-700">
                      "CampusStay made finding an apartment near campus so easy! The virtual tours saved me so much time, and I found a place I love within a week."
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
              
              <motion.div variants={fadeIn}>
                <Card>
                  <CardHeader>
                    <div className="flex items-center">
                      <div className="w-12 h-12 rounded-full bg-gray-200 mr-4"></div>
                      <div>
                        <CardTitle>Francis Mkena</CardTitle>
                        <CardDescription>IFM</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex mb-3">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" />
                      ))}
                    </div>
                    <p className="text-gray-700">
                      "As an international student, finding housing was my biggest worry. CampusStay connected me with a verified landlord and the whole process was smooth."
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
              <motion.div variants={fadeIn}>
                <Card>
                  <CardHeader>
                    <div className="flex items-center">
                      <div className="w-12 h-12 rounded-full bg-gray-200 mr-4"></div>
                      <div>
                        <CardTitle>Sarah Mwaipoz</CardTitle>
                        <CardDescription>DIT</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex mb-3">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" />
                      ))}
                    </div>
                    <p className="text-gray-700">
                      "I was able to find roommates and a great apartment all on one platform. The payment system is secure and the customer support is amazing!"
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-16 bg-blue-600">
          <div className="container mx-auto px-4">
            <motion.div 
              className="max-w-3xl mx-auto text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">Ready to Find Your Perfect Campus Stay?</h2>
              <p className="text-xl text-blue-100 mb-8">
                Join thousands of students who have found their ideal accommodation near campus.
              </p>
              <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                  Get Started <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button size="lg" variant="outline" className="border-white hover:text-white hover:bg-blue-700">
                  Learn More
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer/>
    </div>
  );
}