// FAQ Interfaces for 360 Gym Management System

export interface FaqCategory {
  id: number;
  name: string;
  slug: string;
  description?: string;
  display_order: number;
  is_active: boolean;
  active_faq_count?: number;
  total_faq_count?: number;
  created_at: string;
  updated_at: string;
}

export interface Faq {
  id: number;
  category_id: number;
  question: string;
  answer: string;
  display_order: number;
  is_active: boolean;
  created_by?: number;
  category_name?: string;
  category_slug?: string;
  first_name?: string;
  last_name?: string;
  created_at: string;
  updated_at: string;
}

export interface FaqGroupedByCategory {
  id: number;
  name: string;
  slug: string;
  faqs: FaqItem[];
}

export interface FaqItem {
  id: number;
  question: string;
  answer: string;
  display_order: number;
}

export interface CreateFaqRequest {
  category_id: number;
  question: string;
  answer: string;
  display_order?: number;
  is_active?: boolean;
}

export interface UpdateFaqRequest {
  category_id?: number;
  question?: string;
  answer?: string;
  display_order?: number;
  is_active?: boolean;
}

export interface CreateFaqCategoryRequest {
  name: string;
  slug: string;
  description?: string;
  display_order?: number;
  is_active?: boolean;
}

export interface UpdateFaqCategoryRequest {
  name?: string;
  slug?: string;
  description?: string;
  display_order?: number;
  is_active?: boolean;
}

export interface FaqFilters {
  search?: string;
  category_id?: number;
  is_active?: boolean;
  page?: number;
  limit?: number;
  sort_by?: 'question' | 'display_order' | 'created_at';
  sort_order?: 'ASC' | 'DESC';
}

export interface FaqStats {
  total_faqs: number;
  active_faqs: number;
  total_categories: number;
  active_categories: number;
}
