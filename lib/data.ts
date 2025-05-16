// Content data for 360 Gymnastics website

// About section data
export const aboutData = {
  mission: "At 360 Gymnastics, our mission is to provide a safe, fun, and positive environment where children can develop physical fitness, self-confidence, and life skills through the sport of gymnastics.",
  history: "Founded in 2005, 360 Gymnastics has grown from a small recreational program to a full-service gymnastics facility offering classes for all ages and abilities. Our dedicated staff of experienced coaches is committed to helping each student reach their full potential, whether their goal is recreational fun or competitive excellence.",
  facility: "Our state-of-the-art facility features the latest gymnastics equipment, including Olympic-quality apparatus, trampolines, foam pits, and a dedicated preschool area. With over 15,000 square feet of training space, we have everything needed to provide top-quality gymnastics instruction in a safe and supportive environment."
};

// Classes data
export const classesData = [
  {
    id: 'parent-tot',
    title: 'Parent-Tot Classes',
    ageRange: '18 months - 3 years',
    description: 'Parent participation classes designed for toddlers to explore movement with their parents. Focus on basic motor skills, coordination, and social interaction in a fun, playful environment.',
    details: {
      duration: '45 minutes',
      ratio: '6:1 student to teacher ratio',
      schedule: 'Classes available mornings and evenings',
      skills: ['Balance', 'Coordination', 'Strength', 'Listening skills', 'Following directions']
    },
    image: '/images/parent-tot.jpg'
  },
  {
    id: 'threes',
    title: 'Threes Classes',
    ageRange: '3 years',
    description: 'A gentle transition from parent-tot to independent gymnastics. Children learn basic gymnastics skills, body positions, and class structure while building confidence and independence.',
    details: {
      duration: '45 minutes',
      ratio: '5:1 student to teacher ratio',
      schedule: 'Multiple class times available weekly',
      skills: ['Balance', 'Coordination', 'Basic tumbling', 'Listening skills', 'Following directions']
    },
    image: '/images/threes.jpg'
  },
  {
    id: 'beginner-preschool',
    title: 'Beginner Preschool',
    ageRange: '4-5 years',
    description: 'Designed for preschoolers ready to learn gymnastics fundamentals. Classes focus on basic skills on all apparatus while developing strength, flexibility, and coordination.',
    details: {
      duration: '45 minutes',
      ratio: '5:1 student to teacher ratio',
      schedule: 'Classes available afternoons and evenings',
      skills: ['Forward rolls', 'Backward rolls', 'Cartwheels', 'Balance beam walks', 'Bar hangs and swings']
    },
    image: '/images/beginner-preschool.jpg'
  },
  {
    id: 'beginner-boys',
    title: 'Beginner Boys',
    ageRange: '6-12 years',
    description: 'Boys-specific classes focusing on developing strength, coordination, and fundamental gymnastics skills on men\'s apparatus: floor, pommel horse, rings, vault, parallel bars, and high bar.',
    details: {
      duration: '60 minutes',
      ratio: '6:1 student to teacher ratio',
      schedule: 'Classes available evenings and weekends',
      skills: ['Handstands', 'Cartwheels', 'Basic vaulting', 'Support positions on bars', 'Strength development']
    },
    image: '/images/beginner-boys.jpg'
  },
  {
    id: 'adult-gymnastics',
    title: 'Adult Gymnastics',
    ageRange: '18+ years',
    description: 'Classes designed for adults of all experience levels. Whether you\'re a former gymnast looking to stay active or a beginner wanting to try something new, our adult classes provide a fun and supportive environment.',
    details: {
      duration: '90 minutes',
      ratio: '8:1 student to teacher ratio',
      schedule: 'Evening classes available',
      skills: ['Flexibility', 'Strength', 'Basic tumbling', 'Apparatus skills', 'Personalized progression']
    },
    image: '/images/adult-gymnastics.jpg'
  },
  {
    id: 'cheer-courses',
    title: 'Cheer Courses',
    ageRange: '6-18 years',
    description: 'Specialized tumbling and stunting classes for cheerleaders. Focus on developing the specific tumbling, jumping, and flexibility skills needed for cheerleading.',
    details: {
      duration: '60 minutes',
      ratio: '6:1 student to teacher ratio',
      schedule: 'Classes available evenings',
      skills: ['Tumbling passes', 'Jumps', 'Flexibility', 'Performance', 'Conditioning']
    },
    image: '/images/cheer.jpg'
  }
];

