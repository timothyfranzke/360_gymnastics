import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { Subject, takeUntil } from 'rxjs';
import { PagesService } from '../../../../services/pages.service';
import { PageBlock, HeadingData, ParagraphData, ListData, ImageData, GridData, GridColumn } from '../../../../interfaces/page';
import { GalleryPicker } from '../gallery-picker/gallery-picker';

@Component({
  selector: 'app-page-editor',
  templateUrl: './editor.html',
  styleUrls: ['./editor.scss'],
  imports: [CommonModule, FormsModule, RouterLink, DragDropModule, GalleryPicker]
})
export class PageEditor implements OnInit, OnDestroy {
  pageId: number | null = null;
  title = '';
  slug = '';
  isPublished = false;
  blocks: PageBlock[] = [];

  isLoading = false;
  isSaving = false;
  error: string | null = null;

  showBlockPicker: number | null = null;
  showGalleryPicker = false;
  activeImageBlockIndex: number | null = null;
  activeGridImageContext: { blockIndex: number; colIndex: number; nestedIndex: number } | null = null;

  private slugManuallyEdited = false;
  private destroy$ = new Subject<void>();

  blockTypes: { type: string; label: string; icon: string }[] = [
    { type: 'heading', label: 'Heading', icon: 'H' },
    { type: 'paragraph', label: 'Paragraph', icon: 'P' },
    { type: 'list', label: 'List', icon: 'L' },
    { type: 'image', label: 'Image', icon: 'I' },
    { type: 'grid', label: 'Grid', icon: 'G' }
  ];

  constructor(
    private pagesService: PagesService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.pageId = +id;
      this.loadPage();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadPage(): void {
    if (!this.pageId) return;
    this.isLoading = true;

    this.pagesService.getPage(this.pageId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (page) => {
          this.title = page.title;
          this.slug = page.slug;
          this.isPublished = page.is_published;
          this.blocks = page.content || [];
          this.slugManuallyEdited = true;
          this.isLoading = false;
        },
        error: (err) => {
          this.error = 'Failed to load page';
          this.isLoading = false;
        }
      });
  }

  onTitleChange(): void {
    if (!this.slugManuallyEdited) {
      this.slug = this.generateSlug(this.title);
    }
  }

  onSlugChange(): void {
    this.slugManuallyEdited = true;
  }

  generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/[\s-]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  // ========== BLOCK MANAGEMENT ==========

