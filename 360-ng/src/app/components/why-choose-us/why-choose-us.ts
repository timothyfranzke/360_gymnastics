import { Component, OnInit } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { AssetPathPipe } from '../../pipes/asset-path.pipe';

interface FeatureCard {
  icon: string;
  bgColor: string;
  title: string;
  description: string;
}

@Component({
  selector: 'app-why-choose-us',
  templateUrl: './why-choose-us.html',
  styleUrls: ['./why-choose-us.scss'],
  imports: [CommonModule, AssetPathPipe],
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
    trigger('fadeInLeft', [
      state('in', style({ opacity: 1, transform: 'translateX(0)' })),
      transition('void => *', [
        style({ opacity: 0, transform: 'translateX(-30px)' }),
        animate('600ms 400ms ease-out')
      ])
    ]),
    trigger('fadeInRight', [
      state('in', style({ opacity: 1, transform: 'translateX(0)' })),
      transition('void => *', [
        style({ opacity: 0, transform: 'translateX(30px)' }),
        animate('600ms 600ms ease-out')
      ])
    ]),
    trigger('staggerCards', [
      state('in', style({ opacity: 1, transform: 'translateY(0)' })),
      transition('void => *', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('600ms ease-out')
      ])
    ])
  ]
})
export class WhyChooseUs implements OnInit {
  animationState = 'in';
  
  features: FeatureCard[] = [
    {
      icon: 'lightning',
      bgColor: 'bg-orange-400',
      title: 'Target Skillsets',
      description: 'We focus on developing specific skills tailored to each gymnast\'s abilities.'
    },
    {
      icon: 'happy',
      bgColor: 'bg-cyan-400',
      title: 'Extra Activities',
      description: 'We offer special events, camps, and open gym sessions throughout the year.'
    },
    {
      icon: 'lightbulb',
      bgColor: 'bg-yellow-400',
      title: 'Complete Training',
      description: 'Our comprehensive approach develops strength, flexibility, coordination and confidence.'
    },
    {
      icon: 'person',
      bgColor: 'bg-blue-400',
      title: 'Individual Care',
      description: 'Our certified coaches provide personalized attention to help each gymnast flourish.'
    }
  ];

  ngOnInit(): void {
    // Component initialization logic here if needed
  }

  getIconPath(iconType: string): string {
    const icons: { [key: string]: string } = {
      lightning: 'M13 10V3L4 14h7v7l9-11h-7z',
      happy: 'M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
      lightbulb: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z',
      person: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
    };
    return icons[iconType] || icons['lightning'];
  }
}