import axios from 'axios';
import type { Token } from '@/types';
import type { ConnectedWallet } from '@/providers/WalletProvider';

// Use internal API routes instead of direct 1inch API calls to avoid CORS
const INTERNAL_API_BASE = '/api';

interface OneInchBalanceResponse {
  [tokenAddress: string]: string;
}

interface OneInchTokenInfo {
  symbol: string;
  name: string;
  decimals: number;
  address: string;
  logoURI: string;
}

interface OneInchTokensResponse {
  tokens: {
    [address: string]: OneInchTokenInfo;
  };
}

export class OneInchBalanceService {
  constructor() {
    // No need for API key here since it's handled by our internal API routes
  }

  /**
   * Get chain ID from connected wallet
   */
  private getChainId(wallet: ConnectedWallet): number {
    if (wallet.type === 'ethereum') {
      return wallet.chainId || 1; // Default to mainnet
    }
    return 1; // Default for non-ethereum wallets
  }

  /**
   * Get chain name for display
   */
  getChainName(chainId: number): string {
    const chainNames: Record<number, string> = {
      1: 'Ethereum',
      11155111: 'Sepolia',
      137: 'Polygon',
      56: 'BSC',
      42161: 'Arbitrum',
      10: 'Optimism',
      8453: 'Base',
    };
    return chainNames[chainId] || `Chain ${chainId}`;
  }

  /**
   * Get supported tokens for a specific chain
   */
  async getSupportedTokens(chainId: number): Promise<Token[]> {
    try {
      console.log(`🪙 Getting supported tokens for chain ${chainId}`);

      const response = await axios.get<OneInchTokensResponse>(
        `${INTERNAL_API_BASE}/tokens/${chainId}`
      );

      const tokens = Object.values(response.data.tokens).map(
        (token): Token => ({
          address: token.address,
          symbol: token.symbol,
          name: token.name,
          decimals: token.decimals,
          chainId: chainId.toString(),
          logoUrl: token.logoURI,
        })
      );

      console.log(`✅ Found ${tokens.length} tokens for chain ${chainId}`);
      return tokens;
    } catch (error) {
      console.error('❌ Error fetching supported tokens via API:', error);
      console.log('🔄 Falling back to default tokens...');
      return this.getDefaultTokens(chainId);
    }
  }

  /**
   * Get default tokens for a chain (fallback)
   */
  private getDefaultTokens(chainId: number): Token[] {
    const defaultTokens: Record<number, Token[]> = {
      1: [
        {
          address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
          symbol: 'ETH',
          name: 'Ethereum',
          decimals: 18,
          chainId: '1',
        },
        {
          address: '0xa0b86a33e6776dd5f39b66364e77a0c79cc47640',
          symbol: 'USDC',
          name: 'USD Coin',
          decimals: 6,
          chainId: '1',
        },
      ],
      11155111: [
        {
          address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
          symbol: 'ETH',
          name: 'Ethereum',
          decimals: 18,
          chainId: '11155111',
        },
        {
          address: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',
          symbol: 'USDC',
          name: 'USD Coin (Sepolia)',
          decimals: 6,
          chainId: '11155111',
        },
      ],
      8453: [
        // Base
        {
          address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
          symbol: 'ETH',
          name: 'Ethereum',
          decimals: 18,
          chainId: '8453',
        },
        {
          address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
          symbol: 'USDC',
          name: 'USD Coin',
          decimals: 6,
          chainId: '8453',
        },
      ],
    };

    return defaultTokens[chainId] || defaultTokens[1];
  }

  /**
   * Get wallet balances using internal API route (avoids CORS)
   */
  async getWalletBalances(
    wallet: ConnectedWallet
  ): Promise<Record<string, string>> {
    try {
      if (wallet.type !== 'ethereum') {
        console.log('❌ Balance API only supports Ethereum-compatible wallets');
        return {};
      }

      const chainId = this.getChainId(wallet);
      console.log(
        `📊 Getting wallet balances for ${wallet.address} on chain ${chainId}`
      );

      const response = await axios.get<OneInchBalanceResponse>(
        `${INTERNAL_API_BASE}/balance/${chainId}/${wallet.address}`
      );

      // Convert balances from wei to human readable format
      const balances: Record<string, string> = {};

      for (const [tokenAddress, balance] of Object.entries(response.data)) {
        // Get token info to determine decimals
        const tokens = await this.getSupportedTokens(chainId);
        const token = tokens.find(
          (t) => t.address.toLowerCase() === tokenAddress.toLowerCase()
        );

        if (token) {
          const decimals = token.decimals;
          const humanReadable = this.formatTokenBalance(balance, decimals);
          balances[token.symbol] = humanReadable;
          console.log(`💰 ${token.symbol}: ${humanReadable}`);
        }
      }

      console.log(
        `✅ Successfully loaded ${Object.keys(balances).length} token balances`
      );
      return balances;
    } catch (error) {
      console.error('❌ Error fetching wallet balances via API:', error);
      if (axios.isAxiosError(error)) {
        console.error('Response data:', error.response?.data);
        console.error('Response status:', error.response?.status);
      }
      return {};
    }
  }

