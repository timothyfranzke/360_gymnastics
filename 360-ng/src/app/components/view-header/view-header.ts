import { Component, Input, Output, EventEmitter } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { CommonModule } from '@angular/common';

export interface ViewHeaderAction {
  label: string;
  action: string;
  style?: 'primary' | 'secondary';
  disabled?: boolean;
}

@Component({
  selector: 'app-view-header',
  imports: [CommonModule],
  templateUrl: './view-header.html',
  styleUrl: './view-header.scss',
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
export class ViewHeader {
  @Input() title: string = '';
  @Input() description: string = '';
  @Input() actions: ViewHeaderAction[] = [];
  @Output() actionClicked = new EventEmitter<string>();

  animationState = 'in';

  onActionClick(action: string): void {
    this.actionClicked.emit(action);
  }
}
