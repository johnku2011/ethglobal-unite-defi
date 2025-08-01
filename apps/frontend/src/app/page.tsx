'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';

import { useWallet } from '@/providers/WalletProvider';
import { useCurrentWalletChain } from '@/providers/ChainProvider';
import { usePortfolio } from '@/hooks/api/usePortfolioQuery';
import NetworkStatusBanner from '@/components/NetworkStatusBanner';
import { CompactDualWalletDisplay } from '@/components/DualWalletDisplay';
import ConnectedWalletsSection from '@/components/ConnectedWalletsSection';
import RecentActivity from '@/components/RecentActivity';
import {
  BanknotesIcon,
  ArrowTrendingUpIcon,
  ArrowsRightLeftIcon,
  LinkIcon,
} from '@heroicons/react/24/outline';

export default function Home() {
  const { connectedWallets } = useWallet();
  const { wallet: currentWallet } = useCurrentWalletChain();

  // 獲取第一個連接的以太坊錢包地址
  const ethereumWallet = connectedWallets.find(
    (wallet) => wallet.type === 'ethereum'
  );
  const walletAddress = currentWallet?.address || ethereumWallet?.address;

  // 使用現有的hooks獲取數據
  const { data: portfolioData } = usePortfolio(walletAddress);

  // 計算投資組合統計信息
  const portfolioStats = useMemo(() => {
    if (!portfolioData || !(portfolioData as any).result) {
      return {
        totalValue: '$0.00',
        changeType: 'neutral' as const,
        totalAssets: 0,
        totalChains: 0,
      };
    }

    // 使用正確的 API v5 響應結構 (與 portfolio 頁面一致)
    const totalValue = (portfolioData as any).result.total || 0;
    const chainCount = (portfolioData as any).result.by_chain?.length || 0;
    const assetCount = 1; // 暫時設為 1，實際應該從資產數據計算

    return {
      totalValue:
        totalValue > 0
          ? `$${totalValue.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`
          : '$0.00',
      changeType: 'neutral' as const,
      totalAssets: assetCount,
      totalChains: chainCount,
    };
  }, [portfolioData]);

  // 統計計數
  const recentSwapsCount = 0; // 實際應從API數據計算
  const bridgeTransactionsCount = 0; // 實際應從API數據計算

  // 儀表板統計卡片數據
  const stats = [
    {
      title: 'Total Portfolio Value',
      value: portfolioStats.totalValue,
      change: '+0.00%', // 實際應從API數據計算
      changeType: portfolioStats.changeType,
      icon: BanknotesIcon,
    },
    {
      title: 'Total Assets',
      value: String(portfolioStats.totalAssets),
      change: `Across ${portfolioStats.totalChains} chains`,
      changeType: 'neutral' as const,
      icon: ArrowTrendingUpIcon,
    },
    {
      title: 'Recent Swaps',
      value: String(recentSwapsCount),
      change: 'Last 24h',
      changeType: 'neutral' as const,
      icon: ArrowsRightLeftIcon,
    },
    {
      title: 'Bridge Transactions',
      value: String(bridgeTransactionsCount),
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
            <div className='flex-1'>
              <h1 className='text-3xl font-bold mb-2'>
                Welcome to UniPortfolio
              </h1>
              <p className='text-primary-100 text-lg mb-4'>
                Unified DeFi portfolio management across multiple blockchains
              </p>
              {/* Multi-Chain Wallet Status */}
              <div className='bg-white bg-opacity-20 rounded-lg p-4 inline-block border border-white border-opacity-30'>
                <h3 className='text-sm font-medium text-white mb-3'>
                  Connected Wallets
                </h3>
                <CompactDualWalletDisplay variant='light' />
              </div>
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

        {/* Network Status Banner */}
        <NetworkStatusBanner />

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

        {/* Connected Wallets - Premium UI/UX */}
        <ConnectedWalletsSection />

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
              className='btn-outline w-full block text-center py-2'
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
            <Link
              href='/swap'
              className='btn-outline w-full block text-center py-2'
            >
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
              className='btn-outline w-full block text-center py-2'
            >
              Bridge Assets
            </Link>
          </div>
        </div>

        {/* Recent Activity - Professional Portfolio Positions */}
        <RecentActivity walletAddress={walletAddress} />
      </div>
    </DashboardLayout>
  );
}
