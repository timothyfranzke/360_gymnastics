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
    <header className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 text-white ${isScrolled ? 'bg-indigo-800 shadow-lg' : 'bg-indigo-700'}`}>
      <div className="container mx-auto py-3 px-6 flex justify-between items-center">
        <div className="logo-container flex items-center">
          <a href="/" className="flex items-center">
            <img 
              src="/images/360gym-logo.jpg" 
              alt="360 Gymnastics Logo" 
              className="h-12 mr-3 rounded" 
            />
            <div className="flex flex-col">
              <h1 className="text-xl font-bold leading-tight">360 Gymnastics</h1>
              <span className="text-xs text-yellow-300">Olathe, KS</span>
            </div>
          </a>
        </div>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-6">
          <a href="/" className="hover:text-yellow-300 transition py-2">Home</a>
          <a href="/about" className="hover:text-yellow-300 transition py-2">About Us</a>
          <a href="/classes" className="hover:text-yellow-300 transition py-2">Classes</a>
          <a href="/camps-events" className="hover:text-yellow-300 transition py-2">Camps/Events</a>
          <a href="/open-gym" className="hover:text-yellow-300 transition py-2">Open Gym</a>
          <a href="/team" className="hover:text-yellow-300 transition py-2">Team</a>
          <a href="/schedule-tuition" className="hover:text-yellow-300 transition py-2">Schedule & Tuition</a>
          <a href="/contact" className="hover:text-yellow-300 transition py-2">Contact</a>
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
        className={`fixed inset-0 bg-indigo-900 bg-opacity-95 z-40 transform transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'} md:hidden`}
        style={{ top: '60px' }}
      >
        <nav className="container mx-auto py-8 px-6 flex flex-col space-y-6">
          <a href="/" className="text-xl font-medium hover:text-yellow-300 transition border-b border-indigo-800 pb-2" onClick={toggleMobileMenu}>Home</a>
          <a href="/about" className="text-xl font-medium hover:text-yellow-300 transition border-b border-indigo-800 pb-2" onClick={toggleMobileMenu}>About Us</a>
          <a href="/classes" className="text-xl font-medium hover:text-yellow-300 transition border-b border-indigo-800 pb-2" onClick={toggleMobileMenu}>Classes</a>
          <a href="/camps-events" className="text-xl font-medium hover:text-yellow-300 transition border-b border-indigo-800 pb-2" onClick={toggleMobileMenu}>Camps/Events</a>
          <a href="/open-gym" className="text-xl font-medium hover:text-yellow-300 transition border-b border-indigo-800 pb-2" onClick={toggleMobileMenu}>Open Gym</a>
          <a href="/team" className="text-xl font-medium hover:text-yellow-300 transition border-b border-indigo-800 pb-2" onClick={toggleMobileMenu}>Team</a>
          <a href="/schedule-tuition" className="text-xl font-medium hover:text-yellow-300 transition border-b border-indigo-800 pb-2" onClick={toggleMobileMenu}>Schedule & Tuition</a>
          <a href="/contact" className="text-xl font-medium hover:text-yellow-300 transition pb-2" onClick={toggleMobileMenu}>Contact</a>
        </nav>
      </div>
    </header>
  );
};

export default Header;
