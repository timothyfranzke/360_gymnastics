import React from 'react';

const Hero = () => {
  return (
    <section className="relative text-white overflow-hidden" style={{ background: 'linear-gradient(135deg, #9333ea 0%, #6b21a8 100%)' }}>
      {/* Floating colorful elements */}
      <div className="absolute top-10 left-10 w-20 h-20 bg-orange-400 rounded-lg rotate-12 opacity-70 animate-float"></div>
      <div className="absolute top-20 right-20 w-16 h-16 bg-cyan-400 rounded-full opacity-70 animate-float-delayed"></div>
      <div className="absolute bottom-40 left-1/4 w-12 h-12 bg-pink-400 rounded-lg rotate-45 opacity-70 animate-float"></div>
      <div className="absolute top-1/3 right-1/3 w-10 h-10 bg-yellow-300 rounded-full opacity-70 animate-float-delayed"></div>

      <div className="container mx-auto py-20 px-6 flex flex-col md:flex-row items-center relative">
        <div className="md:w-1/2 md:pr-12 z-10">
          <h2 className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-lg">Recreational & Competitive Gymnastics</h2>
          <div className="inline-block bg-yellow-300 text-indigo-900 px-4 py-2 rounded-lg rotate-2 mb-6">
            <h3 className="text-2xl md:text-3xl font-bold">Enrolling for 2025!</h3>
          </div>
          <p className="mb-8 text-lg text-white drop-shadow-md">Building strength, confidence, and character through the sport of gymnastics</p>
          <div className="flex flex-wrap gap-4">
            <a href="/enroll" className="bg-gradient-to-r from-orange-400 to-pink-500 hover:from-orange-500 hover:to-pink-600 transition text-white font-bold py-3 px-6 rounded-lg shadow-lg transform hover:-translate-y-1 hover:scale-105">
              Enroll Now
            </a>
            <a href="/classes" className="bg-white bg-opacity-20 hover:bg-opacity-30 border-2 border-white hover:border-yellow-300 transition font-bold py-3 px-6 rounded-lg transform hover:-translate-y-1 hover:scale-105">
              View Classes
            </a>
          </div>
        </div>
        <div className="md:w-1/2 mt-10 md:mt-0 relative">
          <div className="relative z-10 transform rotate-3 hover:rotate-0 transition duration-300">
            <img
              src="/images/placeholder.svg"
              alt="Child doing gymnastics"
              className="rounded-lg shadow-xl relative"
            />
            <div className="absolute -top-4 -right-4 w-full h-full border-4 border-yellow-300 rounded-lg -z-10"></div>
          </div>

          {/* Decorative elements */}
          <div className="absolute -top-5 -right-5 w-24 h-24 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full opacity-70 blur-xl"></div>
          <div className="absolute -bottom-5 -left-5 w-32 h-32 bg-gradient-to-tr from-cyan-400 to-blue-500 rounded-full opacity-70 blur-xl"></div>
        </div>
      </div>

      {/* Cloud divider */}
      <div className="absolute bottom-0 left-0 w-full">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 100">
          <path
            fill="#ffffff"
            fillOpacity="1"
            d="M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,48C672,43,768,53,864,64C960,75,1056,85,1152,82.7C1248,80,1344,64,1392,56L1440,48L1440,100L1392,100C1344,100,1248,100,1152,100C1056,100,960,100,864,100C768,100,672,100,576,100C480,100,384,100,288,100C192,100,96,100,48,100L0,100Z"
          ></path>
        </svg>
      </div>
    </section>
  );
};

export default Hero;