import React from 'react';

const Gallery = () => {
  return (
    <section className="py-16 px-6 bg-white">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold text-center text-purple-800 mb-12">Our Gallery</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="relative overflow-hidden rounded-lg shadow-md group">
            <img src="/images/placeholder.svg" alt="Gallery image 1" className="w-full h-64 object-cover transition duration-300 group-hover:scale-110" />
            <div className="absolute inset-0 bg-purple-800 bg-opacity-0 group-hover:bg-opacity-30 transition duration-300 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white opacity-0 group-hover:opacity-100 transition duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
              </svg>
            </div>
          </div>
          
          <div className="relative overflow-hidden rounded-lg shadow-md group">
            <img src="/images/placeholder.svg" alt="Gallery image 2" className="w-full h-64 object-cover transition duration-300 group-hover:scale-110" />
            <div className="absolute inset-0 bg-purple-800 bg-opacity-0 group-hover:bg-opacity-30 transition duration-300 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white opacity-0 group-hover:opacity-100 transition duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
              </svg>
            </div>
          </div>
          
          <div className="relative overflow-hidden rounded-lg shadow-md group">
            <img src="/images/placeholder.svg" alt="Gallery image 3" className="w-full h-64 object-cover transition duration-300 group-hover:scale-110" />
            <div className="absolute inset-0 bg-purple-800 bg-opacity-0 group-hover:bg-opacity-30 transition duration-300 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white opacity-0 group-hover:opacity-100 transition duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
              </svg>
            </div>
          </div>
          
          <div className="relative overflow-hidden rounded-lg shadow-md group">
            <img src="/images/placeholder.svg" alt="Gallery image 4" className="w-full h-64 object-cover transition duration-300 group-hover:scale-110" />
            <div className="absolute inset-0 bg-purple-800 bg-opacity-0 group-hover:bg-opacity-30 transition duration-300 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white opacity-0 group-hover:opacity-100 transition duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
              </svg>
            </div>
          </div>
        </div>
        <div className="text-center">
          <a href="/gallery" className="inline-block bg-purple-700 hover:bg-purple-800 text-white font-bold py-3 px-8 rounded-lg shadow transition">
            View Gallery
          </a>
        </div>
      </div>
    </section>
  );
};

export default Gallery;
