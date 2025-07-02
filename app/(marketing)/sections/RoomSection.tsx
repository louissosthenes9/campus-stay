'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Clock, Shield, ArrowRight } from 'lucide-react';
import { fadeIn, scaleIn, staggerContainer } from '@/utils/motion';

export default function RoomSection() {
 

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 via-white to-blue-50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-20 right-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-yellow-400/5 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header Section */}
        <motion.div
          className="flex flex-col lg:flex-row items-center mb-16 gap-12"
          variants={fadeIn}
          initial="initial"
          whileInView="whileInView"
          viewport={{ once: true }}
        >
          <div className="w-full lg:w-1/2 text-center lg:text-left">
            <motion.h2 
              className="text-4xl lg:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-800 to-primary bg-clip-text text-transparent leading-tight"
              variants={fadeIn}
            >
              We Will Help You Find<br />
              Your <span className="text-primary">Perfect Room!</span>
            </motion.h2>
            <motion.p 
              className="text-lg text-gray-600 mb-8 max-w-lg"
              variants={fadeIn}
            >
              Discover amazing student accommodations that fit your budget and lifestyle. From affordable options to premium stays.
            </motion.p>
          </div>
          
          <motion.div
            className="w-full lg:w-1/2 relative"
            variants={scaleIn}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true }}
          >
            <div className="relative">
              <Image
                src="/student-room3.jpg"
                width={500}
                height={400}
                alt="Student in room"
                className="rounded-3xl shadow-2xl transform hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl p-4 shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Shield className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Verified Properties</p>
                    <p className="text-xs text-gray-600">100% Safe & Secure</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Features Section */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16"
          variants={staggerContainer}
          initial="initial"
          whileInView="whileInView"
          viewport={{ once: true }}
        >
          {[
            {
              icon: <Clock className="text-yellow-600" />,
              title: 'Price Match Promise',
              description: 'Find a lower price elsewhere, and we\'ll match it plus pay the difference.',
              bg: 'bg-gradient-to-br from-yellow-50 to-orange-50',
              iconBg: 'bg-gradient-to-br from-yellow-400 to-orange-400',
            },
            {
              icon: <Shield className="text-white" />,
              title: 'Perfect Home Guarantee',
              description: 'Enjoy peace of mind with a home that feels just right.',
              bg: 'bg-gradient-to-br from-primary/5 to-blue-50',
              iconBg: 'bg-gradient-to-br from-primary to-blue-600',
            },
            {
              icon: <ArrowRight className="text-white" />,
              title: 'Instant Book Available',
              description: 'Book reliable accommodations tailored to your needs instantly.',
              bg: 'bg-gradient-to-br from-emerald-50 to-teal-50',
              iconBg: 'bg-gradient-to-br from-emerald-500 to-teal-600',
            },
          ].map((feature, index) => (
            <motion.div
              key={index}
              variants={scaleIn}
              className={`${feature.bg} p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-white/50 backdrop-blur-sm`}
            >
              <div
                className={`${feature.iconBg} w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-lg`}
              >
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-800">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}