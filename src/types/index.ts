// ============================================
// TIMEBANK TYPESCRIPT INTERFACES - FIXED
// ============================================

/**
 * User interface matching the 'users' table.
 * Includes all fields with optionals for nullable columns.
 */
export interface User {
  id: string; // UUID primary key
  name?: string; // Optional name field
  email: string; // NOT NULL, unique
  username: string; // NOT NULL, unique
  bio?: string; // Optional bio text
  avatar_url?: string; // Optional avatar URL
  phone?: string; // Optional phone number
  location?: string; // Optional location
  role: string; // Defaults to 'user'
  is_admin: boolean; // Defaults to false
  time_balance: number; // Defaults to 10
  rating: number; // Defaults to 0
  total_hours_given: number; // Defaults to 0
  total_hours_received: number; // Defaults to 0
  verification_status: string; // Defaults to 'unverified'
  is_active: boolean; // Defaults to true
  last_active_at?: string; // TIMESTAMP WITH TIME ZONE, optional
  created_at?: string; // TIMESTAMP WITH TIME ZONE, defaults to NOW()
  updated_at?: string; // TIMESTAMP WITH TIME ZONE, defaults to NOW()
}

/**
 * Skill interface matching the 'skills' table.
 */
export interface Skill {
  id: string; // UUID primary key, auto-generated
  name: string; // NOT NULL, unique
  category: 'technology' | 'creative' | 'education' | 'health' | 'business' | 'trades' | 'other'; // CHECK constraint enum, defaults to 'other'
  description?: string; // Optional description text
  created_at?: string; // TIMESTAMP WITH TIME ZONE, defaults to NOW()
}

/**
 * User-Skill relation interface matching the 'user_skills' table.
 */
export interface UserSkill {
  id: string; // UUID primary key, auto-generated
  user_id: string; // Foreign key to users.id, NOT NULL
  skill_id: string; // Foreign key to skills.id, NOT NULL
  skill_level: 'beginner' | 'intermediate' | 'advanced' | 'expert'; // CHECK constraint enum, defaults to 'beginner'
  years_of_experience?: number; // Optional integer
  willing_to_teach: boolean; // Defaults to true
  willing_to_learn: boolean; // Defaults to false
  hourly_rate?: number; // DECIMAL(10,2), optional
  created_at?: string; // TIMESTAMP WITH TIME ZONE, defaults to NOW()
  updated_at?: string; // TIMESTAMP WITH TIME ZONE, defaults to NOW(), auto-updated via trigger
}

/**
 * Ledger transaction interface matching the 'ledger' table (renamed from TimeTransaction for clarity).
 */
export interface TimeTransaction {
  id: string; // UUID primary key, auto-generated
  from_user: string; // Foreign key to users.id, NOT NULL
  to_user: string; // Foreign key to users.id, NOT NULL
  hours: number; // DECIMAL(10,2), NOT NULL
  transaction_type: 'transfer' | 'service' | 'adjustment' | 'refund'; // CHECK constraint enum, defaults to 'transfer'
  status: 'pending' | 'completed' | 'cancelled' | 'disputed'; // CHECK constraint enum, defaults to 'completed'
  skill_id?: string; // Foreign key to skills.id, optional (ON DELETE SET NULL)
  note?: string; // Optional note text
  admin_note?: string; // Optional admin note text
  created_by?: string; // Foreign key to users.id, optional (ON DELETE SET NULL)
  approved_at?: string; // TIMESTAMP WITH TIME ZONE, optional
  cancelled_at?: string; // TIMESTAMP WITH TIME ZONE, optional
  created_at: string; // TIMESTAMP WITH TIME ZONE, defaults to NOW()
  updated_at?: string; // TIMESTAMP WITH TIME ZONE, defaults to NOW(), auto-updated via trigger
}

/**
 * Notification interface matching the 'notifications' table.
 */
