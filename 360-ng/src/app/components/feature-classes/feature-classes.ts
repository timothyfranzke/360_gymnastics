import { Component, OnInit } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

interface FeaturedClass {
  id: string;
  name: string;
  ageRange: string;
  bgColor: string;
  hoverColor: string;
  iconColor: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-featured-classes',
  templateUrl: './feature-classes.html',
  styleUrls: ['./feature-classes.scss'],
  imports: [CommonModule, RouterLink],
  animations: [
    trigger('fadeInUp', [
      state('in', style({ opacity: 1, transform: 'translateY(0)' })),
      transition('void => *', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('600ms ease-out')
      ])
    ]),
    trigger('fadeInUpDelay', [
      state('in', style({ opacity: 1, transform: 'translateY(0)' })),
      transition('void => *', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('600ms 200ms ease-out')
      ])
    ]),
    trigger('fadeInUpDelay2', [
      state('in', style({ opacity: 1, transform: 'translateY(0)' })),
      transition('void => *', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('600ms 400ms ease-out')
      ])
    ]),
    trigger('staggerClasses', [
      state('in', style({ opacity: 1, transform: 'translateY(0)' })),
      transition('void => *', [
        style({ opacity: 0, transform: 'translateY(30px)' }),
        animate('600ms ease-out')
      ])
    ])
  ]
})
export class FeaturedClasses implements OnInit {
  animationState = 'in';
  
  featuredClasses: FeaturedClass[] = [
    {
      id: 'parent-tot',
      name: 'Parent-Tot',
      ageRange: 'Ages 18mo-3yrs',
      bgColor: 'bg-blue-500',
      hoverColor: 'hover:bg-blue-600',
      iconColor: 'text-blue-500',
      icon: 'happy',
      route: '/classes/parent-tot'
    },
    {
      id: 'beginner-preschool',
      name: 'Beginner Preschool',
      ageRange: 'Ages 4-5.99yrs',
      bgColor: 'bg-cyan-500',
      hoverColor: 'hover:bg-cyan-600',
      iconColor: 'text-cyan-500',
      icon: 'person',
      route: '/classes/beginner-preschool'
    },
    {
      id: 'beginner-boys',
      name: 'Beginner Boys',
      ageRange: 'Boys-only basics',
      bgColor: 'bg-blue-600',
      hoverColor: 'hover:bg-blue-700',
      iconColor: 'text-blue-600',
      icon: 'lightning',
      route: '/classes/beginner-boys'
    },
    {
      id: 'adult-gymnastics',
      name: 'Adult Gymnastics',
      ageRange: 'All skill levels',
      bgColor: 'bg-cyan-600',
      hoverColor: 'hover:bg-cyan-700',
      iconColor: 'text-cyan-600',
      icon: 'lightbulb',
      route: '/classes/adult-gymnastics'
    }
  ];

  ngOnInit(): void {
    // Component initialization logic here if needed
  }

  getIconPath(iconType: string): string {
    const icons: { [key: string]: string } = {
      happy: 'M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
      person: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
      lightning: 'M13 10V3L4 14h7v7l9-11h-7z',
      lightbulb: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z'
    };
    return icons[iconType] || icons['lightning'];
  }

}