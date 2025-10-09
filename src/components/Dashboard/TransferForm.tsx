// ============================================
// src/components/Dashboard/TransferForm.tsx
// Transfer Form with 2% TimeBank Fee - Email Based
// ============================================
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient'
import { Send, AlertCircle, CheckCircle, Info, Calculator, Mail } from 'lucide-react';
import {
  calculateTransferFee,
  hasSufficientBalance,
  validateTransferAmount,
  getTransferSummary,
  getInsufficientBalanceMessage,
  TIMEBANK_CONFIG,
} from '../../config/fees';

interface TransferFormProps {
  userId: string;
}

export default function TransferForm({ userId }: TransferFormProps) {
  const [recipientEmail, setRecipientEmail] = useState('');
  const [hours, setHours] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [userBalance, setUserBalance] = useState(0);
  const [recipientValidated, setRecipientValidated] = useState<{username: string; id: string} | null>(null);

  // Fetch user's current balance
  useEffect(() => {
    fetchUserBalance();
  }, [userId]);

  // Validate recipient email as user types
  useEffect(() => {
    const validateRecipient = async () => {
      if (!recipientEmail.trim() || recipientEmail.length < 3) {
        setRecipientValidated(null);
        return;
      }

      try {
        const { data: recipient, error: recipientError } = await supabase
          .from('users')
          .select('id, username, email')
          .eq('email', recipientEmail.trim().toLowerCase())
          .single();

        if (!recipientError && recipient) {
          if (recipient.id === userId) {
            setRecipientValidated(null);
          } else {
            setRecipientValidated({ username: recipient.username, id: recipient.id });
          }
        } else {
          setRecipientValidated(null);
        }
      } catch (err) {
        setRecipientValidated(null);
      }
    };

    const debounceTimer = setTimeout(validateRecipient, 500);
    return () => clearTimeout(debounceTimer);
  }, [recipientEmail, userId]);

  const fetchUserBalance = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('time_balance')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setUserBalance(data?.time_balance || 0);
    } catch (err) {
      console.error('Error fetching balance:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const hoursNum = parseFloat(hours);
      
      // Validation
      if (!recipientEmail.trim()) {
        throw new Error('Please enter a recipient email address');
      }

      // Basic email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(recipientEmail.trim())) {
        throw new Error('Please enter a valid email address');
      }
      
      // Validate amount
      const amountValidation = validateTransferAmount(hoursNum);
      if (!amountValidation.valid) {
        throw new Error(amountValidation.error);
      }

      // Check sufficient balance
      const balanceCheck = hasSufficientBalance(userBalance, hoursNum);
      if (!balanceCheck.sufficient) {
        throw new Error(getInsufficientBalanceMessage(userBalance, hoursNum));
      }

      // Find recipient user by email
      const { data: recipient, error: recipientError } = await supabase
        .from('users')
        .select('id, username, email')
        .eq('email', recipientEmail.trim().toLowerCase())
        .single();

      if (recipientError || !recipient) {
        throw new Error('No user found with this email address');
      }

      if (recipient.id === userId) {
        throw new Error('You cannot transfer time to yourself');
      }

      // Execute transfer with fee via RPC function
      const { data, error: transferError } = await supabase.rpc(
        'transfer_time_with_fee',
        {
          p_from_user_id: userId,
          p_to_user_id: recipient.id,
          p_hours: hoursNum,
          p_note: note.trim() || null,
        }
      );

      if (transferError) {
        throw transferError;
      }

      const summary = getTransferSummary(hoursNum);
      
      // Success
      setSuccess(
        `Successfully transferred ${summary.transferAmount} hours to ${recipient.username} (${recipient.email}). ` +
        `TimeBank fee: ${summary.feeAmount} hours (${summary.feePercentage}).`
      );
      
      // Reset form
      setRecipientEmail('');
      setHours('');
      setNote('');
      setRecipientValidated(null);
      
      // Refresh balance
      await fetchUserBalance();
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccess(''), 5000);
    } catch (err: any) {
      console.error('Transfer error:', err);
      setError(err.message || 'Failed to complete transfer');
    } finally {
      setLoading(false);
    }
  };

  const hoursNum = parseFloat(hours) || 0;
  const feeCalculation = hoursNum > 0 ? calculateTransferFee(hoursNum) : null;
  const balanceCheck = hoursNum > 0 ? hasSufficientBalance(userBalance, hoursNum) : null;
  const hasInsufficientFunds = balanceCheck && !balanceCheck.sufficient;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Current Balance Display */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-blue-900">Available Balance</span>
          <span className="text-lg font-bold text-blue-600">
            {userBalance.toFixed(TIMEBANK_CONFIG.DECIMAL_PLACES)} hrs
          </span>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2 animate-shake">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-start gap-2 animate-slideDown">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-green-800">{success}</p>
        </div>
      )}

      {/* Recipient Email */}
      <div>
        <label htmlFor="recipient" className="block text-sm font-semibold text-gray-700 mb-1">
          Recipient Email Address
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Mail className="w-5 h-5 text-gray-400" />
          </div>
          <input
            id="recipient"
            type="email"
            value={recipientEmail}
            onChange={(e) => setRecipientEmail(e.target.value)}
            placeholder="user@example.com"
            className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
              recipientValidated 
                ? 'border-green-300 bg-green-50' 
                : recipientEmail.length > 3 && !recipientValidated 
                ? 'border-red-300 bg-red-50' 
                : 'border-gray-300'
            }`}
            disabled={loading}
            required
          />
        </div>
        {recipientValidated && (
          <div className="mt-2 flex items-center gap-2 text-xs text-green-700 bg-green-50 border border-green-200 rounded-lg p-2">
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
            <span>
              Sending to: <strong>{recipientValidated.username}</strong>
            </span>
          </div>
        )}
        {recipientEmail.length > 3 && !recipientValidated && (
          <div className="mt-2 flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>
              No user found with this email address
            </span>
          </div>
        )}
      </div>

      {/* Hours Amount */}
      <div>
        <label htmlFor="hours" className="block text-sm font-semibold text-gray-700 mb-1">
          Hours to Transfer
        </label>
        <input
          id="hours"
          type="number"
          step="0.01"
          min={TIMEBANK_CONFIG.MIN_TRANSFER_AMOUNT}
          max={TIMEBANK_CONFIG.MAX_TRANSFER_AMOUNT}
          value={hours}
          onChange={(e) => setHours(e.target.value)}
          placeholder="0.00"
          className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
            hasInsufficientFunds ? 'border-red-300 bg-red-50' : 'border-gray-300'
          }`}
          disabled={loading}
          required
        />
        <p className="text-xs text-gray-500 mt-1">
          Min: {TIMEBANK_CONFIG.MIN_TRANSFER_AMOUNT} hrs | Max: {TIMEBANK_CONFIG.MAX_TRANSFER_AMOUNT} hrs
        </p>
      </div>

      {/* Fee Breakdown */}
      {feeCalculation && (
        <div className="bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 border-2 border-amber-200 rounded-xl p-4 space-y-3 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
              <Calculator className="w-4 h-4 text-amber-700" />
            </div>
            <span className="text-sm font-bold text-amber-900">Transaction Breakdown</span>
          </div>
          
          <div className="space-y-2 text-sm bg-white/60 rounded-lg p-3">
            <div className="flex justify-between items-center text-gray-700">
              <span>Transfer Amount:</span>
              <span className="font-semibold text-gray-900">
                {feeCalculation.transferAmount.toFixed(TIMEBANK_CONFIG.DECIMAL_PLACES)} hrs
              </span>
            </div>
            
            <div className="flex justify-between items-center text-gray-700">
              <span>TimeBank Fee ({TIMEBANK_CONFIG.TRANSFER_FEE_DISPLAY}):</span>
              <span className="font-semibold text-amber-700">
                +{feeCalculation.feeAmount.toFixed(TIMEBANK_CONFIG.DECIMAL_PLACES)} hrs
              </span>
            </div>
            
            <div className="border-t-2 border-amber-200 pt-2 mt-2"></div>
            
            <div className="flex justify-between items-center font-bold text-base">
              <span className="text-gray-900">Total Required:</span>
              <span className={hasInsufficientFunds ? 'text-red-600' : 'text-blue-600'}>
                {feeCalculation.totalAmount.toFixed(TIMEBANK_CONFIG.DECIMAL_PLACES)} hrs
              </span>
            </div>
            
            {hasInsufficientFunds && balanceCheck && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-2 mt-2">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                  <div className="text-xs text-red-700">
                    <p className="font-semibold">Insufficient Balance</p>
                    <p>You need {balanceCheck.shortfall.toFixed(TIMEBANK_CONFIG.DECIMAL_PLACES)} more hours</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Note (Optional) */}
      <div>
        <label htmlFor="note" className="block text-sm font-semibold text-gray-700 mb-1">
          Note (Optional)
        </label>
        <textarea
          id="note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Add a message about this transfer..."
          rows={3}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
          disabled={loading}
          maxLength={500}
        />
        <p className="text-xs text-gray-500 mt-1">{note.length}/500 characters</p>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading || hasInsufficientFunds || !recipientValidated || !hours}
        className={`w-full py-3.5 px-4 rounded-xl font-bold text-base transition-all flex items-center justify-center gap-2 shadow-md ${
          loading || hasInsufficientFunds || !recipientValidated || !hours
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none'
            : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]'
        }`}
      >
        {loading ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Processing Transfer...
          </>
        ) : hasInsufficientFunds ? (
          <>
            <AlertCircle className="w-5 h-5" />
            Insufficient Balance
          </>
        ) : !recipientValidated ? (
          <>
            <Mail className="w-5 h-5" />
            Enter Valid Email
          </>
        ) : (
          <>
            <Send className="w-5 h-5" />
            Transfer Time
          </>
        )}
      </button>

      {/* Info Footer */}
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-blue-800">
            A <strong>{TIMEBANK_CONFIG.TRANSFER_FEE_DISPLAY}</strong> fee is applied to all transfers to support 
            and maintain the TimeBank platform. This fee goes directly to the platform admin account.
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
        
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </form>
  );
}