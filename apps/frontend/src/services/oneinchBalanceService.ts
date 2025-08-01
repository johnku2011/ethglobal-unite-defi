import axios from 'axios';
import type { Token } from '@/types';
import type { ConnectedWallet } from '@/providers/WalletProvider';

// 1inch API configuration
const ONEINCH_API_BASE = 'https://api.1inch.dev';
const ONEINCH_API_KEY = process.env.NEXT_PUBLIC_ONEINCH_API_KEY || '';

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
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || ONEINCH_API_KEY;
    this.baseUrl = ONEINCH_API_BASE;
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
    };
    return chainNames[chainId] || `Chain ${chainId}`;
  }

  /**
   * Get supported tokens for a specific chain
   */
  async getSupportedTokens(chainId: number): Promise<Token[]> {
    try {
      const response = await axios.get<OneInchTokensResponse>(
        `${this.baseUrl}/swap/v6.0/${chainId}/tokens`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'accept': 'application/json',
          },
        }
      );

      const tokens = Object.values(response.data.tokens).map((token): Token => ({
        address: token.address,
        symbol: token.symbol,
        name: token.name,
        decimals: token.decimals,
        chainId: chainId.toString(),
        logoUrl: token.logoURI,
      }));

      return tokens;
    } catch (error) {
      console.error('Error fetching supported tokens:', error);
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
          name: 'USD Coin',
          decimals: 6,
          chainId: '11155111',
        },
      ],
    };

    return defaultTokens[chainId] || defaultTokens[1];
  }

  /**
   * Get wallet balances using 1inch Balance API
   */
  async getWalletBalances(wallet: ConnectedWallet): Promise<Record<string, string>> {
    try {
      if (wallet.type !== 'ethereum') {
        console.log('Balance API only supports Ethereum-compatible wallets');
        return {};
      }

      const chainId = this.getChainId(wallet);
      
      const response = await axios.get<OneInchBalanceResponse>(
        `${this.baseUrl}/balance/v1.2/${chainId}/${wallet.address}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'accept': 'application/json',
          },
        }
      );

      // Convert balances from wei to human readable format
      const balances: Record<string, string> = {};
      
      for (const [tokenAddress, balance] of Object.entries(response.data)) {
        // Get token info to determine decimals
        const tokens = await this.getSupportedTokens(chainId);
        const token = tokens.find(t => t.address.toLowerCase() === tokenAddress.toLowerCase());
        
        if (token) {
          const decimals = token.decimals;
          const humanReadable = this.formatTokenBalance(balance, decimals);
          balances[token.symbol] = humanReadable;
        }
      }

      return balances;
    } catch (error) {
      console.error('Error fetching wallet balances:', error);
      return {};
    }
  }

  /**
   * Get balance for a specific token
   */
  async getTokenBalance(wallet: ConnectedWallet, token: Token): Promise<string> {
    try {
      const allBalances = await this.getWalletBalances(wallet);
      return allBalances[token.symbol] || '0.0';
    } catch (error) {
      console.error('Error fetching token balance:', error);
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
      console.error('Error formatting balance:', error);
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
    };

    return popularTokens[chainId] || popularTokens[1];
  }
}

// Export singleton instance
export const oneInchBalanceService = new OneInchBalanceService(); 