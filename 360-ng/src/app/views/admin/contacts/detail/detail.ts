import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ContactsService } from '../../../../services/contacts';
import { ContactSubmission } from '../list/list';

@Component({
  selector: 'app-contact-detail',
  templateUrl: './detail.html',
  styleUrls: ['./detail.scss'],
  imports: [CommonModule, RouterLink]
})
export class ContactDetailComponent implements OnInit, OnDestroy {
  contact: ContactSubmission | null = null;
  isLoading = true;
  error: string | null = null;
  notification: { message: string; type: 'success' | 'error' } | null = null;
  
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private contactsService: ContactsService
  ) {}

  ngOnInit(): void {
    const contactId = this.route.snapshot.paramMap.get('id');
    if (contactId) {
      this.loadContact(+contactId);
    } else {
      this.error = 'Invalid contact ID';
      this.isLoading = false;
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadContact(id: number): void {
    this.isLoading = true;
    this.error = null;

    this.contactsService.getContact(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (contact: ContactSubmission) => {
          this.contact = contact;
          this.isLoading = false;
          
          // Mark as read if it's new
          if (contact.status === 'new') {
            this.updateContactStatus('read');
          }
        },
        error: (error) => {
          console.error('Failed to load contact', error);
          this.error = error.message || 'Failed to load contact';
          this.isLoading = false;
        }
      });
  }

  updateContactStatus(event: Event | string): void {
    if (!this.contact) return;

    // Handle both Event (from template) and string (from direct calls)
    const status = (typeof event === 'string' 
      ? event 
      : (event.target as HTMLSelectElement).value) as 'new' | 'read' | 'responded';

    const oldStatus = this.contact.status;
    this.contact.status = status;

    this.contactsService.updateContact(this.contact.id, { status })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.showNotification(`Contact status updated to ${status}`, 'success');
        },
        error: (error) => {
          if (this.contact) {
            this.contact.status = oldStatus;
          }
          console.error('Failed to update contact status', error);
          this.showNotification('Failed to update contact status: ' + error.message, 'error');
        }
      });
  }

  deleteContact(): void {
    if (!this.contact) return;

    if (!confirm(`Are you sure you want to delete this contact submission from ${this.contact.name}?\n\nThis action cannot be undone.`)) {
      return;
    }

    this.contactsService.deleteContact(this.contact.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.showNotification(`Contact submission from ${this.contact?.name} has been deleted.`, 'success');
          // Navigate back to list after a brief delay
          setTimeout(() => {
            this.router.navigate(['/admin/contacts/list']);
          }, 1500);
        },
        error: (error) => {
          console.error('Failed to delete contact', error);
          this.showNotification('Failed to delete contact: ' + error.message, 'error');
        }
      });
  }

  showNotification(message: string, type: 'success' | 'error'): void {
    this.notification = { message, type };
    // Auto-hide after 3 seconds
    setTimeout(() => {
      this.notification = null;
    }, 3000);
  }

  dismissNotification(): void {
    this.notification = null;
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'new': return 'badge-danger';
      case 'read': return 'badge-warning';
      case 'responded': return 'badge-success';
      default: return 'badge-secondary';
    }
  }
}