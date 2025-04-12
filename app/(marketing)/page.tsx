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
  Users,
  DollarSign,
  BarChart,
} from 'lucide-react';
import Header from './Header';
import Footer from './Footer';
import Image from 'next/image';
import Hero from './Hero';

export default function HomePage() {
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
    viewport: { once: true },
  };

  const scaleIn = {
    initial: { opacity: 0, scale: 0.95 },
    whileInView: { opacity: 1, scale: 1 },
    transition: { duration: 0.5 },
    viewport: { once: true },
  };

  const staggerContainer = {
    initial: {},
    whileInView: {
      transition: {
        staggerChildren: 0.1,
      },
    },
    viewport: { once: true },
  };

  const topUniversities = [
    { name: 'University of Dar es Salaam', logo: '/placeholder-logo.png' },
    { name: 'IFM', logo: '/placeholder-logo.png' },
    { name: 'DIT', logo: '/placeholder-logo.png' },
    { name: 'University of Dodoma', logo: '/placeholder-logo.png' },
  ];

  const featuredListings = [
    {
      title: 'Modern Apartment near UDSM',
      location: '5 minutes from University of Dar es Salaam',
      price: '120,000',
      rating: 4.8,
      reviews: 24,
      image: '/bedroom.jpg',
    },
    {
      title: 'Student Hostel at Mikocheni',
      location: '10 minutes from IFM campus',
      price: '85,000',
      rating: 4.5,
      reviews: 18,
      image: '/appartments.jpeg',
    },
    {
      title: 'Shared Accommodation in Ubungo',
      location: 'Walking distance to DIT',
      price: '65,000',
      rating: 4.6,
      reviews: 32,
      image: '/appartments-1.jpg',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />
      <main>
        {/* Hero Section */}
        <Hero/>
        <section id="home" className="py-16 md:py-24 bg-gradient-to-b from-card to-muted">
          <div className="container mx-auto px-4">
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

        {/* Featured Listings Section */}
        <section id="listings" className="py-16 bg-muted">
          <div className="container mx-auto px-4">
            <motion.div
              className="flex justify-between items-center mb-8"
              variants={fadeIn}
              initial="initial"
              whileInView="whileInView"
            >
              <h2 className="text-3xl font-bold">Student Accommodations Students Love</h2>
              <Button variant="outline" size="sm" className="rounded-full hover:bg-primary hover:text-primary-foreground">
                View all <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </motion.div>
            <motion.div
              className="flex flex-wrap gap-2 mb-8"
              variants={staggerContainer}
              initial="initial"
              whileInView="whileInView"
            >
              {['All Regions', 'Dar es Salaam', 'Morogoro', 'Dodoma', 'Arusha', 'Mwanza'].map((region, index) => (
                <motion.span
                  key={index}
                  variants={fadeIn}
                  className={`px-4 py-1 rounded-full text-sm cursor-pointer transition-colors duration-300 ${
                    index === 0
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-card border border-border hover:bg-primary/10'
                  }`}
                >
                  {region}
                </motion.span>
              ))}
            </motion.div>
            <motion.div
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
              variants={staggerContainer}
              initial="initial"
              whileInView="whileInView"
            >
              {featuredListings.map((listing, index) => (
                <motion.div
                  key={index}
                  variants={scaleIn}
                  className="bg-card rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
                >
                  <div className="relative">
                    <Image
                      src={listing.image}
                      width={400}
                      height={250}
                      alt={listing.title}
                      className="w-full h-48 object-cover transform hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 right-3 bg-primary text-primary-foreground px-2 py-1 rounded text-xs">
                      5 photos
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="font-semibold text-lg mb-2">{listing.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{listing.location}</p>
                    <div className="flex items-center mb-4">
                      <Star className="h-4 w-4 text-yellow-400" fill="currentColor" />
                      <span className="text-sm ml-1">{listing.rating}</span>
                      <span className="text-xs text-muted-foreground ml-1">({listing.reviews} reviews)</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-muted-foreground text-xs">From</span>
                        <p className="font-bold">
                          TZS {listing.price} <span className="text-muted-foreground font-normal text-xs">/ month</span>
                        </p>
                      </div>
                      <Button size="sm" className="btn-primary">
                        View Details
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Top Universities Section */}
        <section id="universities" className="py-16 bg-card">
          <div className="container mx-auto px-4">
            <motion.div
              className="flex justify-between items-center mb-8"
              variants={fadeIn}
              initial="initial"
              whileInView="whileInView"
            >
              <h2 className="text-3xl font-bold">Top Universities</h2>
              <Button variant="outline" size="sm" className="rounded-full hover:bg-primary hover:text-primary-foreground">
                View all <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </motion.div>
            <motion.div
              className="flex flex-wrap gap-4 justify-center mb-12"
              variants={staggerContainer}
              initial="initial"
              whileInView="whileInView"
            >
              {topUniversities.map((university, index) => (
                <motion.div key={index} variants={fadeIn}>
                  <Button
                    variant="outline"
                    className="border border-border rounded-lg text-sm px-6 py-3 hover:bg-primary hover:text-primary-foreground transition-colors duration-300"
                  >
                    {university.name}
                  </Button>
                </motion.div>
              ))}
            </motion.div>
            <motion.div
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
              variants={staggerContainer}
              initial="initial"
              whileInView="whileInView"
            >
              {[
                {
                  title: 'Shared Accommodation in City Center',
                  location: '5 minute walk to University of Dar es Salaam',
                  price: '65,000',
                },
                {
                  title: 'UDSM Student Living',
                  location: '2 minute walk to University of Dar es Salaam',
                  price: '75,000',
                },
                {
                  title: 'IFM Student Living Top Floor',
                  location: 'On campus at IFM',
                  price: '85,000',
                },
              ].map((listing, index) => (
                <motion.div
                  key={index}
                  variants={scaleIn}
                  className="bg-card rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
                >
                  <Image
                    src="/images/placeholder.jpg"
                    width={400}
                    height={250}
                    alt={listing.title}
                    className="w-full h-48 object-cover transform hover:scale-105 transition-transform duration-500"
                  />
                  <div className="p-6">
                    <h3 className="font-semibold text-lg mb-2">{listing.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{listing.location}</p>
                    <div>
                      <span className="text-muted-foreground text-xs">From</span>
                      <p className="font-bold">
                        TZS {listing.price} <span className="text-muted-foreground font-normal text-xs">/ month</span>
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Broker Section */}
        <section id="brokers" className="py-16 bg-gradient-to-b from-emerald-50 to-emerald-100">
          <div className="container mx-auto px-4">
            <motion.div
              className="text-center mb-12"
              variants={fadeIn}
              initial="initial"
              whileInView="whileInView"
            >
              <h2 className="text-3xl font-bold mb-4">
                Join CampusStay as a <span className="text-primary">Broker</span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Partner with us to list your properties, reach thousands of students, and grow your business with ease.
              </p>
            </motion.div>
            <motion.div
              className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
              variants={staggerContainer}
              initial="initial"
              whileInView="whileInView"
            >
              {[
                {
                  icon: <Users className="text-emerald-600" />,
                  title: 'Wide Audience',
                  description: 'Access a large pool of students searching for accommodations near universities.',
                },
                {
                  icon: <DollarSign className="text-emerald-600" />,
                  title: 'Hassle-Free Earnings',
                  description: 'List properties effortlessly and earn competitive commissions with secure payments.',
                },
                {
                  icon: <BarChart className="text-emerald-600" />,
                  title: 'Grow Your Business',
                  description: 'Leverage our platform’s tools to manage listings and track performance.',
                },
              ].map((benefit, index) => (
                <motion.div
                  key={index}
                  variants={scaleIn}
                  className="bg-card p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300"
                >
                  <div className="bg-emerald-200 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                    {benefit.icon}
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground">{benefit.description}</p>
                </motion.div>
              ))}
            </motion.div>
            <motion.div
              className="text-center"
              variants={fadeIn}
              initial="initial"
              whileInView="whileInView"
            >
              <Button className="btn-primary rounded-full text-lg px-8 py-3">
                Become a Broker <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </motion.div>
          </div>
        </section>

        {/* Booking Process Section */}
      

        {/* Perfect Room Section */}
        <section className="py-16 bg-card">
          <div className="container mx-auto px-4">
            <motion.div
              className="flex flex-col md:flex-row items-center mb-12 gap-8"
              variants={fadeIn}
              initial="initial"
              whileInView="whileInView"
            >
              <div className="w-full md:w-1/2">
                <h2 className="text-3xl font-bold mb-4">
                  We Will Help You Find<br />
                  Your <span className="text-primary">Perfect Room!</span>
                </h2>
              </div>
              <motion.div
                className="w-full md:w-1/2"
                variants={scaleIn}
                initial="initial"
                whileInView="whileInView"
              >
                <Image
                  src="/student-room3.jpg"
                  width={400}
                  height={300}
                  alt="Student in room"
                  className="rounded-xl shadow-lg transform hover:scale-105 transition-transform duration-500"
                />
              </motion.div>
            </motion.div>
            <motion.div
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
              variants={staggerContainer}
              initial="initial"
              whileInView="whileInView"
            >
              {[
                {
                  icon: <Clock className="text-yellow-600" />,
                  title: 'Price Match Promise',
                  description:
                    'Find a lower price elsewhere, and we’ll match it plus pay the difference.',
                  bg: 'bg-yellow-100',
                  iconBg: 'bg-yellow-300',
                },
                {
                  icon: <Shield className="text-primary" />,
                  title: 'Perfect Home Guarantee',
                  description: 'Enjoy peace of mind with a home that feels just right.',
                  bg: 'bg-primary/5',
                  iconBg: 'bg-primary/20',
                },
                {
                  icon: <ArrowRight className="text-emerald-600" />,
                  title: 'Instant Book Available',
                  description: 'Book reliable accommodations tailored to your needs instantly.',
                  bg: 'bg-emerald-50',
                  iconBg: 'bg-emerald-200',
                },
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  variants={scaleIn}
                  className={`${feature.bg} p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300`}
                >
                  <div
                    className={`${feature.iconBg} w-10 h-10 rounded-full flex items-center justify-center mb-4`}
                  >
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-16 bg-muted">
          <div className="container mx-auto px-4">
            <motion.h2
              className="text-3xl font-bold mb-4"
              variants={fadeIn}
              initial="initial"
              whileInView="whileInView"
            >
              What <span className="text-primary">Students</span> Say About Us?
            </motion.h2>
            <motion.div
              className="flex items-center mb-8"
              variants={fadeIn}
              initial="initial"
              whileInView="whileInView"
            >
              <p className="text-sm mr-2">Excellent</p>
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-emerald-500 mr-1" fill="currentColor" />
                ))}
              </div>
              <p className="text-sm ml-2">4.8 out of 5</p>
            </motion.div>
            <motion.div
              className="flex flex-col md:flex-row gap-6"
              variants={staggerContainer}
              initial="initial"
              whileInView="whileInView"
            >
              <motion.div className="w-full md:w-1/3" variants={fadeIn}>
                <div className="flex flex-col space-y-4">
                  {[
                    { value: '+2M', alt: 'Total bookings' },
                    { value: '', alt: 'Student testimonial' },
                    { value: '', alt: 'Student testimonial' },
                  ].map((item, index) => (
                    <motion.div
                      key={index}
                      className="bg-card p-4 rounded-xl shadow-sm flex items-center"
                      variants={scaleIn}
                    >
                      <Image
                        src="/images/placeholder.jpg"
                        width={60}
                        height={60}
                        alt={item.alt}
                        className="rounded-full mr-4"
                      />
                      {item.value && <p className="text-xl font-bold">{item.value}</p>}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
              <motion.div className="w-full md:w-2/3" variants={fadeIn}>
                <div className="bg-yellow-50 p-6 rounded-xl border border-emerald-100 shadow-lg">
                  <div className="flex justify-between mb-4">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 text-emerald-500 mr-1" fill="currentColor" />
                      ))}
                    </div>
                  </div>
                  <p className="text-lg font-medium mb-4">"The process was very fast and..."</p>
                  <p className="text-muted-foreground mb-6">
                    I was looking for a place to stay while studying and found a few hours to kill when the booking. The
                    process was simple in case was responsive and always friendly.
                  </p>
                  <div className="flex items-center">
                    <div className="bg-primary/20 w-10 h-10 rounded-full flex items-center justify-center mr-3">
                      <span className="text-primary font-bold">JM</span>
                    </div>
                    <div>
                      <p className="font-medium">John M.</p>
                      <p className="text-sm text-muted-foreground">June 15</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section id="contact" className="py-16 bg-primary">
          <div className="container mx-auto px-4">
            <motion.div
              className="max-w-3xl mx-auto text-center"
              variants={fadeIn}
              initial="initial"
              whileInView="whileInView"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-primary-foreground">
                Ready to Find Your Perfect Campus Stay?
              </h2>
              <p className="text-xl text-primary-foreground/80 mb-8">
                Join thousands of students who have found their ideal accommodation near campus.
              </p>
              <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                <Button size="lg" className="bg-card text-primary hover:bg-card/90">
                  Get Started <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-card text-card hover:bg-card hover:text-primary"
                >
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