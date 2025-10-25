// API response interfaces for 360 Gym Management System

// Re-export camp interfaces
export * from './camp';

// Base API response structure
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: boolean;
  errors?: Record<string, string[]>;
  timestamp: string;
}

// Authentication interfaces
export interface User {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'staff';
  first_name: string;
  last_name: string;
  created_at?: string;
  updated_at?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
  expires_at: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role: 'admin' | 'staff';
}

// Announcement interfaces
export interface Announcement {
  id: number;
  title: string;
  content: string;
  type: 'general' | 'class' | 'maintenance';
  priority: 'low' | 'medium' | 'high' | 'critical';
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_by: number;
  created_at: string;
  updated_at: string;
  author?: User;
}

export interface CreateAnnouncementRequest {
  title: string;
  content: string;
  type: 'general' | 'class' | 'maintenance';
  priority: 'low' | 'medium' | 'high' | 'critical';
  start_date: string;
  end_date: string;
}

export interface UpdateAnnouncementRequest extends Partial<CreateAnnouncementRequest> {
  is_active?: boolean;
}

export interface AnnouncementFilters {
  search?: string;
  type?: 'general' | 'class' | 'maintenance';
  priority?: 'low' | 'medium' | 'high' | 'critical';
  is_active?: boolean;
  page?: number;
  limit?: number;
  sort_by?: 'created_at' | 'start_date' | 'title' | 'priority';
  sort_order?: 'ASC' | 'DESC';
}

export interface AnnouncementStats {
  total: number;
  active: number;
  by_type: Record<string, number>;
  by_priority: Record<string, number>;
  recent: number;
}

// Staff interfaces
export interface Staff {
  id: number;
  first_name: string;
  last_name: string;
  image?: string;
  description?: string;
  hire_date: string;
  created_at: string;
  updated_at: string;
  image_url?: string;
  image_thumbnail_url?: string;
}

// Homepage staff interface for public display
export interface HomepageStaff {
  id: number;
  first_name: string;
  last_name: string;
  image?: string;
  image_filename?: string;
  description?: string;
  hire_date: string;
  years_at_gym: number;
  image_url?: string;
  image_thumbnail_url?: string;
}

export interface CreateStaffRequest {
  first_name: string;
  last_name: string;
  hire_date: string;
  image?: string;
  description?: string;
}

export interface UpdateStaffRequest {
  first_name?: string;
  last_name?: string;
  hire_date?: string;
  image?: string;
  description?: string;
}

export interface StaffFilters {
  search?: string;
  hire_date_from?: string;
  hire_date_to?: string;
  page?: number;
  limit?: number;
  sort_by?: 'hire_date' | 'first_name' | 'last_name' | 'created_at';
  sort_order?: 'ASC' | 'DESC';
}

export interface StaffStats {
  total_staff: number;
  average_tenure_days: number;
}

// Gym Hours interfaces
export interface GymHours {
  id: number;
  day_of_week: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  open_time: string;
  close_time: string;
  is_closed: boolean;
  updated_at: string;
}

export interface UpdateGymHoursRequest {
  open_time?: string;
  close_time?: string;
  is_closed?: boolean;
}

export interface BulkUpdateHoursRequest {
  hours: Array<{
    day_of_week: string;
    open_time: string;
    close_time: string;
    is_closed: boolean;
  }>;
}

export interface GymStatus {
  day: string;
  is_open: boolean;
  status: 'open' | 'closed' | 'closing_soon';
  current_time: string;
  hours: GymHours;
  message: string;
}

export interface HoursCheckRequest {
  day: string;
  time: string;
}

// Gym Closure interfaces
export interface GymClosure {
  id: number;
  closure_date: string;
  reason: string;
  description: string;
  is_all_day: boolean;
  start_time?: string;
  end_time?: string;
  is_emergency: boolean;
  created_by: number;
  created_at: string;
  updated_at: string;
  author?: User;
}

export interface CreateClosureRequest {
  closure_date: string;
  reason: string;
  description: string;
  is_all_day: boolean;
  start_time?: string;
  end_time?: string;
}

export interface EmergencyClosureRequest {
  reason: string;
  description: string;
  end_date?: string;
}

export interface ClosureFilters {
  search?: string;
  start_date?: string;
  end_date?: string;
  is_emergency?: boolean;
  page?: number;
  limit?: number;
  sort_by?: 'closure_date' | 'created_at' | 'reason';
  sort_order?: 'ASC' | 'DESC';
}

export interface ClosureStats {
  total: number;
  upcoming: number;
  emergency: number;
  this_month: number;
}

