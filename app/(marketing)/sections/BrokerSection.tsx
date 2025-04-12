import {motion} from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, BarChart, DollarSign, Users } from 'lucide-react';
import { fadeIn, scaleIn, staggerContainer } from '@/utils/motion';
export default function BrokerSection() {
  return (
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
  )
}
