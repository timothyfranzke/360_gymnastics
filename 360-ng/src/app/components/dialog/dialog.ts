import { Component, Input, Output, EventEmitter, OnInit, HostListener } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { CommonModule } from '@angular/common';

export interface DialogButton {
  text: string;
  type?: 'primary' | 'secondary' | 'danger' | 'success';
  action?: string;
  disabled?: boolean;
  loading?: boolean;
}

export interface DialogConfig {
  title?: string;
  message: string;
  buttons?: DialogButton[];
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  maxWidth?: string;
  icon?: 'info' | 'warning' | 'error' | 'success' | 'question';
}

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.html',
  styleUrls: ['./dialog.scss'],
  imports: [CommonModule],
  animations: [
    trigger('overlayAnimation', [
      state('void', style({ opacity: 0 })),
      state('visible', style({ opacity: 1 })),
      transition('void => visible', [
        animate('200ms ease-in')
      ]),
      transition('visible => void', [
        animate('200ms ease-out')
      ])
    ]),
    trigger('dialogAnimation', [
      state('void', style({ 
        opacity: 0, 
        transform: 'scale(0.8) translateY(-50px)' 
      })),
      state('visible', style({ 
        opacity: 1, 
        transform: 'scale(1) translateY(0)' 
      })),
      transition('void => visible', [
        animate('300ms cubic-bezier(0.25, 0.8, 0.25, 1)')
      ]),
      transition('visible => void', [
        animate('200ms ease-out')
      ])
    ])
  ]
})
export class Dialog implements OnInit {
  @Input() visible = false;
  @Input() config: DialogConfig = {
    message: '',
    showCloseButton: true,
    closeOnOverlayClick: true,
    closeOnEscape: true,
    maxWidth: '500px'
  };

  @Output() dialogClose = new EventEmitter<void>();
  @Output() buttonClick = new EventEmitter<string>();

  animationState = 'visible';

  ngOnInit(): void {
    // Set default buttons if none provided
    if (!this.config.buttons || this.config.buttons.length === 0) {
      this.config.buttons = [
        { text: 'OK', type: 'primary', action: 'ok' }
      ];
    }
  }

  @HostListener('document:keydown.escape', ['$event'])
  onEscapeKeydown(event: Event): void {
    if (this.visible && this.config.closeOnEscape) {
      this.close();
    }
  }

  onOverlayClick(event: Event): void {
    if (this.config.closeOnOverlayClick && event.target === event.currentTarget) {
      this.close();
    }
  }

  onButtonClick(button: DialogButton): void {
    if (button.disabled || button.loading) {
      return;
    }

    if (button.action) {
      this.buttonClick.emit(button.action);
    }
    
    // Close dialog unless it's a custom action that should keep it open
    if (!button.action || ['ok', 'cancel', 'yes', 'no', 'close'].includes(button.action)) {
      this.close();
    }
  }

  close(): void {
    this.dialogClose.emit();
  }

  getButtonClasses(button: DialogButton): string {
    const baseClasses = 'px-4 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-opacity-50';
    
    let typeClasses = '';
    switch (button.type) {
      case 'primary':
        typeClasses = 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500';
        break;
      case 'secondary':
        typeClasses = 'bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-500';
        break;
      case 'danger':
        typeClasses = 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500';
        break;
      case 'success':
        typeClasses = 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500';
        break;
      default:
        typeClasses = 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500';
    }

    const disabledClasses = button.disabled || button.loading 
      ? 'opacity-50 cursor-not-allowed hover:scale-100' 
      : '';

    return `${baseClasses} ${typeClasses} ${disabledClasses}`;
  }

  getIconPath(): string {
    const icons: { [key: string]: string } = {
      info: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
      warning: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z',
      error: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z',
      success: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
      question: 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
    };
    return icons[this.config.icon || 'info'] || icons['info'];
  }

  getIconColorClass(): string {
    const iconColors: { [key: string]: string } = {
      info: 'text-blue-500',
      warning: 'text-yellow-500',
      error: 'text-red-500',
      success: 'text-green-500',
      question: 'text-purple-500'
    };
    return iconColors[this.config.icon || 'info'] || iconColors['info'];
  }
}