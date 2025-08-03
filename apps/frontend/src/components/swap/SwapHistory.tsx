'use client';

import React, { useState } from 'react';
import {
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import type { SwapTransaction } from '@/types';
import { TransactionStatus } from '@/types';

interface SwapHistoryProps {
  transactions: SwapTransaction[];
  onRefresh: () => void;
  isLoading?: boolean;
  onViewTransaction?: (transaction: SwapTransaction) => void;
}

const SwapHistory: React.FC<SwapHistoryProps> = ({
  transactions,
  onRefresh,
  isLoading = false,
  onViewTransaction,
}) => {
  const [filter, setFilter] = useState<
    'all' | 'pending' | 'completed' | 'failed'
  >('all');

  const filteredTransactions = transactions.filter((tx) => {
    if (filter === 'all') return true;
    if (filter === 'pending') return tx.status === TransactionStatus.PENDING;
    if (filter === 'completed')
      return tx.status === TransactionStatus.CONFIRMED;
    if (filter === 'failed') return tx.status === TransactionStatus.FAILED;
    return true;
  });

  const formatAmount = (amount: string, decimals: number) => {
    const value = parseFloat(amount) / Math.pow(10, decimals);
    return value.toFixed(6);
  };

  const formatTokenAmount = (amount: string, token: any) => {
    return `${formatAmount(amount, token.decimals)} ${token.symbol}`;
  };

  const getStatusIcon = (status: TransactionStatus) => {
    switch (status) {
      case TransactionStatus.PENDING:
        return <ClockIcon className='w-5 h-5 text-yellow-500' />;
      case TransactionStatus.CONFIRMED:
        return <CheckCircleIcon className='w-5 h-5 text-green-500' />;
      case TransactionStatus.FAILED:
        return <XCircleIcon className='w-5 h-5 text-red-500' />;
      default:
        return <ExclamationTriangleIcon className='w-5 h-5 text-gray-500' />;
    }
  };

  const getStatusText = (status: TransactionStatus) => {
    switch (status) {
      case TransactionStatus.PENDING:
        return 'Pending';
      case TransactionStatus.CONFIRMED:
        return 'Completed';
      case TransactionStatus.FAILED:
        return 'Failed';
      default:
        return 'Unknown';
    }
  };

  const getStatusColor = (status: TransactionStatus) => {
    switch (status) {
      case TransactionStatus.PENDING:
        return 'text-yellow-600 bg-yellow-50';
      case TransactionStatus.CONFIRMED:
        return 'text-green-600 bg-green-50';
      case TransactionStatus.FAILED:
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  if (transactions.length === 0) {
    return (
      <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-6'>
        <div className='flex items-center justify-between mb-4'>
          <h3 className='text-lg font-semibold text-gray-900'>Swap History</h3>
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className='p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50'
          >
            <ArrowPathIcon
              className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`}
            />
          </button>
        </div>

        <div className='text-center py-8 text-gray-500'>
          <ClockIcon className='w-12 h-12 mx-auto mb-3 text-gray-300' />
          <p className='text-sm'>No swap history yet</p>
          <p className='text-xs text-gray-400 mt-1'>
            Your swap transactions will appear here
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-6'>
      {/* Header */}
      <div className='flex items-center justify-between mb-4'>
        <h3 className='text-lg font-semibold text-gray-900'>Swap History</h3>
        <div className='flex items-center space-x-2'>
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className='p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50'
            title='Refresh history'
          >
            <ArrowPathIcon
              className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`}
            />
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className='flex space-x-1 mb-4 p-1 bg-gray-100 rounded-lg'>
        {[
          { key: 'all', label: 'All', count: transactions.length },
          {
            key: 'pending',
            label: 'Pending',
            count: transactions.filter(
              (t) => t.status === TransactionStatus.PENDING
            ).length,
          },
          {
            key: 'completed',
            label: 'Completed',
            count: transactions.filter(
              (t) => t.status === TransactionStatus.CONFIRMED
            ).length,
          },
          {
            key: 'failed',
            label: 'Failed',
            count: transactions.filter(
              (t) => t.status === TransactionStatus.FAILED
            ).length,
          },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key as any)}
            className={`flex-1 px-3 py-2 text-xs font-medium rounded-md transition-colors ${
              filter === tab.key
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label}
            <span className='ml-1 text-xs opacity-75'>({tab.count})</span>
          </button>
        ))}
      </div>

      {/* Transaction List */}
      <div className='space-y-3'>
        {filteredTransactions.map((transaction) => (
          <div
            key={transaction.id}
            className='border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors'
          >
            <div className='flex items-center justify-between mb-3'>
              <div className='flex items-center space-x-3'>
                {getStatusIcon(transaction.status)}
                <div>
                  <div className='flex items-center space-x-2'>
                    <span className='font-medium text-gray-900'>
                      {formatTokenAmount(
                        transaction.fromAmount,
                        transaction.fromToken
                      )}{' '}
                      →{' '}
                      {formatTokenAmount(
                        transaction.toAmount,
                        transaction.toToken
                      )}
                    </span>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(transaction.status)}`}
                    >
                      {getStatusText(transaction.status)}
                    </span>
                  </div>
                  <div className='text-xs text-gray-500 mt-1'>
                    {formatDate(transaction.timestamp)} •{' '}
                    {getTimeAgo(transaction.timestamp)}
                  </div>
                </div>
              </div>

              {onViewTransaction && (
                <button
                  onClick={() => onViewTransaction(transaction)}
                  className='p-2 text-gray-400 hover:text-gray-600'
                  title='View details'
                >
                  <EyeIcon className='w-4 h-4' />
                </button>
              )}
            </div>

            {/* Transaction Details */}
            <div className='grid grid-cols-2 gap-4 text-xs text-gray-600'>
              <div>
                <span className='font-medium'>Gas Used:</span>
                <span className='ml-1'>{transaction.gasUsed || 'Unknown'}</span>
              </div>
              <div>
                <span className='font-medium'>Price Impact:</span>
                <span className='ml-1'>
                  {transaction.priceImpact?.toFixed(2) || '0.00'}%
                </span>
              </div>
              {transaction.txHash && (
                <div className='col-span-2'>
                  <span className='font-medium'>Transaction:</span>
                  <a
                    href={`https://etherscan.io/tx/${transaction.txHash}`}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='ml-1 text-blue-600 hover:text-blue-800 break-all'
                  >
                    {transaction.txHash.slice(0, 8)}...
                    {transaction.txHash.slice(-6)}
                  </a>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Load More Button */}
      {filteredTransactions.length > 0 && (
        <div className='mt-4 text-center'>
          <button className='text-sm text-blue-600 hover:text-blue-800 font-medium'>
            Load more transactions
          </button>
        </div>
      )}
    </div>
  );
};

export default SwapHistory;
