import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-closure-create',
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Schedule Closure</h1>
          <p class="mt-1 text-sm text-gray-500">Create a new gym closure</p>
        </div>
        <a routerLink="/admin/closures" class="btn-secondary">
          Back to Closures
        </a>
      </div>
      
      <div class="bg-white rounded-lg shadow p-8 text-center">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/>
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">Schedule Closure</h3>
        <p class="mt-1 text-sm text-gray-500">
          Closure creation form would be implemented here with options for emergency closures,
          scheduled maintenance, holidays, and partial day closures.
        </p>
      </div>
    </div>
  `,
  imports: [CommonModule, RouterLink]
})
export class ClosureCreate {}