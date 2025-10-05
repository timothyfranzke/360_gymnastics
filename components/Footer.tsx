'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

const navigation = {
  main: [
    { name: 'Home', href: '/' },
    { name: 'About Us', href: '/about' },
    { name: 'Classes', href: '/classes' },
    { name: 'Camps & Events', href: '/camps-events' },
    { name: 'Open Gym', href: '/open-gym' },
    { name: 'Team', href: '/team' },
    { name: 'Staff', href: '/staff' },
    { name: 'Schedule & Tuition', href: '/schedule-tuition' },
    { name: 'Contact', href: '/contact' },
  ],
  social: [
    {
      name: 'Facebook',
      href: 'https://www.facebook.com/KC360Gymnastics/',
      icon: (props: React.SVGProps<SVGSVGElement>) => (
        <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
          <path
            fillRule="evenodd"
            d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
            clipRule="evenodd"
          />
        </svg>
      ),
    }
  ],
};

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="text-white pt-12 pb-6 px-6" style={{ backgroundColor: '#0119b3' }}>
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div>
              <h3 className="text-xl font-bold mb-4">360 Gymnastics</h3>
              <p className="mb-4">Providing exceptional gymnastics training for all ages and abilities since 2013.</p>
              <div className="flex space-x-4">
                <a href="https://www.facebook.com/Kc360Gymnastics" className="text-white transition" onMouseEnter={(e) => e.currentTarget.style.color = '#fc7900'} onMouseLeave={(e) => e.currentTarget.style.color = 'white'}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
                  </svg>
                </a>
                <a href="https://www.instagram.com/kc360gym/" className="text-white transition" onMouseEnter={(e) => e.currentTarget.style.color = '#fc7900'} onMouseLeave={(e) => e.currentTarget.style.color = 'white'}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="text-xl font-bold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><a href="/about" className="transition" onMouseEnter={(e) => e.currentTarget.style.color = '#fc7900'} onMouseLeave={(e) => e.currentTarget.style.color = 'white'}>About Us</a></li>
                <li><a href="/classes" className="transition" onMouseEnter={(e) => e.currentTarget.style.color = '#fc7900'} onMouseLeave={(e) => e.currentTarget.style.color = 'white'}>Classes</a></li>
                <li><a href="/schedule-tuition" className="transition" onMouseEnter={(e) => e.currentTarget.style.color = '#fc7900'} onMouseLeave={(e) => e.currentTarget.style.color = 'white'}>Schedule & Tuition</a></li>
                <li><a href="/camps-events" className="transition" onMouseEnter={(e) => e.currentTarget.style.color = '#fc7900'} onMouseLeave={(e) => e.currentTarget.style.color = 'white'}>Camps & Events</a></li>
                <li><a href="/open-gym" className="transition" onMouseEnter={(e) => e.currentTarget.style.color = '#fc7900'} onMouseLeave={(e) => e.currentTarget.style.color = 'white'}>Open Gym</a></li>
                <li><a href="/parties" className="transition" onMouseEnter={(e) => e.currentTarget.style.color = '#fc7900'} onMouseLeave={(e) => e.currentTarget.style.color = 'white'}>Birthday Parties</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-xl font-bold mb-4">Programs</h3>
              <ul className="space-y-2">
                <li><a href="/classes/parent-tot" className="transition" onMouseEnter={(e) => e.currentTarget.style.color = '#fc7900'} onMouseLeave={(e) => e.currentTarget.style.color = 'white'}>Parent-Tot</a></li>
                <li><a href="/classes/preschool" className="transition" onMouseEnter={(e) => e.currentTarget.style.color = '#fc7900'} onMouseLeave={(e) => e.currentTarget.style.color = 'white'}>Preschool</a></li>
                <li><a href="/classes/beginner-boys" className="transition" onMouseEnter={(e) => e.currentTarget.style.color = '#fc7900'} onMouseLeave={(e) => e.currentTarget.style.color = 'white'}>Beginner Boys</a></li>
                <li><a href="/classes/adult-gymnastics" className="transition" onMouseEnter={(e) => e.currentTarget.style.color = '#fc7900'} onMouseLeave={(e) => e.currentTarget.style.color = 'white'}>Adult Gymnastics</a></li>
                <li><a href="/team" className="transition" onMouseEnter={(e) => e.currentTarget.style.color = '#fc7900'} onMouseLeave={(e) => e.currentTarget.style.color = 'white'}>Competitive Team</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-xl font-bold mb-4">Contact Us</h3>
              <address className="not-italic mb-4">
                <div className="flex items-start mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div>
                    431 N Lindenwood Dr<br />
                    Olathe, KS 66062
                  </div>
                </div>
                <div className="flex items-center mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <a href="tel:9137823300" className="transition" onMouseEnter={(e) => e.currentTarget.style.color = '#fc7900'} onMouseLeave={(e) => e.currentTarget.style.color = 'white'}>(913) 782-3300</a>
                </div>
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <a href="mailto:kc360gym@gmail.com" className="transition" onMouseEnter={(e) => e.currentTarget.style.color = '#fc7900'} onMouseLeave={(e) => e.currentTarget.style.color = 'white'}>kc360gym@gmail.com</a>
                </div>
              </address>
              <h4 className="font-bold mb-2">Gym Hours:</h4>
              <p className="text-sm">
                Monday - Thursday: 9:00AM – 9:00PM<br />
                Friday: 9:00AM – 8:30PM<br />
                Saturday: 9:00AM – 4:00PM<br />
                Sunday: Parties by Request
              </p>
            </div>
          </div>
          
          <div className="pt-6 border-t text-center text-sm" style={{ borderColor: '#0226ff' }}>
            <p>&copy; {new Date().getFullYear()} 360 Gymnastics. All rights reserved.</p>
          </div>
        </div>
      </footer>
  );
}
