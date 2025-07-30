/**
 * Transaction type constants definition
 */

export interface TransactionTypeInfo {
  type: string; // Type identifier
  label: string; // Display name
  icon: string; // Icon
  color: string; // Display color
  description: string; // Description
}

/**
 * Transaction type configuration
 */
export const transactionTypes: TransactionTypeInfo[] = [
  {
    type: 'swap',
    label: 'Swap',
    icon: 'swap_horiz',
    color: 'text-blue-500',
    description: 'Exchange one token for another',
  },
  {
    type: 'transfer',
    label: 'Transfer',
    icon: 'send',
    color: 'text-green-500',
    description: 'Send tokens to another address',
  },
  {
    type: 'receive',
    label: 'Receive',
    icon: 'call_received',
    color: 'text-green-600',
    description: 'Receive tokens from another address',
  },
  {
    type: 'approve',
    label: 'Approve',
    icon: 'verified',
    color: 'text-yellow-500',
    description: 'Authorize contract to use tokens',
  },
  {
    type: 'cancel',
    label: 'Cancel',
    icon: 'cancel',
    color: 'text-red-500',
    description: 'Cancel a pending transaction',
  },
  {
    type: 'deposit',
    label: 'Deposit',
    icon: 'arrow_downward',
    color: 'text-indigo-500',
    description: 'Deposit funds to protocol or contract',
  },
  {
    type: 'withdraw',
    label: 'Withdraw',
    icon: 'arrow_upward',
    color: 'text-purple-500',
    description: 'Withdraw funds from protocol or contract',
  },
  {
    type: 'claim',
    label: 'Claim',
    icon: 'redeem',
    color: 'text-yellow-600',
    description: 'Claim rewards or airdrops',
  },
  {
    type: 'stake',
    label: 'Stake',
    icon: 'lock',
    color: 'text-blue-600',
    description: 'Stake assets for rewards',
  },
  {
    type: 'unstake',
    label: 'Unstake',
    icon: 'lock_open',
    color: 'text-blue-400',
    description: 'Unstake assets',
  },
  {
    type: 'borrow',
    label: 'Borrow',
    icon: 'attach_money',
    color: 'text-orange-500',
    description: 'Borrow assets from protocol',
  },
  {
    type: 'repay',
    label: 'Repay',
    icon: 'money_off',
    color: 'text-green-500',
    description: 'Repay borrowed assets',
  },
  {
    type: 'mint',
    label: 'Mint',
    icon: 'add_circle',
    color: 'text-teal-500',
    description: 'Create or mint new tokens',
  },
  {
    type: 'burn',
    label: 'Burn',
    icon: 'remove_circle',
    color: 'text-red-600',
    description: 'Burn or remove tokens',
  },
  {
    type: 'unknown',
    label: 'Unknown',
    icon: 'help',
    color: 'text-gray-500',
    description: 'Unknown transaction type',
  },
];

/**
 * Get transaction type information by type
 * @param type Transaction type
 * @returns Transaction type information
 */
export const getTransactionTypeInfo = (type: string): TransactionTypeInfo => {
  const lowerType = type.toLowerCase();
  const typeInfo = transactionTypes.find((t) => t.type === lowerType);
  return typeInfo || transactionTypes[transactionTypes.length - 1]; // Return unknown as default
};
