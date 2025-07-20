import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { DialogConfig } from '../components/dialog/dialog';

export interface DialogInstance {
  id: string;
  config: DialogConfig;
  resolve?: (result: any) => void;
  reject?: (reason: any) => void;
}

@Injectable({
  providedIn: 'root'
})
export class DialogService {
  private dialogs$ = new BehaviorSubject<DialogInstance[]>([]);
  private idCounter = 0;

  getDialogs(): Observable<DialogInstance[]> {
    return this.dialogs$.asObservable();
  }

  getCurrentDialogs(): DialogInstance[] {
    return this.dialogs$.value;
  }

  /**
   * Open a basic dialog with custom message and buttons
   */
  open(config: DialogConfig): Promise<string> {
    return new Promise((resolve, reject) => {
      const id = `dialog-${++this.idCounter}`;
      const dialogInstance: DialogInstance = {
        id,
        config: {
          showCloseButton: true,
          closeOnOverlayClick: true,
          closeOnEscape: true,
          maxWidth: '500px',
          ...config
        },
        resolve,
        reject
      };

      // Set default buttons if none provided
      if (!dialogInstance.config.buttons || dialogInstance.config.buttons.length === 0) {
        dialogInstance.config.buttons = [
          { text: 'OK', type: 'primary', action: 'ok' }
        ];
      }

      const currentDialogs = this.dialogs$.value;
      this.dialogs$.next([...currentDialogs, dialogInstance]);
    });
  }

  /**
   * Open a confirmation dialog
   */
  confirm(message: string, title?: string): Promise<boolean> {
    const config: DialogConfig = {
      title: title || 'Confirm',
      message,
      icon: 'question',
      buttons: [
        { text: 'Cancel', type: 'secondary', action: 'cancel' },
        { text: 'Confirm', type: 'primary', action: 'confirm' }
      ],
      closeOnOverlayClick: false
    };

    return this.open(config).then(result => result === 'confirm');
  }

  /**
   * Open an alert dialog
   */
  alert(message: string, title?: string, type: 'info' | 'warning' | 'error' | 'success' = 'info'): Promise<void> {
    const config: DialogConfig = {
      title: title || this.getDefaultTitle(type),
      message,
      icon: type,
      buttons: [
        { text: 'OK', type: 'primary', action: 'ok' }
      ]
    };

    return this.open(config).then(() => void 0);
  }

  /**
   * Open a custom dialog with multiple action buttons
   */
  custom(config: DialogConfig): Promise<string> {
    return this.open(config);
  }

  /**
   * Close a specific dialog by ID
   */
  close(dialogId: string, result?: string): void {
    const currentDialogs = this.dialogs$.value;
    const dialogIndex = currentDialogs.findIndex(d => d.id === dialogId);
    
    if (dialogIndex !== -1) {
      const dialog = currentDialogs[dialogIndex];
      if (dialog.resolve) {
        dialog.resolve(result || 'close');
      }
      
      const updatedDialogs = currentDialogs.filter(d => d.id !== dialogId);
      this.dialogs$.next(updatedDialogs);
    }
  }

  /**
   * Close all dialogs
   */
  closeAll(): void {
    const currentDialogs = this.dialogs$.value;
    currentDialogs.forEach(dialog => {
      if (dialog.resolve) {
        dialog.resolve('close');
      }
    });
    this.dialogs$.next([]);
  }

  /**
   * Handle button click for a specific dialog
   */
  handleButtonClick(dialogId: string, action: string): void {
    this.close(dialogId, action);
  }

  private getDefaultTitle(type: string): string {
    const titles: { [key: string]: string } = {
      info: 'Information',
      warning: 'Warning',
      error: 'Error',
      success: 'Success'
    };
    return titles[type] || 'Information';
  }
}