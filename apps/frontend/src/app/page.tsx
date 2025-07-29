'use client';

import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import WalletConnect from '@/components/WalletConnect';
import { useWallet } from '@/providers/WalletProvider';
import {
  BanknotesIcon,
  ArrowTrendingUpIcon,
  ArrowsRightLeftIcon,
  LinkIcon,
} from '@heroicons/react/24/outline';

export default function Home() {
  const { connectedWallets } = useWallet();

  const stats = [
    {
      title: 'Total Portfolio Value',
      value: '$0.00',
      change: '+0.00%',
      changeType: 'neutral' as const,
      icon: BanknotesIcon,
    },
    {
      title: 'Total Assets',
      value: '0',
      change: 'Across all chains',
      changeType: 'neutral' as const,
      icon: ArrowTrendingUpIcon,
    },
    {
      title: 'Recent Swaps',
      value: '0',
      change: 'Last 24h',
      changeType: 'neutral' as const,
      icon: ArrowsRightLeftIcon,
    },
    {
      title: 'Bridge Transactions',
      value: '0',
      change: 'Last 7 days',
      changeType: 'neutral' as const,
      icon: LinkIcon,
    },
  ];

  return (
    <DashboardLayout>
      <div className='space-y-6'>
        {/* Welcome Section */}
        <div className='bg-gradient-to-r from-primary-500 to-accent-500 rounded-2xl p-8 text-white'>
          <div className='flex items-center justify-between'>
            <div>
              <h1 className='text-3xl font-bold mb-2'>
                Welcome to UniPortfolio
              </h1>
              <p className='text-primary-100 text-lg'>
                Unified DeFi portfolio management across multiple blockchains
              </p>
            </div>
            <div className='hidden md:block'>
              <div className='w-32 h-32 bg-white bg-opacity-10 rounded-full flex items-center justify-center'>
                <div className='w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center'>
                  <BanknotesIcon className='w-10 h-10 text-white' />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
          {stats.map((stat, index) => (
            <div
              key={index}
              className='bg-white rounded-xl shadow-soft p-6 border border-gray-100'
            >
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-gray-600 mb-1'>
                    {stat.title}
                  </p>
                  <p className='text-2xl font-bold text-gray-900'>
                    {stat.value}
                  </p>
                  <p className='text-sm text-gray-500 mt-1'>{stat.change}</p>
                </div>
                <div className='p-3 bg-primary-50 rounded-lg'>
                  <stat.icon className='w-6 h-6 text-primary-600' />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Connected Wallets */}
        {connectedWallets.length > 0 ? (
          <div className='bg-white rounded-xl shadow-soft p-6 border border-gray-100'>
            <h3 className='text-lg font-semibold text-gray-900 mb-4'>
              Connected Wallets
            </h3>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              {connectedWallets.map((wallet, index) => (
                <div
                  key={index}
                  className='flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200'
                >
                  <div className='flex items-center space-x-3'>
                    <div className='text-2xl'>
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
                    <div className='text-sm font-medium text-gray-900'>
                      {wallet.provider}
                    </div>
                    {wallet.chainId && (
                      <div className='text-xs text-gray-500'>
                        Chain ID: {wallet.chainId}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Getting Started - No Wallets Connected */
          <div className='bg-white rounded-xl shadow-soft p-8 border border-gray-100 text-center'>
            <div className='w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4'>
              <BanknotesIcon className='w-8 h-8 text-primary-600' />
            </div>
            <h3 className='text-xl font-semibold text-gray-900 mb-2'>
              Get Started with UniPortfolio
            </h3>
            <p className='text-gray-600 mb-6 max-w-md mx-auto'>
              Connect your Ethereum and Sui wallets to start managing your DeFi
              portfolio across multiple chains.
            </p>
            <WalletConnect />
          </div>
        )}

        {/* Quick Actions */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
          <div className='bg-white rounded-xl shadow-soft p-6 border border-gray-100 text-center'>
            <div className='w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4'>
              <ArrowTrendingUpIcon className='w-6 h-6 text-primary-600' />
            </div>
            <h4 className='text-lg font-semibold text-gray-900 mb-2'>
              Portfolio Tracking
            </h4>
            <p className='text-gray-600 text-sm mb-4'>
              Monitor all your assets across Ethereum, Polygon, and Sui in one
              place
            </p>
            <button className='btn-outline w-full'>View Portfolio</button>
          </div>

          <div className='bg-white rounded-xl shadow-soft p-6 border border-gray-100 text-center'>
            <div className='w-12 h-12 bg-accent-100 rounded-lg flex items-center justify-center mx-auto mb-4'>
              <ArrowsRightLeftIcon className='w-6 h-6 text-accent-600' />
            </div>
            <h4 className='text-lg font-semibold text-gray-900 mb-2'>
              Optimal Swaps
            </h4>
            <p className='text-gray-600 text-sm mb-4'>
              Get the best rates using 1inch aggregated liquidity
            </p>
            <button className='btn-outline w-full'>Start Swapping</button>
          </div>

          <div className='bg-white rounded-xl shadow-soft p-6 border border-gray-100 text-center'>
            <div className='w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center mx-auto mb-4'>
              <LinkIcon className='w-6 h-6 text-success-600' />
            </div>
            <h4 className='text-lg font-semibold text-gray-900 mb-2'>
              Cross-Chain Bridge
            </h4>
            <p className='text-gray-600 text-sm mb-4'>
              Seamlessly move assets between EVM chains and Sui
            </p>
            <button className='btn-outline w-full'>Bridge Assets</button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className='bg-white rounded-xl shadow-soft p-6 border border-gray-100'>
          <h3 className='text-lg font-semibold text-gray-900 mb-4'>
            Recent Activity
          </h3>
          <div className='text-center py-8'>
            <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
              <BanknotesIcon className='w-8 h-8 text-gray-400' />
            </div>
            <p className='text-gray-500'>
              No recent activity. Connect your wallet to get started.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
