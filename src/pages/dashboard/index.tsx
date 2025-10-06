// ============================================
// src/pages/dashboard/index.tsx
// ============================================
import { useState, useMemo } from 'react';
import { 
  Clock, Users, Award, CreditCard, Briefcase, Store, Shield, 
  TrendingUp, ArrowUpRight, Zap, Star, Activity, ShieldAlert,
  LogOut, ChevronDown
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import ProtectedRoute from '../../components/ProtectedRoute';
import BalanceCard from '../../components/Dashboard/BalanceCard';
import TransferForm from '../../components/Dashboard/TransferForm';
import TransactionList from '../../components/Dashboard/TransactionList';
import { SkillsSelector } from '../../components/Dashboard/SkillsSelector';
import UserProfile from '../../components/Dashboard/UserProfile';
import ChangePasswordForm from '../../components/Auth/ChangePasswordForm';
import ServiceOfferingsManager from '../../components/Dashboard/ServiceOfferingsManager';
import { NotificationBell } from '../../components/Notifications/NotificationBell';
import MarketplacePage from '../marketplace';
import AdminControlPanel from '../../components/Admin/AdminControlPanel';
import type { User } from '../../types';

function useTabs(initialTab: 'overview' | 'profile' | 'skills' | 'transactions' | 'services' | 'marketplace' | 'security' | 'admin') {
  const [activeTab, setActiveTab] = useState(initialTab);
  return { activeTab, setActiveTab };
}

interface DashboardContentProps {
  user: User;
  onSignOut: () => void;
}

function DashboardContent({ user, onSignOut }: DashboardContentProps) {
  const { activeTab, setActiveTab } = useTabs('overview');
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const tabContent = useMemo(() => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-11 h-11 bg-blue-50 rounded-lg flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                    <Clock className="w-6 h-6 text-blue-600" />
                  </div>
                  <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                    Active
                  </span>
                </div>
                <p className="text-sm text-gray-600 font-medium mb-1">Time Balance</p>
                <p className="text-2xl font-bold text-gray-900 mb-1">Check Balance</p>
                <p className="text-xs text-gray-500">See your available hours</p>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-11 h-11 bg-emerald-50 rounded-lg flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                    <TrendingUp className="w-6 h-6 text-emerald-600" />
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-emerald-600" />
                </div>
                <p className="text-sm text-gray-600 font-medium mb-1">Services Offered</p>
                <p className="text-2xl font-bold text-gray-900 mb-1">Manage</p>
                <p className="text-xs text-gray-500">Your service catalog</p>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-11 h-11 bg-purple-50 rounded-lg flex items-center justify-center group-hover:bg-purple-100 transition-colors">
                    <Activity className="w-6 h-6 text-purple-600" />
                  </div>
                  <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                    Live
                  </span>
                </div>
                <p className="text-sm text-gray-600 font-medium mb-1">Recent Activity</p>
                <p className="text-2xl font-bold text-gray-900 mb-1">View All</p>
                <p className="text-xs text-gray-500">Latest transactions</p>
              </div>

              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl p-5 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group cursor-pointer">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-11 h-11 bg-white/20 backdrop-blur rounded-lg flex items-center justify-center group-hover:bg-white/30 transition-colors">
                    <Store className="w-6 h-6 text-white" />
                  </div>
                  <Zap className="w-5 h-5 text-yellow-300" />
                </div>
                <p className="text-sm text-blue-100 font-medium mb-1">Marketplace</p>
                <p className="text-2xl font-bold text-white mb-1">Explore</p>
                <p className="text-xs text-blue-200">Find services now</p>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-2 space-y-6">
                <section aria-labelledby="balance-heading" className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur-xl opacity-20"></div>
                  <div className="relative">
                    <BalanceCard userId={user.id} />
                  </div>
                </section>

                <section 
                  aria-labelledby="transactions-heading" 
                  className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow duration-300"
                >
                  <div className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-100 px-6 py-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
                          <Activity className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h2 id="transactions-heading" className="text-lg font-bold text-gray-900">
                            Recent Activity
                          </h2>
                          <p className="text-xs text-gray-600">Your latest time exchanges</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => setActiveTab('transactions')}
                        className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors group"
                      >
                        View All
                        <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                      </button>
                    </div>
                  </div>
                  <div className="p-6">
                    <TransactionList userId={user.id} />
                  </div>
                </section>
              </div>

              <div className="space-y-6">
                <section aria-labelledby="transfer-heading" className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl blur-lg opacity-0 group-hover:opacity-30 transition-opacity duration-500"></div>
                  <div className="relative bg-white rounded-2xl border-2 border-gray-200 overflow-hidden hover:border-blue-300 transition-all duration-300">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-5 py-4 border-b border-gray-200">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-sm">
                          <Zap className="w-4 h-4 text-white" />
                        </div>
                        <h3 className="text-base font-bold text-gray-900">Quick Transfer</h3>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">Send time in seconds</p>
                    </div>
                    <div className="p-5">
                      <TransferForm userId={user.id} />
                    </div>
                  </div>
                </section>

                <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 rounded-2xl border border-blue-100 p-6 hover:shadow-lg transition-shadow duration-300">
                  <div className="flex items-center gap-2 mb-5">
                    <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-sm">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-gray-900">Community Pulse</h3>
                      <p className="text-xs text-gray-600">Live marketplace stats</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-white/80 backdrop-blur rounded-xl border border-gray-200">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                          <Users className="w-4 h-4 text-emerald-600" />
                        </div>
                        <span className="text-sm font-medium text-gray-700">Active Members</span>
                      </div>
                      <span className="text-lg font-bold text-gray-900">1.2K+</span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-white/80 backdrop-blur rounded-xl border border-gray-200">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Clock className="w-4 h-4 text-blue-600" />
                        </div>
                        <span className="text-sm font-medium text-gray-700">Hours Traded</span>
                      </div>
                      <span className="text-lg font-bold text-gray-900">5.6K</span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-white/80 backdrop-blur rounded-xl border border-gray-200">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                          <Star className="w-4 h-4 text-purple-600" />
                        </div>
                        <span className="text-sm font-medium text-gray-700">Avg. Rating</span>
                      </div>
                      <span className="text-lg font-bold text-gray-900">4.8</span>
                    </div>
                  </div>

                  <button 
                    onClick={() => setActiveTab('marketplace')}
                    className="w-full mt-5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 rounded-xl transition-all duration-300 shadow-sm hover:shadow-md flex items-center justify-center gap-2 group"
                  >
                    <Store className="w-4 h-4" />
                    Explore Marketplace
                    <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      case 'profile':
        return (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-8 py-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Your Profile</h2>
                    <p className="text-blue-100 text-sm">Manage your personal information</p>
                  </div>
                </div>
              </div>
              <section className="p-8" aria-labelledby="profile-heading">
                <UserProfile userId={user.id} />
              </section>
            </div>
          </div>
        );
      case 'skills':
        return (
          <div className="max-w-6xl mx-auto">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
                    <Award className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Skills & Expertise</h2>
                    <p className="text-purple-100 text-sm">Showcase your talents to the community</p>
                  </div>
                </div>
              </div>
              <section className="p-8" aria-labelledby="skills-heading">
                <SkillsSelector userId={user.id} />
              </section>
            </div>
          </div>
        );
      case 'transactions':
        return (
          <div className="max-w-6xl mx-auto">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-8 py-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
                      <CreditCard className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h2 id="all-transactions-heading" className="text-2xl font-bold text-white">
                        Transaction History
                      </h2>
                      <p className="text-emerald-100 text-sm">Complete record of all time exchanges</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-emerald-100 text-xs">Total Volume</p>
                    <p className="text-2xl font-bold text-white">View Stats</p>
                  </div>
                </div>
              </div>
              <section className="p-8" aria-labelledby="all-transactions-heading">
                <TransactionList userId={user.id} />
              </section>
            </div>
          </div>
        );
      case 'services':
        return (
          <div className="max-w-6xl mx-auto">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-600 to-blue-700 px-8 py-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
                    <Briefcase className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Service Management</h2>
                    <p className="text-indigo-100 text-sm">Create and manage your service offerings</p>
                  </div>
                </div>
              </div>
              <section className="p-8" aria-labelledby="services-heading">
                <ServiceOfferingsManager userId={user.id} />
              </section>
            </div>
          </div>
        );
      case 'marketplace':
        return (
          <section className="w-full" aria-labelledby="marketplace-heading">
            <MarketplacePage />
          </section>
        );
      case 'security':
        return (
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-red-600 to-orange-600 px-8 py-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
                    <Shield className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Security Settings</h2>
                    <p className="text-red-100 text-sm">Protect your account and data</p>
                  </div>
                </div>
              </div>
              <section className="p-8" aria-labelledby="security-heading">
                <ChangePasswordForm />
              </section>
            </div>
          </div>
        );
      case 'admin':
        return user.is_admin ? (
          <section className="w-full" aria-labelledby="admin-heading">
            <AdminControlPanel />
          </section>
        ) : null;
      default:
        return null;
    }
  }, [activeTab, user.id, setActiveTab, user.is_admin]);

  const tabConfig = [
    { key: 'overview' as const, label: 'Overview', icon: Clock, color: 'blue' },
    { key: 'marketplace' as const, label: 'Marketplace', icon: Store, color: 'indigo' },
    { key: 'services' as const, label: 'My Services', icon: Briefcase, color: 'purple' },
    { key: 'skills' as const, label: 'Skills', icon: Award, color: 'pink' },
    { key: 'transactions' as const, label: 'History', icon: CreditCard, color: 'emerald' },
    { key: 'profile' as const, label: 'Profile', icon: Users, color: 'cyan' },
    { key: 'security' as const, label: 'Security', icon: Shield, color: 'red' },
    ...(user.is_admin ? [
      { key: 'admin' as const, label: 'Admin', icon: ShieldAlert, color: 'orange' }
    ] : []),
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50/30">
      <div className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-[1600px]">
          <header className="py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
                  <div className="relative w-12 h-12 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl">
                    <Clock className="w-7 h-7 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl font-black bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    TimeSwap
                  </h1>
                  <p className="text-xs text-gray-600 font-medium">Time-Based Service Exchange</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="hidden md:flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-200 hover:shadow-md transition-all"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-bold text-gray-900">{user.username}</p>
                      <p className="text-xs text-gray-600">{user.is_admin ? 'Admin' : 'Member'}</p>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-gray-600 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {userMenuOpen && (
                    <>
                      <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setUserMenuOpen(false)}
                      ></div>
                      <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50">
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="text-sm font-bold text-gray-900">{user.username}</p>
                          <p className="text-xs text-gray-600">{user.email}</p>
                        </div>
                        <button
                          onClick={() => {
                            setUserMenuOpen(false);
                            onSignOut();
                          }}
                          className="w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-red-50 transition-colors text-red-600 font-medium"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </>
                  )}
                </div>
                <NotificationBell userId={user.id} />
              </div>
            </div>
          </header>

          <nav
            className="pb-0 -mb-px"
            role="tablist"
            aria-label="Dashboard tabs"
          >
            <div className="flex gap-1 overflow-x-auto scrollbar-hide" role="tablist">
              {tabConfig.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`
                    relative px-5 py-3 font-semibold text-sm transition-all whitespace-nowrap
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-t-xl
                    flex items-center gap-2
                    ${
                      activeTab === key
                        ? 'text-blue-600 bg-white border-t-2 border-x-2 border-blue-600 -mb-[2px]'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50/50'
                    }
                  `}
                  role="tab"
                  aria-selected={activeTab === key}
                  aria-controls={`tabpanel-${key}`}
                  id={`tab-${key}`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{label}</span>
                  {activeTab === key && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
                  )}
                </button>
              ))}
            </div>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-[1600px]">
        <main role="tabpanel" id={`tabpanel-${activeTab}`} aria-labelledby={`tab-${activeTab}`}>
          {tabContent}
        </main>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}

export default function DashboardPage() {
  const { user, loading, logout } = useAuth();

  const handleSignOut = async () => {
    try {
      await logout();
      window.location.href = '/';
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50/30" aria-label="Loading dashboard">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-8">
            <div className="absolute inset-0 border-4 border-blue-100 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-blue-600 rounded-full animate-spin border-t-transparent" role="status"></div>
            <div className="absolute inset-3 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
              <Clock className="w-8 h-8 text-white animate-pulse" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Loading TimeSwap</h2>
          <p className="text-sm text-gray-600">Preparing your dashboard...</p>
          <p className="sr-only">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      {user ? <DashboardContent user={user} onSignOut={handleSignOut} /> : null}
    </ProtectedRoute>
  );
}