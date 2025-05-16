"use client";

import React from 'react';
import Link from 'next/link';

interface ClassType {
  name: string;
  ageRange: string;
  description: string;
  skills: string[];
  ratio: string;
  duration: string;
  url: string;
}

const Classes = () => {
  const classes: ClassType[] = [
    {
      name: "PARENT-TOT",
      ageRange: "Ages 18mo-3yrs",
      description: "This class is designed to help with fine and gross motor skills, social and listening skills. This is accomplished while playing games and having fun. Parent participation required.",
      skills: [],
      ratio: "10:1",
      duration: "50 MIN CLASS",
      url: "/classes/parent-tot"
    },
    {
      name: "THREES",
      ageRange: "Age 3-3.99yrs",
      description: "No parents required for this class. The class builds off of the same skills as the parent-tot class, but we also add basic gymnastics skills.",
      skills: ["balance", "strength", "body awareness"],
      ratio: "6:1",
      duration: "50 MIN CLASS",
      url: "/classes/threes"
    },
    {
      name: "BEGINNER PRESCHOOL",
      ageRange: "4-5.99yrs",
      description: "No gymnastics experience needed for this class. Kids will work on advanced motor skills and start learning gymnastics progressions.",
      skills: ["somersaults", "cartwheels", "walking on the beams", "bar work", "strength builders"],
      ratio: "6:1",
      duration: "50 MIN CLASS",
      url: "/classes/beginner-preschool"
    },
    {
      name: "ADVANCED PRESCHOOL",
      ageRange: "4-5.99yrs",
      description: "Must have some gymnastics experience for this class.",
      skills: ["backbends", "kickovers", "backhip circles on bars", "beam mounts and dismounts", "handstand on vault"],
      ratio: "6:1",
      duration: "50 MIN CLASS",
      url: "/classes/advanced-preschool"
    },
    {
      name: "LEVEL 1",
      ageRange: "6yrs and Older",
      description: "This class is designed for kids that have never had gymnastics before. They will work on gymnastics basics along with body awareness and control.",
      skills: [],
      ratio: "8:1",
      duration: "50 MIN CLASS",
      url: "/classes/level-1"
    },
    {
      name: "LEVEL 2",
      ageRange: "6yrs and Older",
      description: "Must have some gymnastics experience for this class.",
      skills: ["back bends", "roundoffs", "backhips circles", "kip drills", "handstands on vault"],
      ratio: "8:1",
      duration: "50 MIN CLASS",
      url: "/classes/level-2"
    },
    {
      name: "LEVEL 3",
      ageRange: "6yrs and Older",
      description: "This is an advanced class!",
      skills: ["back handsprings", "front hip circles", "cartwheels on beam", "handsprings on vault"],
      ratio: "8:1",
      duration: "50 MIN CLASS",
      url: "/classes/level-3"
    },
    {
      name: "LEVEL 4",
      ageRange: "6yrs and Older",
      description: "This is an advanced class!",
      skills: ["roundoff back handsprings", "kips", "baby giants", "cartwheels on beam", "handsprings on vault"],
      ratio: "10:1",
      duration: "90 MIN CLASS",
      url: "/classes/level-4"
    },
    {
      name: "BOYS BEGINNER",
      ageRange: "6yrs and Older",
      description: "This is a boys only class. Boys will work on all six boy events and learn the basics on each event. Strength and conditioning skills are also taught.",
      skills: [],
      ratio: "8:1",
      duration: "50 MIN CLASS",
      url: "/classes/beginner-boys"
    },
    {
      name: "BOYS ADVANCED",
      ageRange: "6yrs and Older",
      description: "Boys will start learning skills that take more strength and body awareness.",
      skills: ["flips", "flyaways", "circles"],
      ratio: "8:1",
      duration: "50 MIN CLASS",
      url: "/classes/advanced-boys"
    },
    {
      name: "TUMBLING CLASSES",
      ageRange: "6-18 years",
      description: "In these classes, we work on basic tumbling to advanced tumbling. There is no previous tumbling experience needed for this class. Besides tumbling we will work on jumps, strength, and conditioning.",
      skills: [],
      ratio: "",
      duration: "60 MIN CLASS",
      url: "/classes/tumbling"
    },
    {
      name: "ADULT CLASS",
      ageRange: "18+ years",
      description: "In these classes, we work on basic tumbling to advanced tumbling. There is no previous tumbling experience needed for this class. Besides tumbling we will work on jumps, strength, and conditioning.",
      skills: [],
      ratio: "",
      duration: "90 MIN CLASS - $10 drop in",
      url: "/classes/adult-gymnastics"
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-indigo-800 mb-4">Our Gymnastics Classes</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            We offer a variety of classes for all ages and skill levels. Our experienced instructors provide a fun, 
            no-pressure atmosphere while teaching the fundamentals of gymnastics, social skills, and life skills.
          </p>
          <div className="mt-6 space-y-2 text-center">
            <p className="text-indigo-700 font-semibold">50 minute class – $69/month</p>
            <p className="text-indigo-700 font-semibold">55 minute class – $74/month</p>
            <p className="text-indigo-700 font-semibold">60 minute class – $82/month</p>
            <p className="text-indigo-700 font-semibold">90 minute class – $97/month</p>
            <p className="text-indigo-700 font-semibold mt-4">$15 annual registration fee per person ($30 max per family)</p>
            <p className="text-gray-600 mt-4 font-bold">All classes meet once per week</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {classes.map((gymClass, index) => (
            <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 border border-gray-200">
              <div className="bg-gradient-to-r from-purple-600 to-indigo-600 py-4 px-6">
                <h3 className="text-xl font-bold text-white">{gymClass.name}</h3>
                <p className="text-indigo-100">{gymClass.ageRange}</p>
              </div>
              <div className="p-6">
                <p className="text-gray-700 mb-4">{gymClass.description}</p>
                {gymClass.skills.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-semibold text-gray-600">Skills learned include:</p>
                    <ul className="list-disc pl-5 mt-2 text-gray-600">
                      {gymClass.skills.map((skill, idx) => (
                        <li key={idx}>{skill}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="flex justify-between items-center mt-4 text-sm text-gray-600">
                  {gymClass.ratio && <p><span className="font-semibold">Class Ratio:</span> {gymClass.ratio}</p>}
                  <p><span className="font-semibold">Duration:</span> {gymClass.duration}</p>
                </div>
                <div className="mt-6">
                  <Link href={gymClass.url} className="block w-full text-center py-2 px-4 bg-indigo-600 text-white font-semibold rounded hover:bg-indigo-700 transition-colors duration-300">
                    Learn More
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <Link href="/schedule" className="inline-block py-3 px-8 bg-purple-600 text-white font-bold rounded-lg shadow-md hover:bg-purple-700 transition-colors duration-300">
            View Full Schedule & Tuition
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Classes;
