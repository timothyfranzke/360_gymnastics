import React from 'react';

const Announcement = () => {
  return (
    <section className="py-12 px-6 bg-white">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row items-center bg-gray-50 rounded-xl shadow-md p-6">
          <div className="md:w-1/6 mb-4 md:mb-0">
            <img src="/images/placeholder.svg" alt="Announcement icon" className="w-24 h-24 mx-auto" />
          </div>
          <div className="md:w-4/6 md:px-6">
            <h3 className="text-2xl font-bold text-purple-800 mb-2">Announcements</h3>
            <p className="text-gray-700">
              The easiest way to stay on top of what's going on at 360 is through our social media pages. 
              Follow us on Facebook and/or Instagram for updates on weather closures, events, giveaways, etc.
            </p>
          </div>
          <div className="md:w-1/6 mt-4 md:mt-0">
            <a href="/360events" className="inline-block bg-purple-700 hover:bg-purple-800 text-white font-semibold py-2 px-4 rounded-lg">
              View All
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Announcement;
