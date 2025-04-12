import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { fadeIn} from '@/utils/motion';
import { ArrowRight } from 'lucide-react';
export default function CallSection() {
  return (
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
  )
}
