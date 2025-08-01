'use client';

import React from 'react';
import { useCurrentWalletChain, useChain } from '@/providers/ChainProvider';
import { ChainService } from '@/services/chainService';
import {
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';

/**
 * Network Status Banner Component
 * Displays current network status and related warnings/information
 */

export default function NetworkStatusBanner() {
  const { wallet, chain, canUse1inch, shouldShowTestnetWarning } =
    useCurrentWalletChain();
  const { switchToChain } = useChain();

  if (!wallet || !chain) {
    return null;
  }

  // Testnet warning
  if (shouldShowTestnetWarning) {
    return (
      <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6'>
        <div className='flex items-start'>
          <ExclamationTriangleIcon className='h-5 w-5 text-yellow-400 mt-0.5 mr-3 flex-shrink-0' />
          <div className='flex-1'>
            <h3 className='text-sm font-medium text-yellow-800'>
              Testnet Mode
            </h3>
            <div className='mt-2 text-sm text-yellow-700'>
              <p>
                You are currently connected to{' '}
                <strong>{chain.shortName}</strong> testnet. 1inch API does not
                support portfolio and trading features on testnets.
              </p>
              <div className='mt-3'>
                <p className='font-medium'>Recommended development strategy:</p>
                <ul className='mt-1 list-disc list-inside space-y-1'>
                  <li>
                    Use <strong>Polygon</strong> or <strong>BSC</strong> for
                    low-cost mainnet testing
                  </li>
                  <li>
                    Test wallet connection and network switching on testnets
                  </li>
                  <li>Switch to mainnet to access full DeFi features</li>
                </ul>
              </div>
            </div>

            {/* Quick switch to mainnet buttons */}
            <div className='mt-4 flex space-x-3'>
              <button
                onClick={() => switchToChain(1)}
                className='inline-flex items-center px-3 py-2 border border-yellow-300 shadow-sm text-sm leading-4 font-medium rounded-md text-yellow-700 bg-yellow-100 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-yellow-500'
              >
                Switch to Ethereum
                <ChevronRightIcon className='ml-1 h-3 w-3' />
              </button>
              <button
                onClick={() => switchToChain(137)}
                className='inline-flex items-center px-3 py-2 border border-yellow-300 shadow-sm text-sm leading-4 font-medium rounded-md text-yellow-700 bg-yellow-100 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-yellow-500'
              >
                Switch to Polygon
                <ChevronRightIcon className='ml-1 h-3 w-3' />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Unsupported network warning
  if (!canUse1inch && !shouldShowTestnetWarning) {
    return (
      <div className='bg-red-50 border border-red-200 rounded-lg p-4 mb-6'>
        <div className='flex items-start'>
          <ExclamationTriangleIcon className='h-5 w-5 text-red-400 mt-0.5 mr-3 flex-shrink-0' />
          <div className='flex-1'>
            <h3 className='text-sm font-medium text-red-800'>
              Unsupported Network
            </h3>
            <div className='mt-2 text-sm text-red-700'>
              <p>
                <strong>{chain.shortName}</strong> does not support 1inch API
                features. Please switch to a supported network to use full DeFi
                functionality.
              </p>
            </div>

            {/* Supported networks list */}
            <div className='mt-4 flex flex-wrap gap-2'>
              {ChainService.getMainnetChains().map((supportedChain) => (
                <button
                  key={supportedChain.id}
                  onClick={() => switchToChain(supportedChain.id)}
                  className='inline-flex items-center px-3 py-2 border border-red-300 shadow-sm text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500'
                >
                  Switch to {supportedChain.shortName}
                  <ChevronRightIcon className='ml-1 h-3 w-3' />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Normal mainnet connection - clean status display
  return (
    <div className='bg-green-50 border border-green-200 rounded-lg p-3 mb-4'>
      <div className='flex items-center'>
        <InformationCircleIcon className='h-4 w-4 text-green-400 mr-2 flex-shrink-0' />
        <div className='text-sm text-green-700'>
          <span className='font-medium'>Connected to {chain.shortName}</span>
          <span className='ml-2 text-green-600'>
            • All DeFi features available
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * Simplified network status indicator - for display in other components
 */
export function NetworkStatusIndicator() {
  const { chain, canUse1inch, shouldShowTestnetWarning } =
    useCurrentWalletChain();

  if (!chain) {
    return (
      <span className='inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800'>
        Not Connected
      </span>
    );
  }

  if (shouldShowTestnetWarning) {
    return (
      <span className='inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800'>
        <ExclamationTriangleIcon className='h-3 w-3 mr-1' />
        Testnet
      </span>
    );
  }

  if (!canUse1inch) {
    return (
      <span className='inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800'>
        <ExclamationTriangleIcon className='h-3 w-3 mr-1' />
        Unsupported
      </span>
    );
  }

  return (
    <span className='inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800'>
      <div className='h-2 w-2 bg-green-400 rounded-full mr-1'></div>
      {chain.shortName}
    </span>
  );
}