  /**
   * Get balance for a specific token
   */
  async getTokenBalance(
    wallet: ConnectedWallet,
    token: Token
  ): Promise<string> {
    try {
      const allBalances = await this.getWalletBalances(wallet);
      return allBalances[token.symbol] || '0.0';
    } catch (error) {
      console.error('❌ Error fetching token balance:', error);
      return '0.0';
    }
  }

  /**
   * Format token balance from wei to human readable
   */
  private formatTokenBalance(balance: string, decimals: number): string {
    try {
      const balanceBigInt = BigInt(balance);
      const divisor = BigInt(10 ** decimals);
      const wholePart = balanceBigInt / divisor;
      const fractionalPart = balanceBigInt % divisor;

      const fractionalStr = fractionalPart.toString().padStart(decimals, '0');
      const trimmedFractional = fractionalStr.replace(/0+$/, '');

      if (trimmedFractional === '') {
        return wholePart.toString();
      }

      return `${wholePart}.${trimmedFractional}`;
    } catch (error) {
      console.error('❌ Error formatting balance:', error);
      return '0.0';
    }
  }

  /**
   * Get popular tokens for a chain
   */
  getPopularTokens(chainId: number): Token[] {
    const popularTokens: Record<number, Token[]> = {
      1: [
        {
          address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
          symbol: 'ETH',
          name: 'Ethereum',
          decimals: 18,
          chainId: '1',
        },
        {
          address: '0xa0b86a33e6776dd5f39b66364e77a0c79cc47640',
          symbol: 'USDC',
          name: 'USD Coin',
          decimals: 6,
          chainId: '1',
        },
        {
          address: '0xdac17f958d2ee523a2206206994597c13d831ec7',
          symbol: 'USDT',
          name: 'Tether',
          decimals: 6,
          chainId: '1',
        },
      ],
      56: [
        // BSC
        {
          address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
          symbol: 'BNB',
          name: 'BNB',
          decimals: 18,
          chainId: '56',
        },
        {
          address: '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d',
          symbol: 'USDC',
          name: 'USD Coin',
          decimals: 18,
          chainId: '56',
        },
        {
          address: '0x55d398326f99059ff775485246999027b3197955',
          symbol: 'USDT',
          name: 'Tether',
          decimals: 18,
          chainId: '56',
        },
      ],
      11155111: [
        {
          address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
          symbol: 'ETH',
          name: 'Ethereum',
          decimals: 18,
          chainId: '11155111',
        },
        {
          address: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',
          symbol: 'USDC',
          name: 'USD Coin (Sepolia)',
          decimals: 6,
          chainId: '11155111',
        },
        {
          address: '0x7169D38820dfd117C3FA1f22a697dBA58d90BA06',
          symbol: 'USDT',
          name: 'Tether (Sepolia)',
          decimals: 6,
          chainId: '11155111',
        },
      ],
      137: [
        // Polygon
        {
          address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
          symbol: 'MATIC',
          name: 'Polygon',
          decimals: 18,
          chainId: '137',
        },
        {
          address: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174',
          symbol: 'USDC',
          name: 'USD Coin',
          decimals: 6,
          chainId: '137',
        },
        {
          address: '0xc2132d05d31c914a87c6611c10748aeb04b58e8f',
          symbol: 'USDT',
          name: 'Tether',
          decimals: 6,
          chainId: '137',
        },
      ],
      42161: [
        // Arbitrum
        {
          address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
          symbol: 'ETH',
          name: 'Ethereum',
          decimals: 18,
          chainId: '42161',
        },
        {
          address: '0xff970a61a04b1ca14834a43f5de4533ebddb5cc8',
          symbol: 'USDC',
          name: 'USD Coin',
          decimals: 6,
          chainId: '42161',
        },
        {
          address: '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9',
          symbol: 'USDT',
          name: 'Tether',
          decimals: 6,
          chainId: '42161',
        },
      ],
      10: [
        // Optimism
        {
          address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
          symbol: 'ETH',
          name: 'Ethereum',
          decimals: 18,
          chainId: '10',
        },
        {
          address: '0x7f5c764cbc14f9669b88837ca1490cca17c31607',
          symbol: 'USDC',
          name: 'USD Coin',
          decimals: 6,
          chainId: '10',
        },
        {
          address: '0x94b008aa00579c1307b0ef2c499ad98a8ce58e58',
          symbol: 'USDT',
          name: 'Tether',
          decimals: 6,
          chainId: '10',
        },
      ],
      8453: [
        // Base
        {
          address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
          symbol: 'ETH',
          name: 'Ethereum',
          decimals: 18,
          chainId: '8453',
        },
        {
          address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
          symbol: 'USDC',
          name: 'USD Coin',
          decimals: 6,
          chainId: '8453',
        },
        {
          address: '0x4200000000000000000000000000000000000006',
          symbol: 'WETH',
          name: 'Wrapped Ether',
          decimals: 18,
          chainId: '8453',
        },
      ],
    };

    return popularTokens[chainId] || popularTokens[1];
  }
}

// Export singleton instance
export const oneInchBalanceService = new OneInchBalanceService();
