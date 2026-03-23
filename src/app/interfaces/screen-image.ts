// Screen image assignment interfaces

export interface ScreenImage {
  id: number;
  screen_key: string;
  position_key: string;
  gallery_id: number;
  url: string;
  thumbnail_url: string;
  alt_text?: string;
  caption?: string;
  is_active: boolean;
  created_at?: string;
}

export interface ScreenImagesResponse {
  screen: string;
  images: Record<string, ScreenImageData>;
  placeholder_url: string;
}

export interface ScreenImageData {
  id: number;
  gallery_id: number;
  url: string;
  thumbnail_url: string;
  alt_text?: string;
  caption?: string;
}

export interface AssignScreenImageRequest {
  screen_key: string;
  position_key: string;
  gallery_id: number;
}

export interface ScreenPosition {
  key: string;
  label: string;
}

export interface ScreenPositionsResponse {
  positions: Record<string, ScreenPosition[]>;
}

export interface GalleryAssignmentsResponse {
  gallery_id: number;
  assignments: Array<{
    id: number;
    screen_key: string;
    position_key: string;
    is_active: boolean;
    created_at: string;
  }>;
}
