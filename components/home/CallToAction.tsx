import React from 'react';

const CallToAction = () => {
  return (
    <section className="py-12 px-6 bg-green-400 text-indigo-900">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between">
        <div className="md:w-2/3 mb-6 md:mb-0">
          <h2 className="text-2xl font-bold mb-2">Make your child's life special by enrolling them in our academy</h2>
          <p className="text-indigo-900 opacity-75">Join our gymnastics family today and discover the joy of movement, strength, and achievement.</p>
        </div>
        <div className="md:w-1/3 flex flex-col sm:flex-row gap-4">
          <a href="/contact" className="bg-indigo-800 hover:bg-indigo-900 transition text-white text-center font-bold py-3 px-6 rounded-lg shadow">
            Contact Us Now
          </a>
          <a href="tel:9137823300" className="flex items-center justify-center bg-white hover:bg-gray-100 transition text-indigo-800 text-center font-bold py-3 px-6 rounded-lg shadow">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            (913) 782-3300
          </a>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;
