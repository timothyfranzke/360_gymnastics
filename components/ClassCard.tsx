'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface ClassCardProps {
  id: string;
  title: string;
  ageRange: string;
  description: string;
  image: string;
}

export default function ClassCard({ id, title, ageRange, description, image }: ClassCardProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
      className="flex flex-col rounded-xl overflow-hidden shadow-lg bg-white hover:shadow-xl transition-shadow duration-300"
    >
      <div className="relative h-48 w-full">
        <Image
          src={image}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover"
        />
      </div>
      <div className="p-6 flex-1 flex flex-col">
        <h3 className="text-xl font-bold text-gray-900 mb-1">{title}</h3>
        <p className="text-sm font-medium text-primary mb-3">{ageRange}</p>
        <p className="text-gray-600 mb-4 flex-1">{description}</p>
        <Link href={`/classes/${id}`} className="btn-outline w-full text-center">
          Learn More
        </Link>
      </div>
    </motion.div>
  );
}
