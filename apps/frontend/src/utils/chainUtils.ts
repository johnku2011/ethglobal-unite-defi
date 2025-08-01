/**
 * 區塊鏈工具函數
 */

export interface ChainInfo {
  id: number;
  name: string;
  icon: string;
  explorerUrl: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
}

/**
 * 支持的區塊鏈信息
 */
export const SUPPORTED_CHAINS: ChainInfo[] = [
  // Mainnet chains
  {
    id: 1,
    name: 'Ethereum',
    icon: 'https://app.1inch.io/assets/images/network-logos/ethereum.svg',
    explorerUrl: 'https://etherscan.io',
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
    },
  },
  {
    id: 137,
    name: 'Polygon',
    icon: 'https://app.1inch.io/assets/images/network-logos/polygon_1.svg',
    explorerUrl: 'https://polygonscan.com',
    nativeCurrency: {
      name: 'Polygon',
      symbol: 'MATIC',
      decimals: 18,
    },
  },
  {
    id: 56,
    name: 'BSC',
    icon: 'https://app.1inch.io/assets/images/network-logos/bsc_2.svg',
    explorerUrl: 'https://bscscan.com',
    nativeCurrency: {
      name: 'Binance Coin',
      symbol: 'BNB',
      decimals: 18,
    },
  },
  {
    id: 42161,
    name: 'Arbitrum',
    icon: 'https://app.1inch.io/assets/images/network-logos/arbitrum_2.svg',
    explorerUrl: 'https://arbiscan.io',
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
    },
  },
  {
    id: 10,
    name: 'Optimism',
    icon: 'https://app.1inch.io/assets/images/network-logos/optimism.svg',
    explorerUrl: 'https://optimistic.etherscan.io',
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
    },
  },
  {
    id: 8453,
    name: 'Base',
    icon: 'https://app.1inch.io/assets/images/network-logos/base.svg',
    explorerUrl: 'https://basescan.org',
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
    },
  },
  // Testnet chains
  {
    id: 11155111,
    name: 'Sepolia',
    icon: 'https://app.1inch.io/assets/images/network-logos/ethereum.svg',
    explorerUrl: 'https://sepolia.etherscan.io',
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
    },
  },
  {
    id: 84532,
    name: 'Base Sepolia',
    icon: 'https://app.1inch.io/assets/images/network-logos/base.svg',
    explorerUrl: 'https://sepolia.basescan.org',
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
    },
  },
  {
    id: 421614,
    name: 'Arbitrum Sepolia',
    icon: 'https://app.1inch.io/assets/images/network-logos/arbitrum_2.svg',
    explorerUrl: 'https://sepolia.arbiscan.io',
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
    },
  },
];

/**
 * 根據鏈 ID 獲取鏈名稱
 * @param chainId 區塊鏈ID
 * @returns 鏈名稱
 */
export function getChainName(chainId: number): string {
  const chain = SUPPORTED_CHAINS.find((c) => c.id === chainId);
  return chain?.name || `Chain ${chainId}`;
}

/**
 * 根據鏈 ID 獲取鏈圖標
 * @param chainId 區塊鏈ID
 * @returns 鏈圖標URL
 */
export function getChainIcon(chainId: number): string | undefined {
  const chain = SUPPORTED_CHAINS.find((c) => c.id === chainId);
  return chain?.icon;
}

/**
 * 根據鏈 ID 獲取區塊瀏覽器 URL
 * @param chainId 區塊鏈ID
 * @returns 區塊瀏覽器URL
 */
export function getExplorerUrl(chainId: number): string {
  const chain = SUPPORTED_CHAINS.find((c) => c.id === chainId);
  return chain?.explorerUrl || 'https://etherscan.io';
}

/**
 * 生成交易哈希鏈接
 * @param chainId 區塊鏈ID
 * @param txHash 交易哈希
 * @returns 交易哈希鏈接
 */
export function getTxHashLink(chainId: number, txHash: string): string {
  return `${getExplorerUrl(chainId)}/tx/${txHash}`;
}

/**
 * 生成地址鏈接
 * @param chainId 區塊鏈ID
 * @param address 地址
 * @returns 地址鏈接
 */
export function getAddressLink(chainId: number, address: string): string {
  return `${getExplorerUrl(chainId)}/address/${address}`;
}

/**
 * 格式化地址
 * @param address 完整地址
 * @param prefixLength 前綴長度
 * @param suffixLength 後綴長度
 * @returns 格式化後的地址
 */
export function formatAddress(
  address: string,
  prefixLength = 6,
  suffixLength = 4
): string {
  if (!address) return '';
  if (address.length <= prefixLength + suffixLength) return address;

  return `${address.substring(0, prefixLength)}...${address.substring(address.length - suffixLength)}`;
}
