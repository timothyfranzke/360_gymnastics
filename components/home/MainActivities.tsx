import React from 'react';

const MainActivities = () => {
  return (
    <section className="py-16 px-6 bg-indigo-900 text-white relative overflow-hidden">
      <div className="container mx-auto relative z-10">
        <h2 className="text-3xl font-bold mb-3">We Provide the Best</h2>
        <h3 className="text-2xl font-bold text-cyan-300 mb-8">Main Kids Activities</h3>
        <p className="max-w-2xl mb-10">
          360 Gymnastics is a recreational gymnastics gym that strives to provide a fun, no-pressure 
          atmosphere while teaching the fundamentals of gymnastics, social skills, and life skills.
        </p>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="bg-indigo-800 bg-opacity-50 p-6 rounded-xl hover:bg-opacity-70 transition">
            <div className="flex items-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-300 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
              <h4 className="text-lg font-bold">Outdoor Games</h4>
            </div>
            <p className="text-gray-300">Special events and outdoor activities to develop teamwork and coordination.</p>
          </div>
          
          <div className="bg-indigo-800 bg-opacity-50 p-6 rounded-xl hover:bg-opacity-70 transition">
            <div className="flex items-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-pink-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h4 className="text-lg font-bold">Sport Activities</h4>
            </div>
            <p className="text-gray-300">Gymnastics training that builds strength, coordination, and confidence.</p>
          </div>
          
          <div className="bg-indigo-800 bg-opacity-50 p-6 rounded-xl hover:bg-opacity-70 transition">
            <div className="flex items-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
              </svg>
              <h4 className="text-lg font-bold">Table/Floor Toys</h4>
            </div>
            <p className="text-gray-300">Creative play opportunities that develop fine motor skills and imagination.</p>
          </div>
          
          <div className="bg-indigo-800 bg-opacity-50 p-6 rounded-xl hover:bg-opacity-70 transition">
            <div className="flex items-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <h4 className="text-lg font-bold">Water Games</h4>
            </div>
            <p className="text-gray-300">Summer special events with water-based activities for cooling off while having fun.</p>
          </div>
        </div>
        
        <a href="/activities" className="inline-block bg-cyan-500 hover:bg-cyan-600 transition text-white font-bold py-3 px-8 rounded-lg shadow">
          Learn More
        </a>
      </div>
      
      {/* Background decorative elements */}
      <div className="absolute top-0 right-0 w-1/3 h-full">
        <img src="/images/placeholder.svg" alt="Decorative bubbles" className="w-full h-full opacity-10 object-cover" />
      </div>
      
      {/* Child image */}
      <div className="absolute bottom-0 right-10 hidden lg:block">
        <img src="/images/placeholder.svg" alt="Child with backpack" className="h-64" />
      </div>
    </section>
  );
};

export default MainActivities;
