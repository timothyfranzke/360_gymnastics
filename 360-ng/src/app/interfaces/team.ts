export interface Team {
  id: string;
  name: string;
  description: string;
  ageRange: string;
  levels: string[];
  practiceSchedule: PracticeSchedule[];
  coaches: Coach[];
  achievements: string[];
  requirements: string[];
  imageUrl?: string;
  color: 'orange' | 'blue';
}

export interface Coach {
  name: string;
  title: string;
  imageUrl?: string;
}

export interface PracticeSchedule {
  days: string;
  times: string;
  level?: string;
}
