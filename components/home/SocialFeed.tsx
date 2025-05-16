import React from 'react';

// Mock data for Instagram posts
const instagramPosts = [
  {
    id: 1,
    imageUrl: '/images/social/post1.jpg',
    text: '🗣️ JUNE CLINICS 📢 Register Online Now!',
    link: 'https://www.instagram.com/p/DJj8rX4JPb0/',
  },
  {
    id: 2,
    imageUrl: '/images/social/post2.jpg',
    text: 'Spring Cleaning🧽🫧🆕',
    link: 'https://www.instagram.com/p/DJerA_7OE3X/',
    isCarousel: true,
  },
  {
    id: 3,
    imageUrl: '/images/social/post3.jpg',
    text: '☀️SuMmEr CaMp ViBeS 💪 DM us for the direct registration link!',
    link: 'https://www.instagram.com/p/DJS2uM7RB42/',
  },
  {
    id: 4,
    imageUrl: '/images/social/post4.jpg',
    text: '🗣️ UPCOMING EVENTS! 📌 WWW.360GYM.COM',
    link: 'https://www.instagram.com/p/DJJ224eRTkg/',
  },
  {
    id: 5,
    imageUrl: '/images/social/post5.jpg',
    text: '🌟 MAY FUNDRAISER ALERT! 🌟 Donate to the coaches\'s box!',
    link: 'https://www.instagram.com/p/DJF1flFvxv4/',
  },
  {
    id: 6,
    imageUrl: '/images/social/post6.jpg',
    text: 'Visit our website or download the app for the latest Summer Classes & Events📆',
    link: 'https://www.instagram.com/p/DIwgNeHJnTQ/',
  },
  {
    id: 7,
    imageUrl: '/images/social/post7.jpg',
    text: 'Balancing life this week like…⚖️',
    link: 'https://www.instagram.com/reel/DH9TesfyP8t/',
    isVideo: true,
  },
  {
    id: 8,
    imageUrl: '/images/social/post8.jpg',
    text: '🎉 Enrollment is OPEN for Summer Camps at 360 Gymnastics! 🎉',
    link: 'https://www.instagram.com/p/DHlUQ5fR13X/',
    isCarousel: true,
  },
  {
    id: 9,
    imageUrl: '/images/social/post9.jpg',
    text: 'A few reminders ✏️',
    link: 'https://www.instagram.com/p/DHGqHAgxcFm/',
  },
  {
    id: 10,
    imageUrl: '/images/social/post10.jpg',
    text: '✨ A glimpse into our meet weekend ✨',
    link: 'https://www.instagram.com/p/DG9UvKUpzJG/',
  },
  {
    id: 11,
    imageUrl: '/images/social/post11.jpg',
    text: '💕It\'s that time of year again! We are looking to grow our girls team!',
    link: 'https://www.instagram.com/p/DGyKkYaJV7i/',
  },
  {
    id: 12,
    imageUrl: '/images/social/post12.jpg',
    text: 'NEW ADDITIONAL TIME! 📢 First 20 to sign up with code 360DEMO are FREE 🆓',
    link: 'https://www.instagram.com/p/DGecrP3JGfK/',
  },
];

const SocialFeed: React.FC = () => {
  return (
    <section className="py-16 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: '#9333ea' }}>Follow Us On Instagram</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Stay updated with the latest events, classes, and achievements at 360 Gym.
          </p>
          <div className="mt-4">
            <a 
              href="https://www.instagram.com/360gym" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-500 text-white px-6 py-3 rounded-full font-medium hover:from-purple-700 hover:to-pink-600 transition-all duration-300"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073z"/>
                <path d="M12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 8.468a3.333 3.333 0 100-6.666 3.333 3.333 0 000 6.666zm5.338-9.87a1.2 1.2 0 100 2.4 1.2 1.2 0 000-2.4z"/>
              </svg>
              @360gym
            </a>
          </div>
        </div>

        {/* Instagram Feed Grid */}
        <div id="sbi_images" className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-4">
          {instagramPosts.map((post) => (
            <div key={post.id} className="sbi_item relative group">
              <div className="sbi_photo_wrap">
                <a 
                  href={post.link} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="sbi_photo block relative overflow-hidden bg-gray-200 aspect-square"
                >
                  {/* Overlay icons for carousel or video */}
                  {post.isCarousel && (
                    <div className="absolute top-2 right-2 text-white z-10">
                      <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                        <path fill="currentColor" d="M464 0H144c-26.51 0-48 21.49-48 48v48H48c-26.51 0-48 21.49-48 48v320c0 26.51 21.49 48 48 48h320c26.51 0 48-21.49 48-48v-48h48c26.51 0 48-21.49 48-48V48c0-26.51-21.49-48-48-48zM362 464H54a6 6 0 0 1-6-6V150a6 6 0 0 1 6-6h42v224c0 26.51 21.49 48 48 48h224v42a6 6 0 0 1-6 6zm96-96H150a6 6 0 0 1-6-6V54a6 6 0 0 1 6-6h308a6 6 0 0 1 6 6v308a6 6 0 0 1-6 6z"></path>
                      </svg>
                    </div>
                  )}
                  
                  {post.isVideo && (
                    <div className="absolute inset-0 flex items-center justify-center text-white z-10">
                      <svg className="w-12 h-12" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                        <path fill="currentColor" d="M424.4 214.7L72.4 6.6C43.8-10.3 0 6.1 0 47.9V464c0 37.5 40.7 60.1 72.4 41.3l352-208c31.4-18.5 31.5-64.1 0-82.6z"></path>
                      </svg>
                    </div>
                  )}
                  
                  {/* Image */}
                  <img 
                    src={post.imageUrl} 
                    alt={post.text} 
                    className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110"
                    onError={(e) => {
                      // Fallback for missing images
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://via.placeholder.com/400x400?text=360+Gym';
                    }}
                  />
                  
                  {/* Hover overlay with text */}
                  <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-4">
                    <span className="text-white text-center text-sm sm:text-base font-medium">{post.text}</span>
                  </div>
                </a>
              </div>
            </div>
          ))}
        </div>
        
        {/* Load More Button */}
        <div className="mt-8 text-center">
          <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-8 rounded transition">
            Load More
          </button>
        </div>
      </div>
    </section>
  );
};

export default SocialFeed;
