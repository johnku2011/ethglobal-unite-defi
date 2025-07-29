'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useWallet } from '@/providers/WalletProvider';
import {
  ClockIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowTopRightOnSquareIcon,
  CheckCircleIcon,
  ClockIcon as PendingIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';

export default function Transactions() {
  const { connectedWallets } = useWallet();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  // Mock transaction data
  const mockTransactions = [
    // Will be populated with real data later
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className='w-5 h-5 text-green-500' />;
      case 'pending':
        return <PendingIcon className='w-5 h-5 text-yellow-500' />;
      case 'failed':
        return <XCircleIcon className='w-5 h-5 text-red-500' />;
      default:
        return <ClockIcon className='w-5 h-5 text-gray-400' />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50';
      case 'failed':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <DashboardLayout>
      <div className='space-y-6'>
        {/* Header */}
        <div className='bg-white rounded-xl shadow-soft p-6 border border-gray-100'>
          <div className='flex items-center justify-between mb-6'>
            <div>
              <h2 className='text-2xl font-bold text-gray-900'>
                Transaction History
              </h2>
              <p className='text-gray-600'>
                Track all your DeFi transactions across chains
              </p>
            </div>
          </div>

          {/* Search and Filters */}
          <div className='flex flex-col sm:flex-row gap-4'>
            {/* Search */}
            <div className='relative flex-1'>
              <MagnifyingGlassIcon className='absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400' />
              <input
                type='text'
                placeholder='Search by hash, token, or address...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent'
              />
            </div>

            {/* Filter */}
            <div className='relative'>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className='appearance-none bg-white border border-gray-200 rounded-lg px-4 py-3 pr-10 focus:ring-2 focus:ring-primary-500 focus:border-transparent'
              >
                <option value='all'>All Transactions</option>
                <option value='swap'>Swaps</option>
                <option value='bridge'>Bridges</option>
                <option value='transfer'>Transfers</option>
              </select>
              <FunnelIcon className='absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none' />
            </div>
          </div>
        </div>

        {/* Transaction Stats */}
        <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
          {[
            { title: 'Total Transactions', value: '0', subtitle: 'All time' },
            { title: 'Successful', value: '0', subtitle: 'Completed' },
            { title: 'Pending', value: '0', subtitle: 'In progress' },
            { title: 'Failed', value: '0', subtitle: 'Unsuccessful' },
          ].map((stat, index) => (
            <div
              key={index}
              className='bg-white rounded-xl shadow-soft p-6 border border-gray-100'
            >
              <h3 className='text-sm font-medium text-gray-600 mb-1'>
                {stat.title}
              </h3>
              <p className='text-2xl font-bold text-gray-900 mb-1'>
                {stat.value}
              </p>
              <p className='text-sm text-gray-500'>{stat.subtitle}</p>
            </div>
          ))}
        </div>

        {/* Transactions Table */}
        <div className='bg-white rounded-xl shadow-soft border border-gray-100'>
          <div className='p-6 border-b border-gray-100'>
            <h3 className='text-lg font-semibold text-gray-900'>
              Recent Transactions
            </h3>
          </div>

          <div className='p-6'>
            {connectedWallets.length === 0 ? (
              <div className='text-center py-12'>
                <ClockIcon className='w-16 h-16 text-gray-300 mx-auto mb-4' />
                <h4 className='text-lg font-medium text-gray-900 mb-2'>
                  No Wallets Connected
                </h4>
                <p className='text-gray-600 mb-4'>
                  Connect your wallets to view transaction history
                </p>
              </div>
            ) : mockTransactions.length === 0 ? (
              <div className='text-center py-12'>
                <ClockIcon className='w-16 h-16 text-gray-300 mx-auto mb-4' />
                <h4 className='text-lg font-medium text-gray-900 mb-2'>
                  No Transactions Yet
                </h4>
                <p className='text-gray-600 mb-4'>
                  Your transaction history will appear here once you start using
                  UniPortfolio
                </p>
                <div className='flex justify-center space-x-4'>
                  <button className='btn-primary'>Start Swapping</button>
                  <button className='btn-outline'>Try Bridge</button>
                </div>
              </div>
            ) : (
              /* Transaction table will be populated here */
              <div className='space-y-3'>
                {/* Table headers */}
                <div className='grid grid-cols-12 gap-4 text-sm font-medium text-gray-600 pb-3 border-b border-gray-100'>
                  <div className='col-span-1'>Status</div>
                  <div className='col-span-2'>Type</div>
                  <div className='col-span-2'>From/To</div>
                  <div className='col-span-2'>Amount</div>
                  <div className='col-span-2'>Chain</div>
                  <div className='col-span-2'>Time</div>
                  <div className='col-span-1'>Action</div>
                </div>

                {/* Sample transaction rows */}
                <div className='text-center py-8 text-gray-500'>
                  Transaction data will be loaded here
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Transaction Types Guide */}
        <div className='bg-white rounded-xl shadow-soft p-6 border border-gray-100'>
          <h3 className='text-lg font-semibold text-gray-900 mb-4'>
            Transaction Types
          </h3>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <div className='flex items-center space-x-3 p-3 bg-gray-50 rounded-lg'>
              <div className='w-10 h-10 bg-accent-100 rounded-lg flex items-center justify-center'>
                <span className='text-accent-600 font-semibold text-sm'>
                  SW
                </span>
              </div>
              <div>
                <div className='font-medium text-gray-900'>Swap</div>
                <div className='text-sm text-gray-500'>Token exchanges</div>
              </div>
            </div>
            <div className='flex items-center space-x-3 p-3 bg-gray-50 rounded-lg'>
              <div className='w-10 h-10 bg-success-100 rounded-lg flex items-center justify-center'>
                <span className='text-success-600 font-semibold text-sm'>
                  BR
                </span>
              </div>
              <div>
                <div className='font-medium text-gray-900'>Bridge</div>
                <div className='text-sm text-gray-500'>
                  Cross-chain transfers
                </div>
              </div>
            </div>
            <div className='flex items-center space-x-3 p-3 bg-gray-50 rounded-lg'>
              <div className='w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center'>
                <span className='text-primary-600 font-semibold text-sm'>
                  TX
                </span>
              </div>
              <div>
                <div className='font-medium text-gray-900'>Transfer</div>
                <div className='text-sm text-gray-500'>Direct transfers</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
