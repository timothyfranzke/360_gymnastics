import React from 'react';

const FeaturedClasses = () => {
  return (
    <section className="py-16 px-6 bg-indigo-800 text-white">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">Featured Classes</h2>
        <div className="grid md:grid-cols-4 gap-6">
          <a href="/classes/parent-tot" className="bg-pink-500 rounded-xl p-6 text-center transition hover:bg-pink-600 hover:shadow-lg flex flex-col items-center justify-center">
            <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">Parent-Tot</h3>
            <p className="text-sm">Ages 18mo-3yrs</p>
          </a>
          
          <a href="/classes/beginner-preschool" className="bg-purple-500 rounded-xl p-6 text-center transition hover:bg-purple-600 hover:shadow-lg flex flex-col items-center justify-center">
            <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">Beginner Preschool</h3>
            <p className="text-sm">Ages 4-5.99yrs</p>
          </a>
          
          <a href="/classes/beginner-boys" className="bg-blue-500 rounded-xl p-6 text-center transition hover:bg-blue-600 hover:shadow-lg flex flex-col items-center justify-center">
            <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">Beginner Boys</h3>
            <p className="text-sm">Boys-only basics</p>
          </a>
          
          <a href="/classes/adult-gymnastics" className="bg-cyan-500 rounded-xl p-6 text-center transition hover:bg-cyan-600 hover:shadow-lg flex flex-col items-center justify-center">
            <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">Adult Gymnastics</h3>
            <p className="text-sm">All skill levels</p>
          </a>
        </div>
        <div className="text-center mt-10">
          <a href="/classes" className="inline-block bg-white text-indigo-800 font-bold py-3 px-8 rounded-lg shadow hover:bg-gray-100 transition">
            View All Classes
          </a>
        </div>
      </div>
      {/* Decorative elements */}
      <div className="absolute right-0 bottom-0">
        <img src="/images/placeholder.svg" alt="Decorative element" className="w-32 h-32 opacity-20" />
      </div>
    </section>
  );
};

export default FeaturedClasses;
