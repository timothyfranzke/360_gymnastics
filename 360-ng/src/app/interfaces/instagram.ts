export interface InstagramPost {
  id: string;
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
  media_url: string;
  thumbnail_url?: string;
  permalink: string;
  caption?: string;
  timestamp: string;
  username?: string;
  like_count?: number;
  comments_count?: number;
}

export interface InstagramMediaData {
  data: InstagramPost[];
  paging?: {
    cursors?: {
      before?: string;
      after?: string;
    };
    next?: string;
    previous?: string;
  };
}

export interface InstagramApiResponse {
  access_token: string;
  user_id: string;
}

export interface InstagramBasicDisplayPost {
  id: string;
  caption?: string;
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
  media_url: string;
  permalink: string;
  thumbnail_url?: string;
  timestamp: string;
}

export interface InstagramError {
  error: {
    message: string;
    type: string;
    code: number;
    fbtrace_id?: string;
  };
}

export interface ProcessedInstagramPost {
  id: string;
  imageUrl: string;
  text: string;
  link: string;
  isCarousel: boolean;
  isVideo: boolean;
  timestamp: Date;
  likesCount?: number;
  commentsCount?: number;
}

export interface InstagramConfig {
  accessToken?: string;
  userId?: string;
  refreshToken?: string;
  expiresIn?: number;
  accountUsername: string;
  fallbackPosts?: ProcessedInstagramPost[];
}