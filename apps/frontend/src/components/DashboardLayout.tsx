'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useWallet } from '@/providers/WalletProvider';
import { formatAddress } from '@/utils/format';
import CryptoPriceTicker from './CryptoPriceTicker';
import {
  useCryptoPriceStore,
  loadCryptoPricePreferences,
} from '@/stores/cryptoPriceStore';
import {
  HomeIcon,
  ChartBarIcon,
  ArrowsRightLeftIcon,
  LinkIcon,
  ClockIcon,
  Cog6ToothIcon,
  Bars3Icon,
  XMarkIcon,
  SunIcon,
  MoonIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const navigation: NavigationItem[] = [
  {
    name: 'Dashboard',
    href: '/',
    icon: HomeIcon,
    description: 'Overview & Analytics',
  },
  {
    name: 'Portfolio',
    href: '/portfolio',
    icon: ChartBarIcon,
    description: 'Assets & Holdings',
  },
  {
    name: 'Value Chart',
    href: '/portfolio/value-chart',
    icon: ArrowsRightLeftIcon,
    description: 'Portfolio Performance',
  },
  {
    name: 'Swap',
    href: '/swap',
    icon: ArrowsRightLeftIcon,
    description: 'Token Exchange',
  },
  {
    name: 'Bridge',
    href: '/bridge',
    icon: LinkIcon,
    description: 'Cross-chain Transfer',
  },
  {
    name: 'Transactions',
    href: '/transactions',
    icon: ClockIcon,
    description: 'History & Status',
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Cog6ToothIcon,
    description: 'Preferences',
  },
];

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const pathname = usePathname();
  const { connectedWallets, isEthereumConnected, isSuiConnected } = useWallet();

  // 加密貨幣價格消息欄狀態
  const { showTicker, setShowTicker } = useCryptoPriceStore();

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  // 加載用戶偏好設置
  useEffect(() => {
    loadCryptoPricePreferences();
  }, []);

  return (
    <div className={`min-h-screen bg-gray-50 ${isDarkMode ? 'dark' : ''}`}>
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className='fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden'
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar header */}
        <div className='flex items-center justify-between h-16 px-6 border-b border-gray-200'>
          <Link href='/' className='flex items-center space-x-3'>
            <div className='w-8 h-8 bg-gradient-to-r from-primary-500 to-accent-500 rounded-lg flex items-center justify-center'>
              <span className='text-white font-bold text-sm'>UP</span>
            </div>
            <span className='text-xl font-bold text-gradient'>
              UniPortfolio
            </span>
          </Link>

          {/* Mobile close button */}
          <button
            onClick={() => setSidebarOpen(false)}
            className='lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600'
          >
            <XMarkIcon className='w-5 h-5' />
          </button>
        </div>

        {/* Navigation */}
        <nav className='flex-1 px-4 py-6 space-y-2'>
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                  isActive
                    ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-500'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <item.icon
                  className={`mr-3 h-5 w-5 ${
                    isActive
                      ? 'text-primary-500'
                      : 'text-gray-400 group-hover:text-gray-500'
                  }`}
                />
                <div>
                  <div className='font-medium'>{item.name}</div>
                  <div className='text-xs text-gray-500'>
                    {item.description}
                  </div>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar footer - Wallet info */}
        <div className='border-t border-gray-200 p-4'>
          <div className='space-y-2'>
            {connectedWallets.map((wallet, index) => (
              <div key={index} className='flex items-center space-x-2 text-sm'>
                <div
                  className={`w-2 h-2 rounded-full ${
                    wallet.type === 'ethereum' ? 'bg-blue-500' : 'bg-purple-500'
                  }`}
                />
                <span className='text-gray-600 font-mono text-xs'>
                  {formatAddress(wallet.address)}
                </span>
              </div>
            ))}
            {connectedWallets.length === 0 && (
              <div className='text-xs text-gray-500'>No wallets connected</div>
            )}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className='lg:ml-64'>
        {/* Top header */}
        <header className='bg-white shadow-sm border-b border-gray-200'>
          <div className='flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8'>
            {/* Mobile menu button */}
            <button
              onClick={toggleSidebar}
              className='lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600'
            >
              <Bars3Icon className='w-6 h-6' />
            </button>

            {/* Page title */}
            <div className='flex-1 lg:flex-none'>
              <h1 className='text-2xl font-semibold text-gray-900'>
                {navigation.find((item) => item.href === pathname)?.name ||
                  'Dashboard'}
              </h1>
            </div>

            {/* Header actions */}
            <div className='flex items-center space-x-4'>
              {/* Network indicator */}
              <div className='hidden sm:flex items-center space-x-2'>
                {isEthereumConnected && (
                  <div className='flex items-center space-x-1 bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-xs'>
                    <div className='w-2 h-2 bg-blue-500 rounded-full' />
                    <span>Ethereum</span>
                  </div>
                )}
                {isSuiConnected && (
                  <div className='flex items-center space-x-1 bg-purple-50 text-purple-700 px-2 py-1 rounded-full text-xs'>
                    <div className='w-2 h-2 bg-purple-500 rounded-full' />
                    <span>Sui</span>
                  </div>
                )}
              </div>

              {/* 價格消息欄切換 */}
              <button
                onClick={() => setShowTicker(!showTicker)}
                className={`
                  p-2 rounded-lg transition-colors
                  ${
                    showTicker
                      ? 'text-blue-600 bg-blue-50 hover:bg-blue-100'
                      : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                  }
                `}
                title={showTicker ? 'Hide price ticker' : 'Show price ticker'}
              >
                <CurrencyDollarIcon className='w-5 h-5' />
              </button>

              {/* Theme toggle */}
              <button
                onClick={toggleTheme}
                className='p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100'
              >
                {isDarkMode ? (
                  <SunIcon className='w-5 h-5' />
                ) : (
                  <MoonIcon className='w-5 h-5' />
                )}
              </button>

              {/* Wallet connection status */}
              <div className='flex items-center space-x-2'>
                <div
                  className={`w-3 h-3 rounded-full ${
                    connectedWallets.length > 0 ? 'bg-green-500' : 'bg-red-500'
                  }`}
                />
                <span className='text-sm text-gray-600'>
                  {connectedWallets.length > 0 ? 'Connected' : 'Disconnected'}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* 加密貨幣價格消息欄 */}
        {showTicker && (
          <CryptoPriceTicker
            className='transition-all duration-300'
            autoScroll={true}
            showControls={true}
            symbols={[
              'BTC',
              'ETH',
              'USDT',
              'BNB',
              'SOL',
              'ADA',
              'XRP',
              'DOGE',
              'AVAX',
              'MATIC',
            ]}
            onClose={() => setShowTicker(false)}
          />
        )}

        {/* Page content */}
        <main className='flex-1 p-4 sm:p-6 lg:p-8'>
          <div className='max-w-7xl mx-auto'>{children}</div>
        </main>
      </div>
    </div>
  );
}
