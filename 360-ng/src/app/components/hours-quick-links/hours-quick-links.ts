import { Component, OnInit } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DialogService } from '../../services/dialog-service';

interface HourEntry {
  day: string;
  hours: string;
  isToday?: boolean;
}

interface QuickLink {
  title: string;
  description: string;
  icon: string;
  action: () => void;
  type: 'link' | 'dialog' | 'external';
  url?: string;
  colorClass: string;
}

@Component({
  selector: 'app-hours-quick-links',
  templateUrl: './hours-quick-links.html',
  styleUrls: ['./hours-quick-links.scss'],
  imports: [CommonModule, RouterLink],
  animations: [
    trigger('fadeInUp', [
      state('in', style({ opacity: 1, transform: 'translateY(0)' })),
      transition('void => *', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('600ms ease-out')
      ])
    ]),
    trigger('staggerItems', [
      state('in', style({ opacity: 1, transform: 'translateY(0)' })),
      transition('void => *', [
        style({ opacity: 0, transform: 'translateY(30px)' }),
        animate('600ms ease-out')
      ])
    ]),
    trigger('scaleIn', [
      state('in', style({ opacity: 1, transform: 'scale(1)' })),
      transition('void => *', [
        style({ opacity: 0, transform: 'scale(0.9)' }),
        animate('400ms ease-out')
      ])
    ])
  ]
})
export class HoursQuickLinks implements OnInit {
  animationState = 'in';
  
  gymHours: HourEntry[] = [
    { day: 'Monday - Thursday', hours: '9:00 AM – 9:00 PM' },
    { day: 'Friday', hours: '9:00 AM – 8:30 PM' },
    { day: 'Saturday', hours: '9:00 AM – 4:00 PM' },
    { day: 'Sunday', hours: 'Parties by Request' }
  ];

  quickLinks: QuickLink[] = [
    {
      title: 'Make-Up Policy',
      description: 'View our class make-up policy and procedures',
      icon: 'calendar',
      action: () => this.showMakeUpPolicy(),
      type: 'dialog',
      colorClass: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      title: 'Schedule & Tuition',
      description: 'View class schedules and pricing information',
      icon: 'schedule',
      action: () => this.navigateToSchedule(),
      type: 'link',
      url: '/schedule-tuition',
      colorClass: 'bg-green-500 hover:bg-green-600'
    },
    {
      title: 'Contact Us',
      description: 'Get in touch with our team',
      icon: 'phone',
      action: () => this.navigateToContact(),
      type: 'link',
      url: '/contact',
      colorClass: 'bg-purple-500 hover:bg-purple-600'
    },
    {
      title: 'Register Online',
      description: 'Sign up for classes through JackRabbit',
      icon: 'register',
      action: () => this.openRegistration(),
      type: 'external',
      url: 'https://app.jackrabbitclass.com/jr3.0/Openings/OpeningsListing?id=514082',
      colorClass: 'bg-orange-500 hover:bg-orange-600'
    }
  ];

  constructor(private dialogService: DialogService) {}

  ngOnInit(): void {
    this.setTodayFlag();
  }

  private setTodayFlag(): void {
    const today = new Date().getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    this.gymHours.forEach(entry => {
      entry.isToday = false;
      
      if (entry.day === 'Monday - Thursday' && today >= 1 && today <= 4) {
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

  async showMakeUpPolicy(): Promise<void> {
    console.log('showMakeUpPolicy');
    const policyContent = `
      <div class="text-left">
        <h4 class="font-semibold mb-3">Class Make-Up Policy</h4>
        <ul class="space-y-2 text-sm">
          <li>• <strong>Make-ups must be scheduled in advance</strong> - Contact us before your missed class</li>
          <li>• <strong>Same level classes only</strong> - Make-ups must be with classes of similar skill level</li>
          <li>• <strong>Space availability</strong> - Make-ups are subject to available space in other classes</li>
          <li>• <strong>One month window</strong> - Make-ups must be completed within 30 days of the missed class</li>
          <li>• <strong>Holiday closures</strong> - We offer make-up opportunities for gym closure days</li>
          <li>• <strong>No refunds</strong> - Missed classes without make-ups are not refundable</li>
        </ul>
        <p class="mt-4 text-sm text-gray-600">
          <strong>To schedule a make-up:</strong> Call us at (913) 782-3300 or email kc360gym@gmail.com
        </p>
      </div>
    `;

    await this.dialogService.custom({
      title: 'Class Make-Up Policy',
      message: policyContent,
      icon: 'info',
      buttons: [
        { text: 'Contact Us', type: 'secondary', action: 'contact' },
        { text: 'Got It', type: 'primary', action: 'ok' }
      ],
      maxWidth: '600px'
    }).then((result: string) => {
      if (result === 'contact') {
        this.navigateToContact();
      }
    });
  }

  navigateToSchedule(): void {
    // This would typically use Angular Router
    window.location.href = '/schedule-tuition';
  }

  navigateToContact(): void {
    // This would typically use Angular Router
    window.location.href = '/contact';
  }

  openRegistration(): void {
    window.open('https://app.jackrabbitclass.com/jr3.0/Openings/OpeningsListing?id=514082', '_blank');
  }

  getIconPath(iconType: string): string {
    const icons: { [key: string]: string } = {
      calendar: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
      schedule: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
      phone: 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z',
      register: 'M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z'
    };
    return icons[iconType] || icons['calendar'];
  }

  onQuickLinkClick(link: QuickLink): void {
    link.action();
  }
}