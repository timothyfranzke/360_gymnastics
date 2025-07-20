import { Component, Inject, OnInit } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { ClassesService } from '../../services/classes';
import { Class } from '../../interface/class';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@Component({
  selector: 'app-classes',
  templateUrl: './classes.html',
  styleUrls: ['./classes.scss'],
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
    ])
  ]
})
export class Classes implements OnInit {
  animationState = 'in';
  classes: Class[] = [];
  constructor(
    private classesService: ClassesService
  ) { }

  ngOnInit(): void {
    this.classes = this.classesService.getClasses();
  }

  scrollToSchedule(): void {
    const element = document.getElementById('class-schedule');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }

  scrollToClassTypes(): void {
    const element = document.getElementById('class-types');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }
}