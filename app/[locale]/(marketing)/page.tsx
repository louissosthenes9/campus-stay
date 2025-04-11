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
import { Search, Home, Building, MapPin, Star, ArrowRight, Check, Shield, Clock } from 'lucide-react';
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

  // Example university data
  const topUniversities = [
    { name: "University of Dar es Salaam", logo: "/placeholder-logo.png" },
    { name: "IFM", logo: "/placeholder-logo.png" },
    { name: "DIT", logo: "/placeholder-logo.png" },
    { name: "University of Dodoma", logo: "/placeholder-logo.png" }
  ];

  // Example accommodation listings
  const featuredListings = [
    {
      title: "Modern Apartment near UDSM",
      location: "5 minutes from University of Dar es Salaam",
      price: "120,000",
      rating: 4.8,
      reviews: 24,
      image: "/appartments.jpeg"
    },
    {
      title: "Student Hostel at Mikocheni",
      location: "10 minutes from IFM campus",
      price: "85,000",
      rating: 4.5,
      reviews: 18,
      image: "/appartments.jpeg"
    },
    {
      title: "Shared Accommodation in Ubungo",
      location: "Walking distance to DIT",
      price: "65,000",
      rating: 4.6,
      reviews: 32,
      image: "/appartments.jpeg"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <Header />
      <main>
        {/* Hero Section */}
        <section className="py-12 md:py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center">
              <motion.div 
                className="w-full md:w-1/2 mb-8 md:mb-0"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                  Search, explore and <span className="text-blue-600">book your room!</span>
                </h1>
                <p className="text-lg md:text-xl text-gray-700 mb-8">
                  Join thousands of students who found their ideal accommodation with CampusStay. 
                  Verified listings, secure booking, and a stress-free housing experience.
                </p>
                
                {/* Search Bar */}
                <div className="bg-white rounded-full shadow-md flex items-center p-2 mb-8">
                  <Search className="mx-3 text-gray-400" />
                  <Input 
                    type="text" 
                    placeholder="Search by city, university or property" 
                    className="border-0 focus:ring-0"
                  />
                  <Button size="sm" className="rounded-full bg-blue-600 hover:bg-blue-700">
                    <Search className="h-5 w-5" />
                  </Button>
                </div>

                {/* Stats */}
                <div className="flex justify-between mb-8">
                  <div className="text-center">
                    <p className="text-blue-600 font-bold text-xl">10+ years</p>
                    <p className="text-sm text-gray-500">Experience</p>
                  </div>
                  <div className="text-center">
                    <p className="text-blue-600 font-bold text-xl">20+</p>
                    <p className="text-sm text-gray-500">Cities</p>
                  </div>
                  <div className="text-center">
                    <p className="text-blue-600 font-bold text-xl">1000+</p>
                    <p className="text-sm text-gray-500">Properties</p>
                  </div>
                  <div className="text-center">
                    <p className="text-blue-600 font-bold text-xl">400+</p>
                    <p className="text-sm text-gray-500">Brokers</p>
                  </div>
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
                    <Image
                      src="/api/placeholder/600/400" 
                      width={600}
                      height={400}
                      alt="Student searching for accommodation" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
        
        {/* Student Accommodations Section */}
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold">Student Accommodation Students Love</h2>
              <Button variant="outline" size="sm" className="rounded-full">
                View all <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
            
            {/* Location Pills */}
            <div className="flex flex-wrap gap-2 mb-8">
              <span className="bg-black text-white px-4 py-1 rounded-full text-sm">All Regions</span>
              <span className="bg-white border border-gray-200 px-4 py-1 rounded-full text-sm">Dar es Salaam</span>
              <span className="bg-white border border-gray-200 px-4 py-1 rounded-full text-sm">Morogoro</span>
              <span className="bg-white border border-gray-200 px-4 py-1 rounded-full text-sm">Dodoma</span>
              <span className="bg-white border border-gray-200 px-4 py-1 rounded-full text-sm">Arusha</span>
              <span className="bg-white border border-gray-200 px-4 py-1 rounded-full text-sm">Mwanza</span>
            </div>
            
            {/* Featured Listings */}
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
            >
              {featuredListings.map((listing, index) => (
                <motion.div 
                  key={index}
                  variants={fadeIn}
                  className="bg-white rounded-xl overflow-hidden shadow-md"
                >
                  <div className="relative">
                    <Image 
                      src={listing.image} 
                      width={400}
                      height={250}
                      alt={listing.title} 
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-3 right-3 bg-blue-600 text-white px-2 py-1 rounded text-xs">
                      +{Math.floor(Math.random() * 5) + 3} photos
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-1">{listing.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">{listing.location}</p>
                    <div className="flex items-center mb-3">
                      <Star className="h-4 w-4 text-yellow-400" fill="currentColor" />
                      <span className="text-sm ml-1">{listing.rating}</span>
                      <span className="text-xs text-gray-500 ml-1">({listing.reviews} reviews)</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-gray-500 text-xs">From</span>
                        <p className="font-bold">TZS {listing.price} <span className="text-gray-500 font-normal text-xs">/ month</span></p>
                      </div>
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700">View Details</Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
        
        {/* Top Universities Section */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold">Top Universities</h2>
              <Button variant="outline" size="sm" className="rounded-full">
                View all <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-4 justify-center mb-8">
              {topUniversities.map((university, index) => (
                <Button 
                  key={index} 
                  variant="outline" 
                  className="border border-gray-200 rounded-md text-sm px-4 py-2"
                >
                  {university.name}
                </Button>
              ))}
            </div>
            
            {/* University Accommodation Examples */}
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
            >
              <motion.div variants={fadeIn} className="bg-white rounded-xl overflow-hidden shadow-md">
                <Image 
                  src="/api/placeholder/400/250" 
                  width={400}
                  height={250}
                  alt="Shared Accommodation" 
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h3 className="font-semibold">Shared Accommodation in City Center</h3>
                  <p className="text-sm text-gray-600">5 minute walk to University of Dar es Salaam</p>
                  <div className="mt-2">
                    <span className="text-gray-500 text-xs">From</span>
                    <p className="font-bold">TZS 65,000 <span className="text-gray-500 font-normal text-xs">/ month</span></p>
                  </div>
                </div>
              </motion.div>
              <motion.div variants={fadeIn} className="bg-white rounded-xl overflow-hidden shadow-md">
                <Image 
                  src="/api/placeholder/400/250" 
                  width={400}
                  height={250}
                  alt="UDSM Student Living" 
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h3 className="font-semibold">UDSM Student Living</h3>
                  <p className="text-sm text-gray-600">2 minute walk to University of Dar es Salaam</p>
                  <div className="mt-2">
                    <span className="text-gray-500 text-xs">From</span>
                    <p className="font-bold">TZS 75,000 <span className="text-gray-500 font-normal text-xs">/ month</span></p>
                  </div>
                </div>
              </motion.div>
              <motion.div variants={fadeIn} className="bg-white rounded-xl overflow-hidden shadow-md">
                <Image 
                  src="/api/placeholder/400/250" 
                  width={400}
                  height={250}
                  alt="IFM Student Living" 
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h3 className="font-semibold">IFM Student Living Top Floor</h3>
                  <p className="text-sm text-gray-600">On campus at IFM</p>
                  <div className="mt-2">
                    <span className="text-gray-500 text-xs">From</span>
                    <p className="font-bold">TZS 85,000 <span className="text-gray-500 font-normal text-xs">/ month</span></p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>
        {/* Booking Process Section */}
        <section className="py-16 bg-gradient-to-b from-yellow-100 to-yellow-50">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-2">Booking <span className="text-indigo-600">Process</span></h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div className="flex flex-col items-center">
                <div className="bg-white rounded-full w-12 h-12 flex items-center justify-center mb-4 shadow-md">
                  <MapPin className="text-indigo-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Step 1</h3>
                <p className="font-bold mb-1">Explore your city</p>
                <p className="text-sm text-center text-gray-600">
                  Discover the accommodation options available in your city. We offer no plan fee for all students.
                </p>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="bg-white rounded-full w-12 h-12 flex items-center justify-center mb-4 shadow-md">
                  <Search className="text-indigo-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Step 2</h3>
                <p className="font-bold mb-1">Submit an application</p>
                <p className="text-sm text-center text-gray-600">
                  Apply for the properties that interest you. We'll be with you every step of the way to guide you through your placement.
                </p>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="bg-white rounded-full w-12 h-12 flex items-center justify-center mb-4 shadow-md">
                  <Check className="text-indigo-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Step 3</h3>
                <p className="font-bold mb-1">Confirm your booking</p>
                <p className="text-sm text-center text-gray-600">
                  Select deposit and pay your fees securely. Our team is on hand to answer any questions at all.
                </p>
              </div>
            </div>
            
            <div className="text-center mt-8">
              <Button className="bg-indigo-600 hover:bg-indigo-700 rounded-full">
                Start Now <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </section>
        
        {/* Perfect Room Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center mb-10">
              <div className="w-full md:w-1/2 mb-8 md:mb-0">
                <h2 className="text-2xl font-bold mb-2">We Will Help You Find<br />Your <span className="text-indigo-600">Perfect Room!</span></h2>
              </div>
              
              <div className="w-full md:w-1/2 md:pl-8">
                <Image 
                  src="/api/placeholder/400/300" 
                  width={400}
                  height={300}
                  alt="Student in room" 
                  className="rounded-xl"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-yellow-100 p-6 rounded-xl">
                <div className="bg-yellow-300 w-10 h-10 rounded-full flex items-center justify-center mb-4">
                  <Clock className="text-yellow-800" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Price Match Promise</h3>
                <p className="text-sm text-gray-700">
                  If you find accommodation elsewhere at a lower price, we will match this price and pay you the difference.
                </p>
              </div>
              
              <div className="bg-indigo-50 p-6 rounded-xl">
                <div className="bg-indigo-200 w-10 h-10 rounded-full flex items-center justify-center mb-4">
                  <Shield className="text-indigo-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Perfect Home Guarantee</h3>
                <p className="text-sm text-gray-700">
                  We want to give you a peace of mind during your stay at your home away from home.
                </p>
              </div>
              
              <div className="bg-emerald-50 p-6 rounded-xl">
                <div className="bg-emerald-200 w-10 h-10 rounded-full flex items-center justify-center mb-4">
                  <ArrowRight className="text-emerald-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Instant Book Available</h3>
                <p className="text-sm text-gray-700">
                  We work with most reliable housing options to ensure accommodations listed have been carefully matched to your needs.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Testimonials Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-2">What <span className="text-indigo-600">Students</span> Say About Us?</h2>
            <div className="flex items-center mb-4">
              <p className="text-sm mr-2">Excellent</p>
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-green-500 mr-1" fill="currentColor" />
                ))}
              </div>
              <p className="text-sm ml-2">4.8 out of 5</p>
            </div>
            
            <div className="flex flex-col md:flex-row gap-6">
              <div className="w-full md:w-1/3">
                <div className="flex flex-col space-y-4">
                  <div className="bg-white p-4 rounded-xl shadow-sm flex items-center">
                    <Image 
                      src="/api/placeholder/60/60" 
                      width={60}
                      height={60}
                      alt="Student testimonial" 
                      className="rounded-full mr-4"
                    />
                    <p className="text-xl font-bold">+2M</p>
                  </div>
                  
                  <div className="bg-white p-4 rounded-xl shadow-sm">
                    <Image 
                      src="/api/placeholder/60/60" 
                      width={60}
                      height={60}
                      alt="Student testimonial" 
                      className="rounded-full mb-2"
                    />
                  </div>
                  
                  <div className="bg-white p-4 rounded-xl shadow-sm">
                    <Image 
                      src="/api/placeholder/60/60" 
                      width={60}
                      height={60}
                      alt="Student testimonial" 
                      className="rounded-full mb-2"
                    />
                  </div>
                </div>
              </div>
              
              <div className="w-full md:w-2/3">
                <div className="bg-yellow-50 p-6 rounded-xl border border-green-100">
                  <div className="flex justify-between mb-4">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 text-green-500 mr-1" fill="currentColor" />
                      ))}
                    </div>
                  </div>
                  
                  <p className="text-lg font-medium mb-4">"The process was very fast and..."</p>
                  <p className="text-gray-700 mb-6">
                    I was looking for a place to stay while studying and found a few hours to kill when the booking. The process was simple in case was responsive and always friendly.
                  </p>
                  
                  <div className="flex items-center">
                    <div className="bg-pink-100 w-10 h-10 rounded-full flex items-center justify-center mr-3">
                      <span className="text-pink-600 font-bold">JM</span>
                    </div>
                    <div>
                      <p className="font-medium">John M.</p>
                      <p className="text-sm text-gray-500">June 15</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
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
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-blue-700">
                  Learn More
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}