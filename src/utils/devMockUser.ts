// src/utils/devMockUser.ts (New file: Place this in a utils folder for easy import/reuse)
import { User } from '../types' // Adjust path to your User interface

/**
 * Generates a mock dev user for bypassing auth in development mode.
 * Customizable via options for flexible testing (e.g., admin privileges, balance).
 * Ensures all User fields are populated to avoid null errors in components.
 * 
 * @param options - Optional overrides for specific fields
 * @returns A complete mock User object
 */
export const getMockDevUser = (options: Partial<Pick<User, 'role' | 'is_admin' | 'time_balance' | 'username' | 'email' | 'bio'>> = {}): User => {
  // Validate options (edge-case: prevent invalid roles)
  if (options.role && !['user', 'admin', 'moderator', 'premium'].includes(options.role)) {
    throw new Error(`Invalid role: ${options.role}. Must be 'user', 'admin', 'moderator', or 'premium'.`)
  }

  // Base mock with schema defaults
  const baseUser: User = {
    id: 'dev-mock-user-id-uuid', // Fixed UUID-like string for consistency
    email: options.email || 'dev@example.com',
    username: options.username || 'devuser',
    bio: options.bio || 'Development mock user for TimeBank testing.',
    avatar_url: '/images/avatar-placeholder.png', // Assume a public asset path
    phone: null, // Optional in schema
    location: null, // Optional in schema
    role: options.role || 'user',
    is_admin: options.is_admin ?? false, // Use ?? for nullish coalescing (allows explicit false)
    time_balance: options.time_balance ?? 100.00, // Generous default for dev transfers
    rating: 4.50, // Default as per schema
    total_hours_given: 50.00,
    total_hours_received: 30.00,
    verification_status: 'verified', // Skip verification in dev
    is_active: true,
    last_active_at: new Date().toISOString(), // Current timestamp
    created_at: new Date(Date.now() - 86400000).toISOString(), // Yesterday for realism
    updated_at: new Date().toISOString() // Just now
  }

  return baseUser
}

// Example usage (for testing in console or components):
// const adminUser = getMockDevUser({ is_admin: true, role: 'admin', time_balance: 500 });
// console.log(adminUser); // Full mock user object