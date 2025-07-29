'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useWallet } from '@/providers/WalletProvider';
import {
  ArrowsRightLeftIcon,
  Cog6ToothIcon,
  InformationCircleIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';

export default function Swap() {
  const { connectedWallets } = useWallet();
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [slippage, setSlippage] = useState('0.5');
  const [showSettings, setShowSettings] = useState(false);

  // Mock token data
  const [fromToken, setFromToken] = useState({
    symbol: 'ETH',
    name: 'Ethereum',
    balance: '0.00',
    logo: '🔷',
  });

  const [toToken, setToToken] = useState({
    symbol: 'USDC',
    name: 'USD Coin',
    balance: '0.00',
    logo: '💰',
  });

  const handleSwapTokens = () => {
    const temp = fromToken;
    setFromToken(toToken);
    setToToken(temp);
    setFromAmount(toAmount);
    setToAmount(fromAmount);
  };

  const handleSwap = () => {
    // Swap logic will be implemented later
    console.log('Swap initiated');
  };

  return (
    <DashboardLayout>
      <div className='max-w-md mx-auto space-y-6'>
        {/* Swap Card */}
        <div className='bg-white rounded-2xl shadow-soft p-6 border border-gray-100'>
          {/* Header */}
          <div className='flex items-center justify-between mb-6'>
            <h2 className='text-xl font-bold text-gray-900'>Swap Tokens</h2>
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
              <div className='flex items-center justify-between mb-3'>
                <label className='text-sm font-medium text-gray-700'>
                  Slippage Tolerance
                </label>
                <div className='flex items-center space-x-2'>
                  <button
                    onClick={() => setSlippage('0.1')}
                    className={`px-2 py-1 text-xs rounded ${
                      slippage === '0.1'
                        ? 'bg-primary-100 text-primary-700'
                        : 'bg-white text-gray-600'
                    }`}
                  >
                    0.1%
                  </button>
                  <button
                    onClick={() => setSlippage('0.5')}
                    className={`px-2 py-1 text-xs rounded ${
                      slippage === '0.5'
                        ? 'bg-primary-100 text-primary-700'
                        : 'bg-white text-gray-600'
                    }`}
                  >
                    0.5%
                  </button>
                  <button
                    onClick={() => setSlippage('1.0')}
                    className={`px-2 py-1 text-xs rounded ${
                      slippage === '1.0'
                        ? 'bg-primary-100 text-primary-700'
                        : 'bg-white text-gray-600'
                    }`}
                  >
                    1.0%
                  </button>
                  <input
                    type='text'
                    value={slippage}
                    onChange={(e) => setSlippage(e.target.value)}
                    className='w-16 px-2 py-1 text-xs border border-gray-300 rounded text-center'
                    placeholder='Custom'
                  />
                </div>
              </div>
            </div>
          )}

          {/* From Token */}
          <div className='mb-2'>
            <div className='flex items-center justify-between mb-2'>
              <label className='text-sm font-medium text-gray-600'>From</label>
              <span className='text-sm text-gray-500'>
                Balance: {fromToken.balance} {fromToken.symbol}
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
                <span className='text-lg'>{fromToken.logo}</span>
                <span className='font-semibold'>{fromToken.symbol}</span>
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
                Balance: {toToken.balance} {toToken.symbol}
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
                <span className='text-lg'>{toToken.logo}</span>
                <span className='font-semibold'>{toToken.symbol}</span>
                <ChevronDownIcon className='w-4 h-4 text-gray-400' />
              </button>
            </div>
          </div>

          {/* Swap Info */}
          {fromAmount && toAmount && (
            <div className='mb-6 p-4 bg-gray-50 rounded-lg space-y-2'>
              <div className='flex justify-between text-sm'>
                <span className='text-gray-600'>Rate</span>
                <span className='font-medium'>
                  1 {fromToken.symbol} = -- {toToken.symbol}
                </span>
              </div>
              <div className='flex justify-between text-sm'>
                <span className='text-gray-600'>Price Impact</span>
                <span className='font-medium text-green-600'>{'<'} 0.01%</span>
              </div>
              <div className='flex justify-between text-sm'>
                <span className='text-gray-600'>Network Fee</span>
                <span className='font-medium'>~$--</span>
              </div>
            </div>
          )}

          {/* Swap Button */}
          <button
            onClick={handleSwap}
            disabled={!connectedWallets.length || !fromAmount}
            className={`w-full py-4 rounded-xl font-semibold transition-colors ${
              !connectedWallets.length || !fromAmount
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-primary-600 hover:bg-primary-700 text-white'
            }`}
          >
            {!connectedWallets.length
              ? 'Connect Wallet'
              : !fromAmount
                ? 'Enter Amount'
                : 'Swap Tokens'}
          </button>

          {/* Info Note */}
          <div className='mt-4 flex items-start space-x-2 text-sm text-gray-500'>
            <InformationCircleIcon className='w-4 h-4 mt-0.5 flex-shrink-0' />
            <p>
              This swap will be executed using 1inch aggregator to find the best
              rates across multiple DEXs.
            </p>
          </div>
        </div>

        {/* Transaction History */}
        <div className='bg-white rounded-xl shadow-soft p-6 border border-gray-100'>
          <h3 className='text-lg font-semibold text-gray-900 mb-4'>
            Recent Swaps
          </h3>
          <div className='text-center py-8'>
            <ArrowsRightLeftIcon className='w-12 h-12 text-gray-300 mx-auto mb-4' />
            <p className='text-gray-500 mb-2'>No swap history</p>
            <p className='text-sm text-gray-400'>
              Your completed swaps will appear here
            </p>
          </div>
        </div>

        {/* Supported Chains */}
        <div className='bg-white rounded-xl shadow-soft p-6 border border-gray-100'>
          <h3 className='text-lg font-semibold text-gray-900 mb-4'>
            Supported Chains
          </h3>
          <div className='grid grid-cols-3 gap-4'>
            <div className='text-center p-3 bg-gray-50 rounded-lg'>
              <div className='text-2xl mb-2'>🔷</div>
              <div className='text-sm font-medium'>Ethereum</div>
            </div>
            <div className='text-center p-3 bg-gray-50 rounded-lg'>
              <div className='text-2xl mb-2'>🟣</div>
              <div className='text-sm font-medium'>Polygon</div>
            </div>
            <div className='text-center p-3 bg-gray-50 rounded-lg'>
              <div className='text-2xl mb-2'>🔵</div>
              <div className='text-sm font-medium'>Sui</div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
