'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useWallet } from '@/providers/WalletProvider';
import useSwapStore from '@/stores/swapStore';
import { oneInchBalanceService } from '@/services/oneinchBalanceService';
import { ChainService, SUPPORTED_CHAINS } from '@/services/chainService';
import WalletDebugInfo from '@/components/WalletDebugInfo';
import type { ConnectedWallet } from '@/providers/WalletProvider';
import type { Token } from '@/types';
import {
  ArrowsRightLeftIcon,
  Cog6ToothIcon,
  InformationCircleIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';

// For debugging - now using internal API routes

export default function Swap() {
  const { connectedWallets } = useWallet();
  const { getQuote, executeSwap, quote, isLoadingQuote, quoteError } =
    useSwapStore();

  // State
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [slippage, setSlippage] = useState('0.5');
  const [showSettings, setShowSettings] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<ConnectedWallet | null>(
    null
  );
  const [selectedChainId, setSelectedChainId] = useState<number | null>(null);
  const [availableTokens, setAvailableTokens] = useState<Token[]>([]);
  const [balances, setBalances] = useState<Record<string, string>>({});
  const [isLoadingBalances, setIsLoadingBalances] = useState(false);
  const [isSwitchingChain, setIsSwitchingChain] = useState(false);

  // Token selection
  const [fromToken, setFromToken] = useState<Token | null>(null);
  const [toToken, setToToken] = useState<Token | null>(null);

  // Initialize selected wallet and chain
  useEffect(() => {
    if (connectedWallets.length > 0 && !selectedWallet) {
      const ethereumWallet = connectedWallets.find(
        (w) => w.type === 'ethereum'
      );
      if (ethereumWallet) {
        setSelectedWallet(ethereumWallet);
        setSelectedChainId(ethereumWallet.chainId || 1);
      }
    }
  }, [connectedWallets, selectedWallet]);

  // Load tokens when wallet or chain changes
  useEffect(() => {
    if (selectedWallet && selectedChainId) {
      loadTokensForChain();
    }
  }, [selectedWallet, selectedChainId]);

  // Load balances when wallet or tokens change
  useEffect(() => {
    if (selectedWallet && availableTokens.length > 0) {
      loadWalletBalances();
    }
  }, [selectedWallet, availableTokens]);

  // Auto-fetch quote when amount changes
  useEffect(() => {
    const fetchQuoteWithDelay = setTimeout(() => {
      if (
        fromAmount &&
        parseFloat(fromAmount) > 0 &&
        fromToken &&
        toToken &&
        selectedWallet &&
        selectedChainId
      ) {
        console.log(
          '🔄 Auto-fetching quote for',
          fromAmount,
          fromToken.symbol,
          '→',
          toToken.symbol
        );
        handleGetQuote();
      }
    }, 1000); // 1 second debounce

    return () => clearTimeout(fetchQuoteWithDelay);
  }, [fromAmount, fromToken, toToken, selectedWallet, selectedChainId]);

  const handleGetQuote = async () => {
    if (
      !fromAmount ||
      !fromToken ||
      !toToken ||
      !selectedWallet ||
      !selectedChainId
    ) {
      return;
    }

    try {
      const chainId = selectedChainId;

      // Convert amount to wei (multiply by 10^decimals)
      const amountInWei = (
        parseFloat(fromAmount) * Math.pow(10, fromToken.decimals)
      ).toString();

      console.log(
        `💱 Getting quote: ${fromAmount} ${fromToken.symbol} (${amountInWei} wei) → ${toToken.symbol}`
      );

      await getQuote({
        fromToken: {
          address: fromToken.address,
          symbol: fromToken.symbol,
          name: fromToken.name,
          decimals: fromToken.decimals,
          chainId: chainId.toString(),
        },
        toToken: {
          address: toToken.address,
          symbol: toToken.symbol,
          name: toToken.name,
          decimals: toToken.decimals,
          chainId: chainId.toString(),
        },
        amount: amountInWei,
        slippage: parseFloat(slippage),
        fromAddress: selectedWallet.address,
      });
    } catch (error) {
      console.error('❌ Error getting quote:', error);
    }
  };

  // Update toAmount when quote changes
  useEffect(() => {
    if (quote && quote.toAmount) {
      const toAmountDecimal =
        parseFloat(quote.toAmount) / Math.pow(10, toToken?.decimals || 18);
      setToAmount(toAmountDecimal.toFixed(6));
      console.log(
        `✅ Quote received: ${fromAmount} ${fromToken?.symbol} → ${toAmountDecimal.toFixed(6)} ${toToken?.symbol}`
      );
    }
  }, [quote, toToken]);

  const loadTokensForChain = async () => {
    if (
      !selectedWallet ||
      !selectedChainId ||
      selectedWallet.type !== 'ethereum'
    )
      return;

    try {
      const tokens = oneInchBalanceService.getPopularTokens(selectedChainId);
      setAvailableTokens(tokens);

      // Reset tokens when chain changes
      const ethToken = tokens.find((t) => t.symbol === 'ETH');
      const usdcToken = tokens.find((t) => t.symbol === 'USDC');

      setFromToken(ethToken || null);
      setToToken(usdcToken || null);

      // Clear amounts when switching chains
      setFromAmount('');
      setToAmount('');
    } catch (error) {
      console.error('Error loading tokens:', error);
    }
  };

  const loadWalletBalances = async () => {
    if (!selectedWallet) return;

    setIsLoadingBalances(true);
    console.log(
      '🔄 Loading balances for wallet:',
      selectedWallet.address,
      'on chain:',
      selectedChainId
    );

    try {
      // First try the 1inch Balance API
      const walletBalances =
        await oneInchBalanceService.getWalletBalances(selectedWallet);
      console.log('💰 1inch Balance API response:', walletBalances);

      // If 1inch API returns empty balances, try native balance checking
      if (Object.keys(walletBalances).length === 0) {
        console.log(
          '⚠️ 1inch Balance API returned empty, trying native balance...'
        );
        const nativeBalances = await getNativeBalances();
        setBalances(nativeBalances);
      } else {
        setBalances(walletBalances);
      }
    } catch (error) {
      console.error('❌ Error loading balances:', error);

      // Fallback to native balance checking
      try {
        console.log('🔄 Trying fallback native balance...');
        const nativeBalances = await getNativeBalances();
        setBalances(nativeBalances);
      } catch (fallbackError) {
        console.error('❌ Fallback balance loading failed:', fallbackError);
        // Set empty balances to avoid infinite loading
        setBalances({});
      }
    } finally {
      setIsLoadingBalances(false);
    }
  };

  const getNativeBalances = async (): Promise<Record<string, string>> => {
    if (!selectedWallet || !window.ethereum) {
      return {};
    }

    try {
      const balances: Record<string, string> = {};

      // Get ETH balance
      const ethBalance = await window.ethereum.request({
        method: 'eth_getBalance',
        params: [selectedWallet.address, 'latest'],
      });

      if (ethBalance) {
        const ethBalanceDecimal = parseInt(ethBalance, 16) / Math.pow(10, 18);
        balances.ETH = ethBalanceDecimal.toFixed(6);
        console.log('💎 ETH Balance:', balances.ETH);
      }

      // Get ERC-20 token balances for popular tokens
      for (const token of availableTokens) {
        if (
          token.symbol !== 'ETH' &&
          token.address !== '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'
        ) {
          try {
            const tokenBalance = await getERC20Balance(
              token.address,
              selectedWallet.address,
              token.decimals
            );
            if (tokenBalance && parseFloat(tokenBalance) > 0) {
              balances[token.symbol] = tokenBalance;
              console.log(`💰 ${token.symbol} Balance:`, tokenBalance);
            }
          } catch (tokenError) {
            console.warn(
              `⚠️ Failed to get ${token.symbol} balance:`,
              tokenError
            );
          }
        }
      }

      return balances;
    } catch (error) {
      console.error('Error getting native balances:', error);
      return {};
    }
  };

  const getERC20Balance = async (
    tokenAddress: string,
    walletAddress: string,
    decimals: number
  ): Promise<string> => {
    if (!window.ethereum) throw new Error('No ethereum provider');

    // ERC-20 balanceOf method signature
    const methodId = '0x70a08231'; // balanceOf(address)
    const paddedAddress = walletAddress.slice(2).padStart(64, '0');
    const data = methodId + paddedAddress;

    try {
      const result = await window.ethereum.request({
        method: 'eth_call',
        params: [
          {
            to: tokenAddress,
            data: data,
          },
          'latest',
        ],
      });

      if (result && result !== '0x') {
        const balance = parseInt(result, 16);
        const balanceDecimal = balance / Math.pow(10, decimals);
        return balanceDecimal.toFixed(6);
      }

      return '0.000000';
    } catch (error) {
      console.error('Error calling ERC-20 balanceOf:', error);
      return '0.000000';
    }
  };

  const getChainName = () => {
    if (!selectedChainId) return 'Unknown';
    return ChainService.getChainName(selectedChainId);
  };

  const handleWalletChange = (walletAddress: string) => {
    const wallet = ethereumWallets.find((w) => w.address === walletAddress);
    if (wallet) {
      setSelectedWallet(wallet);
      setSelectedChainId(wallet.chainId || 1);
    }
  };

  const handleChainSwitch = async (chainId: number) => {
    if (!selectedWallet) return;

    setIsSwitchingChain(true);
    try {
      const success = await ChainService.switchChain(chainId);
      if (success) {
        setSelectedChainId(chainId);
        // Note: The wallet will update automatically via Privy when the chain switches
      } else {
        alert(
          'Failed to switch chain. Please try manually switching in your wallet.'
        );
      }
    } catch (error) {
      console.error('Error switching chain:', error);
      alert(
        'Failed to switch chain. Please try manually switching in your wallet.'
      );
    } finally {
      setIsSwitchingChain(false);
    }
  };

  const getTokenBalance = (token: Token | null): string => {
    if (!token || isLoadingBalances) return '...';
    return balances[token.symbol] || '0.0';
  };

  const handleSwapTokens = () => {
    if (!fromToken || !toToken) return;

    const tempToken = fromToken;
    setFromToken(toToken);
    setToToken(tempToken);
    setFromAmount(toAmount);
    setToAmount(fromAmount);
  };

  const handleSwap = async () => {
    try {
      if (
        !fromAmount ||
        !fromToken ||
        !toToken ||
        !selectedWallet ||
        !selectedChainId
      ) {
        alert(
          'Please fill in all fields, select a wallet, and choose a network'
        );
        return;
      }

      // Make sure we have a current quote
      if (!quote) {
        console.log('🔄 No quote available, fetching one...');
        await handleGetQuote();
        // Wait a moment for quote to be processed
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      if (!quote) {
        alert('Unable to get a quote for this swap. Please try again.');
        return;
      }

      console.log('🚀 Executing swap with quote:', quote);

      // Execute swap
      await executeSwap();

      // Reload balances after swap
      loadWalletBalances();
    } catch (error) {
      console.error('Swap failed:', error);
      alert('Swap failed. Please try again.');
    }
  };

  // Show connection prompt if no wallets
  if (connectedWallets.length === 0) {
    return (
      <DashboardLayout>
        <div className='max-w-md mx-auto text-center py-12'>
          <h1 className='text-2xl font-bold text-gray-900 mb-4'>
            Connect Wallet
          </h1>
          <p className='text-gray-600 mb-6'>
            Please connect an Ethereum wallet to start swapping tokens.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  // Show Ethereum wallet required if only Sui wallets
  const ethereumWallets = connectedWallets.filter((w) => w.type === 'ethereum');
  if (ethereumWallets.length === 0) {
    return (
      <DashboardLayout>
        <div className='max-w-md mx-auto text-center py-12'>
          <h1 className='text-2xl font-bold text-gray-900 mb-4'>
            Ethereum Wallet Required
          </h1>
          <p className='text-gray-600 mb-6'>
            Token swapping requires an Ethereum-compatible wallet. Please
            connect an Ethereum wallet to continue.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Debug Info - Remove this after fixing */}
      <WalletDebugInfo />

      {/* Debug Information - Only show in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className='mb-4 p-3 bg-gray-100 border border-gray-300 rounded-lg text-xs'>
          <div className='font-semibold mb-2'>🔧 Debug Info:</div>
          <div>Selected Wallet: {selectedWallet?.address}</div>
          <div>
            Selected Chain: {selectedChainId} ({getChainName()})
          </div>
          <div>Available Tokens: {availableTokens.length}</div>
          <div>Loaded Balances: {Object.keys(balances).length}</div>
          <div>API Routes: ✅ Using internal proxy</div>
          <div>Loading Balances: {isLoadingBalances ? 'Yes' : 'No'}</div>
          {Object.keys(balances).length > 0 && (
            <div className='mt-1'>
              Balances: {JSON.stringify(balances, null, 2)}
            </div>
          )}
        </div>
      )}

      <div className='max-w-md mx-auto space-y-6'>
        {/* Header */}
        <div className='text-center'>
          <h1 className='text-2xl font-bold text-gray-900 mb-2'>Swap Tokens</h1>
          <p className='text-gray-600'>
            Exchange tokens at the best rates using 1inch aggregator
          </p>
        </div>

        {/* Wallet & Chain Selection */}
        <div className='bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-4'>
          {/* Current Selection Display */}
          <div className='flex items-center justify-between'>
            <div>
              <div className='text-sm font-medium text-blue-900'>
                Selected Wallet
              </div>
              <div className='text-xs text-blue-600'>
                {selectedWallet?.address.slice(0, 6)}...
                {selectedWallet?.address.slice(-4)}
              </div>
            </div>
            <div className='text-right'>
              <div className='text-sm font-medium text-blue-900'>
                Network: {getChainName()}
              </div>
              <div className='text-xs text-blue-600'>
                Chain ID: {selectedChainId || 'Unknown'}
              </div>
            </div>
          </div>

          {/* Wallet Selection */}
          {ethereumWallets.length > 1 && (
            <div>
              <label className='text-xs font-medium text-blue-800 mb-1 block'>
                Select Wallet:
              </label>
              <select
                value={selectedWallet?.address || ''}
                onChange={(e) => handleWalletChange(e.target.value)}
                className='w-full text-sm border border-blue-300 rounded px-2 py-1 bg-white'
              >
                {ethereumWallets.map((wallet) => (
                  <option key={wallet.address} value={wallet.address}>
                    {ChainService.formatWalletDisplay(wallet)}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Chain Selection */}
          <div>
            <label className='text-xs font-medium text-blue-800 mb-1 block'>
              Select Network:
            </label>
            <div className='grid grid-cols-2 gap-2'>
              {SUPPORTED_CHAINS.slice(0, 6).map((chain) => {
                const isSelected = selectedChainId === chain.id;
                const networkStatus = ChainService.getNetworkStatus(chain.id);

                return (
                  <button
                    key={chain.id}
                    onClick={() => handleChainSwitch(chain.id)}
                    disabled={isSwitchingChain}
                    className={`text-xs p-2 rounded border transition-colors ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-blue-900 border-blue-300 hover:bg-blue-100'
                    } ${isSwitchingChain ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className='flex items-center justify-between'>
                      <span className='font-medium'>{chain.shortName}</span>
                      <span
                        className={`w-2 h-2 rounded-full ${
                          networkStatus.color === 'green'
                            ? 'bg-green-400'
                            : networkStatus.color === 'yellow'
                              ? 'bg-yellow-400'
                              : 'bg-gray-400'
                        }`}
                      />
                    </div>
                    <div className='text-left'>
                      <div className='opacity-75'>{networkStatus.label}</div>
                    </div>
                  </button>
                );
              })}
            </div>

            {isSwitchingChain && (
              <div className='mt-2 text-xs text-blue-700'>
                🔄 Switching network... Please approve in your wallet
              </div>
            )}
          </div>
        </div>

        {/* Swap Interface */}
        <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-6'>
          <div className='flex items-center justify-between mb-6'>
            <h2 className='text-lg font-semibold text-gray-900'>Swap Tokens</h2>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className='p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100'
            >
              <Cog6ToothIcon className='w-5 h-5' />
            </button>
          </div>

          {/* Settings Panel */}
          {showSettings && (
            <div className='mb-6 p-4 bg-gray-50 rounded-lg'>
              <div className='flex items-center justify-between'>
                <label className='text-sm font-medium text-gray-700'>
                  Slippage Tolerance
                </label>
                <div className='flex items-center space-x-2'>
                  <input
                    type='number'
                    value={slippage}
                    onChange={(e) => setSlippage(e.target.value)}
                    className='w-16 px-2 py-1 text-sm border border-gray-300 rounded'
                    step='0.1'
                    min='0.1'
                    max='50'
                  />
                  <span className='text-sm text-gray-500'>%</span>
                </div>
              </div>
            </div>
          )}

          {/* From Token */}
          <div className='mb-2'>
            <div className='flex items-center justify-between mb-2'>
              <label className='text-sm font-medium text-gray-600'>From</label>
              <div className='flex items-center space-x-2'>
                <span className='text-sm text-gray-500'>
                  Balance: {getTokenBalance(fromToken)}{' '}
                  {fromToken?.symbol || ''}
                </span>
                <button
                  onClick={loadWalletBalances}
                  disabled={isLoadingBalances}
                  className='text-xs text-blue-600 hover:text-blue-800 disabled:text-gray-400'
                  title='Refresh balances'
                >
                  {isLoadingBalances ? '🔄' : '↻'}
                </button>
              </div>
            </div>
            <div className='relative'>
              <input
                type='text'
                value={fromAmount}
                onChange={(e) => setFromAmount(e.target.value)}
                placeholder='0.0'
                className='w-full text-2xl font-semibold bg-gray-50 border border-gray-200 rounded-xl p-4 pr-32 focus:ring-2 focus:ring-primary-500 focus:border-transparent'
              />
              <button className='absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-2 bg-white border border-gray-200 rounded-lg px-3 py-2 hover:bg-gray-50'>
                <span className='text-lg'>🔷</span>
                <span className='font-semibold'>
                  {fromToken?.symbol || 'Select'}
                </span>
                <ChevronDownIcon className='w-4 h-4 text-gray-400' />
              </button>
            </div>
          </div>

          {/* Quote Information */}
          {(isLoadingQuote || quote) && (
            <div className='my-4 p-3 bg-blue-50 border border-blue-200 rounded-lg'>
              {isLoadingQuote ? (
                <div className='flex items-center justify-center space-x-2 text-blue-600'>
                  <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600'></div>
                  <span className='text-sm'>Getting best price...</span>
                </div>
              ) : quote ? (
                <div className='space-y-1 text-sm'>
                  <div className='flex justify-between items-center'>
                    <span className='text-gray-600'>Rate:</span>
                    <span className='font-semibold'>
                      1 {fromToken?.symbol} ={' '}
                      {quote.toAmount && fromAmount
                        ? (
                            parseFloat(quote.toAmount) /
                            Math.pow(10, toToken?.decimals || 18) /
                            parseFloat(fromAmount)
                          ).toFixed(6)
                        : '...'}{' '}
                      {toToken?.symbol}
                    </span>
                  </div>
                  <div className='flex justify-between items-center'>
                    <span className='text-gray-600'>Gas estimate:</span>
                    <span>{quote.gasEstimate} gas</span>
                  </div>
                  <div className='flex justify-between items-center'>
                    <span className='text-gray-600'>Slippage:</span>
                    <span>{quote.slippage}%</span>
                  </div>
                </div>
              ) : null}
            </div>
          )}

          {/* Swap Button */}
          <div className='flex justify-center my-4'>
            <button
              onClick={handleSwapTokens}
              className='p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors'
            >
              <ArrowsRightLeftIcon className='w-5 h-5 text-gray-600 transform rotate-90' />
            </button>
          </div>

          {/* To Token */}
          <div className='mb-6'>
            <div className='flex items-center justify-between mb-2'>
              <label className='text-sm font-medium text-gray-600'>To</label>
              <span className='text-sm text-gray-500'>
                Balance: {getTokenBalance(toToken)} {toToken?.symbol || ''}
              </span>
            </div>
            <div className='relative'>
              <input
                type='text'
                value={toAmount}
                onChange={(e) => setToAmount(e.target.value)}
                placeholder={isLoadingQuote ? 'Getting quote...' : '0.0'}
                className='w-full text-2xl font-semibold bg-gray-50 border border-gray-200 rounded-xl p-4 pr-32 cursor-not-allowed'
                readOnly
              />
              <button className='absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-2 bg-white border border-gray-200 rounded-lg px-3 py-2 hover:bg-gray-50'>
                <span className='text-lg'>💰</span>
                <span className='font-semibold'>
                  {toToken?.symbol || 'Select'}
                </span>
                <ChevronDownIcon className='w-4 h-4 text-gray-400' />
              </button>
            </div>
          </div>

          {/* Quote Information */}
          {quote && (
            <div className='mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg'>
              <div className='text-sm space-y-2'>
                <div className='flex justify-between'>
                  <span>Expected Output:</span>
                  <span className='font-medium'>
                    {quote.toAmount} {quote.toToken.symbol}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span>Price Impact:</span>
                  <span className='font-medium'>{quote.priceImpact}%</span>
                </div>
                <div className='flex justify-between'>
                  <span>Minimum Received:</span>
                  <span className='font-medium'>
                    {quote.minimumReceived} {quote.toToken.symbol}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Error Display */}
          {quoteError && (
            <div className='mb-6 p-4 bg-red-50 border border-red-200 rounded-lg'>
              <div className='flex items-center space-x-2 text-red-700'>
                <InformationCircleIcon className='w-5 h-5' />
                <span className='text-sm'>
                  {typeof quoteError === 'string'
                    ? quoteError
                    : quoteError.message}
                </span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className='space-y-3'>
            <button
              onClick={handleSwap}
              disabled={!fromAmount || !fromToken || !toToken || isLoadingQuote}
              className='w-full py-4 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
            >
              {isLoadingQuote ? 'Getting Quote...' : 'Swap Tokens'}
            </button>
          </div>

          {/* 1inch Info */}
          <div className='mt-4 p-3 bg-gray-50 rounded-lg'>
            <div className='flex items-center space-x-2 text-gray-600 text-sm'>
              <InformationCircleIcon className='w-4 h-4' />
              <span>
                This swap will be executed using 1inch aggregator to find the
                best rates across multiple DEXs.
              </span>
            </div>
          </div>
        </div>

        {/* Recent Swaps */}
        <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-6'>
          <h3 className='text-lg font-semibold text-gray-900 mb-4'>
            Recent Swaps
          </h3>
          <div className='text-center py-8 text-gray-500'>
            <ArrowsRightLeftIcon className='w-12 h-12 mx-auto mb-3 text-gray-300' />
            <p>No swap history</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