// Paginated response
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    current_page: number;
    total_pages: number;
    total_items: number;
    items_per_page: number;
    has_next_page: boolean;
    has_previous_page: boolean;
  };
}

// Dashboard stats
export interface DashboardStats {
  announcements: AnnouncementStats;
  staff: StaffStats;
  closures: ClosureStats;
  current_status: GymStatus;
}

// Form validation error types
export interface ValidationErrors {
  [key: string]: string[];
}

// Generic list response for dropdowns and selects
export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

// Photo upload interfaces
export interface PhotoUploadResponse {
  original_url: string;
  thumbnail_url: string;
  filename: string;
  path: string;
  size: number;
  dimensions: {
    width: number;
    height: number;
  };
}

export interface PhotoInfo {
  original_url: string;
  thumbnail_url: string;
  filename: string;
  uploaded_at: string;
}

// File validation interface
export interface FileValidationError {
  field: string;
  message: string;
  details?: any;
}

// Class schedule interfaces
export interface ClassScheduleItem {
  id: string;
  className: string;
  day: string;
  time: string;
  gender: string;
  ages: string;
  openings: number;
  tuition: number;
  registrationButton: {
    text: string;
    href: string;
  };
}

export interface ClassScheduleResponse {
  success: boolean;
  message: string;
  data: ClassScheduleItem[];
  timestamp: string;
}

// Banner interfaces
export interface Banner {
  id: number;
  text: string;
  is_visible: boolean;
  background_color?: string;
  created_at: string;
  updated_at: string;
}

export interface UpdateBannerRequest {
  text?: string;
  is_visible?: boolean;
  background_color?: string;
}

// Contact form interfaces
export interface ContactFormRequest {
  name: string;
  email: string;
  subject?: string;
  message: string;
}

export interface ContactFormResponse {
  success: boolean;
  message: string;
  reference_id?: string;
}

// API endpoints enum for type safety
export enum ApiEndpoints {
  // Auth
  LOGIN = '/auth/login',
  REGISTER = '/auth/register',
  PROFILE = '/auth/profile',
  LOGOUT = '/auth/logout',
  
  // Announcements
  ANNOUNCEMENTS = '/announcements',
  ANNOUNCEMENTS_ACTIVE = '/announcements/active',
  ANNOUNCEMENTS_STATS = '/announcements/stats',
  
  // Staff
  STAFF = '/staff',
  STAFF_HOMEPAGE = '/staff/homepage',
  STAFF_STATS = '/staff/stats',
  STAFF_UPLOAD_PHOTO = '/staff/upload-photo',
  STAFF_UPLOAD_PHOTO_ANONYMOUS = '/staff/upload-photo-anonymous',
  
  // Files
  FILES_STAFF = '/files/staff',
  FILES_STAFF_THUMBNAILS = '/files/staff/thumbnails',
  
  // Gym Hours
  GYM_HOURS = '/gym-hours',
  GYM_HOURS_WEEK = '/gym-hours/week',
  GYM_HOURS_STATUS = '/gym-hours/status',
  GYM_HOURS_BULK = '/gym-hours/bulk',
  GYM_HOURS_CHECK = '/gym-hours/check',
  
  // Closures
  GYM_CLOSURES = '/gym-closures',
  GYM_CLOSURES_UPCOMING = '/gym-closures/upcoming',
  GYM_CLOSURES_CURRENT_MONTH = '/gym-closures/current-month',
  GYM_CLOSURES_CHECK = '/gym-closures/check',
  GYM_CLOSURES_CLOSE_TODAY = '/gym-closures/close-today',
  GYM_CLOSURES_EMERGENCY = '/gym-closures/emergency',
  GYM_CLOSURES_STATS = '/gym-closures/stats',
  
  // Classes
  CLASSES_SCHEDULE = '/classes/schedule',
  
  // Camps
  CAMPS = '/camps',
  CAMPS_ACTIVE = '/camps/active',
  CAMPS_UPCOMING = '/camps/upcoming',
  CAMPS_STATS = '/camps/stats',
  
  // Banner
  BANNER = '/banner',
  
  // Contact
  CONTACT = '/contact',
  
  // Gallery
  GALLERY = '/gallery'
}

// Gallery interfaces
export interface GalleryImage {
  id: number;
  filename: string;
  file_path?: string;
  alt_text?: string;
  caption?: string;
  url: string;
  thumbnail_url?: string;
  created_at: string;
  order_index?: number;
}

export interface GalleryResponse {
  images: GalleryImage[];
  total: number;
}