  generateBlockId(): string {
    return `block_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  toggleBlockPicker(index: number): void {
    this.showBlockPicker = this.showBlockPicker === index ? null : index;
  }

  addBlock(type: string, index: number): void {
    const block = this.createDefaultBlock(type);
    this.blocks.splice(index, 0, block);
    this.showBlockPicker = null;
  }

  createDefaultBlock(type: string): PageBlock {
    const id = this.generateBlockId();
    switch (type) {
      case 'heading':
        return { id, type: 'heading', data: { level: 2, text: '' } as HeadingData };
      case 'paragraph':
        return { id, type: 'paragraph', data: { text: '', bold: false, italic: false } as ParagraphData };
      case 'list':
        return { id, type: 'list', data: { style: 'bulleted', items: [''] } as ListData };
      case 'image':
        return { id, type: 'image', data: { source: 'upload', gallery_id: null, page_image_id: null, alt: '', caption: '' } as ImageData };
      case 'grid':
        return { id, type: 'grid', data: { preset: '2-equal', columns: [{ blocks: [] }, { blocks: [] }] } as GridData };
      default:
        return { id, type: 'paragraph', data: { text: '', bold: false, italic: false } as ParagraphData };
    }
  }

  moveBlock(from: number, to: number): void {
    if (to >= 0 && to < this.blocks.length) {
      moveItemInArray(this.blocks, from, to);
    }
  }

  removeBlock(index: number): void {
    if (confirm('Remove this block?')) {
      this.blocks.splice(index, 1);
    }
  }

  onBlockDrop(event: CdkDragDrop<PageBlock[]>): void {
    moveItemInArray(this.blocks, event.previousIndex, event.currentIndex);
  }

  // ========== HEADING ==========

  getHeadingData(block: PageBlock): HeadingData {
    return block.data as HeadingData;
  }

  // ========== PARAGRAPH ==========

  getParagraphData(block: PageBlock): ParagraphData {
    return block.data as ParagraphData;
  }

  // ========== LIST ==========

  getListData(block: PageBlock): ListData {
    return block.data as ListData;
  }

  addListItem(block: PageBlock): void {
    (block.data as ListData).items.push('');
  }

  removeListItem(block: PageBlock, itemIndex: number): void {
    const items = (block.data as ListData).items;
    if (items.length > 1) {
      items.splice(itemIndex, 1);
    }
  }

  trackByIndex(index: number): number {
    return index;
  }

  // ========== IMAGE ==========

  getImageData(block: PageBlock): ImageData {
    return block.data as ImageData;
  }

  openGalleryPicker(blockIndex: number): void {
    this.activeImageBlockIndex = blockIndex;
    this.activeGridImageContext = null;
    this.showGalleryPicker = true;
  }

  openGalleryPickerForGrid(blockIndex: number, colIndex: number, nestedIndex: number): void {
    this.activeImageBlockIndex = null;
    this.activeGridImageContext = { blockIndex, colIndex, nestedIndex };
    this.showGalleryPicker = true;
  }

  onGalleryImageSelected(image: any): void {
    if (this.activeImageBlockIndex !== null) {
      const block = this.blocks[this.activeImageBlockIndex];
      const data = block.data as ImageData;
      data.source = 'gallery';
      data.gallery_id = image.id;
      data.page_image_id = null;
      data.url = image.url;
      data.thumbnail_url = image.thumbnail_url;
    } else if (this.activeGridImageContext) {
      const { blockIndex, colIndex, nestedIndex } = this.activeGridImageContext;
      const gridData = this.blocks[blockIndex].data as GridData;
      const nestedBlock = gridData.columns[colIndex].blocks[nestedIndex];
      const data = nestedBlock.data as ImageData;
      data.source = 'gallery';
      data.gallery_id = image.id;
      data.page_image_id = null;
      data.url = image.url;
      data.thumbnail_url = image.thumbnail_url;
    }
    this.showGalleryPicker = false;
    this.activeImageBlockIndex = null;
    this.activeGridImageContext = null;
  }

  onGalleryPickerClose(): void {
    this.showGalleryPicker = false;
    this.activeImageBlockIndex = null;
    this.activeGridImageContext = null;
  }

  onImageUpload(event: Event, blockIndex: number): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const file = input.files[0];

    this.pagesService.uploadImage(file, this.pageId ?? undefined)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (pageImage) => {
          const block = this.blocks[blockIndex];
          const data = block.data as ImageData;
          data.source = 'upload';
          data.page_image_id = pageImage.id;
          data.gallery_id = null;
          data.url = pageImage.url;
          data.thumbnail_url = pageImage.thumbnail_url;
        },
        error: (err) => {
          alert('Failed to upload image: ' + (err.message || 'Unknown error'));
        }
      });
  }

  onGridImageUpload(event: Event, blockIndex: number, colIndex: number, nestedIndex: number): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const file = input.files[0];

    this.pagesService.uploadImage(file, this.pageId ?? undefined)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (pageImage) => {
          const gridData = this.blocks[blockIndex].data as GridData;
          const nestedBlock = gridData.columns[colIndex].blocks[nestedIndex];
          const data = nestedBlock.data as ImageData;
          data.source = 'upload';
          data.page_image_id = pageImage.id;
          data.gallery_id = null;
          data.url = pageImage.url;
          data.thumbnail_url = pageImage.thumbnail_url;
        },
        error: (err) => {
          alert('Failed to upload image: ' + (err.message || 'Unknown error'));
        }
      });
  }

  // ========== GRID ==========

  getGridData(block: PageBlock): GridData {
    return block.data as GridData;
  }

  onGridPresetChange(block: PageBlock): void {
    const data = block.data as GridData;
    const colCount = this.getGridColumnCount(data.preset);

    while (data.columns.length < colCount) {
      data.columns.push({ blocks: [] });
    }
    while (data.columns.length > colCount) {
      data.columns.pop();
    }
  }

  getGridColumnCount(preset: string): number {
    switch (preset) {
      case '2-equal': return 2;
      case '3-equal': return 3;
      case '1-3-2-3': return 2;
      case '2-3-1-3': return 2;
      default: return 2;
    }
  }

  addNestedBlock(type: string, blockIndex: number, colIndex: number): void {
    const gridData = this.blocks[blockIndex].data as GridData;
    const newBlock = this.createDefaultBlock(type);
    gridData.columns[colIndex].blocks.push(newBlock);
  }

  removeNestedBlock(blockIndex: number, colIndex: number, nestedIndex: number): void {
    const gridData = this.blocks[blockIndex].data as GridData;
    gridData.columns[colIndex].blocks.splice(nestedIndex, 1);
  }

  onNestedBlockDrop(event: CdkDragDrop<PageBlock[]>, blockIndex: number, colIndex: number): void {
    const gridData = this.blocks[blockIndex].data as GridData;
    moveItemInArray(gridData.columns[colIndex].blocks, event.previousIndex, event.currentIndex);
  }

  // ========== SAVE ==========

  onSave(): void {
    if (!this.title.trim()) {
      alert('Please enter a page title');
      return;
    }

    this.isSaving = true;

    const payload = {
      title: this.title,
      slug: this.slug,
      content: this.blocks,
      is_published: this.isPublished
    };

    const request = this.pageId
      ? this.pagesService.updatePage(this.pageId, payload)
      : this.pagesService.createPage(payload);

    request.pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (page) => {
          this.isSaving = false;
          if (!this.pageId) {
            this.router.navigate(['/admin/pages', page.id, 'edit']);
          }
        },
        error: (err) => {
          this.isSaving = false;
          alert('Failed to save page: ' + (err.message || 'Unknown error'));
        }
      });
  }
}
