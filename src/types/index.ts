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
 * Ledger transaction interface matching the 'ledger' table.
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
 * Transfer form input - subset of TimeTransaction for creating transfers
 */
export interface TransferFormInput {
  to_user: string; // Required: recipient user ID or username
  hours: number; // Required: hours to transfer (must be positive)
  note?: string; // Optional: transfer note/description
  skill_id?: string; // Optional: related skill ID
}

/**
 * Transfer request payload for API
 */
export interface CreateTransferRequest {
  from_user: string; // Sender user ID
  to_user: string; // Recipient user ID (resolved from username if needed)
  hours: number; // Hours to transfer
  transaction_type?: 'transfer' | 'service'; // Defaults to 'transfer'
  status?: 'pending' | 'completed'; // Defaults to 'completed'
  note?: string; // Optional note
  skill_id?: string; // Optional skill reference
}

/**
 * Transfer response from API
 */
export interface TransferResponse {
  success: boolean;
  transaction?: TimeTransaction;
  error?: string;
  message?: string;
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

// ============================================
// VALIDATION HELPERS
// ============================================

/**
 * Validates transfer input
 */
export function validateTransferInput(input: TransferFormInput): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!input.to_user || input.to_user.trim() === '') {
    errors.push('Recipient is required');
  }

  if (!input.hours || input.hours <= 0) {
    errors.push('Hours must be greater than 0');
  }

  if (input.hours && input.hours > 1000) {
    errors.push('Hours cannot exceed 1000');
  }

  // Validate hours has max 2 decimal places
  if (input.hours && !Number.isInteger(input.hours * 100)) {
    errors.push('Hours can have at most 2 decimal places');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Type guard to check if a transaction is pending
 */
export function isPendingTransaction(transaction: TimeTransaction): boolean {
  return transaction.status === 'pending';
}

/**
 * Type guard to check if a transaction is completed
 */
export function isCompletedTransaction(transaction: TimeTransaction): boolean {
  return transaction.status === 'completed';
}

/**
 * Format hours for display
 */
export function formatHours(hours: number): string {
  return hours.toFixed(2);
}

/**
 * Parse hours from string input
 */
export function parseHours(value: string): number | null {
  const parsed = parseFloat(value);
  if (isNaN(parsed) || parsed < 0) {
    return null;
  }
  return Math.round(parsed * 100) / 100; // Round to 2 decimal places
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// ============================================
// FORM STATE TYPES
// ============================================

export interface FormState<T> {
  data: T;
  errors: Record<keyof T, string>;
  isSubmitting: boolean;
  isDirty: boolean;
}

export interface TransferFormState extends FormState<TransferFormInput> {
  recipientUser?: User | null;
  availableBalance: number;
}

// Export all types
