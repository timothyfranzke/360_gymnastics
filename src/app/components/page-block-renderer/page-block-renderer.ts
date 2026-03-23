import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageBlock, HeadingData, ParagraphData, ListData, ImageData, GridData } from '../../interfaces/page';

@Component({
  selector: 'app-page-block-renderer',
  templateUrl: './page-block-renderer.html',
  styleUrls: ['./page-block-renderer.scss'],
  imports: [CommonModule]
})
export class PageBlockRenderer {
  @Input() block!: PageBlock;

  get headingData(): HeadingData { return this.block.data as HeadingData; }
  get paragraphData(): ParagraphData { return this.block.data as ParagraphData; }
  get listData(): ListData { return this.block.data as ListData; }
  get imageData(): ImageData { return this.block.data as ImageData; }
  get gridData(): GridData { return this.block.data as GridData; }

  getGridClasses(): string {
    switch (this.gridData.preset) {
      case '2-equal': return 'grid grid-cols-1 md:grid-cols-2 gap-6';
      case '3-equal': return 'grid grid-cols-1 md:grid-cols-3 gap-6';
      case '1-3-2-3': return 'grid grid-cols-1 md:grid-cols-3 gap-6';
      case '2-3-1-3': return 'grid grid-cols-1 md:grid-cols-3 gap-6';
      default: return 'grid grid-cols-1 md:grid-cols-2 gap-6';
    }
  }

  getColumnClasses(colIndex: number): string {
    switch (this.gridData.preset) {
      case '1-3-2-3':
        return colIndex === 0 ? 'md:col-span-1' : 'md:col-span-2';
      case '2-3-1-3':
        return colIndex === 0 ? 'md:col-span-2' : 'md:col-span-1';
      default:
        return '';
    }
  }

  getImageBase(): string {
    const isLocalhost = window.location.hostname === 'localhost' ||
                       window.location.hostname === '127.0.0.1';
    return isLocalhost ? 'http://localhost:8080' : '';
  }

  getImageUrl(): string {
    return this.getImageBase() + (this.imageData.url || '');
  }
}
