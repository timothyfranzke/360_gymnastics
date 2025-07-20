import { Component, OnInit } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

interface Feature {
  title: string;
  description: string;
  icon: string;
  iconColor: string;
}

@Component({
  selector: 'app-main-activities',
  templateUrl: './main-activities.html',
  styleUrls: ['./main-activities.scss'],
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
    trigger('staggerCards', [
      state('in', style({ opacity: 1, transform: 'translateY(0)' })),
      transition('void => *', [
        style({ opacity: 0, transform: 'translateY(30px)' }),
        animate('600ms ease-out')
      ])
    ]),
    trigger('slideInRight', [
      state('in', style({ opacity: 1, transform: 'translateX(0)' })),
      transition('void => *', [
        style({ opacity: 0, transform: 'translateX(50px)' }),
        animate('800ms 600ms ease-out')
      ])
    ])
  ]
})
export class MainActivities implements OnInit {
  animationState = 'in';
  
  features: Feature[] = [
    {
      title: 'Large Open Facility',
      description: 'Spacious gym designed for beginners to expert gymnasts with professional equipment.',
      icon: 'facility',
      iconColor: 'text-yellow-300'
    },
    {
      title: 'Recreational & Competitive',
      description: 'Gymnastics programs for all ages and skill levels, from recreational fun to competitive teams.',
      icon: 'gymnastics',
      iconColor: 'text-pink-400'
    },
    {
      title: 'Experienced Staff',
      description: 'Fun and friendly coaches with decades of experience in gymnastics training.',
      icon: 'staff',
      iconColor: 'text-green-400'
    },
    {
      title: 'Open Gym & Parties',
      description: 'Open gym sessions to burn off energy plus birthday parties hosted by our staff.',
      icon: 'events',
      iconColor: 'text-blue-400'
    }
  ];

  ngOnInit(): void {
    // Component initialization logic here if needed
  }

  getIconPath(iconType: string): string {
    const icons: { [key: string]: string } = {
      facility: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
      gymnastics: 'M13 10V3L4 14h7v7l9-11h-7z',
      staff: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
      events: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z'
    };
    return icons[iconType] || icons['facility'];
  }
}