'use client';

import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useWallet } from '@/providers/WalletProvider';
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';

export default function Portfolio() {
  const { connectedWallets } = useWallet();

  // Mock portfolio data - will be replaced with real data later
  type ChangeType = 'positive' | 'negative' | 'neutral';

  const portfolioStats: Array<{
    title: string;
    value: string;
    change: string;
    changeType: ChangeType;
  }> = [
    {
      title: 'Total Value',
      value: '$0.00',
      change: '+0.00%',
      changeType: 'neutral',
    },
    {
      title: '24h Change',
      value: '$0.00',
      change: '+0.00%',
      changeType: 'neutral',
    },
    {
      title: 'Total Assets',
      value: '0',
      change: 'Across all chains',
      changeType: 'neutral',
    },
  ];

  const mockAssets = [
    // Mock data - will be populated from real API
  ];

  return (
    <DashboardLayout>
      <div className='space-y-6'>
        {/* Portfolio Header */}
        <div className='bg-white rounded-xl shadow-soft p-6 border border-gray-100'>
          <div className='flex items-center justify-between mb-6'>
            <div>
              <h2 className='text-2xl font-bold text-gray-900'>
                Portfolio Overview
              </h2>
              <p className='text-gray-600'>
                Track your assets across all connected chains
              </p>
            </div>
            <button className='btn-primary flex items-center space-x-2'>
              <ArrowTrendingUpIcon className='w-4 h-4' />
              <span>Refresh</span>
            </button>
          </div>

          {/* Portfolio Stats */}
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            {portfolioStats.map((stat, index) => (
              <div key={index} className='bg-gray-50 rounded-lg p-4'>
                <h3 className='text-sm font-medium text-gray-600 mb-1'>
                  {stat.title}
                </h3>
                <p className='text-2xl font-bold text-gray-900 mb-1'>
                  {stat.value}
                </p>
                <div className='flex items-center space-x-1'>
                  {stat.changeType === 'positive' && (
                    <ArrowTrendingUpIcon className='w-4 h-4 text-green-500' />
                  )}
                  {stat.changeType === 'negative' && (
                    <ArrowTrendingDownIcon className='w-4 h-4 text-red-500' />
                  )}
                  <span
                    className={`text-sm ${
                      stat.changeType === 'positive'
                        ? 'text-green-600'
                        : stat.changeType === 'negative'
                          ? 'text-red-600'
                          : 'text-gray-500'
                    }`}
                  >
                    {stat.change}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Asset Allocation Chart */}
        <div className='bg-white rounded-xl shadow-soft p-6 border border-gray-100'>
          <h3 className='text-lg font-semibold text-gray-900 mb-4'>
            Asset Allocation
          </h3>
          <div className='text-center py-12'>
            <ChartBarIcon className='w-16 h-16 text-gray-300 mx-auto mb-4' />
            <p className='text-gray-500 mb-2'>No asset data available</p>
            <p className='text-sm text-gray-400'>
              Connect your wallets and refresh to see your portfolio breakdown
            </p>
          </div>
        </div>

        {/* Assets Table */}
        <div className='bg-white rounded-xl shadow-soft border border-gray-100'>
          <div className='p-6 border-b border-gray-100'>
            <div className='flex items-center justify-between'>
              <h3 className='text-lg font-semibold text-gray-900'>
                Your Assets
              </h3>
              <div className='flex items-center space-x-2'>
                <button className='btn-secondary text-sm'>
                  <EyeIcon className='w-4 h-4 mr-1' />
                  Hide Small Balances
                </button>
              </div>
            </div>
          </div>

          <div className='p-6'>
            {connectedWallets.length === 0 ? (
              <div className='text-center py-8'>
                <ChartBarIcon className='w-12 h-12 text-gray-300 mx-auto mb-4' />
                <h4 className='text-lg font-medium text-gray-900 mb-2'>
                  No Wallets Connected
                </h4>
                <p className='text-gray-600 mb-4'>
                  Connect your Ethereum and Sui wallets to view your assets
                </p>
              </div>
            ) : mockAssets.length === 0 ? (
              <div className='text-center py-8'>
                <ChartBarIcon className='w-12 h-12 text-gray-300 mx-auto mb-4' />
                <h4 className='text-lg font-medium text-gray-900 mb-2'>
                  No Assets Found
                </h4>
                <p className='text-gray-600 mb-4'>
                  Your connected wallets don't have any tracked assets, or data
                  is still loading.
                </p>
                <button className='btn-primary'>Refresh Portfolio</button>
              </div>
            ) : (
              /* Assets table will be populated here */
              <div className='space-y-3'>
                {/* Table headers */}
                <div className='grid grid-cols-12 gap-4 text-sm font-medium text-gray-600 pb-2 border-b border-gray-100'>
                  <div className='col-span-4'>Asset</div>
                  <div className='col-span-2'>Chain</div>
                  <div className='col-span-2'>Balance</div>
                  <div className='col-span-2'>Value</div>
                  <div className='col-span-2'>24h Change</div>
                </div>

                {/* Asset rows would go here */}
                <div className='text-center py-4 text-gray-500'>
                  Asset data will be populated here
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Connected Wallets Summary */}
        <div className='bg-white rounded-xl shadow-soft p-6 border border-gray-100'>
          <h3 className='text-lg font-semibold text-gray-900 mb-4'>
            Connected Wallets ({connectedWallets.length})
          </h3>
          <div className='space-y-3'>
            {connectedWallets.map((wallet, index) => (
              <div
                key={index}
                className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'
              >
                <div className='flex items-center space-x-3'>
                  <div className='text-xl'>
                    {wallet.type === 'ethereum' ? '🔷' : '🔵'}
                  </div>
                  <div>
                    <div className='font-medium text-gray-900'>
                      {wallet.type === 'ethereum' ? 'Ethereum' : 'Sui'} Wallet
                    </div>
                    <div className='text-sm text-gray-500 font-mono'>
                      {wallet.address}
                    </div>
                  </div>
                </div>
                <div className='text-right'>
                  <div className='text-sm font-medium text-gray-900'>$0.00</div>
                  <div className='text-xs text-gray-500'>0 assets</div>
                </div>
              </div>
            ))}
            {connectedWallets.length === 0 && (
              <div className='text-center py-4 text-gray-500'>
                No wallets connected
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
