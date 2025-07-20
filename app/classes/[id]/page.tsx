'use client';

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Script from 'next/script';

export default function ClassDetailPage() {
  const params = useParams();
  const classId = params.id;
  
  // This would normally come from an API or database based on the classId
  // For now, we're hardcoding the Parent Tot class data
  const classData = {
    name: "Parent Tot",
    description: "This class is designed for children aged 1.5 to 3 years old, accompanied by a parent or caregiver. The class focuses on developing basic motor skills, coordination, and confidence through fun gymnastics activities.",
    imageUrl: "/images/placeholder.svg",
    benefits: [
      "Develop gross motor skills",
      "Enhance parent-child bonding",
      "Build confidence and social skills",
      "Introduce basic gymnastics concepts",
      "Prepare for independent classes"
    ],
    whatToBring: [
      "Comfortable clothes for both parent and child",
      "Water bottle",
      "Socks for parent"
    ],
    ageRange: "1.5 - 3"
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      {/* Page Header */}
      <section className="text-white py-12 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #9333ea 0%, #6b21a8 100%)' }}>
        {/* Floating decorative elements */}
        <div className="absolute top-10 left-10 w-16 h-16 bg-orange-400 rounded-lg rotate-12 opacity-70 animate-float"></div>
        <div className="absolute bottom-10 right-20 w-12 h-12 bg-cyan-400 rounded-full opacity-70 animate-float-delayed"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex items-center mb-4">
            <Link href="/classes" className="text-white hover:text-yellow-300 transition flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Back to Classes
            </Link>
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-3xl md:text-5xl font-bold mb-2">{classData.name}</h1>
            <div className="inline-block bg-yellow-300 text-indigo-900 px-4 py-2 rounded-lg rotate-1 mb-4">
              <h3 className="text-xl font-bold">Ages {classData.ageRange}</h3>
            </div>
          </motion.div>
        </div>
        
        {/* Cloud divider */}
        <div className="absolute bottom-0 left-0 w-full">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 100">
            <path
              fill="#f9fafb"
              fillOpacity="1"
              d="M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,48C672,43,768,53,864,64C960,75,1056,85,1152,82.7C1248,80,1344,64,1392,56L1440,48L1440,100L1392,100C1344,100,1248,100,1152,100C1056,100,960,100,864,100C768,100,672,100,576,100C480,100,384,100,288,100C192,100,96,100,48,100L0,100Z"
            ></path>
          </svg>
        </div>
      </section>
      
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Left Column - Class Info */}
          <div className="md:col-span-2 space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white rounded-xl shadow-lg p-8 relative overflow-hidden"
            >
              <div className="absolute -top-5 -right-5 w-24 h-24 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full opacity-10 blur-xl"></div>
              
              <h2 className="text-2xl font-bold text-purple-800 mb-4">Class Description</h2>
              <p className="text-gray-700 mb-6">{classData.description}</p>
              
              <h3 className="text-xl font-bold text-purple-800 mb-3">Benefits</h3>
              <ul className="space-y-2 mb-6">
                {classData.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-center">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                    <span className="text-gray-700">{benefit}</span>
                  </li>
                ))}
              </ul>
              
              <h3 className="text-xl font-bold text-purple-800 mb-3">What to Bring</h3>
              <ul className="space-y-2">
                {classData.whatToBring.map((item, index) => (
                  <li key={index} className="flex items-center">
                    <span className="w-2 h-2 bg-cyan-500 rounded-full mr-3"></span>
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
            
            {/* Class Schedule */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-white rounded-xl shadow-lg p-8 relative overflow-hidden"
              id="class-schedule"
            >
              <div className="absolute -bottom-5 -left-5 w-32 h-32 bg-gradient-to-tr from-cyan-400 to-blue-500 rounded-full opacity-10 blur-xl"></div>
              
              <h2 className="text-2xl font-bold text-purple-800 mb-6">Available Sessions</h2>
              
              {/* JackRabbit Class Schedule */}
              <div className="overflow-x-auto">
                <style jsx global>{`
                  table.openings,tr.openings,td.openings {
                    vertical-align: top;
                    font-family: inherit;
                    font-size: 0.95rem;
                    width: 100%;
                    border-collapse: collapse;
                  }
                  
                  table.openings td.amt {
                    text-align: right;
                    white-space: nowrap;
                  }
                  
                  table.openings tr:nth-child(even) {
                    background-color: #f9f5ff;
                  }
                  
                  table.openings tr:hover {
                    background-color: #f3e8ff;
                  }
                  
                  table.openings td {
                    padding: 0.75rem 1rem;
                    border: 1px solid #e9d5ff;
                  }
                  
                  table.openings tr:first-child {
                    background-color: #f3e8ff;
                    color: #6b21a8;
                    font-weight: bold;
                  }
                  
                  table.openings a {
                    display: inline-block;
                    background: linear-gradient(to right, #f97316, #ec4899);
                    color: white;
                    padding: 0.5rem 1rem;
                    border-radius: 0.375rem;
                    font-weight: 500;
                    text-decoration: none;
                    transition: all 0.3s;
                  }
                  
                  table.openings a:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
                  }
                `}</style>
                
                <Script
                  src={`https://app.jackrabbitclass.com/Openings.asp?id=514082&Cat1=Parent%20Tot&sortcols=Day&hidecols=Class%20Ends,Class%20Starts,Class%20Starts,Description,Session`}
                  strategy="afterInteractive"
                />
              </div>
            </motion.div>
          </div>
          
          {/* Right Column - Image and CTA */}
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="relative"
            >
              <div className="relative z-10 transform rotate-2 hover:rotate-0 transition duration-300">
                <img
                  src={classData.imageUrl}
                  alt={`${classData.name} class`}
                  className="rounded-lg shadow-xl w-full"
                  style={{ aspectRatio: '3/4', objectFit: 'cover' }}
                />
                <div className="absolute -top-4 -right-4 w-full h-full border-4 border-yellow-300 rounded-lg -z-10"></div>
              </div>
              
              {/* Decorative elements */}
              <div className="absolute -top-5 -right-5 w-24 h-24 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full opacity-30 blur-xl"></div>
              <div className="absolute -bottom-5 -left-5 w-32 h-32 bg-gradient-to-tr from-cyan-400 to-blue-500 rounded-full opacity-30 blur-xl"></div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="bg-gradient-to-br from-purple-600 to-pink-500 text-white rounded-xl p-6 shadow-lg relative overflow-hidden"
            >
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full opacity-30 blur-xl"></div>
              
              <h3 className="text-xl font-bold mb-4">Ready to Join?</h3>
              <p className="mb-6">Secure your spot in our popular Parent Tot class today! Limited spaces available.</p>
              
              <a 
                href="#class-schedule" 
                className="block w-full bg-white text-purple-700 text-center font-bold py-3 px-6 rounded-lg hover:bg-yellow-300 transition transform hover:-translate-y-1"
              >
                View Schedule & Register
              </a>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <h3 className="text-xl font-bold text-purple-800 mb-4">Have Questions?</h3>
              <p className="text-gray-700 mb-4">Contact us for more information about our Parent Tot class or any other programs.</p>
              
              <a 
                href="/contact" 
                className="block w-full border-2 border-purple-600 text-purple-600 text-center font-bold py-3 px-6 rounded-lg hover:bg-purple-600 hover:text-white transition"
              >
                Contact Us
              </a>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
