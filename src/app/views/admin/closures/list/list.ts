import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-closure-list',
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Gym Closures</h1>
          <p class="mt-1 text-sm text-gray-500">Manage scheduled and emergency gym closures</p>
        </div>
        <a routerLink="/admin/closures/create" class="btn-primary">
          <svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          Schedule Closure
        </a>
      </div>
      
      <div class="bg-white rounded-lg shadow p-8 text-center">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3a4 4 0 118 0v4m-4 6v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"/>
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">Closure Management</h3>
        <p class="mt-1 text-sm text-gray-500">
          Closure management features would be implemented here including a calendar view,
          closure list with filters, and emergency closure capabilities.
        </p>
      </div>
    </div>
  `,
  imports: [CommonModule, RouterLink]
})
export class ClosureList {}