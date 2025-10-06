// ============================================
// src/components/Layout.tsx
// ============================================
// Refactored Layout: Modular UserMenu with NotificationBell integration for alerts.
// Added Marketplace nav link for direct access. Improved types (no assertions), SPA logout via router,
// enhanced ARIA for accessibility, and error handling. Responsive, production-ready.

'use client'; // Client-side for hooks (useAuth, useRouter)

import Link from 'next/link';
import { useRouter } from 'next/router'; // For SPA navigation on logout
import { ReactNode, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../hooks/useAuth';
import { User } from '../types/index'; // Import updated User interface
import { LogOut, Menu, X, Clock, Home, LayoutDashboard, Shield, ShoppingBag } from 'lucide-react'; // Added ShoppingBag for Marketplace
import { NotificationBell } from './Notifications/NotificationBell'; // Integrated for user alerts

// Reusable NavLinks component for modularity (desktop/mobile)
function NavLinks({ user, onLinkClick, isMobile = false }: {
  user?: User | null;
  onLinkClick?: () => void;
  isMobile?: boolean;
}) {
  return (
    <>
      <Link
        href="/"
        className={`flex items-center space-x-2 px-4 py-${isMobile ? '3' : '2'} rounded-lg text-slate-700 hover:bg-slate-100 transition-all ${
          isMobile ? 'py-3' : 'py-2'
        }`}
        onClick={onLinkClick}
        aria-label="Home"
      >
        <Home className={`w-${isMobile ? '5' : '4'} h-${isMobile ? '5' : '4'}`} />
        <span>Home</span>
      </Link>

      <Link
        href="/marketplace"
        className={`flex items-center space-x-2 px-4 py-${isMobile ? '3' : '2'} rounded-lg text-slate-700 hover:bg-slate-100 transition-all ${
          isMobile ? 'py-3' : 'py-2'
        }`}
        onClick={onLinkClick}
        aria-label="Marketplace"
      >
        <ShoppingBag className={`w-${isMobile ? '5' : '4'} h-${isMobile ? '5' : '4'}`} />
        <span>Marketplace</span>
      </Link>

      {user && (
        <Link
          href="/dashboard"
          className={`flex items-center space-x-2 px-4 py-${isMobile ? '3' : '2'} rounded-lg text-slate-700 hover:bg-slate-100 transition-all ${
            isMobile ? 'py-3' : 'py-2'
          }`}
          onClick={onLinkClick}
          aria-label="Dashboard"
        >
          <LayoutDashboard className={`w-${isMobile ? '5' : '4'} h-${isMobile ? '5' : '4'}`} />
          <span>Dashboard</span>
        </Link>
      )}

      {user?.is_admin && (
        <Link
          href="/admin"
          className={`flex items-center space-x-2 px-4 py-${isMobile ? '3' : '2'} rounded-lg text-slate-700 hover:bg-slate-100 transition-all ${
            isMobile ? 'py-3' : 'py-2'
          }`}
          onClick={onLinkClick}
          aria-label="Admin Panel"
        >
          <Shield className={`w-${isMobile ? '5' : '4'} h-${isMobile ? '5' : '4'}`} />
          <span>Admin</span>
        </Link>
      )}
    </>
  );
}

// Modular UserMenu component for auth/notify logic (reusable, with error handling)
function UserMenu({ user }: { user: User | null }) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      // SPA redirect for better UX (fallback to href if no router)
      if (router) {
        await router.push('/auth/login');
      } else if (typeof window !== 'undefined') {
        window.location.href = '/auth/login';
      }
      // Optional: Integrate toast library here, e.g., toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout failed:', error);
      // Optional: toast.error('Logout failed. Please try again.');
    }
  };

  if (!user) {
    return (
      <Link
        href="/auth/login"
        className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all shadow-md hover:shadow-lg font-medium"
        aria-label="Login"
      >
        Login
      </Link>
    );
  }

  return (
    <div className="flex items-center space-x-3" role="group" aria-label="User menu">
      <NotificationBell userId={user.id} /> {/* Integrated for real-time alerts */}
      <div className="text-right">
        <p className="text-sm font-medium text-slate-900" aria-label={`Logged in as ${user.email}`}>
          {user.email}
        </p>
        {user.role && (
          <p className="text-xs text-slate-500 capitalize" aria-label={`Role: ${user.role}`}>
            {user.role}
          </p>
        )}
      </div>
      <button
        onClick={handleLogout}
        className="flex items-center space-x-2 bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg hover:from-red-600 hover:to-red-700 transition-all shadow-md hover:shadow-lg"
        aria-label="Logout"
      >
        <LogOut className="w-4 h-4" aria-hidden="true" />
        <span>Logout</span>
      </button>
    </div>
  );
}

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  // Proper typing: useAuth returns { user: User | null, ... } – no assertion needed
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Navbar */}
      <header className="bg-white shadow-lg border-b border-slate-200 sticky top-0 z-50" role="banner">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-label="Main navigation">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2 group" aria-label="TimeBank Home">
              <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-2 rounded-lg group-hover:scale-110 transition-transform">
                <Clock className="w-6 h-6 text-white" aria-hidden="true" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                TimeBank
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              <NavLinks user={user} />
            </div>

            {/* Auth Section (Desktop) */}
            <div className="hidden md:flex items-center space-x-3">
              <UserMenu user={user} />
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div 
              id="mobile-menu" 
              className="md:hidden py-4 border-t border-slate-200" 
              role="menu"
              aria-live="polite" // Announces menu open/close for screen readers
            >
              <div className="flex flex-col space-y-2">
                <NavLinks user={user} onLinkClick={() => setMobileMenuOpen(false)} isMobile />
                
                <div className="border-t border-slate-200 pt-2 mt-2">
                  <UserMenu user={user} /> {/* Reuses desktop menu logic */}
                </div>
              </div>
            </div>
          )}
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8" role="main">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-auto" role="contentinfo">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2">
              <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-1.5 rounded-lg">
                <Clock className="w-4 h-4 text-white" aria-hidden="true" />
              </div>
              <span className="text-sm font-semibold text-slate-700">TimeBank</span>
            </div>
            
            <p className="text-sm text-slate-500">
              © {new Date().getFullYear()} TimeBank. All rights reserved.
            </p>
            
            <div className="flex space-x-6 text-sm text-slate-500">
              <Link href="/privacy" className="hover:text-purple-600 transition-colors" aria-label="Privacy Policy">
                Privacy
              </Link>
              <Link href="/terms" className="hover:text-purple-600 transition-colors" aria-label="Terms of Service">
                Terms
              </Link>
              <Link href="/contact" className="hover:text-purple-600 transition-colors" aria-label="Contact Us">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}