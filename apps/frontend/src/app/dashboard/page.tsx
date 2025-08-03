'use client';

import React, { useMemo } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useWallet } from '@/providers/WalletProvider';
import { useCurrentWalletChain } from '@/providers/ChainProvider';
import { usePortfolio } from '@/hooks/api/usePortfolioQuery';
import NetworkStatusBanner from '@/components/NetworkStatusBanner';
import { CompactDualWalletDisplay } from '@/components/DualWalletDisplay';
import CryptoPriceTicker from '@/components/CryptoPriceTicker';
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ArrowsRightLeftIcon,
  LinkIcon,
  ClockIcon,
  CurrencyDollarIcon,
  WalletIcon,
  CubeTransparentIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function DashboardHomepage() {
  const { connectedWallets } = useWallet();
  const { wallet: currentWallet } = useCurrentWalletChain();

  // Get the first connected Ethereum wallet address
  const ethereumWallet = connectedWallets.find(
    (wallet) => wallet.type === 'ethereum'
  );
  const walletAddress = currentWallet?.address || ethereumWallet?.address;

  // Fetch portfolio data
  const { data: portfolioData, isLoading, error } = usePortfolio(walletAddress);

  // Calculate portfolio statistics
  const portfolioStats = useMemo(() => {
    if (!portfolioData || !portfolioData.result) {
      return {
        totalValue: '$0.00',
        change24h: '+0.00%',
        changeType: 'neutral' as const,
        totalAssets: 0,
        totalChains: 0,
      };
    }

    const totalValue = portfolioData.result.total;
    const change24h = 0; // Placeholder - will be calculated from historical data
    const changeType =
      change24h > 0 ? 'positive' : change24h < 0 ? 'negative' : 'neutral';

    return {
      totalValue:
        totalValue > 0
          ? `$${totalValue.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`
          : '$0.00',
      change24h: `${change24h > 0 ? '+' : ''}${change24h.toFixed(2)}%`,
      changeType,
      totalAssets: 1, // Placeholder
      totalChains: portfolioData.result.by_chain?.length || 0,
    };
  }, [portfolioData]);

  const quickActions = [
    {
      name: 'View Portfolio',
      href: '/portfolio',
      icon: ChartBarIcon,
      description: 'Track your assets across all chains',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      name: 'Swap Tokens',
      href: '/swap',
      icon: ArrowsRightLeftIcon,
      description: 'Get the best rates across DEXs',
      color: 'from-purple-500 to-pink-500',
    },
    {
      name: 'Bridge Assets',
      href: '/bridge',
      icon: LinkIcon,
      description: 'Transfer between blockchains',
      color: 'from-green-500 to-teal-500',
    },
    {
      name: 'View Transactions',
      href: '/transactions',
      icon: ClockIcon,
      description: 'Check your transaction history',
      color: 'from-orange-500 to-red-500',
    },
  ];

  return (
    <DashboardLayout>
      <div className='space-y-6'>
        {/* Network Status Banner */}
        <NetworkStatusBanner />

        {/* Welcome Section */}
        <div className='bg-white rounded-xl shadow-soft p-6 border border-gray-100'>
          <div className='flex items-center justify-between mb-6'>
            <div className='flex-1'>
              <h1 className='text-3xl font-bold text-gray-900 mb-2'>
                Welcome to UniPortfolio
              </h1>
              <p className='text-gray-600 mb-4'>
                Your unified DeFi portfolio management dashboard
              </p>
              {/* Multi-Wallet Status */}
              <div className='flex items-center space-x-4'>
                <div>
                  <p className='text-xs text-gray-500 mb-1'>
                    Connected Wallets:
                  </p>
                  <CompactDualWalletDisplay />
                </div>
                {walletAddress && (
                  <div>
                    <p className='text-xs text-gray-500 mb-1'>
                      Active Address:
                    </p>
                    <p className='text-sm text-gray-600 font-mono bg-gray-50 px-2 py-1 rounded'>
                      {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                    </p>
                  </div>
                )}
              </div>
            </div>
            <div className='text-right'>
              <div className='text-2xl font-bold text-gray-900'>
                {portfolioStats.totalValue}
              </div>
              <div className='flex items-center space-x-1'>
                {portfolioStats.changeType === 'positive' && (
                  <ArrowTrendingUpIcon className='w-4 h-4 text-green-500' />
                )}
                {portfolioStats.changeType === 'negative' && (
                  <ArrowTrendingDownIcon className='w-4 h-4 text-red-500' />
                )}
                <span
                  className={`text-sm ${
                    portfolioStats.changeType === 'positive'
                      ? 'text-green-600'
                      : portfolioStats.changeType === 'negative'
                        ? 'text-red-600'
                        : 'text-gray-500'
                  }`}
                >
                  {portfolioStats.change24h}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
          <div className='bg-white rounded-xl shadow-soft p-6 border border-gray-100'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600 mb-1'>
                  Total Value
                </p>
                <p className='text-2xl font-bold text-gray-900'>
                  {portfolioStats.totalValue}
                </p>
              </div>
              <div className='w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center'>
                <CurrencyDollarIcon className='w-6 h-6 text-white' />
              </div>
            </div>
          </div>

          <div className='bg-white rounded-xl shadow-soft p-6 border border-gray-100'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600 mb-1'>
                  Connected Chains
                </p>
                <p className='text-2xl font-bold text-gray-900'>
                  {portfolioStats.totalChains}
                </p>
              </div>
              <div className='w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center'>
                <CubeTransparentIcon className='w-6 h-6 text-white' />
              </div>
            </div>
          </div>

          <div className='bg-white rounded-xl shadow-soft p-6 border border-gray-100'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600 mb-1'>
                  Connected Wallets
                </p>
                <p className='text-2xl font-bold text-gray-900'>
                  {connectedWallets.length}
                </p>
              </div>
              <div className='w-12 h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg flex items-center justify-center'>
                <WalletIcon className='w-6 h-6 text-white' />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className='bg-white rounded-xl shadow-soft p-6 border border-gray-100'>
          <h2 className='text-xl font-semibold text-gray-900 mb-6'>
            Quick Actions
          </h2>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
            {quickActions.map((action, index) => (
              <Link
                key={index}
                href={action.href}
                className='group block p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200'
              >
                <div className='flex items-center space-x-3'>
                  <div
                    className={`w-10 h-10 rounded-lg bg-gradient-to-r ${action.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}
                  >
                    <action.icon className='w-5 h-5 text-white' />
                  </div>
                  <div className='flex-1'>
                    <h3 className='font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-200'>
                      {action.name}
                    </h3>
                    <p className='text-sm text-gray-600'>
                      {action.description}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Crypto Price Ticker */}
        <div className='bg-white rounded-xl shadow-soft border border-gray-100'>
          <div className='p-6 border-b border-gray-100'>
            <h2 className='text-xl font-semibold text-gray-900'>
              Live Crypto Prices
            </h2>
          </div>
          <div className='p-6'>
            <CryptoPriceTicker />
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
                className={`flex items-center justify-between p-3 rounded-lg ${
                  wallet.type === 'ethereum'
                    ? 'bg-blue-50 border border-blue-200'
                    : 'bg-gray-50'
                }`}
              >
                <div className='flex items-center space-x-3'>
                  <div className='text-xl'>
                    {wallet.type === 'ethereum' ? '🔷' : '🔵'}
                  </div>
                  <div>
                    <div className='font-medium text-gray-900'>
                      {wallet.type === 'ethereum' ? 'Ethereum' : 'Sui'} Wallet
                      {wallet.type === 'ethereum' && (
                        <span className='ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded'>
                          1inch Enabled
                        </span>
                      )}
                    </div>
                    <div className='text-sm text-gray-500 font-mono'>
                      {wallet.address}
                    </div>
                  </div>
                </div>
                <div className='text-right'>
                  <div className='text-sm font-medium text-gray-900'>
                    {wallet.type === 'ethereum' &&
                    portfolioData &&
                    portfolioData.result
                      ? `$${portfolioData.result.total.toLocaleString()}`
                      : '$0.00'}
                  </div>
                  <div className='text-xs text-gray-500'>
                    {wallet.type === 'ethereum'
                      ? `${portfolioStats.totalAssets} assets`
                      : 'Not tracked'}
                  </div>
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
