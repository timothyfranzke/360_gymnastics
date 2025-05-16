'use client';

import React, { useEffect, useState } from 'react';
import Script from 'next/script';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const SchedulesPage = () => {
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [isTableLoaded, setIsTableLoaded] = useState(false);

  // Function to check if the table has been loaded
  useEffect(() => {
    if (isScriptLoaded) {
      const checkTableLoaded = setInterval(() => {
        const table = document.querySelector('table.openings');
        if (table) {
          setIsTableLoaded(true);
          clearInterval(checkTableLoaded);
        }
      }, 500);

      // Clear interval after 10 seconds to prevent infinite checking
      setTimeout(() => {
        clearInterval(checkTableLoaded);
      }, 10000);

      return () => clearInterval(checkTableLoaded);
    }
  }, [isScriptLoaded]);

  // Apply custom styling to the table after it's loaded
  useEffect(() => {
    if (isTableLoaded) {
      const tables = document.querySelectorAll('table.openings');
      tables.forEach(table => {
        table.classList.add('styled-table');
      });

      // Style the register/waitlist links
      const links = document.querySelectorAll('table.openings a');
      links.forEach(link => {
        const linkElement = link as HTMLElement;
        if (linkElement.textContent?.includes('Register')) {
          linkElement.classList.add('register-link');
        } else if (linkElement.textContent?.includes('Wait')) {
          linkElement.classList.add('waitlist-link');
        }
      });
    }
  }, [isTableLoaded]);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <section className="py-16 px-4 bg-gradient-to-b from-purple-50 to-white">
          <div className="container mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 text-purple-800">Class Schedules</h1>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Browse our current class schedule and register online. Classes are organized by age group and skill level.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-purple-800 mb-2">Class Categories</h2>
                <div className="flex flex-wrap gap-2">
                  {[
                    { name: 'Threes', id: 'Threes' },
                    { name: 'Fours', id: 'Fours' },
                    { name: 'Fives', id: 'Fives' },
                    { name: 'Sixes', id: 'Sixes' },
                    { name: 'Advanced', id: 'Advanced' },
                    { name: 'Boys', id: 'Boys' },
                    { name: 'Tumbling', id: 'Tumbling' },
                    { name: 'Ninja', id: 'Ninja' }
                  ].map((category) => (
                    <a 
                      key={category.id}
                      href={`#${category.id}`}
                      className="px-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-800 rounded-full transition-colors duration-200"
                    >
                      {category.name}
                    </a>
                  ))}
                </div>
              </div>

              <div id="schedule-container" className="overflow-x-auto">
                {/* JackRabbit script will load the table here */}
                <div id="jackrabbit-schedule">
                  <Script
                    src="https://app.jackrabbitclass.com/Openings.asp?id=514082&Cat1=Threes&hidecols=Description,Class%20Starts,Class%20Ends,Session&sort=Days,Times"
                    onLoad={() => setIsScriptLoaded(true)}
                    strategy="afterInteractive"
                  />
                </div>

                {!isTableLoaded && (
                  <div className="flex justify-center items-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-800"></div>
                    <span className="ml-3 text-lg text-gray-600">Loading class schedule...</span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-purple-800 mb-4">Registration Information</h2>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold mb-2">How to Register</h3>
                  <p className="text-gray-700 mb-4">
                    Click the "Register" button next to the class you want to join. You'll be directed to our secure registration system to complete your enrollment.
                  </p>
                  <h3 className="text-xl font-semibold mb-2">Wait List</h3>
                  <p className="text-gray-700">
                    If a class is full, you can join the wait list. We'll contact you when a spot becomes available.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Class Policies</h3>
                  <ul className="list-disc pl-5 text-gray-700 space-y-2">
                    <li>Monthly tuition is due on the 1st of each month</li>
                    <li>Make-up classes are available with 24-hour notice</li>
                    <li>A one-time annual registration fee applies to all students</li>
                    <li>Proper attire is required for all classes</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />

      {/* Custom styling for the JackRabbit table */}
      <style jsx global>{`
        /* Table styling */
        .styled-table {
          width: 100%;
          border-collapse: collapse;
          margin: 1.5rem 0;
          font-size: 0.9rem;
          border-radius: 0.5rem;
          overflow: hidden;
          box-shadow: 0 0 20px rgba(0, 0, 0, 0.05);
        }

        .styled-table thead tr,
        .styled-table tr:first-child {
          background-color: #9333ea;
          color: white;
          text-align: left;
          font-weight: bold;
        }

        .styled-table th,
        .styled-table td {
          padding: 12px 15px;
        }

        .styled-table tbody tr {
          border-bottom: 1px solid #dddddd;
        }

        .styled-table tbody tr:nth-of-type(even) {
          background-color: #f9f5ff;
        }

        .styled-table tbody tr:last-of-type {
          border-bottom: 2px solid #9333ea;
        }

        /* Register/Waitlist button styling */
        .register-link {
          display: inline-block;
          padding: 6px 12px;
          background-color: #10b981;
          color: white !important;
          border-radius: 4px;
          text-decoration: none;
          font-weight: 500;
          transition: background-color 0.2s;
        }

        .register-link:hover {
          background-color: #059669;
        }

        .waitlist-link {
          display: inline-block;
          padding: 6px 12px;
          background-color: #f59e0b;
          color: white !important;
          border-radius: 4px;
          text-decoration: none;
          font-weight: 500;
          transition: background-color 0.2s;
        }

        .waitlist-link:hover {
          background-color: #d97706;
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
          .styled-table {
            font-size: 0.8rem;
          }
          
          .styled-table th,
          .styled-table td {
            padding: 8px 10px;
          }
          
          .register-link,
          .waitlist-link {
            padding: 4px 8px;
            font-size: 0.8rem;
          }
        }
      `}</style>
    </div>
  );
};

export default SchedulesPage;
