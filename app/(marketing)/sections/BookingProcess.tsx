import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
    Search,
    MapPin,
    ArrowRight,
    Check,
  } from 'lucide-react';
import { fadeIn, scaleIn, staggerContainer } from '@/utils/motion';
export default function BookingProcess() {
   
  return (
    <section className="py-16 bg-gradient-to-b from-yellow-50 to-yellow-100">
    <div className="container mx-auto px-4">
      <motion.h2
        className="text-3xl font-bold mb-12 text-center"
        variants={fadeIn}
        initial="initial"
        whileInView="whileInView"
      >
        Booking <span className="text-primary">Process</span>
      </motion.h2>
      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-8"
        variants={staggerContainer}
        initial="initial"
        whileInView="whileInView"
      >
        {[
          {
            icon: <MapPin className="text-primary" />,
            step: 'Step 1',
            title: 'Explore detailed listings around your  university',
            description: 'Discover accommodation options in your city with no plan fee for students.',
          },
          {
            icon: <Search className="text-primary" />,
            step: 'Step 2',
            title: 'Submit an application and  contact broker',
            description: 'Apply for properties with guided support every step of the way.',
          },
          {
            icon: <Check className="text-primary" />,
            step: 'Step 3',
            title: 'Plan your visit and pay physically after you`ve seen the property',
            description: 'Pay for your accommodation after you have seen the property.',
          },
        ].map((step, index) => (
          <motion.div
            key={index}
            variants={scaleIn}
            className="flex flex-col items-center text-center"
          >
            <div className="bg-card rounded-full w-12 h-12 flex items-center justify-center mb-4 shadow-md">
              {step.icon}
            </div>
            <h3 className="text-lg font-semibold mb-2">{step.step}</h3>
            <p className="font-bold mb-2">{step.title}</p>
            <p className="text-sm text-muted-foreground">{step.description}</p>
          </motion.div>
        ))}
      </motion.div>
      <motion.div
        className="text-center mt-12"
        variants={fadeIn}
        initial="initial"
        whileInView="whileInView"
      >
        <Button className="btn-primary rounded-full text-lg px-8 py-3">
          Start Now <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </motion.div>
    </div>
  </section>
  )
}
