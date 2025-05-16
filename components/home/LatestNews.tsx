import React from 'react';

const LatestNews = () => {
  return (
    <section className="py-16 px-6 bg-white">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold text-center text-purple-800 mb-12">Latest News & Events</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-gray-50 rounded-xl shadow-md overflow-hidden transition hover:shadow-lg">
            <div className="relative h-48">
              <img src="/images/placeholder.svg" alt="Event 1" className="w-full h-full object-cover" />
              <div className="absolute top-4 left-4 bg-yellow-400 text-indigo-900 text-sm font-bold py-1 px-3 rounded-lg">
                Upcoming Event
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold text-purple-800 mb-2">Spring Skills Clinic</h3>
              <p className="text-gray-600 mb-4">Join us for special skills training focused on balance beam techniques. Limited spots available!</p>
              <div className="flex justify-between items-center">
                <div className="flex items-center text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm">May 20, 2025</span>
                </div>
                <a href="/events/spring-clinic" className="text-purple-700 font-semibold hover:text-purple-900">
                  Read More →
                </a>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-xl shadow-md overflow-hidden transition hover:shadow-lg">
            <div className="relative h-48">
              <img src="/images/placeholder.svg" alt="Event 2" className="w-full h-full object-cover" />
              <div className="absolute top-4 left-4 bg-cyan-400 text-indigo-900 text-sm font-bold py-1 px-3 rounded-lg">
                Summer Camp
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold text-purple-800 mb-2">Summer Camp Registration Open</h3>
              <p className="text-gray-600 mb-4">Our popular summer camps are now open for registration. Weekly sessions available throughout June and July.</p>
              <div className="flex justify-between items-center">
                <div className="flex items-center text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm">Jun 1 - Jul 31, 2025</span>
                </div>
                <a href="/events/summer-camp" className="text-purple-700 font-semibold hover:text-purple-900">
                  Read More →
                </a>
              </div>
            </div>
          </div>
        </div>
        <div className="text-center mt-10">
          <a href="/events" className="inline-block bg-purple-700 hover:bg-purple-800 text-white font-bold py-3 px-8 rounded-lg shadow transition">
            View All News & Events
          </a>
        </div>
      </div>
    </section>
  );
};

export default LatestNews;
