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
  // 1inch API可能返回的其他類型
  {
    type: 'erc20_transfer',
    label: 'ERC20 Transfer',
    icon: 'swap_vertical_circle',
    color: 'text-green-500',
    description: 'ERC20 token transfer',
  },
  {
    type: 'eth_transfer',
    label: 'ETH Transfer',
    icon: 'payments',
    color: 'text-blue-500',
    description: 'Native ETH transfer',
  },
  {
    type: 'transaction',
    label: 'Transaction',
    icon: 'history',
    color: 'text-gray-600',
    description: 'Standard blockchain transaction',
  },
  {
    type: 'contract_execution',
    label: 'Contract',
    icon: 'code',
    color: 'text-purple-500',
    description: 'Smart contract execution',
  },
  {
    type: 'liquidity',
    label: 'Liquidity',
    icon: 'pool',
    color: 'text-cyan-500',
    description: 'Add or remove liquidity',
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
  // 處理無效輸入
  if (!type || typeof type !== 'string') {
    return transactionTypes[transactionTypes.length - 1]; // Return unknown as default
  }

  // 標準化類型名稱
  const lowerType = type.toLowerCase().trim();

  // 嘗試精確匹配
  let typeInfo = transactionTypes.find((t) => t.type === lowerType);

  // 如果沒有精確匹配，嘗試使用包含關係匹配
  if (!typeInfo) {
    // 映射常見的替代名稱
    const typeMap: Record<string, string> = {
      erc20: 'erc20_transfer',
      eth: 'eth_transfer',
      contract: 'contract_execution',
      lp: 'liquidity',
      token: 'transfer',
      send: 'transfer',
    };

    // 檢查是否有映射
    const mappedType = typeMap[lowerType];
    if (mappedType) {
      typeInfo = transactionTypes.find((t) => t.type === mappedType);
    }

    // 如果仍然沒有匹配，嘗試查找包含該關鍵字的類型
    if (!typeInfo) {
      typeInfo = transactionTypes.find(
        (t) => lowerType.includes(t.type) || t.type.includes(lowerType)
      );
    }
  }

  // 如果仍然沒有找到匹配，使用默認值
  return typeInfo || transactionTypes[transactionTypes.length - 1];
};
