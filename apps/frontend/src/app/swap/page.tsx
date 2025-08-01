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

export default function Swap() {
  const { connectedWallets } = useWallet();
  const { getQuote, executeSwap, quote, isLoadingQuote, quoteError } = useSwapStore();
  
  // State
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [slippage, setSlippage] = useState('0.5');
  const [showSettings, setShowSettings] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<ConnectedWallet | null>(null);
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
      const ethereumWallet = connectedWallets.find(w => w.type === 'ethereum');
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

  const loadTokensForChain = async () => {
    if (!selectedWallet || !selectedChainId || selectedWallet.type !== 'ethereum') return;
    
    try {
      const tokens = oneInchBalanceService.getPopularTokens(selectedChainId);
      setAvailableTokens(tokens);
      
      // Reset tokens when chain changes
      const ethToken = tokens.find(t => t.symbol === 'ETH');
      const usdcToken = tokens.find(t => t.symbol === 'USDC');
      
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
    try {
      const walletBalances = await oneInchBalanceService.getWalletBalances(selectedWallet);
      setBalances(walletBalances);
    } catch (error) {
      console.error('Error loading balances:', error);
    } finally {
      setIsLoadingBalances(false);
    }
  };

  const getChainName = () => {
    if (!selectedChainId) return 'Unknown';
    return ChainService.getChainName(selectedChainId);
  };

  const handleWalletChange = (walletAddress: string) => {
    const wallet = ethereumWallets.find(w => w.address === walletAddress);
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
        alert('Failed to switch chain. Please try manually switching in your wallet.');
      }
    } catch (error) {
      console.error('Error switching chain:', error);
      alert('Failed to switch chain. Please try manually switching in your wallet.');
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
      if (!fromAmount || !fromToken || !toToken || !selectedWallet || !selectedChainId) {
        alert('Please fill in all fields, select a wallet, and choose a network');
        return;
      }

      const chainId = selectedChainId;

      // Get quote with correct chain-specific addresses
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
        amount: (parseFloat(fromAmount) * Math.pow(10, fromToken.decimals)).toString(),
        slippage: parseFloat(slippage),
        fromAddress: selectedWallet.address,
      });

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
          <h1 className='text-2xl font-bold text-gray-900 mb-4'>Connect Wallet</h1>
          <p className='text-gray-600 mb-6'>
            Please connect an Ethereum wallet to start swapping tokens.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  // Show Ethereum wallet required if only Sui wallets
  const ethereumWallets = connectedWallets.filter(w => w.type === 'ethereum');
  if (ethereumWallets.length === 0) {
    return (
      <DashboardLayout>
        <div className='max-w-md mx-auto text-center py-12'>
          <h1 className='text-2xl font-bold text-gray-900 mb-4'>Ethereum Wallet Required</h1>
          <p className='text-gray-600 mb-6'>
            Token swapping requires an Ethereum-compatible wallet. Please connect an Ethereum wallet to continue.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Debug Info - Remove this after fixing */}
      <WalletDebugInfo />
      
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
                {selectedWallet?.address.slice(0, 6)}...{selectedWallet?.address.slice(-4)}
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
              <span className='text-sm text-gray-500'>
                Balance: {getTokenBalance(fromToken)} {fromToken?.symbol || ''}
              </span>
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
                <span className='font-semibold'>{fromToken?.symbol || 'Select'}</span>
                <ChevronDownIcon className='w-4 h-4 text-gray-400' />
              </button>
            </div>
          </div>

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
                placeholder='0.0'
                className='w-full text-2xl font-semibold bg-gray-50 border border-gray-200 rounded-xl p-4 pr-32 focus:ring-2 focus:ring-primary-500 focus:border-transparent'
                readOnly
              />
              <button className='absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-2 bg-white border border-gray-200 rounded-lg px-3 py-2 hover:bg-gray-50'>
                <span className='text-lg'>💰</span>
                <span className='font-semibold'>{toToken?.symbol || 'Select'}</span>
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
                  <span className='font-medium'>{quote.toAmount} {quote.toToken.symbol}</span>
                </div>
                <div className='flex justify-between'>
                  <span>Price Impact:</span>
                  <span className='font-medium'>{quote.priceImpact}%</span>
                </div>
                <div className='flex justify-between'>
                  <span>Minimum Received:</span>
                  <span className='font-medium'>{quote.minimumReceived} {quote.toToken.symbol}</span>
                </div>
              </div>
            </div>
          )}

          {/* Error Display */}
          {quoteError && (
            <div className='mb-6 p-4 bg-red-50 border border-red-200 rounded-lg'>
              <div className='flex items-center space-x-2 text-red-700'>
                <InformationCircleIcon className='w-5 h-5' />
                <span className='text-sm'>{quoteError}</span>
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
                This swap will be executed using 1inch aggregator to find the best rates across multiple DEXs.
              </span>
            </div>
          </div>
        </div>

        {/* Recent Swaps */}
        <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-6'>
          <h3 className='text-lg font-semibold text-gray-900 mb-4'>Recent Swaps</h3>
          <div className='text-center py-8 text-gray-500'>
            <ArrowsRightLeftIcon className='w-12 h-12 mx-auto mb-3 text-gray-300' />
            <p>No swap history</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 