// Camps and Events data
export const eventsData = [
  {
    id: 'skills-clinic',
    title: 'Skills Clinic',
    date: 'June 15, 2025',
    time: '1:00 PM - 3:00 PM',
    price: '$15',
    description: 'Focus on specific skills in a concentrated format. Open to gymnasts of all levels who want to improve particular elements.',
    location: '360 Gymnastics Facility',
    registration: 'Required - Limited spots available'
  },
  {
    id: 'spring-showcase',
    title: 'Spring Showcase',
    date: 'May 20, 2025',
    time: '5:00 PM - 7:00 PM',
    price: '$35',
    description: 'Annual non-competitive exhibition where gymnasts can showcase their skills to friends and family.',
    location: '360 Gymnastics Facility',
    registration: 'Required - Register by May 10'
  },
  {
    id: 'summer-camp',
    title: 'Summer Camp',
    date: 'July 10-14, 2025',
    time: '9:00 AM - 3:00 PM',
    price: '$225/week',
    description: 'Full-day summer camp featuring gymnastics, games, crafts, and fun activities for children ages 5-12.',
    location: '360 Gymnastics Facility',
    registration: 'Required - Early bird discount available'
  },
  {
    id: 'parents-night-out',
    title: 'Parents\' Night Out',
    date: 'Last Friday of each month',
    time: '6:00 PM - 9:00 PM',
    price: '$25',
    description: 'Drop your kids off for an evening of supervised gymnastics, games, pizza, and fun while you enjoy some time off!',
    location: '360 Gymnastics Facility',
    registration: 'Required - 48 hours in advance'
  },
  {
    id: 'competitive-meet',
    title: 'Home Gymnastics Meet',
    date: 'November 12-13, 2025',
    time: 'Various sessions',
    price: 'Spectators: $10',
    description: 'USAG sanctioned competition hosted by 360 Gymnastics featuring teams from across the region.',
    location: '360 Gymnastics Facility',
    registration: 'Participating gymnasts register through their coaches'
  }
];

// Open Gym sessions data
export const openGymData = {
  description: "Open Gym provides supervised, non-instructional time for children to practice skills, play on equipment, and enjoy the facility. Participants must follow safety rules and staff directions at all times.",
  sessions: [
    {
      day: 'Monday',
      time: '7:00 PM - 8:30 PM',
      ageGroup: 'Ages 6+',
      price: '$10 per session'
    },
    {
      day: 'Wednesday',
      time: '1:00 PM - 2:30 PM',
      ageGroup: 'Preschool (Ages 1-5)',
      price: '$8 per session'
    },
    {
      day: 'Friday',
      time: '6:00 PM - 8:00 PM',
      ageGroup: 'Ages 6+',
      price: '$15 per session'
    },
    {
      day: 'Saturday',
      time: '11:00 AM - 12:30 PM',
      ageGroup: 'All Ages',
      price: '$10 per session'
    }
  ],
  policies: [
    'Waivers must be signed before participation',
    'Non-marking shoes or bare feet only',
    'No food or drink in the gym area',
    'Parents must supervise children under 5',
    'Staff reserves the right to remove participants for unsafe behavior'
  ]
};

// Team levels data
export const teamData = [
  {
    level: 'Bronze',
    ageRange: '5-7 years',
    description: 'Introductory competitive team focusing on basic skills and developing proper technique. Competes in local meets.',
    practiceSchedule: '2 days per week, 2 hours per practice',
    requirements: 'By invitation or evaluation only'
  },
  {
    level: 'Silver',
    ageRange: '6-9 years',
    description: 'Progressive team building on Bronze level skills. Competes in local and some regional meets.',
    practiceSchedule: '3 days per week, 3 hours per practice',
    requirements: 'Must have completed Bronze level or equivalent skills'
  },
  {
    level: 'Gold',
    ageRange: '7-12 years',
    description: 'Intermediate competitive team focusing on advanced skills and competition preparation. Competes in regional meets.',
    practiceSchedule: '3-4 days per week, 3-4 hours per practice',
    requirements: 'Must have completed Silver level or equivalent skills'
  },
  {
    level: 'Platinum',
    ageRange: '8+ years',
    description: 'Advanced competitive team preparing for higher-level competitions. Competes in regional and state meets.',
    practiceSchedule: '4 days per week, 4 hours per practice',
    requirements: 'Must have completed Gold level or equivalent skills'
  },
  {
    level: 'USAG Levels 1-10',
    ageRange: 'Varies by level',
    description: 'Official USA Gymnastics competitive program following standardized requirements for each level.',
    practiceSchedule: 'Varies by level, typically 3-5 days per week',
    requirements: 'By evaluation and coach recommendation only'
  }
];

