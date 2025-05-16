'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { classesData, eventsData, contactData } from '@/lib/data';
import GymHome from '@/components/GymHome';

export default function Home() {
  // Get the top 3 upcoming events
  const upcomingEvents = eventsData.slice(0, 3);
  // Get the top 3 featured classes
  const featuredClasses = classesData.slice(0, 3);

  return (
    <GymHome />
  );
}