export interface Notification {
  id: string; // UUID primary key, auto-generated
  user_id: string; // Foreign key to users.id, NOT NULL
  type: 'transaction' | 'service_request' | 'review' | 'system' | 'message'; // CHECK constraint enum, defaults to 'system'
  title?: string; // Optional title (VARCHAR(255))
  message: string; // NOT NULL message text
  link?: string; // Optional link (VARCHAR(255))
  read: boolean; // Defaults to false
  created_at: string; // TIMESTAMP WITH TIME ZONE, defaults to NOW()
}

/**
 * Derived Match interface for user-skill matching logic.
 * References updated User and Skill types; matchScore is computed (e.g., via algorithm).
 */
export interface Match {
  user: User;
  skills: Skill[]; // Array of matched skills
  matchScore: number; // Computed relevance score (0-100)
}

/**
 * Service Offering interface matching the 'service_offerings' table.
 */
export interface ServiceOffering {
  id: string; // UUID primary key
  user_id: string; // Foreign key to users.id
  title: string; // NOT NULL
  description?: string;
  skill_id?: string; // Foreign key to skills.id, optional
  expected_hours: number; // DECIMAL(10,2), defaults to 1.00
  availability_start?: string; // TIMESTAMP WITH TIME ZONE, optional
  availability_end?: string; // TIMESTAMP WITH TIME ZONE, optional
  price_in_hours: number; // DECIMAL(10,2), defaults to 1.00
  status: 'active' | 'inactive' | 'booked'; // CHECK constraint enum, defaults to 'active'
  created_at: string; // TIMESTAMP WITH TIME ZONE, defaults to NOW()
  updated_at?: string; // TIMESTAMP WITH TIME ZONE, defaults to NOW(), auto-updated via trigger
}

/**
 * Service Request interface matching the 'service_requests' table.
 */
export interface ServiceRequest {
  id: string; // UUID primary key
  service_offering_id: string; // Foreign key to service_offerings.id
  requester_user_id: string; // Foreign key to users.id
  status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled'; // Defaults to 'pending'
  notes?: string; // Optional notes
  requested_hours: number; // DECIMAL(10,2), defaults to 1.00
  created_at: string; // TIMESTAMP WITH TIME ZONE, defaults to NOW()
  updated_at?: string; // TIMESTAMP WITH TIME ZONE, defaults to NOW(), auto-updated via trigger
}

// ============================================
// ADMIN INTERFACES
// ============================================

/**
 * Admin Action Log interface matching the 'admin_action_logs' table.
 * Tracks all administrative actions for audit purposes.
 */
export interface AdminActionLog {
  id: string; // UUID primary key
  admin_user_id: string; // Foreign key to users.id
  action_type: 'deposit' | 'withdraw' | 'adjustment' | 'user_suspend' | 'user_activate' | 'transaction_cancel' | 'transaction_approve' | 'role_change' | 'other';
  target_user_id?: string; // Foreign key to users.id, optional
  target_transaction_id?: string; // Foreign key to ledger.id, optional
  amount?: number; // DECIMAL(10,2), optional - for credit operations
  reason: string; // NOT NULL - reason for the action
  metadata?: Record<string, any>; // JSONB - additional data
  ip_address?: string; // VARCHAR(45) - IPv4 or IPv6
  created_at: string; // TIMESTAMP WITH TIME ZONE
}

/**
 * System Statistics interface for dashboard metrics.
 * This is a computed view, not a table.
 */
export interface SystemStats {
  total_users: number;
  active_users: number;
  total_transactions: number;
  total_hours_circulated: number;
  total_service_offerings: number;
  pending_disputes: number;
  avg_user_balance: number;
  total_system_balance: number;
}

/**
 * User with extended details for admin view.
 */
export interface UserWithDetails extends User {
  transaction_count?: number;
  services_offered?: number;
  services_requested?: number;
  last_transaction_date?: string;
}

/**
 * Transaction with user details for admin view.
 */
export interface TransactionWithDetails extends TimeTransaction {
  from_user_details?: {
    username: string;
    email: string;
    avatar_url?: string;
  };
  to_user_details?: {
    username: string;
    email: string;
    avatar_url?: string;
  };
  skill_name?: string;
}