import { motion } from 'framer-motion';
import Image from 'next/image';
import { Star } from 'lucide-react';
import { fadeIn, scaleIn, staggerContainer } from '@/utils/motion';
export default function Testmonials() {
  return (
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
              { value: '+50k', alt: 'Student testimonial' },
              { value: '+30k', alt: 'Student testimonial' },
            ].map((item, index) => (
              <motion.div
                key={index}
                className="bg-card p-4 rounded-xl shadow-sm flex items-center"
                variants={scaleIn}
              >
                <Image
                  src="/student-room.jpg"
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

  )
}
