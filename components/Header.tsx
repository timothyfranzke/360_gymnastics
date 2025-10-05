"use client";

import React, { useState, useEffect } from 'react';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Handle scroll event to change header appearance
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white shadow-lg text-gray-800' : 'bg-white text-gray-800'}`}>
      <div className="container mx-auto py-3 px-6 flex justify-between items-center">
        <div className="logo-container flex items-center">
          <a href="/" className="flex items-center">
            <img 
              src="/images/360gym-logo.jpg" 
              alt="360 Gymnastics Logo" 
              className="h-12 mr-3 rounded" 
            />
            
          </a>
        </div>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-6">
          <a href="/" className="transition py-2" style={{ color: 'inherit' }} onMouseEnter={(e) => e.currentTarget.style.color = '#0226ff'} onMouseLeave={(e) => e.currentTarget.style.color = 'inherit'}>Home</a>
          <a href="/classes" className="transition py-2" style={{ color: 'inherit' }} onMouseEnter={(e) => e.currentTarget.style.color = '#0226ff'} onMouseLeave={(e) => e.currentTarget.style.color = 'inherit'}>Classes</a>
          <a href="/camps-events" className="transition py-2" style={{ color: 'inherit' }} onMouseEnter={(e) => e.currentTarget.style.color = '#0226ff'} onMouseLeave={(e) => e.currentTarget.style.color = 'inherit'}>Camps/Events</a>
          <a href="/open-gym" className="transition py-2" style={{ color: 'inherit' }} onMouseEnter={(e) => e.currentTarget.style.color = '#0226ff'} onMouseLeave={(e) => e.currentTarget.style.color = 'inherit'}>Open Gym</a>
          <a href="/parties" className="transition py-2" style={{ color: 'inherit' }} onMouseEnter={(e) => e.currentTarget.style.color = '#0226ff'} onMouseLeave={(e) => e.currentTarget.style.color = 'inherit'}>Parties</a>
          <a href="/contact" className="transition py-2" style={{ color: 'inherit' }} onMouseEnter={(e) => e.currentTarget.style.color = '#0226ff'} onMouseLeave={(e) => e.currentTarget.style.color = 'inherit'}>Contact</a>
        </nav>
        
        {/* Mobile Menu Button */}
        <button 
          className="md:hidden text-2xl focus:outline-none z-50" 
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>
      
      {/* Mobile Menu */}
      <div 
        className={`fixed inset-0 bg-white bg-opacity-95 z-40 transform transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'} md:hidden`}
        style={{ top: '60px' }}
      >
        <nav className="container mx-auto py-8 px-6 flex flex-col space-y-6">
          <a href="/" className="text-xl font-medium text-gray-800 transition border-b border-gray-200 pb-2" onClick={toggleMobileMenu} onMouseEnter={(e) => e.currentTarget.style.color = '#0226ff'} onMouseLeave={(e) => e.currentTarget.style.color = '#374151'}>Home</a>
          <a href="/about" className="text-xl font-medium text-gray-800 transition border-b border-gray-200 pb-2" onClick={toggleMobileMenu} onMouseEnter={(e) => e.currentTarget.style.color = '#0226ff'} onMouseLeave={(e) => e.currentTarget.style.color = '#374151'}>About Us</a>
          <a href="/classes" className="text-xl font-medium text-gray-800 transition border-b border-gray-200 pb-2" onClick={toggleMobileMenu} onMouseEnter={(e) => e.currentTarget.style.color = '#0226ff'} onMouseLeave={(e) => e.currentTarget.style.color = '#374151'}>Classes</a>
          <a href="/camps-events" className="text-xl font-medium text-gray-800 transition border-b border-gray-200 pb-2" onClick={toggleMobileMenu} onMouseEnter={(e) => e.currentTarget.style.color = '#0226ff'} onMouseLeave={(e) => e.currentTarget.style.color = '#374151'}>Camps/Events</a>
          <a href="/open-gym" className="text-xl font-medium text-gray-800 transition border-b border-gray-200 pb-2" onClick={toggleMobileMenu} onMouseEnter={(e) => e.currentTarget.style.color = '#0226ff'} onMouseLeave={(e) => e.currentTarget.style.color = '#374151'}>Open Gym</a>
          <a href="/parties" className="text-xl font-medium text-gray-800 transition border-b border-gray-200 pb-2" onClick={toggleMobileMenu} onMouseEnter={(e) => e.currentTarget.style.color = '#0226ff'} onMouseLeave={(e) => e.currentTarget.style.color = '#374151'}>Parties</a>
          <a href="/team" className="text-xl font-medium text-gray-800 transition border-b border-gray-200 pb-2" onClick={toggleMobileMenu} onMouseEnter={(e) => e.currentTarget.style.color = '#0226ff'} onMouseLeave={(e) => e.currentTarget.style.color = '#374151'}>Team</a>
          <a href="/schedule-tuition" className="text-xl font-medium text-gray-800 transition border-b border-gray-200 pb-2" onClick={toggleMobileMenu} onMouseEnter={(e) => e.currentTarget.style.color = '#0226ff'} onMouseLeave={(e) => e.currentTarget.style.color = '#374151'}>Schedule & Tuition</a>
          <a href="/contact" className="text-xl font-medium text-gray-800 transition border-b border-gray-200 pb-2" onClick={toggleMobileMenu} onMouseEnter={(e) => e.currentTarget.style.color = '#0226ff'} onMouseLeave={(e) => e.currentTarget.style.color = '#374151'}>Contact</a>
          <a href="/parties#reserve" className="text-xl font-medium text-white text-center py-3 rounded-md transition" style={{ backgroundColor: '#0226ff' }} onClick={toggleMobileMenu} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0119b3'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#0226ff'}>Reserve Now</a>
        </nav>
      </div>
    </header>
  );
};

export default Header;
