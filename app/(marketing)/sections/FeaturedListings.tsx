import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ArrowRight, Star } from 'lucide-react';
import { fadeIn, scaleIn, staggerContainer } from '@/utils/motion';

export default function FeaturedListings() {
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
            className={`px-4 py-1 rounded-full text-sm cursor-pointer transition-colors duration-300 ${index === 0
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
  )
}
