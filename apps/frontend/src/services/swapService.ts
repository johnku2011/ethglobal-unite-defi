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

interface OneInchAllowanceResponse {
  allowance: string;
}

interface OneInchApprovalResponse {
  to: string;
  data: string;
  value: string;
  gas?: string;
}

export class SwapService implements ISwapService {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || ONEINCH_API_KEY;
    this.baseUrl = ONEINCH_API_BASE;
  }

  /**
   * Build query URL for 1inch API calls
   */
  private buildQueryURL(path: string, params: Record<string, string>): string {
    const url = new URL(`${this.baseUrl}${path}`);
    url.search = new URLSearchParams(params).toString();
    return url.toString();
  }

  /**
   * Make authenticated API call to 1inch
   */
  private async call1inchAPI<T>(
    endpointPath: string,
    queryParams: Record<string, string>
  ): Promise<T> {
    const url = this.buildQueryURL(endpointPath, queryParams);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`1inch API returned status ${response.status}: ${body}`);
    }

    return (await response.json()) as T;
  }

  /**
   * Check token allowance for 1inch router
   */
  async checkAllowance(
    chainId: number,
    tokenAddress: string,
    walletAddress: string
  ): Promise<bigint> {
    try {
      console.log('Checking token allowance...');

      const allowanceRes = await axios.get<OneInchAllowanceResponse>(
        `/api/swap/${chainId}/approve/allowance?tokenAddress=${tokenAddress}&walletAddress=${walletAddress.toLowerCase()}`
      );

      const allowance = BigInt(allowanceRes.data.allowance);
      console.log('Current allowance:', allowance.toString());

      return allowance;
    } catch (error) {
      console.error('Error checking allowance:', error);
      throw new Error('Failed to check token allowance');
    }
  }

  /**
   * Get approval transaction data
   */
  async getApprovalTransaction(
    chainId: number,
    tokenAddress: string,
    amount: string
  ): Promise<OneInchApprovalResponse> {
    try {
      console.log('Getting approval transaction data...');

      const approveTx = await axios.get<OneInchApprovalResponse>(
        `/api/swap/${chainId}/approve/transaction?tokenAddress=${tokenAddress}&amount=${amount}`
      );

      console.log('Approval transaction details:', approveTx.data);
      return approveTx.data;
    } catch (error) {
      console.error('Error getting approval transaction:', error);
      throw new Error('Failed to get approval transaction');
    }
  }

  /**
   * Send transaction using browser wallet
   */
  private async sendTransaction(txData: {
    to: string;
    data: string;
    value: string;
    gas?: string;
  }): Promise<string> {
    if (typeof window === 'undefined' || !window.ethereum) {
      throw new Error('No Ethereum provider found');
    }

    try {
      // Request transaction from user's wallet
      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [
          {
            to: txData.to,
            data: txData.data,
            value: txData.value,
            gas: txData.gas ? `0x${parseInt(txData.gas).toString(16)}` : undefined,
          },
        ],
      });

      console.log('Transaction sent:', txHash);
      return txHash;
    } catch (error) {
      console.error('Transaction failed:', error);
      throw new Error('Transaction was rejected or failed');
    }
  }

  /**
   * Handle token approval if needed
   */
  private async approveIfNeeded(
    chainId: number,
    tokenAddress: string,
    walletAddress: string,
    requiredAmount: bigint
  ): Promise<void> {
    // Skip approval for native ETH
    if (tokenAddress.toLowerCase() === '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee') {
      console.log('Native ETH transfer, no approval needed');
      return;
    }

    const allowance = await this.checkAllowance(chainId, tokenAddress, walletAddress);

    if (allowance >= requiredAmount) {
      console.log('Allowance is sufficient for the swap.');
      return;
    }

    console.log('Insufficient allowance. Creating approval transaction...');

    const approveTx = await this.getApprovalTransaction(
      chainId,
      tokenAddress,
      requiredAmount.toString()
    );

    const txHash = await this.sendTransaction({
      to: approveTx.to,
      data: approveTx.data,
      value: approveTx.value,
      gas: approveTx.gas,
    });

    console.log('Approval transaction sent. Hash:', txHash);
    console.log('Waiting for approval confirmation...');

    // Wait for transaction confirmation
    await this.waitForTransaction(txHash);
  }

  /**
   * Wait for transaction confirmation
   */
  private async waitForTransaction(txHash: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const checkTransaction = async () => {
        try {
          const receipt = await window.ethereum?.request({
            method: 'eth_getTransactionReceipt',
            params: [txHash],
          });

          if (receipt) {
            if (receipt.status === '0x1') {
              console.log('Transaction confirmed:', txHash);
              resolve();
            } else {
              reject(new Error('Transaction failed'));
            }
          } else {
            // Transaction still pending, check again
            setTimeout(checkTransaction, 2000);
          }
        } catch (error) {
          reject(error);
        }
      };

      checkTransaction();
    });
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
        `/api/swap/${chainId}/quote?${queryParams}`
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
        gasEstimate: data.estimatedGas.toString(),
        priceImpact: 0, // Would need additional calculation
        minimumReceived: data.toAmount, // Simplified - should calculate based on slippage
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

      // Check and handle token approval first
      await this.approveIfNeeded(
        chainId,
        quote.fromToken.address,
        wallet.address,
        BigInt(quote.fromAmount)
      );

      console.log('Fetching swap transaction...');

      const swapParams = {
        src: quote.fromToken.address,
        dst: quote.toToken.address,
        amount: quote.fromAmount,
        from: wallet.address.toLowerCase(),
        slippage: quote.slippage.toString(),
        disableEstimate: 'false',
        allowPartialFill: 'false',
        includeTokensInfo: 'true',
        includeProtocols: 'true',
        includeGas: 'true',
      };

      const queryString = new URLSearchParams(swapParams).toString();
      const swapTx = await axios.get<{ tx: OneInchSwapResponse['tx'] }>(
        `/api/swap/${chainId}/swap?${queryString}`
      );

      console.log('Swap transaction:', swapTx.data.tx);

      // Execute the swap transaction
      const txHash = await this.sendTransaction({
        to: swapTx.data.tx.to,
        data: swapTx.data.tx.data,
        value: swapTx.data.tx.value,
        gas: swapTx.data.tx.gas.toString(),
      });

      console.log('Swap transaction sent. Hash:', txHash);

      return {
        id: txHash,
        status: TransactionStatus.PENDING,
        txHash,
        timestamp: new Date(),
        fromToken: quote.fromToken,
        toToken: quote.toToken,
        fromAmount: quote.fromAmount,
        toAmount: quote.toAmount,
        slippage: quote.slippage,
        priceImpact: 0, // Would need additional calculation
        gasUsed: swapTx.data.tx.gas.toString(),
      };
    } catch (error) {
      console.error('Error executing swap:', error);
      throw new Error(`Failed to execute swap: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
      if (typeof window === 'undefined' || !window.ethereum) {
        return TransactionStatus.FAILED;
      }

      const receipt = await window.ethereum.request({
        method: 'eth_getTransactionReceipt',
        params: [transactionId],
      });

      if (!receipt) {
        return TransactionStatus.PENDING;
      }

      return receipt.status === '0x1' 
        ? TransactionStatus.CONFIRMED 
        : TransactionStatus.FAILED;
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
