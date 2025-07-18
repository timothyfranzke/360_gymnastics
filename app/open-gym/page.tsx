'use client';

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

export default function OpenGymPage() {
  useEffect(() => {
    // Load the Jackrabbit calendar script if it doesn't exist
    const existingScript = document.querySelector('script[src*="jackrabbitclass.com"]');
    if (!existingScript) {
      const script = document.createElement('script');
      script.src = 'https://app.jackrabbitclass.com/eventcalendar.asp?orgid=514082';
      script.async = true;
      document.head.appendChild(script);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12" >
      {/* Page Header */}
      <div className="bg-gradient-to-r from-indigo-800 to-purple-800 text-white py-16">
        <div className="container mx-auto px-4 bg-gradient-to-r from-purple-600 to-indigo-600 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Open Gym</h1>
            <p className="text-xl text-indigo-200 max-w-2xl mx-auto">
              Join us for structured practice time and open play sessions
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Structured Open Gym Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-xl shadow-lg p-8 mb-12"
        >
          <h2 className="text-3xl font-bold text-center text-indigo-800 mb-6">
            Structured Open Gym
          </h2>
          <div className="text-center mb-6">
            <p className="text-lg text-gray-700 mb-4">
              <strong>Sundays from 5:30-7pm</strong> we offer a structured open gym for gymnasts who want to work on improving their skills. 
              <span className="text-red-600 font-semibold"> Playtime is NOT PERMITTED</span> during this open gym.
            </p>
            <p className="text-lg text-gray-700 mb-4">
              We will have an experienced coach available to spot, set up stations and offer corrections.
            </p>
            <p className="text-lg text-gray-700">
              See the Open Gym calendar below to register.
            </p>
          </div>
          
          {/* Decorative separator */}
          <div className="border-t-2 border-gray-200 my-8"></div>
        </motion.div>

        {/* Open Gym Options */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* 6 & Under Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-white rounded-xl shadow-lg p-8"
          >
            <h2 className="text-2xl font-bold text-center text-purple-800 mb-4">
              Open Gym For 6 & Under Only
            </h2>
            <p className="text-center font-semibold text-red-600 mb-6">
              Parents must accompany child(ren)
            </p>
            
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-purple-200">
                  <span className="font-semibold text-purple-800">Monday</span>
                  <span className="text-indigo-700 font-bold">12noon-1pm – $5</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-purple-200">
                  <span className="font-semibold text-purple-800">Wednesday</span>
                  <span className="text-indigo-700 font-bold">12noon-1pm – $5</span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="font-semibold text-purple-800">Friday</span>
                  <span className="text-indigo-700 font-bold">12noon-1pm – $5</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* 16 & Under Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-white rounded-xl shadow-lg p-8"
          >
            <h2 className="text-2xl font-bold text-center text-cyan-800 mb-4">
              Open Gym For 16 and under
            </h2>
            <p className="text-center font-semibold text-red-600 mb-6">
              Parents must accompany child(ren) if under 6 years old
            </p>
            
            <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-lg p-6">
              <div className="text-center">
                <div className="py-4">
                  <span className="font-semibold text-cyan-800 text-lg">Saturday:</span>
                  <span className="text-blue-700 font-bold text-lg ml-4">2pm-3:30pm – $10</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Registration Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="bg-white rounded-xl shadow-lg p-8 mb-12"
        >
          <div className="text-center">
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 mb-6">
              <h3 className="text-xl font-bold text-yellow-800 mb-4">Important Registration Information</h3>
              <div className="space-y-2 text-left">
                <p className="text-yellow-700 font-semibold">• Pre-registration is required for all open gyms.</p>
                <p className="text-yellow-700 font-semibold">• Register by clicking the date in the calendar below.</p>
                <p className="text-yellow-700 font-semibold">• Minimum number of participants is required.</p>
              </div>
              <p className="text-yellow-600 text-sm mt-4 italic">
                See times and cost above (Pricing may change for holiday open gym times)
              </p>
            </div>
            
            <div className="flex items-center justify-center mb-6">
              <div className="h-px bg-gray-300 flex-1"></div>
              <span className="px-6 text-2xl font-bold text-indigo-800">Open Gym Calendar</span>
              <div className="h-px bg-gray-300 flex-1"></div>
            </div>
          </div>
        </motion.div>

        {/* Calendar Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="bg-white rounded-xl shadow-lg p-4"
        >
          <div className="calendar-container">
            <iframe
              className="w-full h-[650px] rounded-lg"
              src="https://app.jackrabbitclass.com/eventcalendar.asp?orgid=514082"
              frameBorder="0"
              scrolling="yes"
              title="Open Gym Registration Calendar"
            />
          </div>
        </motion.div>

        {/* Additional Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="mt-12 text-center"
        >
          <div className="bg-indigo-800 text-white rounded-xl p-8">
            <h3 className="text-2xl font-bold mb-4">Questions about Open Gym?</h3>
            <p className="text-indigo-200 mb-6">
              Contact us for more information about our open gym sessions and registration process.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="tel:9137823300"
                className="bg-white text-indigo-800 font-bold py-3 px-6 rounded-lg hover:bg-gray-100 transition duration-300 flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                (913) 782-3300
              </a>
              <a
                href="/contact"
                className="border-2 border-white text-white font-bold py-3 px-6 rounded-lg hover:bg-white hover:text-indigo-800 transition duration-300"
              >
                Contact Us
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}