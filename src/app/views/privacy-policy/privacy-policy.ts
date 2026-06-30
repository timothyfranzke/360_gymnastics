import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ViewHeader } from '../../components/view-header/view-header';

@Component({
  selector: 'app-privacy-policy',
  imports: [CommonModule, ViewHeader],
  templateUrl: './privacy-policy.html',
  styleUrl: './privacy-policy.scss'
})
export class PrivacyPolicy {
  readonly effectiveDate = 'June 25, 2026';

  readonly contact = {
    email: 'kc360gym@gmail.com',
    phone: '(913) 782-3300',
    website: 'https://www.kc360gym.com'
  };
}
