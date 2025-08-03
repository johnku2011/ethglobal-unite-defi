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
const ONEINCH_API_KEY = process.env.NEXT_PUBLIC_1INCH_API_KEY || '';

interface OneInchQuoteResponse {
  srcToken: {
    symbol: string;
    name: string;
    decimals: number;
    address: string;
    logoURI: string;
  };
  dstToken: {
    symbol: string;
    name: string;
    decimals: number;
    address: string;
    logoURI: string;
  };
  dstAmount: string;
  protocols: any[];
  gas: number;
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
    gasPrice?: string;
    from?: string;
    chainId?: number;
  }): Promise<string> {
    if (typeof window === 'undefined' || !window.ethereum) {
      throw new Error('No Ethereum provider found');
    }

    try {
      // Get the current account address
      const accounts = await window.ethereum.request({
        method: 'eth_accounts',
      });

      if (!accounts || accounts.length === 0) {
        throw new Error('No wallet account found. Please connect your wallet.');
      }

      const fromAddress = accounts[0];
      console.log('Using wallet address:', fromAddress);

      // Validate addresses
      if (!fromAddress || !fromAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
        throw new Error('Invalid from address format');
      }

      if (!txData.to || !txData.to.match(/^0x[a-fA-F0-9]{40}$/)) {
        throw new Error('Invalid to address format');
      }

      // Prepare transaction parameters
      const txParams: any = {
        from: fromAddress,
        to: txData.to,
        data: txData.data,
        value: txData.value,
      };

      // Handle gas limit with buffer for complex transactions
      if (txData.gas) {
        const gasLimit = parseInt(txData.gas);

        // 針對不同網絡使用不同的gas buffer
        let gasWithBuffer: number;
        if (txData.chainId === 42161) {
          // Arbitrum - 使用50% buffer
          gasWithBuffer = Math.floor(gasLimit * 1.5);
          console.log(
            `Arbitrum gas limit: ${gasLimit} -> ${gasWithBuffer} (50% buffer)`
          );
        } else if (txData.chainId === 10) {
          // Optimism - 使用50% buffer
          gasWithBuffer = Math.floor(gasLimit * 1.5);
          console.log(
            `Optimism gas limit: ${gasLimit} -> ${gasWithBuffer} (50% buffer)`
          );
        } else {
          // L1 networks - 使用20% buffer
          gasWithBuffer = Math.floor(gasLimit * 1.2);
          console.log(
            `L1 gas limit: ${gasLimit} -> ${gasWithBuffer} (20% buffer)`
          );
        }

        txParams.gas = `0x${gasWithBuffer.toString(16)}`;
      }

      // Handle gas price - use the one from 1inch API if provided
      if (txData.gasPrice) {
        const gasPrice = parseInt(txData.gasPrice);

        // For L2 networks (Arbitrum, Optimism), use maxFeePerGas and maxPriorityFeePerGas
        // For L1 networks, use gasPrice
        if (txData.chainId === 42161 || txData.chainId === 10) {
          // L2 networks - use EIP-1559 gas parameters
          txParams.maxFeePerGas = `0x${gasPrice.toString(16)}`;
          txParams.maxPriorityFeePerGas = `0x${Math.floor(gasPrice * 0.1).toString(16)}`; // 10% of gas price
          console.log(
            `Using L2 gas parameters: maxFeePerGas=${gasPrice}, maxPriorityFeePerGas=${Math.floor(gasPrice * 0.1)}`
          );
        } else {
          // L1 networks - use legacy gas price
          txParams.gasPrice = `0x${gasPrice.toString(16)}`;
          console.log(`Using L1 gas price: ${gasPrice} wei`);
        }
      }

      console.log('Sending transaction with params:', {
        from: txParams.from,
        to: txParams.to,
        gas: txParams.gas,
        gasPrice: txParams.gasPrice,
        value: txParams.value,
        valueETH: parseFloat(txParams.value) / Math.pow(10, 18),
      });

      // Add a warning if the value seems too high
      const valueETH = parseFloat(txParams.value) / Math.pow(10, 18);
      if (valueETH > 0.1) {
        console.warn(
          '⚠️  WARNING: Transaction value seems high:',
          valueETH,
          'ETH'
        );
        console.warn(
          'This might cause MetaMask to display an incorrect amount.'
        );
        console.warn('Please verify the amount in MetaMask before confirming.');
      }

      // Request transaction from user's wallet
      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [txParams],
      });

      console.log('Transaction sent successfully:', txHash);
      return txHash;
    } catch (error) {
      console.error('Transaction failed:', error);

      // Provide more specific error messages
      let errorMessage = 'Transaction was rejected or failed';
      if (error instanceof Error) {
        if (error.message.includes('insufficient funds')) {
          errorMessage = 'Insufficient funds for transaction';
        } else if (
          error.message.includes('user rejected') ||
          error.message.includes('User rejected')
        ) {
          errorMessage = 'Transaction was rejected by user';
        } else if (error.message.includes('gas')) {
          errorMessage = 'Gas estimation failed - please try again';
        } else if (error.message.includes('nonce')) {
          errorMessage = 'Transaction nonce error - please try again';
        } else if (
          error.message.includes('Invalid parameters') ||
          error.message.includes('must provide an Ethereum address')
        ) {
          errorMessage =
            'Invalid transaction parameters. Please check your wallet connection and try again.';
        } else if (error.message.includes('No wallet account found')) {
          errorMessage = 'No wallet account found. Please connect your wallet.';
        } else if (
          error.message.includes('Invalid from address format') ||
          error.message.includes('Invalid to address format')
        ) {
          errorMessage =
            'Invalid address format. Please check your wallet connection.';
        } else {
          errorMessage = error.message;
        }
      }

      throw new Error(errorMessage);
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
    if (
      tokenAddress.toLowerCase() ===
      '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'
    ) {
      console.log('Native ETH transfer, no approval needed');
      return;
    }

    const allowance = await this.checkAllowance(
      chainId,
      tokenAddress,
      walletAddress
    );

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

      const data = response.data;
      console.log('🔍 API Response data:', data);

      // Transform 1inch response to our SwapQuote format
      // API returns: dstAmount, srcToken, dstToken, protocols, gas
      // We expect: fromToken, toToken, toAmount, fromAmount, protocols, estimatedGas
      return {
        fromToken: {
          address: data.srcToken.address,
          symbol: data.srcToken.symbol,
          name: data.srcToken.name,
          decimals: data.srcToken.decimals,
          logoUrl: data.srcToken.logoURI,
          chainId: chainId.toString(),
        },
        toToken: {
          address: data.dstToken.address,
          symbol: data.dstToken.symbol,
          name: data.dstToken.name,
          decimals: data.dstToken.decimals,
          logoUrl: data.dstToken.logoURI,
          chainId: chainId.toString(),
        },
        fromAmount: amount, // Use the original input amount
        toAmount: data.dstAmount, // API returns dstAmount
        gasEstimate: data.gas.toString(), // API returns gas
        priceImpact: 0, // Would need additional calculation
        minimumReceived: data.dstAmount, // Simplified - should calculate based on slippage
        route: data.protocols.map((protocol: any) => ({
          protocol: protocol.name || 'Unknown',
          percentage: protocol.part || 100,
          fromToken: {
            address: data.srcToken.address,
            symbol: data.srcToken.symbol,
            name: data.srcToken.name,
            decimals: data.srcToken.decimals,
            logoUri: data.srcToken.logoURI,
            chainId: chainId.toString(),
          },
          toToken: {
            address: data.dstToken.address,
            symbol: data.dstToken.symbol,
            name: data.dstToken.name,
            decimals: data.dstToken.decimals,
            logoUri: data.dstToken.logoURI,
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
      console.log('🚀 Starting swap execution...', {
        fromToken: quote.fromToken.symbol,
        toToken: quote.toToken.symbol,
        amount: quote.fromAmount,
        chainId,
      });

      // Step 1: Check and handle token approval first
      console.log('🔍 Checking token approval...');
      await this.approveIfNeeded(
        chainId,
        quote.fromToken.address,
        wallet.address,
        BigInt(quote.fromAmount)
      );
      console.log('✅ Token approval completed');

      // Step 2: Get fresh quote to ensure accuracy
      console.log('💱 Getting fresh swap quote...');
      const freshQuote = await this.getSwapQuote({
        fromToken: quote.fromToken,
        toToken: quote.toToken,
        amount: quote.fromAmount,
        slippage: quote.slippage,
        fromAddress: wallet.address,
      });

      // Step 3: Validate quote hasn't changed significantly
      const originalRate =
        parseFloat(quote.toAmount) / parseFloat(quote.fromAmount);
      const freshRate =
        parseFloat(freshQuote.toAmount) / parseFloat(freshQuote.fromAmount);
      const rateChange = Math.abs(freshRate - originalRate) / originalRate;

      if (rateChange > 0.05) {
        // 5% tolerance
        console.warn('⚠️ Quote has changed significantly:', {
          originalRate,
          freshRate,
          change: `${(rateChange * 100).toFixed(2)}%`,
        });
        throw new Error('Quote has changed significantly. Please try again.');
      }

      console.log('✅ Quote validation passed');

      // Step 4: Fetch swap transaction data
      console.log('📝 Fetching swap transaction data...');

      // Network-specific optimizations
      const isArbitrum = chainId === 42161;
      const isOptimism = chainId === 10;

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

      // Add network-specific parameters
      if (isArbitrum) {
        console.log('🔄 Using Arbitrum-specific optimizations');
      } else if (isOptimism) {
        console.log('🔄 Using Optimism-specific optimizations');
      }

      const queryString = new URLSearchParams(swapParams).toString();
      const swapTx = await axios.get<{ tx: OneInchSwapResponse['tx'] }>(
        `/api/swap/${chainId}/swap?${queryString}`
      );

      console.log('✅ Swap transaction data received:', {
        to: swapTx.data.tx.to,
        gas: swapTx.data.tx.gas,
        gasPrice: swapTx.data.tx.gasPrice,
        value: swapTx.data.tx.value,
        valueETH: parseFloat(swapTx.data.tx.value) / Math.pow(10, 18),
        userInput: quote.fromAmount,
        userInputETH: parseFloat(quote.fromAmount) / Math.pow(10, 18),
      });

      // 添加更詳細的1inch API響應分析
      console.log('🔍 1inch API Response Analysis:', {
        originalRequest: {
          fromToken: quote.fromToken.symbol,
          toToken: quote.toToken.symbol,
          amount: quote.fromAmount,
          amountInETH: parseFloat(quote.fromAmount) / Math.pow(10, 18),
        },
        apiResponse: {
          txValue: swapTx.data.tx.value,
          txValueInETH: parseFloat(swapTx.data.tx.value) / Math.pow(10, 18),
          gas: swapTx.data.tx.gas,
          gasPrice: swapTx.data.tx.gasPrice,
          totalGasCost: (
            parseInt(swapTx.data.tx.gas) * parseInt(swapTx.data.tx.gasPrice)
          ).toString(),
          totalGasCostInETH:
            (parseInt(swapTx.data.tx.gas) * parseInt(swapTx.data.tx.gasPrice)) /
            Math.pow(10, 18),
        },
        analysis: {
          valueDifference: Math.abs(
            parseFloat(swapTx.data.tx.value) - parseFloat(quote.fromAmount)
          ),
          valueDifferenceInETH:
            Math.abs(
              parseFloat(swapTx.data.tx.value) - parseFloat(quote.fromAmount)
            ) / Math.pow(10, 18),
          isValueIncludingGas:
            parseFloat(swapTx.data.tx.value) > parseFloat(quote.fromAmount),
          gasCostInETH:
            (parseInt(swapTx.data.tx.gas) * parseInt(swapTx.data.tx.gasPrice)) /
            Math.pow(10, 18),
        },
      });

      // Step 4.5: Validate transaction parameters
      console.log('🔍 Validating transaction parameters...');
      const validationErrors = [];

      if (
        !swapTx.data.tx.to ||
        swapTx.data.tx.to === '0x0000000000000000000000000000000000000000'
      ) {
        validationErrors.push('Invalid transaction recipient');
      }

      if (!swapTx.data.tx.data || swapTx.data.tx.data.length < 10) {
        validationErrors.push('Invalid transaction data');
      }

      if (parseInt(swapTx.data.tx.gas) < 21000) {
        validationErrors.push('Gas limit too low');
      }

      // Validate transaction value matches user input
      const expectedValue = quote.fromAmount; // This should be the user's input amount
      const actualValue = swapTx.data.tx.value;

      console.log('🔍 Transaction validation details:', {
        userInput: quote.fromAmount,
        userInputETH: parseFloat(quote.fromAmount) / Math.pow(10, 18),
        apiResponseValue: actualValue,
        apiResponseValueETH: parseFloat(actualValue) / Math.pow(10, 18),
        difference: Math.abs(
          parseFloat(expectedValue) - parseFloat(actualValue)
        ),
        differenceETH:
          Math.abs(parseFloat(expectedValue) - parseFloat(actualValue)) /
          Math.pow(10, 18),
        chainId: chainId,
      });

      // 針對小額交易的改進驗證
      const expectedValueNum = parseFloat(expectedValue);
      const actualValueNum = parseFloat(actualValue);
      const expectedValueETH = expectedValueNum / Math.pow(10, 18);
      const actualValueETH = actualValueNum / Math.pow(10, 18);

      // 對於小額交易（< 0.01 ETH），使用絕對值差異
      const isSmallAmount = expectedValueETH < 0.01;

      if (isSmallAmount) {
        const absoluteDifference = Math.abs(actualValueNum - expectedValueNum);
        const absoluteDifferenceETH = absoluteDifference / Math.pow(10, 18);

        // 允許0.001 ETH的絕對差異
        if (absoluteDifferenceETH > 0.001) {
          console.warn('⚠️ Small amount validation failed:', {
            expected: expectedValueETH,
            actual: actualValueETH,
            difference: absoluteDifferenceETH,
          });
          validationErrors.push(
            `Transaction value mismatch for small amount: expected ${expectedValueETH.toFixed(6)} ETH, got ${actualValueETH.toFixed(6)} ETH`
          );
        } else {
          console.log('✅ Small amount validation passed');
        }
      } else {
        // 對於大額交易，使用百分比差異
        const valueDifference =
          Math.abs(actualValueNum - expectedValueNum) / expectedValueNum;

        if (valueDifference > 0.1) {
          // 10% tolerance
          console.error('🚨 CRITICAL: Transaction value mismatch detected!');
          console.error(
            `Expected: ${expectedValue} (${expectedValueETH.toFixed(6)} ETH)`
          );
          console.error(
            `Actual: ${actualValue} (${actualValueETH.toFixed(6)} ETH)`
          );
          console.error(`Difference: ${(valueDifference * 100).toFixed(2)}%`);
          validationErrors.push(
            `Transaction value mismatch: expected ${expectedValue}, got ${actualValue}`
          );
        } else {
          console.log('✅ Large amount validation passed');
        }
      }

      // Gas price validation - more lenient for L2 networks
      const gasPrice = parseInt(swapTx.data.tx.gasPrice);
      const gasPriceGwei = gasPrice / 1000000000;

      // Different validation for L1 vs L2 networks
      if (chainId === 42161) {
        // Arbitrum
        if (gasPrice < 10000000) {
          // 0.01 gwei minimum for Arbitrum
          validationErrors.push('Gas price too low for Arbitrum');
        } else if (gasPriceGwei > 1) {
          // 1 gwei maximum for Arbitrum
          validationErrors.push('Gas price too high for Arbitrum');
        }
      } else if (chainId === 10) {
        // Optimism
        if (gasPrice < 10000000) {
          // 0.01 gwei minimum for Optimism
          validationErrors.push('Gas price too low for Optimism');
        } else if (gasPriceGwei > 1) {
          // 1 gwei maximum for Optimism
          validationErrors.push('Gas price too high for Optimism');
        }
      } else {
        // L1 networks (Ethereum, etc.)
        if (gasPrice < 100000000) {
          // 0.1 gwei minimum for L1 (more lenient)
          validationErrors.push('Gas price too low for L1 network');
        } else if (gasPriceGwei > 200) {
          // 200 gwei maximum for L1 (more lenient)
          validationErrors.push('Gas price too high for L1 network');
        }
      }

      console.log(
        `Gas price validation for chain ${chainId}: ${gasPriceGwei.toFixed(6)} gwei`
      );

      if (validationErrors.length > 0) {
        throw new Error(
          `Transaction validation failed: ${validationErrors.join(', ')}`
        );
      }

      console.log('✅ Transaction parameters validated');

      // Step 4.6: Check wallet balance
      console.log('💰 Checking wallet balance...');
      const balance = await window.ethereum.request({
        method: 'eth_getBalance',
        params: [wallet.address, 'latest'],
      });

      const balanceWei = parseInt(balance, 16);
      const requiredWei =
        parseInt(swapTx.data.tx.value) +
        parseInt(swapTx.data.tx.gas) * parseInt(swapTx.data.tx.gasPrice);

      console.log('Balance check:', {
        balanceWei: balanceWei.toString(),
        requiredWei: requiredWei.toString(),
        balanceETH: balanceWei / Math.pow(10, 18),
        requiredETH: requiredWei / Math.pow(10, 18),
        hasEnoughFunds: balanceWei >= requiredWei,
      });

      if (balanceWei < requiredWei) {
        throw new Error(
          `Insufficient funds: need ${requiredWei / Math.pow(10, 18).toFixed(6)} ETH, have ${balanceWei / Math.pow(10, 18).toFixed(6)} ETH`
        );
      }

      // Step 5: Execute the swap transaction with retry mechanism
      console.log('🔄 Executing swap transaction...');
      let txHash: string;
      let retryCount = 0;
      const maxRetries = 3;

      while (retryCount < maxRetries) {
        try {
          txHash = await this.sendTransaction({
            to: swapTx.data.tx.to,
            data: swapTx.data.tx.data,
            value: swapTx.data.tx.value,
            gas: swapTx.data.tx.gas.toString(),
            gasPrice: swapTx.data.tx.gasPrice, // Include gas price from 1inch API
            chainId: chainId, // Include chain ID for gas parameter selection
          });
          console.log('✅ Swap transaction sent successfully:', txHash);
          break;
        } catch (error) {
          retryCount++;
          console.error(
            `❌ Swap transaction attempt ${retryCount} failed:`,
            error
          );

          if (retryCount >= maxRetries) {
            throw new Error(
              `Swap transaction failed after ${maxRetries} attempts: ${error instanceof Error ? error.message : 'Unknown error'}`
            );
          }

          // Wait before retry with exponential backoff
          const waitTime = Math.min(2000 * Math.pow(2, retryCount - 1), 10000);
          console.log(`⏳ Waiting ${waitTime}ms before retry...`);
          await new Promise((resolve) => setTimeout(resolve, waitTime));
          console.log(
            `🔄 Retrying swap transaction (attempt ${retryCount + 1}/${maxRetries})...`
          );
        }
      }

      // Step 6: Create transaction record
      const swapTransaction: SwapTransaction = {
        id: txHash!,
        status: TransactionStatus.PENDING,
        txHash: txHash!,
        timestamp: new Date(),
        fromToken: quote.fromToken,
        toToken: quote.toToken,
        fromAmount: quote.fromAmount,
        toAmount: quote.toAmount,
        slippage: quote.slippage,
        priceImpact: this.calculatePriceImpact(quote),
        gasUsed: swapTx.data.tx.gas.toString(),
        gasPrice: swapTx.data.tx.gasPrice,
        protocols: freshQuote.protocols || [],
        estimatedGas: freshQuote.estimatedGas || swapTx.data.tx.gas,
      };

      console.log('📊 Swap transaction created:', {
        id: swapTransaction.id,
        status: swapTransaction.status,
        gasUsed: swapTransaction.gasUsed,
        priceImpact: swapTransaction.priceImpact,
      });

      return swapTransaction;
    } catch (error) {
      console.error('❌ Swap execution failed:', error);

      // Enhanced error handling with more specific messages
      let errorMessage = 'Failed to execute swap';
      if (error instanceof Error) {
        if (
          error.message.includes('insufficient funds') ||
          error.message.includes('Insufficient funds')
        ) {
          errorMessage = 'Insufficient funds for swap';
        } else if (
          error.message.includes('user rejected') ||
          error.message.includes('User rejected')
        ) {
          errorMessage = 'Transaction was rejected by user';
        } else if (error.message.includes('Quote has changed')) {
          errorMessage = 'Quote has changed. Please try again.';
        } else if (error.message.includes('gas')) {
          errorMessage = 'Gas estimation failed. Please try again.';
        } else if (
          error.message.includes('Transaction validation failed') ||
          error.message.includes('Transaction value mismatch')
        ) {
          errorMessage = error.message;
        } else if (error.message.includes('Gas price too low')) {
          errorMessage = 'Network congestion detected. Please try again.';
        } else if (error.message.includes('Gas limit too low')) {
          errorMessage =
            'Transaction complexity requires higher gas limit. Please try again.';
        } else if (error.message.includes('nonce')) {
          errorMessage = 'Transaction nonce error. Please try again.';
        } else {
          errorMessage = error.message;
        }
      }

      throw new Error(errorMessage);
    }
  }

  /**
   * Calculate price impact percentage
   */
  private calculatePriceImpact(quote: SwapQuote): number {
    try {
      // This is a simplified calculation
      // In a real implementation, you'd compare against a reference price
      const fromAmount = parseFloat(quote.fromAmount);
      const toAmount = parseFloat(quote.toAmount);

      if (fromAmount === 0) return 0;

      // Calculate a rough price impact based on the quote
      // This is a placeholder - real implementation would use market data
      return Math.abs((toAmount / fromAmount - 1) * 100);
    } catch (error) {
      console.warn('Failed to calculate price impact:', error);
      return 0;
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
