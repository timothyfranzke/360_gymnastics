import React from 'react';

const Testimonials = () => {
  return (
    <section className="py-16 px-6 bg-pink-500 text-white relative overflow-hidden">
      <div className="container mx-auto relative z-10">
        <h2 className="text-3xl font-bold text-center mb-12">Parent Testimonials</h2>
        <div className="max-w-4xl mx-auto bg-white bg-opacity-10 p-8 rounded-xl shadow-lg">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/4 mb-6 md:mb-0">
              <div className="w-24 h-24 rounded-full overflow-hidden mx-auto">
                <img src="/images/placeholder.svg" alt="Parent testimonial" className="w-full h-full object-cover" />
              </div>
            </div>
            <div className="md:w-3/4 md:pl-8">
              <p className="text-lg mb-4">
                "My daughter has been attending 360 Gymnastics for two years now, and the transformation in her confidence and physical abilities has been amazing. The coaches are patient, encouraging, and truly care about each child's development. I highly recommend this gym to all parents!"
              </p>
              <div className="flex flex-col">
                <span className="font-bold">Sarah Johnson</span>
                <span className="text-sm opacity-75">Parent of Emma, Age 7</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-center mt-8">
          <button className="w-3 h-3 rounded-full bg-white mr-2"></button>
          <button className="w-3 h-3 rounded-full bg-white bg-opacity-50 mr-2"></button>
          <button className="w-3 h-3 rounded-full bg-white bg-opacity-50"></button>
        </div>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-10 left-10 w-20 h-20 rounded-full bg-white opacity-10"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 rounded-full bg-white opacity-10"></div>
      </div>
    </section>
  );
};

export default Testimonials;
