/**
 * 交易類型常量定義
 */

export interface TransactionTypeInfo {
  type: string; // 類型標識符
  label: string; // 顯示名稱
  icon: string; // 圖標
  color: string; // 顯示顏色
  description: string; // 描述
}

/**
 * 交易類型配置
 */
export const transactionTypes: TransactionTypeInfo[] = [
  {
    type: 'swap',
    label: '兌換',
    icon: 'swap_horiz',
    color: 'text-blue-500',
    description: '兌換一種代幣為另一種代幣',
  },
  {
    type: 'transfer',
    label: '轉賬',
    icon: 'send',
    color: 'text-green-500',
    description: '發送代幣到另一個地址',
  },
  {
    type: 'receive',
    label: '收款',
    icon: 'call_received',
    color: 'text-green-600',
    description: '從另一個地址接收代幣',
  },
  {
    type: 'approve',
    label: '授權',
    icon: 'verified',
    color: 'text-yellow-500',
    description: '授權合約使用代幣',
  },
  {
    type: 'cancel',
    label: '取消',
    icon: 'cancel',
    color: 'text-red-500',
    description: '取消待處理的交易',
  },
  {
    type: 'deposit',
    label: '存入',
    icon: 'arrow_downward',
    color: 'text-indigo-500',
    description: '將資金存入協議或合約',
  },
  {
    type: 'withdraw',
    label: '提取',
    icon: 'arrow_upward',
    color: 'text-purple-500',
    description: '從協議或合約提取資金',
  },
  {
    type: 'claim',
    label: '領取',
    icon: 'redeem',
    color: 'text-yellow-600',
    description: '領取獎勵或空投',
  },
  {
    type: 'stake',
    label: '質押',
    icon: 'lock',
    color: 'text-blue-600',
    description: '質押資產以獲得獎勵',
  },
  {
    type: 'unstake',
    label: '解除質押',
    icon: 'lock_open',
    color: 'text-blue-400',
    description: '解除資產質押',
  },
  {
    type: 'borrow',
    label: '借款',
    icon: 'attach_money',
    color: 'text-orange-500',
    description: '從協議借出資產',
  },
  {
    type: 'repay',
    label: '償還',
    icon: 'money_off',
    color: 'text-green-500',
    description: '償還借款',
  },
  {
    type: 'mint',
    label: '鑄造',
    icon: 'add_circle',
    color: 'text-teal-500',
    description: '創建或鑄造新代幣',
  },
  {
    type: 'burn',
    label: '銷毀',
    icon: 'remove_circle',
    color: 'text-red-600',
    description: '銷毀或移除代幣',
  },
  {
    type: 'unknown',
    label: '未知',
    icon: 'help',
    color: 'text-gray-500',
    description: '未知類型的交易',
  },
];

/**
 * 根據類型獲取交易類型信息
 * @param type 交易類型
 * @returns 交易類型信息
 */
export const getTransactionTypeInfo = (type: string): TransactionTypeInfo => {
  const lowerType = type.toLowerCase();
  const typeInfo = transactionTypes.find((t) => t.type === lowerType);
  return typeInfo || transactionTypes[transactionTypes.length - 1]; // 默認返回unknown
};
