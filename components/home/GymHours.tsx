import React from 'react';

type DaySchedule = {
  day: string;
  hours: string;
};

const GymHours: React.FC = () => {
  const scheduleData: DaySchedule[] = [
    { day: 'Monday', hours: '9:00AM – 9:00PM' },
    { day: 'Tuesday', hours: '9:00AM – 9:00PM' },
    { day: 'Wednesday', hours: '9:00AM – 9:00PM' },
    { day: 'Thursday', hours: '9:00AM – 9:00PM' },
    { day: 'Friday', hours: '9:00AM – 8:30PM' },
    { day: 'Saturday', hours: '9:00AM – 4:00PM' },
    { day: 'Sunday', hours: 'Parties by Request' },
  ];

  return (
    <section className="relative text-white overflow-hidden py-16 px-4" style={{ background: 'linear-gradient(135deg, #9333ea 0%, #6b21a8 100%)' }}>
      {/* Floating decorative elements */}
      <div className="absolute top-10 right-10 w-16 h-16 bg-orange-400 rounded-full opacity-30 animate-float"></div>
      <div className="absolute bottom-20 left-20 w-12 h-12 bg-cyan-400 rounded-lg rotate-12 opacity-30 animate-float-delayed"></div>
      
      <div className="container mx-auto max-w-4xl relative z-10">
        <div className="text-center mb-10">
          {/* Clock icon using SVG */}
          <div className="flex justify-center mb-3">
            <div className="w-16 h-16 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Gym Hours
          </h2>
          <div className="w-20 h-1 bg-yellow-300 mx-auto"></div>
        </div>

        <div className="bg-white rounded-lg shadow-xl overflow-hidden transform rotate-1 hover:rotate-0 transition duration-300">
          <div className="p-6">
            <table className="w-full">
              <tbody>
                {scheduleData.map((schedule, index) => (
                  <tr 
                    key={schedule.day} 
                    className={`${index !== scheduleData.length - 1 ? 'border-b border-gray-200' : ''} hover:bg-purple-50 transition`}
                  >
                    <td className="py-4 text-xl text-gray-800 font-bold" style={{ fontFamily: "'Love Ya Like A Sister', cursive" }}>{schedule.day}</td>
                    <td className="py-4 text-center text-xl text-gray-500">–</td>
                    <td className="py-4 text-right text-xl text-gray-800" style={{ fontFamily: "'Love Ya Like A Sister', cursive" }}>{schedule.hours}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="bg-gray-50 px-6 py-4">
            <div className="flex justify-center">
              <a 
                href="/contact-us" 
                className="bg-gradient-to-r from-orange-400 to-pink-500 hover:from-orange-500 hover:to-pink-600 transition text-white font-bold py-3 px-6 rounded-lg shadow-lg transform hover:-translate-y-1 hover:scale-105"
              >
                Contact Us →
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GymHours;