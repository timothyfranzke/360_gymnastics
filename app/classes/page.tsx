import React from 'react';
import Classes from '@/components/home/Classes';

export default function ClassesPage() {
  return (
    <main>
      <div className="pt-20">
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Gymnastics Classes</h1>
            <p className="text-xl text-white/90 max-w-3xl mx-auto">
              Discover our wide range of gymnastics classes designed for all ages and skill levels
            </p>
          </div>
        </div>
        <Classes />
      </div>
    </main>
  );
}
