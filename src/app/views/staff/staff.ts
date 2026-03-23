import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ViewHeader } from '../../components/view-header/view-header';
import { StaffDisplay } from '../../components/staff-display/staff-display';

@Component({
  selector: 'app-staff-view',
  imports: [CommonModule, ViewHeader, StaffDisplay],
  template: `
    <main class="min-h-screen bg-white pt-24 pb-24">
      <app-view-header
        title="Our Team"
        description="Meet the experienced coaches and staff at 360 Gymnastics">
      </app-view-header>
      
      <app-staff-display></app-staff-display>
    </main>
  `
})
export class StaffView {}
