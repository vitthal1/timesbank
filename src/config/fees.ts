// ============================================
// src/config/fees.ts
// TimeBank Fee Configuration
// ============================================

export const TIMEBANK_CONFIG = {
  // Fee configuration
  TRANSFER_FEE_PERCENTAGE: 0.02, // 2% fee on all transfers
  TRANSFER_FEE_DISPLAY: '2%',
  
  // Transfer limits
  MIN_TRANSFER_AMOUNT: 0.01,
  MAX_TRANSFER_AMOUNT: 1000,
  
  // Precision
  DECIMAL_PLACES: 2,
} as const;

// ============================================
// Fee Calculation Utilities
// ============================================

export interface FeeCalculation {
  transferAmount: number;
  feeAmount: number;
  totalAmount: number;
  feePercentage: number;
}

/**
 * Calculate fee and total amount for a transfer
 */
export function calculateTransferFee(hours: number): FeeCalculation {
  const transferAmount = parseFloat(hours.toFixed(TIMEBANK_CONFIG.DECIMAL_PLACES));
  const feeAmount = parseFloat(
    (transferAmount * TIMEBANK_CONFIG.TRANSFER_FEE_PERCENTAGE).toFixed(TIMEBANK_CONFIG.DECIMAL_PLACES)
  );
  const totalAmount = parseFloat(
    (transferAmount + feeAmount).toFixed(TIMEBANK_CONFIG.DECIMAL_PLACES)
  );
  
  return {
    transferAmount,
    feeAmount,
    totalAmount,
    feePercentage: TIMEBANK_CONFIG.TRANSFER_FEE_PERCENTAGE * 100,
  };
}

/**
 * Validate if user has sufficient balance for transfer including fee
 */
export function hasSufficientBalance(
  userBalance: number,
  transferAmount: number
): { sufficient: boolean; shortfall: number; required: number } {
  const { totalAmount } = calculateTransferFee(transferAmount);
  const sufficient = userBalance >= totalAmount;
  const shortfall = sufficient ? 0 : totalAmount - userBalance;
  
  return {
    sufficient,
    shortfall: parseFloat(shortfall.toFixed(TIMEBANK_CONFIG.DECIMAL_PLACES)),
    required: totalAmount,
  };
}

/**
 * Format hours with proper decimal places
 */
export function formatHours(hours: number): string {
  return hours.toFixed(TIMEBANK_CONFIG.DECIMAL_PLACES);
}

/**
 * Validate transfer amount
 */
export function validateTransferAmount(amount: number): {
  valid: boolean;
  error?: string;
} {
  if (isNaN(amount)) {
    return { valid: false, error: 'Please enter a valid number' };
  }
  
  if (amount < TIMEBANK_CONFIG.MIN_TRANSFER_AMOUNT) {
    return {
      valid: false,
      error: `Minimum transfer amount is ${TIMEBANK_CONFIG.MIN_TRANSFER_AMOUNT} hours`,
    };
  }
  
  if (amount > TIMEBANK_CONFIG.MAX_TRANSFER_AMOUNT) {
    return {
      valid: false,
      error: `Maximum transfer amount is ${TIMEBANK_CONFIG.MAX_TRANSFER_AMOUNT} hours`,
    };
  }
  
  return { valid: true };
}

// ============================================
// Display Utilities
// ============================================

export interface TransferSummary {
  transferAmount: string;
  feeAmount: string;
  totalAmount: string;
  feePercentage: string;
}

/**
 * Get formatted transfer summary for display
 */
export function getTransferSummary(hours: number): TransferSummary {
  const calculation = calculateTransferFee(hours);
  
  return {
    transferAmount: formatHours(calculation.transferAmount),
    feeAmount: formatHours(calculation.feeAmount),
    totalAmount: formatHours(calculation.totalAmount),
    feePercentage: TIMEBANK_CONFIG.TRANSFER_FEE_DISPLAY,
  };
}

/**
 * Get insufficient balance message
 */
export function getInsufficientBalanceMessage(
  userBalance: number,
  transferAmount: number
): string {
  const { totalAmount, feeAmount } = calculateTransferFee(transferAmount);
  
  return `Insufficient balance. You need ${formatHours(totalAmount)} hours ` +
    `(${formatHours(transferAmount)} + ${formatHours(feeAmount)} fee) ` +
    `but have ${formatHours(userBalance)} hours`;
}