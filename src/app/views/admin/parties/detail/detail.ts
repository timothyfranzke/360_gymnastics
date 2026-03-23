import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { ApiService } from '../../../../services/api.service';
import { PartyRequest } from '../../../../interfaces/party';

@Component({
  selector: 'app-party-request-detail',
  templateUrl: './detail.html',
  styleUrls: ['./detail.scss'],
  imports: [CommonModule, RouterLink, ReactiveFormsModule]
})
export class PartyRequestDetail implements OnInit, OnDestroy {
  partyRequest: PartyRequest | null = null;
  isLoading = true;
  error: string | null = null;
  isUpdating = false;

  statusForm: FormGroup;
  
  private destroy$ = new Subject<void>();
  private requestId!: number;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
    private fb: FormBuilder
  ) {
    this.statusForm = this.fb.group({
      status: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.route.params
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        this.requestId = +params['id'];
        this.loadPartyRequest();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadPartyRequest(): void {
    this.isLoading = true;
    this.error = null;

    this.apiService.getPartyRequest(this.requestId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (request: PartyRequest) => {
          this.partyRequest = request;
          this.statusForm.patchValue({
            status: request.status
          });
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Failed to load party request', error);
          this.error = error.message || 'Failed to load party request';
          this.isLoading = false;
        }
      });
  }

  updateStatus(): void {
    if (this.statusForm.invalid || !this.partyRequest) {
      return;
    }

    const newStatus = this.statusForm.get('status')?.value;
    if (newStatus === this.partyRequest.status) {
      return; // No change
    }

    this.isUpdating = true;

    this.apiService.updatePartyStatus(this.partyRequest.id, newStatus)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          if (this.partyRequest) {
            this.partyRequest.status = newStatus;
            this.partyRequest.updated_at = new Date().toISOString();
          }
          this.isUpdating = false;
        },
        error: (error) => {
          console.error('Failed to update status', error);
          alert('Failed to update status: ' + error.message);
          this.isUpdating = false;
          // Reset form to original value
          this.statusForm.patchValue({
            status: this.partyRequest?.status
          });
        }
      });
  }

  deletePartyRequest(): void {
    if (!this.partyRequest) return;

    if (!confirm(`Are you sure you want to delete the party request for "${this.partyRequest.child_name}"? This action cannot be undone.`)) {
      return;
    }

    this.apiService.deletePartyRequest(this.partyRequest.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.router.navigate(['/admin/parties']);
        },
        error: (error) => {
          console.error('Failed to delete party request', error);
          alert('Failed to delete party request: ' + error.message);
        }
      });
  }

  // Helper methods
  getStatusColor(status: string): string {
    const colors = {
      pending: 'yellow',
      contacted: 'blue',
      confirmed: 'green',
      cancelled: 'red'
    };
    return colors[status as keyof typeof colors] || 'gray';
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  formatDateTime(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  }

  formatTime(timeString: string): string {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  }

  isUpcoming(requestedDate: string): boolean {
    return new Date(requestedDate) >= new Date();
  }

  getContactMethods(): string[] {
    if (!this.partyRequest) return [];
    
    const methods = [this.partyRequest.email];
    
    if (this.partyRequest.can_text === 'yes') {
      methods.push(`${this.partyRequest.phone} (text)`);
    } else {
      methods.push(`${this.partyRequest.phone} (call only)`);
    }
    
    return methods;
  }

  generateEmailLink(): string {
    if (!this.partyRequest) return '';

    const subject = encodeURIComponent(`${this.partyRequest.child_name}'s Birthday Party - 360 Gym`);
    const body = encodeURIComponent(
      `Hi ${this.partyRequest.parent_name},\n\n` +
      `Thank you for your interest in hosting ${this.partyRequest.child_name}'s birthday party at 360 Gym!\n\n` +
      `Here are the details from your request:\n` +
      `• Child: ${this.partyRequest.child_name} (age ${this.partyRequest.child_age})\n` +
      `• Requested Date: ${this.formatDate(this.partyRequest.requested_date)}\n` +
      `• Requested Time: ${this.formatTime(this.partyRequest.requested_time)}\n` +
      `• Party Type: ${this.partyRequest.party_type}\n` +
      `• Estimated Children: ${this.partyRequest.estimated_children}\n\n` +
      `I'd love to discuss the details and check availability. Please let me know when you're available for a quick call.\n\n` +
      `Best regards,\n360 Gym Team`
    );

    return `mailto:${this.partyRequest.email}?subject=${subject}&body=${body}`;
  }

  generateCallLink(): string {
    if (!this.partyRequest) return '';
    return `tel:${this.partyRequest.phone}`;
  }

  generateTextLink(): string {
    if (!this.partyRequest) return '';
    const message = encodeURIComponent(
      `Hi ${this.partyRequest.parent_name}! This is 360 Gym regarding ${this.partyRequest.child_name}'s birthday party request. When would be a good time to discuss the details?`
    );
    return `sms:${this.partyRequest.phone}&body=${message}`;
  }
}