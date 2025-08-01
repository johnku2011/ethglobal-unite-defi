import axios from 'axios';
import type {
  SwapQuote,
  SwapQuoteParams,
  SwapTransaction,
  ConnectedWallet,
  Token,
} from '@/types';
import { TransactionStatus } from '@/types';
import type { ISwapService } from '@/types/services';

// 1inch API configuration
const ONEINCH_API_BASE = 'https://api.1inch.dev';
const ONEINCH_API_KEY = process.env.NEXT_PUBLIC_ONEINCH_API_KEY || '';

interface OneInchQuoteResponse {
  fromToken: {
    symbol: string;
    name: string;
    decimals: number;
    address: string;
    logoURI: string;
  };
  toToken: {
    symbol: string;
    name: string;
    decimals: number;
    address: string;
    logoURI: string;
  };
  toAmount: string;
  fromAmount: string;
  protocols: any[];
  estimatedGas: number;
}

interface OneInchSwapResponse extends OneInchQuoteResponse {
  tx: {
    from: string;
    to: string;
    data: string;
    value: string;
    gasPrice: string;
    gas: number;
  };
}

export class SwapService implements ISwapService {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || ONEINCH_API_KEY;
    this.baseUrl = ONEINCH_API_BASE;
  }

  /**
   * Get swap quote from 1inch API
   */
  async getSwapQuote(params: SwapQuoteParams): Promise<SwapQuote> {
    try {
      const { fromToken, toToken, amount, slippage = 1, fromAddress } = params;

      // Use chain ID from the token (should be set by the UI)
      const chainId = parseInt(fromToken.chainId) || 1;

      const queryParams = new URLSearchParams({
        src: fromToken.address,
        dst: toToken.address,
        amount: amount,
        includeTokensInfo: 'true',
        includeProtocols: 'true',
        includeGas: 'true',
      });

      const response = await axios.get(
        `${this.baseUrl}/swap/v6.0/${chainId}/quote?${queryParams}`,
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            accept: 'application/json',
          },
        }
      );

      const data: OneInchQuoteResponse = response.data;

      // Transform 1inch response to our SwapQuote format
      return {
        fromToken: {
          address: data.fromToken.address,
          symbol: data.fromToken.symbol,
          name: data.fromToken.name,
          decimals: data.fromToken.decimals,
          logoUrl: data.fromToken.logoURI,
          chainId: chainId.toString(),
        },
        toToken: {
          address: data.toToken.address,
          symbol: data.toToken.symbol,
          name: data.toToken.name,
          decimals: data.toToken.decimals,
          logoUrl: data.toToken.logoURI,
          chainId: chainId.toString(),
        },
        fromAmount: data.fromAmount,
        toAmount: data.toAmount,
        estimatedGas: data.estimatedGas.toString(),
        priceImpact: 0, // Would need additional calculation
        route: data.protocols.map((protocol: any) => ({
          protocol: protocol.name || 'Unknown',
          percentage: protocol.part || 100,
          fromToken: {
            address: data.fromToken.address,
            symbol: data.fromToken.symbol,
            name: data.fromToken.name,
            decimals: data.fromToken.decimals,
            logoUri: data.fromToken.logoURI,
            chainId: chainId.toString(),
          },
          toToken: {
            address: data.toToken.address,
            symbol: data.toToken.symbol,
            name: data.toToken.name,
            decimals: data.toToken.decimals,
            logoUri: data.toToken.logoURI,
            chainId: chainId.toString(),
          },
        })),
        slippage: slippage,
      };
    } catch (error) {
      console.error('Error getting swap quote:', error);
      throw new Error('Failed to get swap quote');
    }
  }

  /**
   * Execute a swap transaction
   */
  async executeSwap(
    quote: SwapQuote,
    wallet: ConnectedWallet
  ): Promise<SwapTransaction> {
    try {
      const chainId = parseInt(quote.fromToken.chainId) || 1;

      const queryParams = new URLSearchParams({
        src: quote.fromToken.address,
        dst: quote.toToken.address,
        amount: quote.fromAmount,
        from: wallet.address,
        slippage: quote.slippage.toString(),
        includeTokensInfo: 'true',
        includeProtocols: 'true',
        includeGas: 'true',
      });

      const response = await axios.get(
        `${this.baseUrl}/swap/v6.0/${chainId}/swap?${queryParams}`,
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            accept: 'application/json',
          },
        }
      );

      const data: OneInchSwapResponse = response.data;

      // Execute the transaction using the wallet
      let txHash: string | undefined;
      try {
        // This would depend on your wallet implementation
        // For now, we'll simulate the transaction
        console.log('Transaction data:', data.tx);

        // In a real implementation, you would send the transaction here
        // txHash = await wallet.sendTransaction(data.tx);

        // For now, we'll generate a mock transaction hash
        txHash = `0x${Math.random().toString(16).substr(2, 64)}`;
      } catch (txError) {
        console.error('Transaction execution failed:', txError);
        throw new Error('Transaction execution failed');
      }

      return {
        id: txHash || `swap_${Date.now()}`,
        type: 'swap',
        status: TransactionStatus.PENDING,
        txHash,
        timestamp: new Date(),
        fromToken: quote.fromToken,
        toToken: quote.toToken,
        fromAmount: quote.fromAmount,
        toAmount: quote.toAmount,
        slippage: quote.slippage,
        priceImpact: 0, // Would need additional calculation
        gasUsed: data.estimatedGas.toString(),
      };
    } catch (error) {
      console.error('Error executing swap:', error);
      throw new Error('Failed to execute swap');
    }
  }

  /**
   * Get swap transaction history
   */
  async getSwapHistory(wallet: ConnectedWallet): Promise<SwapTransaction[]> {
    try {
      // This would typically fetch from your backend or blockchain
      // For now, return empty array as placeholder
      return [];
    } catch (error) {
      console.error('Error fetching swap history:', error);
      return [];
    }
  }

  /**
   * Track swap transaction status
   */
  async trackSwapStatus(transactionId: string): Promise<TransactionStatus> {
    try {
      // This would check the transaction status on the blockchain
      // For now, return a placeholder status
      return TransactionStatus.PENDING;
    } catch (error) {
      console.error('Error tracking swap status:', error);
      return TransactionStatus.FAILED;
    }
  }

  /**
   * Cancel pending swap (if possible)
   */
  async cancelSwap(transactionId: string): Promise<boolean> {
    try {
      // Most swaps cannot be cancelled once submitted
      // This would depend on the specific implementation
      return false;
    } catch (error) {
      console.error('Error cancelling swap:', error);
      return false;
    }
  }

  // Note: getSupportedTokens() moved to OneInchBalanceService to avoid duplication
}

// Export a singleton instance
export const swapService = new SwapService();
