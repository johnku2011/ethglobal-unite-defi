'use client';

import React from 'react';
import Link from 'next/link';
import { usePortfolioHistory } from '@/hooks/api/usePortfolioQuery';
import { formatAddress } from '@/utils/format';
import {
  BanknotesIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  ChevronRightIcon,
  LinkIcon,
} from '@heroicons/react/24/outline';
import type { PortfolioPosition } from '@/services/api/oneinchAPI';

interface RecentActivityProps {
  walletAddress?: string;
}

/**
 * 專業的 Recent Activity 組件
 * 展示用戶最近的資產持倉情況
 */
export default function RecentActivity({ walletAddress }: RecentActivityProps) {
  const {
    data: portfolioHistory,
    isLoading,
    error,
  } = usePortfolioHistory(walletAddress, 5);

  const getChainName = (chainId: number) => {
    const chains: { [key: number]: { name: string; color: string } } = {
      1: { name: 'Ethereum', color: 'bg-blue-100 text-blue-800' },
      137: { name: 'Polygon', color: 'bg-purple-100 text-purple-800' },
      56: { name: 'BSC', color: 'bg-yellow-100 text-yellow-800' },
      42161: { name: 'Arbitrum', color: 'bg-blue-100 text-blue-800' },
      10: { name: 'Optimism', color: 'bg-red-100 text-red-800' },
      8453: { name: 'Base', color: 'bg-blue-100 text-blue-800' },
    };
    return (
      chains[chainId] || {
        name: `Chain ${chainId}`,
        color: 'bg-gray-100 text-gray-800',
      }
    );
  };

  const formatValue = (value: number) => {
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`;
    }
    return `$${value.toFixed(2)}`;
  };

  const getTokenIcon = (symbol: string) => {
    const icons: { [key: string]: string } = {
      ETH: '⟠',
      USDC: '🔵',
      USDT: '🟢',
      DAI: '🟡',
      BTC: '₿',
      MATIC: '🔮',
    };
    return icons[symbol] || '🪙';
  };

  if (isLoading) {
    return (
      <div className='bg-white rounded-xl shadow-soft p-6 border border-gray-100'>
        <div className='flex items-center justify-between mb-4'>
          <h3 className='text-lg font-semibold text-gray-900 flex items-center space-x-2'>
            <ClockIcon className='w-5 h-5 text-gray-600' />
            <span>Recent Activity</span>
          </h3>
        </div>
        <div className='animate-pulse space-y-3'>
          {[1, 2, 3].map((i) => (
            <div key={i} className='flex items-center space-x-3'>
              <div className='w-10 h-10 bg-gray-200 rounded-lg'></div>
              <div className='flex-1 space-y-2'>
                <div className='h-4 bg-gray-200 rounded w-3/4'></div>
                <div className='h-3 bg-gray-200 rounded w-1/2'></div>
              </div>
              <div className='h-4 bg-gray-200 rounded w-16'></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='bg-white rounded-xl shadow-soft p-6 border border-gray-100'>
        <div className='flex items-center justify-between mb-4'>
          <h3 className='text-lg font-semibold text-gray-900 flex items-center space-x-2'>
            <ClockIcon className='w-5 h-5 text-gray-600' />
            <span>Recent Activity</span>
          </h3>
        </div>
        <div className='text-center py-8'>
          <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
            <BanknotesIcon className='w-8 h-8 text-gray-400' />
          </div>
          <p className='text-gray-500 text-sm'>{error.message}</p>
        </div>
      </div>
    );
  }

  if (!walletAddress) {
    return (
      <div className='bg-white rounded-xl shadow-soft p-6 border border-gray-100'>
        <div className='flex items-center justify-between mb-4'>
          <h3 className='text-lg font-semibold text-gray-900 flex items-center space-x-2'>
            <ClockIcon className='w-5 h-5 text-gray-600' />
            <span>Recent Activity</span>
          </h3>
        </div>
        <div className='text-center py-8'>
          <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
            <BanknotesIcon className='w-8 h-8 text-gray-400' />
          </div>
          <p className='text-gray-500'>
            Connect your wallet to see recent activity
          </p>
        </div>
      </div>
    );
  }

  if (!portfolioHistory || portfolioHistory.length === 0) {
    return (
      <div className='bg-white rounded-xl shadow-soft p-6 border border-gray-100'>
        <div className='flex items-center justify-between mb-4'>
          <h3 className='text-lg font-semibold text-gray-900 flex items-center space-x-2'>
            <ClockIcon className='w-5 h-5 text-gray-600' />
            <span>Recent Activity</span>
          </h3>
        </div>
        <div className='text-center py-8'>
          <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
            <BanknotesIcon className='w-8 h-8 text-gray-400' />
          </div>
          <p className='text-gray-500'>
            No recent activity found for this wallet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='bg-white rounded-xl shadow-soft p-6 border border-gray-100'>
      <div className='flex items-center justify-between mb-6'>
        <h3 className='text-lg font-semibold text-gray-900 flex items-center space-x-2'>
          <ClockIcon className='w-5 h-5 text-gray-600' />
          <span>Recent Activity</span>
        </h3>
        <span className='text-sm text-gray-500'>
          Top {portfolioHistory.length} positions
        </span>
      </div>

      <div className='space-y-4'>
        {portfolioHistory.slice(0, 3).map((position) => {
          const chainInfo = getChainName(position.chain);
          const mainToken = position.underlying_tokens[0];

          return (
            <div
              key={position.index}
              className='group flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors'
            >
              <div className='flex items-center space-x-4'>
                {/* Token Icon */}
                <div className='w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg'>
                  <span className='text-2xl text-white'>
                    {getTokenIcon(position.contract_symbol)}
                  </span>
                </div>

                {/* Token Info */}
                <div className='flex-1'>
                  <div className='flex items-center space-x-2 mb-1'>
                    <h4 className='font-semibold text-gray-900'>
                      {position.contract_name}
                    </h4>
                    <span className='text-sm text-gray-500'>
                      ({position.contract_symbol})
                    </span>
                  </div>

                  <div className='flex items-center space-x-3 text-sm text-gray-600'>
                    <span>
                      {mainToken?.amount.toFixed(4)} {mainToken?.symbol}
                    </span>
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${chainInfo.color}`}
                    >
                      {chainInfo.name}
                    </span>
                  </div>
                </div>
              </div>

              {/* Value & Action */}
              <div className='flex items-center space-x-3'>
                <div className='text-right'>
                  <div className='font-semibold text-gray-900'>
                    {formatValue(position.value_usd)}
                  </div>
                  <div className='text-xs text-gray-500'>
                    ${mainToken?.price_usd.toFixed(2)}
                  </div>
                </div>
                <ChevronRightIcon className='w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors' />
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Actions */}
      <div className='mt-6 pt-4 border-t border-gray-100 flex items-center justify-between'>
        <div className='text-sm text-gray-500'>
          Updated just now • {portfolioHistory.length} positions total
        </div>
        <Link
          href='/portfolio'
          className='text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center space-x-1 transition-colors'
        >
          <span>View full portfolio</span>
          <ArrowTrendingUpIcon className='w-4 h-4' />
        </Link>
      </div>
    </div>
  );
}
