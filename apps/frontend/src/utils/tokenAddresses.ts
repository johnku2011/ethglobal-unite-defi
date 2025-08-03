// Token addresses for different chains
export const TOKEN_ADDRESSES = {
  1: {
    // Ethereum Mainnet
    ETH: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
    USDC: '0xa0b86a33e6776dd5f39b66364e77a0c79cc47640',
    USDT: '0xdac17f958d2ee523a2206206994597c13d831ec7',
  },
  56: {
    // BSC
    BNB: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
    USDC: '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d',
    USDT: '0x55d398326f99059ff775485246999027b3197955',
  },
  137: {
    // Polygon
    MATIC: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
    USDC: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174',
    USDT: '0xc2132d05d31c914a87c6611c10748aeb04b58e8f',
  },
  42161: {
    // Arbitrum
    ETH: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
    USDC: '0xff970a61a04b1ca14834a43f5de4533ebddb5cc8',
    USDT: '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9',
  },
  10: {
    // Optimism
    ETH: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
    USDC: '0x7f5c764cbc14f9669b88837ca1490cca17c31607',
    USDT: '0x94b008aa00579c1307b0ef2c499ad98a8ce58e58',
  },
  8453: {
    // Base
    ETH: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
    USDC: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    WETH: '0x4200000000000000000000000000000000000006',
  },
  11155111: {
    // Sepolia
    ETH: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
    USDC: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',
    USDT: '0x7169D38820dfd117C3FA1f22a697dBA58d90BA06',
  },
} as const;

export function getTokenAddress(
  chainId: number,
  symbol: string
): string | null {
  const chainTokens = TOKEN_ADDRESSES[chainId as keyof typeof TOKEN_ADDRESSES];
  if (!chainTokens) {
    console.warn(`❌ Chain ${chainId} not supported`);
    return null;
  }

  const address = chainTokens[symbol as keyof typeof chainTokens];
  if (!address) {
    console.warn(`❌ Token ${symbol} not found on chain ${chainId}`);
    return null;
  }

  return address;
}

export function validateTokenAddress(
  chainId: number,
  address: string
): boolean {
  const chainTokens = TOKEN_ADDRESSES[chainId as keyof typeof TOKEN_ADDRESSES];
  if (!chainTokens) return false;

  return Object.values(chainTokens).includes(address);
}

export function getSupportedTokens(chainId: number): string[] {
  const chainTokens = TOKEN_ADDRESSES[chainId as keyof typeof TOKEN_ADDRESSES];
  return chainTokens ? Object.keys(chainTokens) : [];
}
