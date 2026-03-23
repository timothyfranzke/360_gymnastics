export interface Page {
  id: number;
  title: string;
  slug: string;
  content: PageBlock[];
  is_published: boolean;
  created_by: number;
  created_at: string;
  updated_at: string;
}

export interface PageBlock {
  id: string;
  type: 'heading' | 'paragraph' | 'list' | 'image' | 'grid';
  data: HeadingData | ParagraphData | ListData | ImageData | GridData;
}

export interface HeadingData { level: number; text: string; }
export interface ParagraphData { text: string; bold: boolean; italic: boolean; }
export interface ListData { style: 'bulleted' | 'numbered'; items: string[]; }
export interface ImageData {
  source: 'gallery' | 'upload';
  gallery_id: number | null;
  page_image_id: number | null;
  url?: string;
  thumbnail_url?: string;
  alt: string;
  caption: string;
}
export interface GridData {
  preset: '2-equal' | '3-equal' | '1-3-2-3' | '2-3-1-3';
  columns: GridColumn[];
}
export interface GridColumn { blocks: PageBlock[]; }

export interface CreatePageRequest { title: string; slug?: string; content: PageBlock[]; is_published?: boolean; }
export interface UpdatePageRequest { title?: string; slug?: string; content?: PageBlock[]; is_published?: boolean; }
export interface PageFilters { search?: string; is_published?: string; page?: number; limit?: number; sort_by?: string; sort_order?: string; }
export interface PageStats { total: number; published: number; draft: number; }
