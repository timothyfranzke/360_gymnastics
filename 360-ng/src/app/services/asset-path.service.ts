import { Injectable, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AssetPathService {
  private baseHref: string;

  constructor(@Inject(DOCUMENT) private document: Document) {
    // Get the base href from the document
    this.baseHref = this.document.getElementsByTagName('base')[0]?.href || '';
    
    // If baseHref ends with '/', remove it to avoid double slashes
    if (this.baseHref.endsWith('/')) {
      this.baseHref = this.baseHref.slice(0, -1);
    }
  }

  /**
   * Get the full path for an image
   */
  getImagePath(imagePath: string): string {
    // Remove leading slash if present
    const cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
    return `${this.baseHref}/${cleanPath}`;
  }

  /**
   * Get the full path for a video
   */
  getVideoPath(videoPath: string): string {
    // Remove leading slash if present
    const cleanPath = videoPath.startsWith('/') ? videoPath.substring(1) : videoPath;
    return `${this.baseHref}/${cleanPath}`;
  }

  /**
   * Get the full path for any asset
   */
  getAssetPath(assetPath: string): string {
    // Remove leading slash if present
    const cleanPath = assetPath.startsWith('/') ? assetPath.substring(1) : assetPath;
    return `${this.baseHref}/${cleanPath}`;
  }

  /**
   * Get the base href
   */
  getBaseHref(): string {
    return this.baseHref;
  }
}