import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import {
  DollarSign,
  TrendingUp,
  Calendar,
  Clock,
  Activity,
  Download,
  RefreshCw,
} from 'lucide-react';
import { TIMEBANK_CONFIG } from '../../config/fees';

interface FeeStats {
  totalFeesCollected: number;
  feesToday: number;
  feesThisWeek: number;
  feesThisMonth: number;
  totalFeeTransactions: number;
  averageFeePerTransaction: number;
}

interface DailyFee {
  date: string; // YYYY-MM-DD
  total_fees: number;
  transaction_count: number;
}

export default function FeeCollectionMonitor() {
  const [stats, setStats] = useState<FeeStats | null>(null);
  const [dailyFees, setDailyFees] = useState<DailyFee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [adminUserId, setAdminUserId] = useState<string | null>(null);

  useEffect(() => {
    fetchFeeStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toNumber = (v: any) => {
    if (typeof v === 'number') return v;
    if (!v) return 0;
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  };

  const formatDateYMD = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const fetchFeeStats = async () => {
    try {
      setLoading(true);
      setError('');

      // Find the first admin user (oldest) — adapt if you have multiple admin accounts
      const { data: adminUser, error: adminError } = await supabase
        .from('users')
        .select('id')
        .eq('is_admin', true)
        .order('created_at', { ascending: true })
        .limit(1)
        .single();

      if (adminError || !adminUser) throw new Error('Admin user not found');
      setAdminUserId(adminUser.id);

      // Fetch fee-like transactions that are adjustments to the admin user
      const { data: feeTransactions, error: feeError } = await supabase
        .from('ledger')
        .select('hours, created_at')
        .eq('to_user', adminUser.id)
        .eq('transaction_type', 'adjustment')
        .ilike('note', '%TimeBank%fee%')
        .order('created_at', { ascending: false });

      if (feeError) throw feeError;

      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - 7);
      weekStart.setHours(0, 0, 0, 0);
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      let totalFees = 0;
      let feesToday = 0;
      let feesThisWeek = 0;
      let feesThisMonth = 0;

      (feeTransactions || []).forEach((tx: any) => {
        // created_at might be a string — make a Date safely
        const txDate = tx?.created_at ? new Date(tx.created_at) : null;
        const hours = toNumber(tx?.hours);

        totalFees += hours;
        if (txDate) {
          if (txDate >= todayStart) feesToday += hours;
          if (txDate >= weekStart) feesThisWeek += hours;
          if (txDate >= monthStart) feesThisMonth += hours;
        }
      });

      const totalTransactions = (feeTransactions || []).length;
      const avgFee = totalTransactions > 0 ? totalFees / totalTransactions : 0;

      setStats({
        totalFeesCollected: totalFees,
        feesToday,
        feesThisWeek,
        feesThisMonth,
        totalFeeTransactions: totalTransactions,
        averageFeePerTransaction: avgFee,
      });

      // Group by local date (YYYY-MM-DD)
      const feesByDate: Record<string, { total: number; count: number }> = {};
      (feeTransactions || []).forEach((tx: any) => {
        const txDate = tx?.created_at ? new Date(tx.created_at) : new Date();
        const dateKey = formatDateYMD(txDate);
        if (!feesByDate[dateKey]) feesByDate[dateKey] = { total: 0, count: 0 };
        feesByDate[dateKey].total += toNumber(tx?.hours);
        feesByDate[dateKey].count += 1;
      });

      const dailyData: DailyFee[] = Object.entries(feesByDate)
        .map(([date, d]) => ({ date, total_fees: d.total, transaction_count: d.count }))
        // sort descending by date (most recent first)
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, 30);

      setDailyFees(dailyData);
    } catch (err: any) {
      console.error('Error fetching fee stats:', err);
      setError(err?.message ?? 'Failed to load fee statistics');
    } finally {
      setLoading(false);
    }
  };

  const exportFeeData = () => {
    if (!dailyFees.length) return;

    const csvRows = [
      ['Date', 'Total Fees (hours)', 'Transaction Count'],
      ...dailyFees.map((d) => [d.date, d.total_fees.toFixed(2), String(d.transaction_count)]),
    ];

    const csv = csvRows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `timebank-fees-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Small sparkline generator for the dailyFees array (assumes dailyFees sorted most-recent-first)
  const generateSparklinePath = (data: DailyFee[], width = 240, height = 40) => {
    if (!data || data.length === 0) return '';
    const values = data.slice().reverse().map((d) => d.total_fees); // oldest -> newest
    const max = Math.max(...values);
    const min = Math.min(...values);
    const range = max - min || 1;

    const step = width / Math.max(values.length - 1, 1);
    const points = values.map((v, i) => {
      const x = i * step;
      const y = height - ((v - min) / range) * height;
      return `${x},${y}`;
    });

    return `M${points.join(' L')}`;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          <span className="ml-3 text-gray-600">Loading fee statistics...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
        <p className="text-red-800">{error}</p>
        <button
          onClick={fetchFeeStats}
          className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-white border rounded-md"
        >
          <RefreshCw className="w-4 h-4" />
          Retry
        </button>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <DollarSign className="w-7 h-7 text-green-600" />
            Fee Collection Monitor
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Platform fee: {TIMEBANK_CONFIG.TRANSFER_FEE_DISPLAY} on all transfers
          </p>
          {adminUserId && (
            <p className="text-xs text-gray-500 mt-1">Admin account: {adminUserId}</p>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchFeeStats}
            aria-label="Refresh stats"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border rounded-lg hover:bg-gray-50"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>

          <button
            onClick={exportFeeData}
            disabled={!dailyFees.length}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="p-4 bg-white border rounded-2xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Total collected</p>
              <p className="text-lg font-semibold">{stats.totalFeesCollected.toFixed(2)} hrs</p>
            </div>
            <DollarSign className="w-6 h-6 text-green-600" />
          </div>
        </div>

        <div className="p-4 bg-white border rounded-2xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Today</p>
              <p className="text-lg font-semibold">{stats.feesToday.toFixed(2)} hrs</p>
            </div>
            <Calendar className="w-6 h-6 text-blue-500" />
          </div>
        </div>

        <div className="p-4 bg-white border rounded-2xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">This week</p>
              <p className="text-lg font-semibold">{stats.feesThisWeek.toFixed(2)} hrs</p>
            </div>
            <Clock className="w-6 h-6 text-indigo-500" />
          </div>
        </div>

        <div className="p-4 bg-white border rounded-2xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">This month</p>
              <p className="text-lg font-semibold">{stats.feesThisMonth.toFixed(2)} hrs</p>
            </div>
            <TrendingUp className="w-6 h-6 text-pink-500" />
          </div>
        </div>

        <div className="p-4 bg-white border rounded-2xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Transactions</p>
              <p className="text-lg font-semibold">{stats.totalFeeTransactions}</p>
            </div>
            <Activity className="w-6 h-6 text-yellow-500" />
          </div>
        </div>

        <div className="p-4 bg-white border rounded-2xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Avg / txn</p>
              <p className="text-lg font-semibold">{stats.averageFeePerTransaction.toFixed(2)} hrs</p>
            </div>
            <TrendingUp className="w-6 h-6 text-teal-500" />
          </div>
        </div>
      </div>

      {/* Sparkline + table */}
      <div className="bg-white border rounded-2xl p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">Daily fees (last {dailyFees.length} days)</h3>
          <div className="text-sm text-gray-500">Last updated: {new Date().toLocaleString()}</div>
        </div>

        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            {/* Sparkline */}
            <div className="w-full h-16">
              {dailyFees.length ? (
                <svg width="100%" height="40" viewBox="0 0 240 40" preserveAspectRatio="none">
                  <path
                    d={generateSparklinePath(dailyFees, 240, 40)}
                    fill="none"
                    stroke="#2563EB"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : (
                <div className="text-xs text-gray-400">No fee data to display</div>
              )}
            </div>

            {/* Small summary under sparkline */}
            <div className="mt-3 text-sm text-gray-600">
              {dailyFees.length > 0 && (
                <>
                  <strong>{dailyFees[0].total_fees.toFixed(2)} hrs</strong> on {dailyFees[0].date} (most recent)
                </>
              )}
            </div>
          </div>

          <div className="w-full lg:w-80 overflow-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-500">
                  <th className="py-2 pr-4">Date</th>
                  <th className="py-2 pr-4">Total (hrs)</th>
                  <th className="py-2">Txns</th>
                </tr>
              </thead>
              <tbody>
                {dailyFees.map((d) => (
                  <tr key={d.date} className="border-t">
                    <td className="py-2 pr-4">{d.date}</td>
                    <td className="py-2 pr-4">{d.total_fees.toFixed(2)}</td>
                    <td className="py-2">{d.transaction_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
