'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useWallet } from '@/providers/WalletProvider';
import {
  LinkIcon,
  ArrowsRightLeftIcon,
  InformationCircleIcon,
  ChevronDownIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

export default function Bridge() {
  const { connectedWallets } = useWallet();
  const [amount, setAmount] = useState('');
  const [sourceChain, setSourceChain] = useState('ethereum');
  const [destinationChain, setDestinationChain] = useState('polygon');

  const chains = [
    { id: 'ethereum', name: 'Ethereum', logo: '🔷' },
    { id: 'polygon', name: 'Polygon', logo: '🟣' },
    { id: 'sui', name: 'Sui', logo: '🔵' },
  ];

  const handleBridge = () => {
    console.log('Bridge initiated');
  };

  const swapChains = () => {
    const temp = sourceChain;
    setSourceChain(destinationChain);
    setDestinationChain(temp);
  };

  return (
    <DashboardLayout>
      <div className='max-w-md mx-auto space-y-6'>
        {/* Bridge Card */}
        <div className='bg-white rounded-2xl shadow-soft p-6 border border-gray-100'>
          <div className='mb-6'>
            <h2 className='text-xl font-bold text-gray-900 mb-2'>
              Cross-Chain Bridge
            </h2>
            <p className='text-gray-600 text-sm'>
              Transfer assets across different blockchains
            </p>
          </div>

          {/* Source Chain */}
          <div className='mb-2'>
            <label className='text-sm font-medium text-gray-600 mb-2 block'>
              From
            </label>
            <div className='relative mb-4'>
              <select
                value={sourceChain}
                onChange={(e) => setSourceChain(e.target.value)}
                className='w-full appearance-none bg-gray-50 border border-gray-200 rounded-xl p-4 pr-10 focus:ring-2 focus:ring-primary-500 focus:border-transparent'
              >
                {chains.map((chain) => (
                  <option key={chain.id} value={chain.id}>
                    {chain.name}
                  </option>
                ))}
              </select>
              <ChevronDownIcon className='absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none' />
            </div>

            <div className='relative'>
              <input
                type='text'
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder='0.0'
                className='w-full text-2xl font-semibold bg-gray-50 border border-gray-200 rounded-xl p-4 focus:ring-2 focus:ring-primary-500 focus:border-transparent'
              />
              <div className='absolute right-4 top-1/2 transform -translate-y-1/2 text-sm text-gray-500'>
                Balance: 0.00 ETH
              </div>
            </div>
          </div>

          {/* Swap Button */}
          <div className='flex justify-center my-4'>
            <button
              onClick={swapChains}
              className='p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors'
            >
              <ArrowsRightLeftIcon className='w-5 h-5 text-gray-600 transform rotate-90' />
            </button>
          </div>

          {/* Destination Chain */}
          <div className='mb-6'>
            <label className='text-sm font-medium text-gray-600 mb-2 block'>
              To
            </label>
            <div className='relative mb-4'>
              <select
                value={destinationChain}
                onChange={(e) => setDestinationChain(e.target.value)}
                className='w-full appearance-none bg-gray-50 border border-gray-200 rounded-xl p-4 pr-10 focus:ring-2 focus:ring-primary-500 focus:border-transparent'
              >
                {chains
                  .filter((chain) => chain.id !== sourceChain)
                  .map((chain) => (
                    <option key={chain.id} value={chain.id}>
                      {chain.name}
                    </option>
                  ))}
              </select>
              <ChevronDownIcon className='absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none' />
            </div>

            <div className='relative'>
              <input
                type='text'
                value={amount}
                placeholder='0.0'
                className='w-full text-2xl font-semibold bg-gray-50 border border-gray-200 rounded-xl p-4 text-gray-500'
                readOnly
              />
              <div className='absolute right-4 top-1/2 transform -translate-y-1/2 text-sm text-gray-500'>
                You will receive
              </div>
            </div>
          </div>

          {/* Bridge Info */}
          {amount && (
            <div className='mb-6 p-4 bg-gray-50 rounded-lg space-y-2'>
              <div className='flex justify-between text-sm'>
                <span className='text-gray-600'>Estimated Time</span>
                <span className='font-medium'>~10-15 minutes</span>
              </div>
              <div className='flex justify-between text-sm'>
                <span className='text-gray-600'>Bridge Fee</span>
                <span className='font-medium'>~$5.00</span>
              </div>
              <div className='flex justify-between text-sm'>
                <span className='text-gray-600'>Network Fee</span>
                <span className='font-medium'>~$--</span>
              </div>
            </div>
          )}

          {/* Bridge Button */}
          <button
            onClick={handleBridge}
            disabled={!connectedWallets.length || !amount}
            className={`w-full py-4 rounded-xl font-semibold transition-colors ${
              !connectedWallets.length || !amount
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-primary-600 hover:bg-primary-700 text-white'
            }`}
          >
            {!connectedWallets.length
              ? 'Connect Wallet'
              : !amount
                ? 'Enter Amount'
                : 'Bridge Assets'}
          </button>

          {/* Info Note */}
          <div className='mt-4 flex items-start space-x-2 text-sm text-gray-500'>
            <InformationCircleIcon className='w-4 h-4 mt-0.5 flex-shrink-0' />
            <p>
              Cross-chain bridging may take 10-30 minutes depending on network
              congestion. Ensure you have enough gas fees on both chains.
            </p>
          </div>
        </div>

        {/* Bridge History */}
        <div className='bg-white rounded-xl shadow-soft p-6 border border-gray-100'>
          <h3 className='text-lg font-semibold text-gray-900 mb-4'>
            Recent Bridges
          </h3>
          <div className='text-center py-8'>
            <LinkIcon className='w-12 h-12 text-gray-300 mx-auto mb-4' />
            <p className='text-gray-500 mb-2'>No bridge history</p>
            <p className='text-sm text-gray-400'>
              Your completed bridges will appear here
            </p>
          </div>
        </div>

        {/* Supported Routes */}
        <div className='bg-white rounded-xl shadow-soft p-6 border border-gray-100'>
          <h3 className='text-lg font-semibold text-gray-900 mb-4'>
            Supported Routes
          </h3>
          <div className='space-y-3'>
            <div className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'>
              <div className='flex items-center space-x-3'>
                <span className='text-lg'>🔷</span>
                <ArrowsRightLeftIcon className='w-4 h-4 text-gray-400' />
                <span className='text-lg'>🟣</span>
              </div>
              <div className='text-sm font-medium'>Ethereum ↔ Polygon</div>
            </div>
            <div className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'>
              <div className='flex items-center space-x-3'>
                <span className='text-lg'>🔷</span>
                <ArrowsRightLeftIcon className='w-4 h-4 text-gray-400' />
                <span className='text-lg'>🔵</span>
              </div>
              <div className='text-sm font-medium'>Ethereum ↔ Sui</div>
            </div>
            <div className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'>
              <div className='flex items-center space-x-3'>
                <span className='text-lg'>🟣</span>
                <ArrowsRightLeftIcon className='w-4 h-4 text-gray-400' />
                <span className='text-lg'>🔵</span>
              </div>
              <div className='text-sm font-medium'>Polygon ↔ Sui</div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
