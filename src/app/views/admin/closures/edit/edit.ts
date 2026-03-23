import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-closure-edit',
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Edit Closure</h1>
          <p class="mt-1 text-sm text-gray-500">Update closure details</p>
        </div>
        <a routerLink="/admin/closures" class="btn-secondary">
          Back to Closures
        </a>
      </div>
      
      <div class="bg-white rounded-lg shadow p-8 text-center">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">Edit Closure</h3>
        <p class="mt-1 text-sm text-gray-500">
          Closure editing form would be implemented here with pre-populated fields
          for updating closure information.
        </p>
      </div>
    </div>
  `,
  imports: [CommonModule, RouterLink]
})
export class ClosureEdit {}