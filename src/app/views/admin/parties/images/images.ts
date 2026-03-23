import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../../../services/api.service';
import { ScreenImageData, GalleryImage } from '../../../../interfaces/api';

interface PartyPosition {
  key: string;
  label: string;
  current: ScreenImageData | null;
}

@Component({
  selector: 'app-party-images',
  templateUrl: './images.html',
  styleUrls: ['./images.scss'],
  imports: [CommonModule, RouterLink]
})
export class PartyImages implements OnInit {
  positions: PartyPosition[] = [
    { key: 'parties-1', label: 'Private Party Image', current: null },
    { key: 'parties-2', label: 'Open Gym Party Image', current: null }
  ];

  isLoading = true;
  error: string | null = null;

  // Gallery browser state
  showGalleryBrowser = false;
  activePositionKey: string | null = null;
  galleryImages: GalleryImage[] = [];
  galleryLoading = false;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadCurrentImages();
  }

  loadCurrentImages(): void {
    this.isLoading = true;
    this.error = null;

    this.apiService.getScreenImages('parties').subscribe({
      next: (response) => {
        for (const pos of this.positions) {
          const imageData = response.images[pos.key];
          pos.current = imageData || null;
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading party images:', err);
        this.error = 'Failed to load current party images.';
        this.isLoading = false;
      }
    });
  }

  openGalleryBrowser(positionKey: string): void {
    this.activePositionKey = positionKey;
    this.showGalleryBrowser = true;
    this.galleryLoading = true;

    this.apiService.getGalleryImages().subscribe({
      next: (response) => {
        this.galleryImages = response.data || response.images || [];
        this.galleryLoading = false;
      },
      error: (err) => {
        console.error('Error loading gallery:', err);
        this.galleryImages = [];
        this.galleryLoading = false;
      }
    });
  }

  closeGalleryBrowser(): void {
    this.showGalleryBrowser = false;
    this.activePositionKey = null;
    this.galleryImages = [];
  }

  selectGalleryImage(image: GalleryImage): void {
    if (!this.activePositionKey) return;

    this.apiService.assignScreenImage({
      screen_key: 'parties',
      position_key: this.activePositionKey,
      gallery_id: image.id
    }).subscribe({
      next: () => {
        this.closeGalleryBrowser();
        this.loadCurrentImages();
      },
      error: (err) => {
        console.error('Error assigning image:', err);
        this.error = 'Failed to assign image. Please try again.';
      }
    });
  }

  removeImage(position: PartyPosition): void {
    if (!position.current) return;

    this.apiService.removeScreenImage(position.current.id).subscribe({
      next: () => {
        position.current = null;
      },
      error: (err) => {
        console.error('Error removing image:', err);
        this.error = 'Failed to remove image. Please try again.';
      }
    });
  }

  getImageUrl(position: PartyPosition): string {
    return position.current?.url || position.current?.thumbnail_url || '';
  }
}
