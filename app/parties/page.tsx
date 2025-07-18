'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';

export default function PartiesPage() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    canText: '',
    email: '',
    city: '',
    partyType: '',
    dateRequested: '',
    timeRequested: '',
    childName: '',
    childAge: '',
    childQty: '',
    message: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = () => {
    // Handle form submission here
    console.log('Form submitted:', formData);
    alert('Thank you for your party request! We will contact you soon to confirm your booking.');
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      {/* Page Header */}
      <section className="text-white py-16 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #9333ea 0%, #6b21a8 100%)' }}>
        {/* Floating decorative elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-orange-400 rounded-lg rotate-12 opacity-70 animate-float"></div>
        <div className="absolute top-20 right-20 w-16 h-16 bg-cyan-400 rounded-full opacity-70 animate-float-delayed"></div>
        <div className="absolute bottom-40 left-1/4 w-12 h-12 bg-pink-400 rounded-lg rotate-45 opacity-70 animate-float"></div>
        <div className="absolute top-1/3 right-1/3 w-10 h-10 bg-yellow-300 rounded-full opacity-70 animate-float-delayed"></div>
        
        {/* Decorative elements */}
        <div className="absolute -top-5 -right-5 w-24 h-24 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full opacity-70 blur-xl"></div>
        <div className="absolute -bottom-5 -left-5 w-32 h-32 bg-gradient-to-tr from-cyan-400 to-blue-500 rounded-full opacity-70 blur-xl"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-4">Birthday Parties</h1>
            <p className="text-xl text-pink-100 max-w-3xl mx-auto">
              Make your child's special day unforgettable with a gymnastics party at 360 Gymnastics!
            </p>
          </motion.div>
        </div>
        <div className="container mx-auto px-4 relative z-10 flex justify-center mt-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-wrap gap-4"
          >
            <a href="/parties#reserve" className="bg-gradient-to-r from-orange-400 to-pink-500 hover:from-orange-500 hover:to-pink-600 transition text-white font-bold py-3 px-6 rounded-lg shadow-lg transform hover:-translate-y-1 hover:scale-105">Reserve Now</a>
            <a href="#party-types" className="bg-white bg-opacity-20 hover:bg-opacity-30 border-2 border-white hover:border-yellow-300 transition font-bold py-3 px-6 rounded-lg transform hover:-translate-y-1 hover:scale-105">View Party Types</a>
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
        {/* Party Hero Section */}
        <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <img 
              src="/images/gym0.jpg" 
              alt="Birthday party at 360 Gymnastics" 
              className="rounded-xl shadow-lg w-full"
              style={{ aspectRatio: '3/4' }}
            />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="space-y-6"
          >
            <h2 className="text-3xl font-bold text-center text-purple-800">
              360 Gymnastics is a great place to have your next birthday party!
            </h2>
            <div className="inline-block bg-yellow-300 text-indigo-900 px-4 py-2 rounded-lg rotate-2 mb-6 mx-auto">
              <h3 className="text-xl md:text-2xl font-bold">Book your party today!</h3>
            </div>
            <p className="text-center text-lg text-gray-700">
              Come play and have fun in our gym! Perfect for birthday parties, school field trips, 
              scouting events, or any other special celebration.
            </p>
            
            <div className="bg-gradient-to-r from-yellow-400 to-orange-400 rounded-xl p-6 text-center">
              <h3 className="text-xl font-bold text-indigo-900 mb-2">
                Every party gets one hour of gym time &
              </h3>
              <h3 className="text-xl font-bold text-indigo-900">
                30 minutes in one of our private party rooms!
              </h3>
            </div>
            
            <div className="bg-red-50 border-l-4 border-red-400 p-4">
              <p className="text-red-700 font-semibold text-center">
                *** $50 non-refundable deposit REQUIRED to hold reservation ***
              </p>
            </div>
          </motion.div>
        </div>

        {/* What We Provide Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-white rounded-xl shadow-lg p-8 mb-12"
        >
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6">
              <h3 className="text-2xl font-bold text-green-800 mb-4 text-center">We Provide:</h3>
              <ul className="space-y-3 text-green-700">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  30 minutes in a party room
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  A FUN and memorable time
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  Great space to burn off some energy
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  Cleanup
                </li>
              </ul>
            </div>
            
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6">
              <h3 className="text-2xl font-bold text-blue-800 mb-4 text-center">You Provide:</h3>
              <ul className="space-y-3 text-blue-700">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                  Tableware (plates, napkins, tablecloth)
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                  Your own food and drinks (refrigerator available upon request)
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                  The kids!
                </li>
              </ul>
            </div>
          </div>
          
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Party waivers will need to be signed for each child by parents upon drop off
            </p>
            <p className="text-gray-600">
              (Or copies can be printed and distributed prior to your party)
            </p>
          </div>
        </motion.div>

        {/* Party Types */}
        <div id="party-types" className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Private Party */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="bg-gradient-to-br from-purple-600 to-pink-500 text-white rounded-xl p-8 shadow-lg relative overflow-hidden"
          >
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full opacity-30 blur-xl"></div>
            <h2 className="text-2xl font-bold mb-4">Private Party</h2>
            <p className="mb-6">
              Our parties are structured and scheduled outside of open gym and class times so your kids get to take over the gym! 
              You have a gym instructor leading your child and friends through an obstacle course, games, assistance on the equipment, and free time!
            </p>
            
            <div className="bg-white bg-opacity-20 rounded-lg p-4 mb-4">
              <h3 className="font-bold mb-2">Schedule includes:</h3>
              <ul className="space-y-1">
                <li>• 30 minutes in the party room</li>
                <li>• 60 minutes in the gym with an instructor</li>
                <li>• Tons of FUN!</li>
              </ul>
            </div>
            
            <div className="bg-white bg-opacity-20 rounded-lg p-4 mb-4">
              <h3 className="font-bold mb-2">Cost:</h3>
              <p>$200 (for 15 kids including birthday child)</p>
              <p>Additional children – $10 each</p>
            </div>
            
            <div className="bg-white bg-opacity-20 rounded-lg p-4">
              <h3 className="font-bold mb-2">Hours available:</h3>
              <p>Friday – after 5pm</p>
              <p>Saturday – after 3pm</p>
              <p>Sunday – all day</p>
              <p className="text-sm mt-2">(scheduled when no other activities are going on)</p>
            </div>
          </motion.div>

          {/* Open Gym Party */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="bg-gradient-to-br from-cyan-500 to-blue-500 text-white rounded-xl p-8 shadow-lg relative overflow-hidden"
          >
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-tr from-cyan-400 to-blue-500 rounded-full opacity-30 blur-xl"></div>
            <h2 className="text-2xl font-bold mb-4">Open Gym Party</h2>
            <p className="mb-6">
              Your party takes place during our regularly scheduled open gym time. The children have access to all of the equipment to play and have fun. 
              This includes 30 minutes in the party room prior to open gym.
            </p>
            
            <div className="bg-white bg-opacity-20 rounded-lg p-4 mb-4">
              <h3 className="font-bold mb-2">Schedule includes:</h3>
              <ul className="space-y-1">
                <li>• 30 minutes in the party room</li>
                <li>• 60 minutes in the gym during open gym</li>
                <li>• Tons of FUN!</li>
              </ul>
            </div>
            
            <div className="bg-white bg-opacity-20 rounded-lg p-4 mb-4">
              <h3 className="font-bold mb-2">Cost:</h3>
              <p>$150 (for 15 kids including birthday child)</p>
              <p>Additional children – $8 each</p>
            </div>
            
            <div className="bg-white bg-opacity-20 rounded-lg p-4">
              <h3 className="font-bold mb-2">Hours available:</h3>
              <p>Monday, Wednesday, Friday – 12-1 pm</p>
              <p>Saturday – 2-3:30 pm</p>
            </div>
          </motion.div>
        </div>

        {/* Groups/Field Trips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="bg-gradient-to-r from-orange-400 to-yellow-400 text-indigo-900 rounded-xl p-8 mb-12 shadow-lg relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-16 h-16 bg-yellow-300 rounded-full opacity-30 -mr-6 -mt-6"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-orange-500 rounded-full opacity-30 -ml-6 -mb-6"></div>
          <h2 className="text-2xl font-bold mb-4 text-center">Groups/Field Trips</h2>
          <p className="text-center text-lg">
            Don't need a party room but have a large group of kids for open gym – contact us about our Group Rate!
          </p>
        </motion.div>

        {/* Booking Form */}
        <motion.div
          id="reserve"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="bg-white rounded-xl shadow-lg p-8 relative overflow-hidden"
        >
          <div className="absolute -top-5 -right-5 w-24 h-24 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full opacity-10 blur-xl"></div>
          <div className="absolute -bottom-5 -left-5 w-32 h-32 bg-gradient-to-tr from-cyan-400 to-blue-500 rounded-full opacity-10 blur-xl"></div>
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-purple-800 mb-4">RESERVE ONLINE</h2>
            <div className="inline-block bg-yellow-300 text-indigo-900 px-4 py-2 rounded-lg rotate-1 mb-4">
              <h3 className="text-xl font-bold">Book your special day!</h3>
            </div>
            <p className="text-lg text-gray-700 mb-4">
              **ALL BIRTHDAY PARTY REQUESTS ARE HANDLED ONLINE THROUGH THE BELOW REQUEST FORM AND EMAIL.**
            </p>
            <div className="bg-red-50 border-l-4 border-red-400 p-4 max-w-2xl mx-auto">
              <p className="text-red-700 font-semibold">
                *** $50 non-refundable deposit REQUIRED to hold reservation ***
              </p>
            </div>
          </div>

          <div className="max-w-2xl mx-auto space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your First & Last Name (required)
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number (required)
                </label>
                <input
                  type="tel"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Can we text you at this number about your party?
              </label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="canText"
                    value="Yes"
                    checked={formData.canText === 'Yes'}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  Yes
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="canText"
                    value="No"
                    checked={formData.canText === 'No'}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  No
                </label>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Email (required)
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City you live in (required)
                </label>
                <input
                  type="text"
                  name="city"
                  required
                  value={formData.city}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Choose Party Type (required)
              </label>
              <select
                name="partyType"
                required
                value={formData.partyType}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">Select a party type</option>
                <option value="Private Party - $200">Private Party - $200</option>
                <option value="Open Gym Party - please see open gym hours">Open Gym Party - please see open gym hours</option>
                <option value="Groups/Field Trips">Groups/Field Trips</option>
              </select>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date Requested (required)
                </label>
                <input
                  type="text"
                  name="dateRequested"
                  required
                  value={formData.dateRequested}
                  onChange={handleInputChange}
                  placeholder="MM/DD/YYYY"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time Requested (required)
                </label>
                <input
                  type="text"
                  name="timeRequested"
                  required
                  value={formData.timeRequested}
                  onChange={handleInputChange}
                  placeholder="e.g., 2:00 PM"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Birthday Child's Name (required)
                </label>
                <input
                  type="text"
                  name="childName"
                  required
                  value={formData.childName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Birthday Child's Age (required)
                </label>
                <input
                  type="text"
                  name="childAge"
                  required
                  value={formData.childAge}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estimated Number of Children (required)
                </label>
                <input
                  type="text"
                  name="childQty"
                  required
                  value={formData.childQty}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Please share any details, questions, or special requests:
              </label>
              <textarea
                name="message"
                rows={5}
                value={formData.message}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              ></textarea>
            </div>

            <div className="text-center">
              <button
                onClick={handleSubmit}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 px-8 rounded-lg shadow-lg transform hover:-translate-y-1 hover:scale-105 transition-all duration-300"
              >
                Send Party Request
              </button>
            </div>
          </div>
        </motion.div>

        {/* Waiver Download */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.9 }}
          className="text-center mt-12"
        >
          <div className="bg-indigo-800 text-white rounded-xl p-8">
            <h3 className="text-2xl font-bold mb-4">Download Waiver Form</h3>
            <p className="text-indigo-200 mb-6">
              Download and print waiver forms ahead of time for your convenience.
            </p>
            <a
              href="/waiver-form.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white text-indigo-800 font-bold py-3 px-6 rounded-lg hover:bg-gray-100 transition duration-300 inline-flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              360 Gym – Waiver Form
            </a>
          </div>
        </motion.div>

        {/* Contact Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
          className="mt-12 text-center"
        >
          <div className="bg-gradient-to-r from-green-400 to-cyan-400 text-white rounded-xl p-8">
            <h3 className="text-2xl font-bold mb-4">Questions about Parties?</h3>
            <p className="text-lg mb-6">
              Contact us for more information about our party packages and availability.
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