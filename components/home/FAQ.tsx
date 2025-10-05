import React, { useState } from 'react';

interface FAQItemProps {
  question: string;
  answer: string;
  isHighlighted?: boolean;
}

const FAQItem: React.FC<FAQItemProps> = ({ question, answer, isHighlighted = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };
  
  return (
    <div className={`${isHighlighted ? 'text-white' : 'bg-gray-100'} p-6 rounded-xl shadow-md transition-all duration-300`} style={isHighlighted ? { backgroundColor: '#fc7900' } : {}}>
      <div 
        className="flex justify-between items-center cursor-pointer" 
        onClick={toggleOpen}
      >
        <h3 className={`text-xl font-bold mb-2`} style={!isHighlighted ? { color: '#0119b3' } : {}}>{question}</h3>
        <button className="focus:outline-none">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className={`h-6 w-6 transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>
      <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
        <p className={`${isHighlighted ? '' : 'text-gray-600'} pt-2`}>
          {answer}
        </p>
      </div>
      {!isOpen && (
        <p className={`${isHighlighted ? '' : 'text-gray-600'}`}>
          {answer}
        </p>
      )}
    </div>
  );
};

const FAQ = () => {
  const faqItems = [
    {
      question: "What age groups do you offer classes for?",
      answer: "We offer classes for children as young as 18 months (Parent-Tot program) through adult classes. Each age group has specially designed curriculum to meet developmental needs.",
      isHighlighted: true
    },
    {
      question: "Do you offer trial classes?",
      answer: "Yes! We offer trial classes for new students. This gives your child a chance to experience our gym before committing to enrollment. Please contact our front desk to schedule a trial class."
    },
    {
      question: "What should my child wear to class?",
      answer: "Children should wear comfortable athletic attire. Leotards are recommended for girls but not required. Boys can wear athletic shorts and t-shirts. All jewelry should be removed before class for safety reasons."
    },
    {
      question: "Do you offer make-up classes?",
      answer: "Yes, we offer make-up classes for missed sessions. These must be scheduled within the same month and are subject to availability. Please refer to our make-up policy for complete details."
    }
  ];

  return (
    <section className="py-16 px-6 relative">
      <div className="container mx-auto flex flex-col md:flex-row">
        <div className="md:w-1/3 mb-8 md:mb-0">
          <div className="sticky top-20">
            <h2 className="text-3xl font-bold mb-4" style={{ color: '#0119b3' }}>Ask About Kids Activities</h2>
            <p className="text-gray-600 mb-6">Find answers to commonly asked questions about our programs and policies.</p>
            <img src="/images/placeholder.svg" alt="Child with megaphone" className="w-3/4" />
          </div>
        </div>
        <div className="md:w-2/3 md:pl-12">
          <div className="space-y-4">
            {faqItems.map((item, index) => (
              <FAQItem 
                key={index}
                question={item.question}
                answer={item.answer}
                isHighlighted={item.isHighlighted}
              />
            ))}
          </div>
          <div className="mt-8">
            <a href="/faq" className="inline-block text-white font-bold py-3 px-8 rounded-lg shadow transition" style={{ backgroundColor: '#0226ff' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0119b3'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#0226ff'}>
              View All FAQs
            </a>
          </div>
        </div>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute bottom-0 left-0 w-full">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" style={{ color: '#0119b3' }}>
          <path fill="currentColor" fillOpacity="1" d="M0,288L48,272C96,256,192,224,288,197.3C384,171,480,149,576,165.3C672,181,768,235,864,250.7C960,267,1056,245,1152,224C1248,203,1344,181,1392,170.7L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </svg>
      </div>
    </section>
  );
};

export default FAQ;
