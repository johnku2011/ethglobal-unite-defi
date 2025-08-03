import { create } from 'zustand';
import type { SwapState, SwapQuoteParams, SwapQuote, Token } from '@/types';
import { swapService } from '@/services/swapService';
import { oneInchBalanceService } from '@/services/oneinchBalanceService';

// Enhanced swap store with real implementation
interface SwapStoreState extends SwapState {
  getQuote: (params: SwapQuoteParams) => Promise<void>;
  executeSwap: () => Promise<void>;
  clearQuote: () => void;
  clearError: () => void;
  getSupportedTokens: (chainId: string) => Promise<Token[]>;
}

const useSwapStore = create<SwapStoreState>((set, get) => ({
  // Initial state
  quote: undefined,
  isLoadingQuote: false,
  quoteError: undefined,
  pendingTransactions: [],
  history: [],

  // Actions - real implementations
  getQuote: async (params: SwapQuoteParams) => {
    try {
      set({ isLoadingQuote: true, quoteError: undefined });

      const quote = await swapService.getSwapQuote(params);

      // Transform to match our SwapQuote interface
      const transformedQuote: SwapQuote = {
        fromToken: quote.fromToken,
        toToken: quote.toToken,
        fromAmount: quote.fromAmount,
        toAmount: quote.toAmount,
        slippage: quote.slippage,
        gasEstimate: (quote as any).estimatedGas || '0',
        route: quote.route,
        priceImpact: quote.priceImpact,
        minimumReceived: (
          parseFloat(quote.toAmount) *
          (1 - quote.slippage / 100)
        ).toString(),
      };

      set({
        quote: transformedQuote,
        isLoadingQuote: false,
      });
    } catch (error) {
      console.error('Error getting swap quote:', error);
      set({
        quoteError: {
          type: 'API_ERROR' as any,
          message:
            error instanceof Error ? error.message : 'Failed to get quote',
          recoverable: true,
          suggestedAction: 'Please try again later',
        },
        isLoadingQuote: false,
      });
    }
  },

  executeSwap: async () => {
    try {
      const { quote } = get();
      if (!quote) {
        throw new Error('No quote available');
      }

      // For now, we'll simulate the swap execution
      // In a real implementation, you would get the connected wallet
      console.log('Executing swap with quote:', quote);

      // You would typically get the wallet from context here
      // const wallet = useWallet().connectedWallets[0];
      // const transaction = await swapService.executeSwap(quote, wallet);

      // For now, just log success
      console.log('Swap executed successfully (simulated)');
    } catch (error) {
      console.error('Error executing swap:', error);
      set({
        quoteError: {
          type: 'TRANSACTION_FAILED' as any,
          message:
            error instanceof Error ? error.message : 'Failed to execute swap',
          recoverable: true,
          suggestedAction: 'Please check your wallet and try again',
        },
      });
    }
  },

  getSupportedTokens: async (chainId: string) => {
    try {
      return await oneInchBalanceService.getSupportedTokens(parseInt(chainId));
    } catch (error) {
      console.error('Error fetching supported tokens:', error);
      return [];
    }
  },

  clearQuote: () => {
    set({ quote: undefined, quoteError: undefined });
  },

  clearError: () => {
    set({ quoteError: undefined });
  },
}));

export default useSwapStore;
