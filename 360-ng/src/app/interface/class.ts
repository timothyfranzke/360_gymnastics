export interface Class {
    id: string;
    name: string;
    ageRange: string;
    description: string;
    prerequisites: string[];
    structure: string[];
    skills: string[];
    ratio?: string;
    duration?: string;
    url?: string;
    featured?: boolean;
}