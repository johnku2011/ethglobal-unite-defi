'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import WalletConnect from '@/components/WalletConnect';
import { useWallet } from '@/providers/WalletProvider';
import {
  usePortfolioStatus,
  useTransactionHistory,
} from '@/hooks/api/usePortfolioQuery';
import {
  BanknotesIcon,
  ArrowTrendingUpIcon,
  ArrowsRightLeftIcon,
  LinkIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { formatCurrency } from '@/utils/format';

export default function Home() {
  const { connectedWallets } = useWallet();
  const ethereumWallet = connectedWallets.find(
    (wallet) => wallet.type === 'ethereum'
  );
  const portfolioStatus = usePortfolioStatus(ethereumWallet?.address);
  const { data: transactions } = useTransactionHistory(
    ethereumWallet?.address,
    5
  );

  // 當錢包連接狀態變化時，刷新數據
  useEffect(() => {
    if (ethereumWallet?.address && portfolioStatus) {
      portfolioStatus.refetch.all();
    }
  }, [ethereumWallet?.address]);

  // 根據查詢結果構建統計數據
  const stats = [
    {
      title: 'Total Portfolio Value',
      value: portfolioStatus.portfolio?.totalValueUsd
        ? formatCurrency(portfolioStatus.portfolio.totalValueUsd)
        : '$0.00',
      change: portfolioStatus.portfolio?.totalChangePercentage24h
        ? `${portfolioStatus.portfolio.totalChangePercentage24h > 0 ? '+' : ''}${portfolioStatus.portfolio.totalChangePercentage24h.toFixed(2)}%`
        : '+0.00%',
      changeType:
        portfolioStatus.portfolio?.totalChangePercentage24h > 0
          ? ('positive' as const)
          : portfolioStatus.portfolio?.totalChangePercentage24h < 0
            ? ('negative' as const)
            : ('neutral' as const),
      icon: BanknotesIcon,
    },
    {
      title: 'Total Assets',
      value: portfolioStatus.portfolio?.positions?.length?.toString() || '0',
      change: 'Across all chains',
      changeType: 'neutral' as const,
      icon: ArrowTrendingUpIcon,
    },
    {
      title: 'Recent Swaps',
      value: transactions
        ? transactions.filter((tx) => tx.type === 'swap').length.toString()
        : '0',
      change: 'Last 24h',
      changeType: 'neutral' as const,
      icon: ArrowsRightLeftIcon,
    },
    {
      title: 'Bridge Transactions',
      value: '0', // 目前可能沒有直接的橋接數據，保持為0
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
            <Link
              href='/portfolio'
              className='btn-outline w-full block text-center'
            >
              View Portfolio
            </Link>
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
            <Link href='/swap' className='btn-outline w-full block text-center'>
              Start Swapping
            </Link>
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
            <Link
              href='/bridge'
              className='btn-outline w-full block text-center'
            >
              Bridge Assets
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className='bg-white rounded-xl shadow-soft p-6 border border-gray-100'>
          <h3 className='text-lg font-semibold text-gray-900 mb-4'>
            Recent Activity
          </h3>

          {/* 加載中狀態 */}
          {ethereumWallet?.address &&
            portfolioStatus.loadingStates.transactions && (
              <div className='text-center py-6'>
                <div className='animate-spin w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full mx-auto mb-2'></div>
                <p className='text-gray-500'>Loading transaction history...</p>
              </div>
            )}

          {/* 已連接錢包，有交易記錄 */}
          {ethereumWallet?.address &&
            transactions &&
            transactions.length > 0 && (
              <div className='space-y-3'>
                {transactions.slice(0, 5).map((tx) => (
                  <div
                    key={tx.id}
                    className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'
                  >
                    <div className='flex items-center space-x-3'>
                      <div className='p-2 rounded-full bg-gray-100'>
                        {tx.type === 'swap' && (
                          <ArrowsRightLeftIcon className='w-5 h-5 text-accent-600' />
                        )}
                        {tx.type === 'send' && (
                          <ArrowTrendingUpIcon className='w-5 h-5 text-error-600' />
                        )}
                        {tx.type === 'receive' && (
                          <ArrowTrendingUpIcon className='w-5 h-5 text-success-600' />
                        )}
                        {tx.type === 'other' && (
                          <BanknotesIcon className='w-5 h-5 text-primary-600' />
                        )}
                      </div>
                      <div>
                        <div className='font-medium capitalize'>{tx.type}</div>
                        <div className='text-xs text-gray-500'>
                          {new Date(tx.timestamp).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className='text-right'>
                      <div className='font-medium'>
                        {formatCurrency(tx.value)}
                      </div>
                      <div className='text-xs text-gray-500'>
                        {tx.chainName}
                      </div>
                    </div>
                  </div>
                ))}
                <div className='text-center mt-4'>
                  <Link
                    href='/transactions'
                    className='text-primary-600 text-sm font-medium hover:underline flex items-center justify-center'
                  >
                    <span>View all transactions</span>
                    <ClockIcon className='w-4 h-4 ml-1' />
                  </Link>
                </div>
              </div>
            )}

          {/* 已連接錢包，但無交易記錄 */}
          {ethereumWallet?.address &&
            (!transactions || transactions.length === 0) &&
            !portfolioStatus.loadingStates.transactions && (
              <div className='text-center py-8'>
                <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                  <ClockIcon className='w-8 h-8 text-gray-400' />
                </div>
                <p className='text-gray-500'>No transaction history found.</p>
              </div>
            )}

          {/* 未連接錢包 */}
          {!ethereumWallet?.address && (
            <div className='text-center py-8'>
              <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                <BanknotesIcon className='w-8 h-8 text-gray-400' />
              </div>
              <p className='text-gray-500'>
                No recent activity. Connect your wallet to get started.
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
