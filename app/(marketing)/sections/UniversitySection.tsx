import { ArrowRight } from 'lucide-react'
import { fadeIn, scaleIn, staggerContainer } from '@/utils/motion';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
export default function UniversitySection() {
    //todo fectch from db
    const topUniversities = [
      { name: 'University of Dar es Salaam', logo: '/placeholder-logo.png' },
      { name: 'IFM', logo: '/placeholder-logo.png' },
      { name: 'DIT', logo: '/placeholder-logo.png' },
      { name: 'University of Dodoma', logo: '/placeholder-logo.png' },
    ];

  return (
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
              src="/student-room4.jpg"
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
  )
}
