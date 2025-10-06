// src/components/Dashboard/BalanceCard.tsx - FIXED: Now fetches from users table
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { Clock, TrendingUp, TrendingDown, RefreshCw } from 'lucide-react'

export default function BalanceCard({ userId }: { userId: string }) {
  const [balance, setBalance] = useState(0)
  const [hoursGiven, setHoursGiven] = useState(0)
  const [hoursReceived, setHoursReceived] = useState(0)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchBalance = async () => {
    try {
      // FIXED: Fetch from users table for time_balance, total_hours_given, total_hours_received
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('time_balance, total_hours_given, total_hours_received')
        .eq('id', userId)
        .single()

      if (userError) {
        console.error('Error fetching user balance:', userError)
        return
      }

      if (userData) {
        setBalance(userData.time_balance || 0)
        setHoursGiven(userData.total_hours_given || 0)
        setHoursReceived(userData.total_hours_received || 0)
      }

      // Optional: Also fetch from time_ledger for verification (can be removed if not needed)
      const { data: given } = await supabase
        .from('time_ledger')
        .select('hours')
        .eq('from_user', userId)
      
      const { data: received } = await supabase
        .from('time_ledger')
        .select('hours')
        .eq('to_user', userId)

      const totalGiven = given?.reduce((acc, cur) => acc + Number(cur.hours), 0) || 0
      const totalReceived = received?.reduce((acc, cur) => acc + Number(cur.hours), 0) || 0
      
      // If ledger values differ from user table, log warning (for debugging)
      if (process.env.NODE_ENV === 'development') {
        if (totalGiven !== (userData?.total_hours_given || 0)) {
          console.warn('Hours given mismatch - User table:', userData?.total_hours_given, 'Ledger:', totalGiven)
        }
        if (totalReceived !== (userData?.total_hours_received || 0)) {
          console.warn('Hours received mismatch - User table:', userData?.total_hours_received, 'Ledger:', totalReceived)
        }
      }
    } catch (error) {
      console.error('Error fetching balance:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = () => {
    setRefreshing(true)
    fetchBalance()
  }

  useEffect(() => {
    fetchBalance()

    // Real-time subscription to users table
    const userSubscription = supabase
      .channel(`user-balance-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'users',
          filter: `id=eq.${userId}`
        },
        (payload) => {
          if (process.env.NODE_ENV === 'development') {
            console.log('User balance updated:', payload)
          }
          if (payload.new) {
            setBalance((payload.new as any).time_balance || 0)
            setHoursGiven((payload.new as any).total_hours_given || 0)
            setHoursReceived((payload.new as any).total_hours_received || 0)
          }
        }
      )
      .subscribe()

    return () => {
      userSubscription.unsubscribe()
    }
  }, [userId])

  const isPositive = balance >= 0
  const isNeutral = balance === 0

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-purple-500 via-purple-600 to-pink-600 rounded-2xl shadow-2xl p-6 text-white">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
      <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold">Time Balance</h3>
          </div>
          
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="bg-white/20 hover:bg-white/30 p-2 rounded-lg backdrop-blur-sm transition-all disabled:opacity-50"
            title="Refresh balance"
          >
            <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Main Balance */}
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <div className="flex items-baseline space-x-2">
                <span className="text-5xl font-bold">{Math.abs(balance)}</span>
                <span className="text-xl font-medium opacity-90">hours</span>
              </div>
              
              {/* Status indicator */}
              <div className="flex items-center space-x-2 mt-3">
                {isNeutral ? (
                  <div className="flex items-center space-x-1 bg-white/20 px-3 py-1 rounded-full text-sm backdrop-blur-sm">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                    <span>Balanced</span>
                  </div>
                ) : isPositive ? (
                  <div className="flex items-center space-x-1 bg-green-400/30 px-3 py-1 rounded-full text-sm backdrop-blur-sm">
                    <TrendingUp className="w-4 h-4" />
                    <span>Credit</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-1 bg-orange-400/30 px-3 py-1 rounded-full text-sm backdrop-blur-sm">
                    <TrendingDown className="w-4 h-4" />
                    <span>Debt</span>
                  </div>
                )}
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              {/* Hours Received */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center space-x-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-green-300" />
                  <p className="text-sm font-medium opacity-90">Received</p>
                </div>
                <p className="text-2xl font-bold">{hoursReceived}</p>
                <p className="text-xs opacity-75 mt-1">hours</p>
              </div>

              {/* Hours Given */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center space-x-2 mb-2">
                  <TrendingDown className="w-4 h-4 text-orange-300" />
                  <p className="text-sm font-medium opacity-90">Given</p>
                </div>
                <p className="text-2xl font-bold">{hoursGiven}</p>
                <p className="text-xs opacity-75 mt-1">hours</p>
              </div>
            </div>

            {/* Help text */}
            <p className="text-xs opacity-75 mt-4 text-center">
              {isPositive && !isNeutral && 'You have time credits to use'}
              {!isPositive && 'Contribute time to earn credits'}
              {isNeutral && 'Your time is perfectly balanced'}
            </p>
          </>
        )}
      </div>
    </div>
  )
}