// Staff data
export const staffData = [
  {
    name: 'Coach Sarah',
    position: 'Head Coach & Gym Director',
    bio: 'Former collegiate gymnast with 15+ years of coaching experience. Specializes in beam and floor. USAG Professional Member, Safety Certified.',
    image: '/images/coach-sarah.jpg'
  },
  {
    name: 'Coach Mike',
    position: 'Boys Team Coach',
    bio: 'Former Men\'s Collegiate gymnast with expertise in all men\'s events. 10+ years coaching experience. USAG Safety Certified.',
    image: '/images/coach-mike.jpg'
  },
  {
    name: 'Coach Emily',
    position: 'Preschool Program Director',
    bio: 'Early childhood education specialist with gymnastics background. Creates developmentally appropriate curriculum for our youngest gymnasts.',
    image: '/images/coach-emily.jpg'
  },
  {
    name: 'Coach Jason',
    position: 'Girls Team Coach',
    bio: 'Specializes in vault and uneven bars. Former Regional Champion. 8+ years coaching competitive gymnastics.',
    image: '/images/coach-jason.jpg'
  },
  {
    name: 'Coach Tanya',
    position: 'Recreational Program Director',
    bio: 'Oversees all recreational classes and special events. Former gymnast with 12+ years coaching experience.',
    image: '/images/coach-tanya.jpg'
  }
];

// Tuition data
export const tuitionData = {
  registrationFee: '$50 annual registration fee per family',
  policies: [
    'Tuition is due by the 1st of each month',
    'Auto-pay available and encouraged',
    '10% sibling discount for additional children',
    'No refunds for missed classes',
    'One make-up class allowed per month with 24-hour notice'
  ],
  classPricing: [
    {
      program: 'Parent-Tot (45 min)',
      frequency: 'Once weekly',
      monthlyRate: '$75'
    },
    {
      program: 'Threes (45 min)',
      frequency: 'Once weekly',
      monthlyRate: '$85'
    },
    {
      program: 'Beginner Preschool (45 min)',
      frequency: 'Once weekly',
      monthlyRate: '$90'
    },
    {
      program: 'Beginner Boys (60 min)',
      frequency: 'Once weekly',
      monthlyRate: '$100'
    },
    {
      program: 'Adult Gymnastics (90 min)',
      frequency: 'Once weekly',
      monthlyRate: '$120'
    },
    {
      program: 'Cheer Courses (60 min)',
      frequency: 'Once weekly',
      monthlyRate: '$100'
    }
  ],
  teamPricing: [
    {
      level: 'Bronze Team',
      frequency: 'Twice weekly',
      monthlyRate: '$180'
    },
    {
      level: 'Silver Team',
      frequency: 'Three times weekly',
      monthlyRate: '$225'
    },
    {
      level: 'Gold Team',
      frequency: '3-4 times weekly',
      monthlyRate: '$275'
    },
    {
      level: 'Platinum Team',
      frequency: '4 times weekly',
      monthlyRate: '$325'
    },
    {
      level: 'USAG Competitive Teams',
      frequency: 'Varies by level',
      monthlyRate: 'Contact for pricing'
    }
  ]
};

// Contact information
export const contactData = {
  address: {
    street: '431 N Lindenwood Dr',
    city: 'Olathe',
    state: 'KS',
    zip: '66062',
    mapUrl: 'https://maps.google.com/?q=431+N+Lindenwood+Dr,+Olathe,+KS+66062'
  },
  phone: '913-782-3300',
  email: 'kc360gym@gmail.com',
  socialMedia: {
    facebook: 'https://www.facebook.com/KC360Gymnastics/'
  },
  hours: [
    { day: 'Monday - Thursday', hours: '9:00 AM - 8:30 PM' },
    { day: 'Friday', hours: '9:00 AM - 8:00 PM' },
    { day: 'Saturday', hours: '9:00 AM - 1:00 PM' },
    { day: 'Sunday', hours: 'Closed' }
  ]
};
