import { motion } from 'framer-motion';
import Image from 'next/image';
import {Clock,Shield,ArrowRight } from 'lucide-react';
import { fadeIn, scaleIn, staggerContainer } from '@/utils/motion';
export default function RoomSection() {
  return (
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
  )
}
