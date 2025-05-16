import React from 'react';

// Import all the component sections
import Header from './home/Header';
import Hero from './home/Hero';
import Announcement from './home/Announcement';
import WhyChooseUs from './home/WhyChooseUs';
import FeaturedClasses from './home/FeaturedClasses';
import MainActivities from './home/MainActivities';
import GymHours from './home/GymHours';
import Gallery from './home/Gallery';
import Testimonials from './home/Testimonials';
import LatestNews from './home/LatestNews';
import SocialFeed from './home/SocialFeed';
import FAQ from './home/FAQ';
import CallToAction from './home/CallToAction';

const GymHome = () => {
  return (
    <div className="gym-website">
      <Hero />
      <Announcement />
      <WhyChooseUs />
      <FeaturedClasses />
      <MainActivities />
      <GymHours />
      <Gallery />
      <Testimonials />
      <LatestNews />
      <SocialFeed />
      <FAQ />
      <CallToAction />
    </div>
  );
};

export default GymHome;