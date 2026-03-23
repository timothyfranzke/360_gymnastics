import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Subject, takeUntil } from 'rxjs';
import { GalleryImage, ApiResponse } from '../../../../interfaces/api';

@Component({
  selector: 'app-gallery-picker',
  templateUrl: './gallery-picker.html',
  styleUrls: ['./gallery-picker.scss'],
  imports: [CommonModule]
})
export class GalleryPicker implements OnInit, OnDestroy {
  @Output() imageSelected = new EventEmitter<GalleryImage>();
  @Output() close = new EventEmitter<void>();

  images: GalleryImage[] = [];
  isLoading = true;

  private destroy$ = new Subject<void>();

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadImages();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private getApiBase(): string {
    const isLocalhost = window.location.hostname === 'localhost' ||
                       window.location.hostname === '127.0.0.1';
    return isLocalhost ? 'http://localhost:8080/api/v1' : '/api/v1';
  }

  loadImages(): void {
    this.http.get<ApiResponse<GalleryImage[]>>(`${this.getApiBase()}/gallery`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.images = response.data || [];
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
        }
      });
  }

  selectImage(image: GalleryImage): void {
    this.imageSelected.emit(image);
  }

  onClose(): void {
    this.close.emit();
  }

  onOverlayClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('gallery-overlay')) {
      this.onClose();
    }
  }
}
