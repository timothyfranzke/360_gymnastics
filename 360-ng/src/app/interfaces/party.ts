export interface PartyRequest {
  id: number;
  parent_name: string;
  phone: string;
  can_text: 'yes' | 'no';
  email: string;
  city: string;
  party_type: string;
  requested_date: string;
  requested_time: string;
  child_name: string;
  child_age: number;
  estimated_children: number;
  additional_details?: string;
  status: 'pending' | 'contacted' | 'confirmed' | 'cancelled';
  user_agent?: string;
  ip_address?: string;
  submitted_at: string;
  updated_at: string;
}

export interface PartyRequestFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'pending' | 'contacted' | 'confirmed' | 'cancelled';
  party_type?: string;
  date_from?: string;
  date_to?: string;
  sort_by?: 'submitted_at' | 'requested_date' | 'child_name' | 'parent_name';
  sort_order?: 'ASC' | 'DESC';
}

export interface PartyRequestStats {
  total: number;
  pending: number;
  contacted: number;
  confirmed: number;
  cancelled: number;
  today: number;
  this_week: number;
  this_month: number;
}

export interface CreatePartyRequest {
  parentName: string;
  phone: string;
  canText: 'yes' | 'no';
  email: string;
  city: string;
  partyType: string;
  requestedDate: string;
  requestedTime: string;
  childName: string;
  childAge: number;
  estimatedChildren: number;
  additionalDetails?: string;
}

export interface UpdatePartyStatusRequest {
  status: 'pending' | 'contacted' | 'confirmed' | 'cancelled';
}