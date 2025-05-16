import React from 'react';

const WhyChooseUs = () => {
  return (
    <section className="py-12 px-6 bg-gray-50">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold text-center text-purple-800 mb-12">Why Choose Us</h2>
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-md transition hover:shadow-lg">
              <div className="w-12 h-12 bg-pink-400 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold mb-2">Target Skillsets</h3>
              <p className="text-gray-600">We focus on developing specific skills tailored to each gymnast's abilities.</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-md transition hover:shadow-lg">
              <div className="w-12 h-12 bg-cyan-400 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold mb-2">Extra Activities</h3>
              <p className="text-gray-600">We offer special events, camps, and open gym sessions throughout the year.</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-md transition hover:shadow-lg">
              <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold mb-2">Complete Training</h3>
              <p className="text-gray-600">Our comprehensive approach develops strength, flexibility, coordination and confidence.</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-md transition hover:shadow-lg">
              <div className="w-12 h-12 bg-blue-400 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold mb-2">Individual Care</h3>
              <p className="text-gray-600">Our certified coaches provide personalized attention to help each gymnast flourish.</p>
            </div>
          </div>
          
          <div className="relative">
            <img 
              src="/images/placeholder.svg" 
              alt="Children enjoying gymnastics" 
              className="rounded-lg shadow-xl" 
            />
            {/* Decorative elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-yellow-300 rounded-full opacity-20"></div>
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-purple-400 rounded-full opacity-20"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
