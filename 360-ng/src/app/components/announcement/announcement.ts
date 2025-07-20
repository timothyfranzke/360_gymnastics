import { Component, OnInit } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

interface HourEntry {
  day: string;
  hours: string;
  isToday?: boolean;
}

@Component({
  selector: 'app-announcement',
  templateUrl: './announcement.html',
  styleUrls: ['./announcement.scss'],
  imports: [CommonModule, RouterLink],
  animations: [
    trigger('fadeInUp', [
      state('in', style({ opacity: 1, transform: 'translateY(0)' })),
      transition('void => *', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('600ms ease-out')
      ])
    ]),
    trigger('slideInLeft', [
      state('in', style({ opacity: 1, transform: 'translateX(0)' })),
      transition('void => *', [
        style({ opacity: 0, transform: 'translateX(-30px)' }),
        animate('600ms 200ms ease-out')
      ])
    ]),
    trigger('slideInRight', [
      state('in', style({ opacity: 1, transform: 'translateX(0)' })),
      transition('void => *', [
        style({ opacity: 0, transform: 'translateX(30px)' }),
        animate('600ms 400ms ease-out')
      ])
    ]),
    trigger('scaleIn', [
      state('in', style({ opacity: 1, transform: 'scale(1)' })),
      transition('void => *', [
        style({ opacity: 0, transform: 'scale(0.8)' }),
        animate('600ms 100ms ease-out')
      ])
    ])
  ]
})
export class Announcement implements OnInit {
  animationState = 'in';
  
  gymHours: HourEntry[] = [
    { day: 'Mon-Thu', hours: '9:00 AM – 9:00 PM' },
    { day: 'Friday', hours: '9:00 AM – 8:30 PM' },
    { day: 'Saturday', hours: '9:00 AM – 4:00 PM' },
    { day: 'Sunday', hours: 'Parties by Request' }
  ];

  ngOnInit(): void {
    this.setTodayFlag();
  }

  private setTodayFlag(): void {
    const today = new Date().getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    this.gymHours.forEach(entry => {
      entry.isToday = false;
      
      if (entry.day === 'Mon-Thu' && today >= 1 && today <= 4) {
        entry.isToday = true;
      } else if (entry.day === 'Friday' && today === 5) {
        entry.isToday = true;
      } else if (entry.day === 'Saturday' && today === 6) {
        entry.isToday = true;
      } else if (entry.day === 'Sunday' && today === 0) {
        entry.isToday = true;
      }
    });
  }
}