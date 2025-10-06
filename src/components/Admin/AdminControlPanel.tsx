// ============================================
// src/components/Admin/AdminControlPanel.tsx
// ============================================
// Full Admin Control Panel Component with Real Supabase Data

import { useState, useEffect } from 'react';
import { 
  Shield, Users, Clock, TrendingUp, AlertTriangle, 
  DollarSign, Activity, Search, RefreshCw,
  Plus, Minus, X, CheckCircle, XCircle, Eye,
  ArrowUpRight, ArrowDownRight, BarChart3, Loader2
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import type { User, TimeTransaction, SystemStats } from '../../types';

type TabType = 'overview' | 'users' | 'transactions' | 'bank' | 'logs';

export default function AdminControlPanel() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [users, setUsers] = useState<User[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [actionLogs, setActionLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);

  // Form states
  const [depositForm, setDepositForm] = useState({ amount: '', reason: '' });
  const [withdrawForm, setWithdrawForm] = useState({ amount: '', reason: '' });
  const [actionLoading, setActionLoading] = useState(false);

  // Load data on mount and tab change
  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      if (activeTab === 'overview') {
        const statsData = await adminService.getSystemStats();
        setStats(statsData);
      } else if (activeTab === 'users') {
        const usersData = await adminService.getAllUsers(searchTerm);
        setUsers(usersData || []);
      } else if (activeTab === 'transactions') {
        const txData = await adminService.getAllTransactions();
        setTransactions(txData || []);
      } else if (activeTab === 'logs') {
        const logsData = await adminService.getActionLogs();
        setActionLogs(logsData || []);
      }
    } catch (error: any) {
      console.error('Error loading data:', error);
      setError(error.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeposit = async () => {
    if (!selectedUser || !depositForm.amount || !depositForm.reason) return;
    
    setActionLoading(true);
    try {
      await adminService.depositCredits(
        selectedUser.id,
        parseFloat(depositForm.amount),
        depositForm.reason
      );
      alert(`Successfully deposited ${depositForm.amount} hours to ${selectedUser.username}`);
      setShowDepositModal(false);
      setDepositForm({ amount: '', reason: '' });
      loadData();
    } catch (error: any) {
      console.error('Deposit error:', error);
      alert('Failed to deposit credits: ' + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!selectedUser || !withdrawForm.amount || !withdrawForm.reason) return;
    
    setActionLoading(true);
    try {
      await adminService.withdrawCredits(
        selectedUser.id,
        parseFloat(withdrawForm.amount),
        withdrawForm.reason
      );
      alert(`Successfully withdrew ${withdrawForm.amount} hours from ${selectedUser.username}`);
      setShowWithdrawModal(false);
      setWithdrawForm({ amount: '', reason: '' });
      loadData();
    } catch (error: any) {
      console.error('Withdraw error:', error);
      alert('Failed to withdraw credits: ' + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelTransaction = async () => {
    if (!selectedTransaction) return;
    
    setActionLoading(true);
    try {
      await adminService.cancelTransaction(
        selectedTransaction.id,
        'Admin cancelled transaction',
        true
      );
      alert(`Successfully cancelled transaction`);
      setShowCancelModal(false);
      loadData();
    } catch (error: any) {
      console.error('Cancel error:', error);
      alert('Failed to cancel transaction: ' + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSearch = () => {
    loadData();
  };

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTransactions = transactions.filter(t => {
    const fromUsername = t.from_user_details?.username || '';
    const toUsername = t.to_user_details?.username || '';
    const note = t.note || '';
    const search = searchTerm.toLowerCase();
    return fromUsername.toLowerCase().includes(search) ||
           toUsername.toLowerCase().includes(search) ||
           note.toLowerCase().includes(search);
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 text-white shadow-xl">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
                <Shield className="w-9 h-9 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-black">Admin Control Panel</h1>
                <p className="text-red-100 text-sm mt-1">System Management & Bank Operations</p>
              </div>
            </div>
            <button
              onClick={loadData}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span className="text-sm font-semibold">Refresh</span>
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex gap-2 mt-6 overflow-x-auto pb-2">
            {[
              { key: 'overview' as TabType, label: 'Overview', icon: BarChart3 },
              { key: 'users' as TabType, label: 'Users', icon: Users },
              { key: 'transactions' as TabType, label: 'Transactions', icon: Activity },
              { key: 'bank' as TabType, label: 'Bank Operations', icon: DollarSign },
              { key: 'logs' as TabType, label: 'Action Logs', icon: Clock },
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm transition-all whitespace-nowrap ${
                  activeTab === key
                    ? 'bg-white text-red-600 shadow-lg'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
        )}

        {!loading && (
          <>
            {/* Overview Tab */}
            {activeTab === 'overview' && stats && (
              <div className="space-y-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                        <Users className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Total Users</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.total_users?.toLocaleString() || 0}</p>
                      </div>
                    </div>
                    <p className="text-xs text-green-600 flex items-center gap-1">
                      <ArrowUpRight className="w-3 h-3" />
                      {stats.active_users || 0} active
                    </p>
                  </div>

                  <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                        <Activity className="w-6 h-6 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Transactions</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.total_transactions?.toLocaleString() || 0}</p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600">{stats.completed_transactions || 0} completed</p>
                  </div>

                  <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                        <Clock className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Hours Circulated</p>
                        <p className="text-2xl font-bold text-gray-900">{parseFloat(stats.total_hours_circulated || 0).toLocaleString()}</p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600">Total exchanged</p>
                  </div>

                  <div className="bg-gradient-to-br from-red-500 to-orange-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                        <AlertTriangle className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-red-100">Pending</p>
                        <p className="text-2xl font-bold text-white">{stats.pending_transactions || 0}</p>
                      </div>
                    </div>
                    <p className="text-xs text-red-100">Requires attention</p>
                  </div>
                </div>

                {/* System Balance */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <TrendingUp className="w-6 h-6 text-blue-600" />
                    System Balance Overview
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                      <p className="text-sm text-gray-600 mb-2">Total System Balance</p>
                      <p className="text-4xl font-bold text-gray-900 mb-1">{parseFloat(stats.total_system_balance || 0).toFixed(2)}</p>
                      <p className="text-sm text-gray-600">hours in circulation</p>
                    </div>
                    <div className="p-6 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-200">
                      <p className="text-sm text-gray-600 mb-2">Average User Balance</p>
                      <p className="text-4xl font-bold text-gray-900 mb-1">{parseFloat(stats.avg_user_balance || 0).toFixed(2)}</p>
                      <p className="text-sm text-gray-600">hours per active user</p>
                    </div>
                  </div>
                </div>

                {/* Additional Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white rounded-xl p-6 border border-gray-200">
                    <p className="text-sm text-gray-600 mb-2">Service Offerings</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.total_service_offerings || 0}</p>
                    <p className="text-xs text-gray-500 mt-1">{stats.active_service_offerings || 0} active</p>
                  </div>
                  <div className="bg-white rounded-xl p-6 border border-gray-200">
                    <p className="text-sm text-gray-600 mb-2">Verified Users</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.verified_users || 0}</p>
                    <p className="text-xs text-gray-500 mt-1">ID verified members</p>
                  </div>
                  <div className="bg-white rounded-xl p-6 border border-gray-200">
                    <p className="text-sm text-gray-600 mb-2">Average Rating</p>
                    <p className="text-3xl font-bold text-gray-900">{parseFloat(stats.avg_user_rating || 0).toFixed(2)}</p>
                    <p className="text-xs text-gray-500 mt-1">Community score</p>
                  </div>
                </div>
              </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
              <div className="space-y-6">
                {/* Search */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                  <div className="flex items-center gap-3">
                    <Search className="w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search users by username or email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      className="flex-1 outline-none text-gray-900"
                    />
                    <button
                      onClick={handleSearch}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold"
                    >
                      Search
                    </button>
                  </div>
                </div>

                {/* Users List */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">User</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Email</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Balance</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {filteredUsers.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                              No users found
                            </td>
                          </tr>
                        ) : (
                          filteredUsers.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">
                                    {user.username.charAt(0).toUpperCase()}
                                  </div>
                                  <div>
                                    <p className="font-semibold text-gray-900">{user.username}</p>
                                    <p className="text-xs text-gray-500">{user.role}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                              <td className="px-6 py-4">
                                <span className="font-bold text-gray-900">{user.time_balance}</span>
                                <span className="text-sm text-gray-600 ml-1">hrs</span>
                              </td>
                              <td className="px-6 py-4">
                                {user.is_active ? (
                                  <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                                    Active
                                  </span>
                                ) : (
                                  <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
                                    Inactive
                                  </span>
                                )}
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => {
                                      setSelectedUser(user);
                                      setShowDepositModal(true);
                                    }}
                                    className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                                    title="Deposit"
                                  >
                                    <Plus className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      setSelectedUser(user);
                                      setShowWithdrawModal(true);
                                    }}
                                    className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                                    title="Withdraw"
                                  >
                                    <Minus className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Transactions Tab */}
            {activeTab === 'transactions' && (
              <div className="space-y-6">
                {/* Search */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                  <div className="flex items-center gap-3">
                    <Search className="w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search transactions..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="flex-1 outline-none text-gray-900"
                    />
                  </div>
                </div>

                {/* Transactions List */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">ID</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">From</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">To</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Hours</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Type</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {filteredTransactions.length === 0 ? (
                          <tr>
                            <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                              No transactions found
                            </td>
                          </tr>
                        ) : (
                          filteredTransactions.map((tx) => (
                            <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4 text-sm font-mono text-gray-600">
                                {tx.id.substring(0, 8)}...
                              </td>
                              <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                {tx.from_user_details?.username || 'Unknown'}
                              </td>
                              <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                {tx.to_user_details?.username || 'Unknown'}
                              </td>
                              <td className="px-6 py-4">
                                <span className="font-bold text-gray-900">{tx.hours}</span>
                                <span className="text-sm text-gray-600 ml-1">hrs</span>
                              </td>
                              <td className="px-6 py-4">
                                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded">
                                  {tx.transaction_type}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                {tx.status === 'completed' && (
                                  <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full flex items-center gap-1 w-fit">
                                    <CheckCircle className="w-3 h-3" />
                                    Completed
                                  </span>
                                )}
                                {tx.status === 'pending' && (
                                  <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded-full flex items-center gap-1 w-fit">
                                    <Clock className="w-3 h-3" />
                                    Pending
                                  </span>
                                )}
                                {tx.status === 'disputed' && (
                                  <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full flex items-center gap-1 w-fit">
                                    <AlertTriangle className="w-3 h-3" />
                                    Disputed
                                  </span>
                                )}
                                {tx.status === 'cancelled' && (
                                  <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full flex items-center gap-1 w-fit">
                                    <XCircle className="w-3 h-3" />
                                    Cancelled
                                  </span>
                                )}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-600">
                                {new Date(tx.created_at).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4">
                                {tx.status !== 'cancelled' && (
                                  <button
                                    onClick={() => {
                                      setSelectedTransaction(tx);
                                      setShowCancelModal(true);
                                    }}
                                    className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                                    title="Cancel Transaction"
                                  >
                                    <XCircle className="w-4 h-4" />
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Bank Operations Tab */}
            {activeTab === 'bank' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Quick Deposit */}
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-200 p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center">
                        <ArrowDownRight className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">Deposit Credits</h3>
                        <p className="text-sm text-gray-600">Add time to user accounts</p>
                      </div>
                    </div>
                    <p className="text-gray-700 mb-4">
                      Select a user from the Users tab to deposit time credits. All deposits are logged and audited.
                    </p>
                    <button
                      onClick={() => setActiveTab('users')}
                      className="w-full bg-green-600 text-white font-semibold py-3 rounded-xl hover:bg-green-700 transition-colors"
                    >
                      Go to Users
                    </button>
                  </div>

                  {/* Quick Withdraw */}
                  <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl border-2 border-red-200 p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center">
                        <ArrowUpRight className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">Withdraw Credits</h3>
                        <p className="text-sm text-gray-600">Remove time from user accounts</p>
                      </div>
                    </div>
                    <p className="text-gray-700 mb-4">
                      Select a user from the Users tab to withdraw time credits. Requires sufficient balance and reason.
                    </p>
                    <button
                      onClick={() => setActiveTab('users')}
                      className="w-full bg-red-600 text-white font-semibold py-3 rounded-xl hover:bg-red-700 transition-colors"
                    >
                      Go to Users
                    </button>
                  </div>
                </div>

                {/* Transaction Management */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Activity className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Transaction Management</h3>
                      <p className="text-sm text-gray-600">Cancel or modify transactions</p>
                    </div>
                  </div>
                  <p className="text-gray-700 mb-4">
                    View and manage all transactions in the system. Cancel disputed transactions or apply refunds.
                  </p>
                  <button
                    onClick={() => setActiveTab('transactions')}
                    className="bg-blue-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors"
                  >
                    View All Transactions
                  </button>
                </div>
              </div>
            )}

            {/* Action Logs Tab */}
            {activeTab === 'logs' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900">Admin Action Logs</h3>
                    <p className="text-sm text-gray-600">Complete audit trail of all administrative actions</p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Admin</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Action</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Target User</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Amount</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Reason</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {actionLogs.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                              No action logs found
                            </td>
                          </tr>
                        ) : (
                          actionLogs.map((log) => (
                            <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4 text-sm text-gray-600">
                                {new Date(log.created_at).toLocaleString()}
                              </td>
                              <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                {log.admin?.username || 'Unknown'}
                              </td>
                              <td className="px-6 py-4">
                                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded">
                                  {log.action_type}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-900">
                                {log.target_user?.username || 'N/A'}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-900">
                                {log.amount ? `${log.amount} hrs` : '-'}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                                {log.reason}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Deposit Modal */}
      {showDepositModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <Plus className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Deposit Credits</h3>
                  <p className="text-sm text-gray-600">Add time to {selectedUser.username}</p>
                </div>
              </div>
              <button
                onClick={() => setShowDepositModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Amount (hours)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  value={depositForm.amount}
                  onChange={(e) => setDepositForm({ ...depositForm, amount: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                  placeholder="Enter hours to deposit"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Reason (required)
                </label>
                <textarea
                  value={depositForm.reason}
                  onChange={(e) => setDepositForm({ ...depositForm, reason: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none resize-none"
                  rows={3}
                  placeholder="Explain why you're depositing credits..."
                />
              </div>

              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <p className="text-sm text-green-800">
                  <strong>Current Balance:</strong> {selectedUser.time_balance} hours<br />
                  <strong>New Balance:</strong> {(parseFloat(selectedUser.time_balance.toString()) + parseFloat(depositForm.amount || '0')).toFixed(2)} hours
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowDepositModal(false)}
                  disabled={actionLoading}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeposit}
                  disabled={!depositForm.amount || !depositForm.reason || actionLoading}
                  className="flex-1 px-6 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {actionLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Deposit Credits'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Withdraw Modal */}
      {showWithdrawModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                  <Minus className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Withdraw Credits</h3>
                  <p className="text-sm text-gray-600">Remove time from {selectedUser.username}</p>
                </div>
              </div>
              <button
                onClick={() => setShowWithdrawModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Amount (hours)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max={selectedUser.time_balance}
                  value={withdrawForm.amount}
                  onChange={(e) => setWithdrawForm({ ...withdrawForm, amount: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                  placeholder="Enter hours to withdraw"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Reason (required)
                </label>
                <textarea
                  value={withdrawForm.reason}
                  onChange={(e) => setWithdrawForm({ ...withdrawForm, reason: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none resize-none"
                  rows={3}
                  placeholder="Explain why you're withdrawing credits..."
                />
              </div>

              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-sm text-red-800">
                  <strong>Current Balance:</strong> {selectedUser.time_balance} hours<br />
                  <strong>New Balance:</strong> {(parseFloat(selectedUser.time_balance.toString()) - parseFloat(withdrawForm.amount || '0')).toFixed(2)} hours
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowWithdrawModal(false)}
                  disabled={actionLoading}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleWithdraw}
                  disabled={!withdrawForm.amount || !withdrawForm.reason || parseFloat(withdrawForm.amount) > selectedUser.time_balance || actionLoading}
                  className="flex-1 px-6 py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {actionLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Withdraw Credits'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Transaction Modal */}
      {showCancelModal && selectedTransaction && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Cancel Transaction</h3>
                  <p className="text-sm text-gray-600">ID: {selectedTransaction.id.substring(0, 8)}...</p>
                </div>
              </div>
              <button
                onClick={() => setShowCancelModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6">
              <p className="text-sm text-orange-800 font-medium">
                Are you sure you want to cancel this transaction? This action will:
              </p>
              <ul className="mt-2 space-y-1 text-sm text-orange-700 ml-4">
                <li>• Reverse {selectedTransaction.hours} hours</li>
                <li>• Notify both users</li>
                <li>• Create an audit log entry</li>
              </ul>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                disabled={actionLoading}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Keep Transaction
              </button>
              <button
                onClick={handleCancelTransaction}
                disabled={actionLoading}
                className="flex-1 px-6 py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {actionLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Cancel Transaction'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}