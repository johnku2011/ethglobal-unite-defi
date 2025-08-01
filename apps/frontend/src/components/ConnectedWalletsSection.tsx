'use client';

import React, { useState } from 'react';
import { useWallet } from '@/providers/WalletProvider';
import { formatAddress } from '@/utils/format';
import WalletConnect from './WalletConnect';
import WalletDisconnectButton from './WalletDisconnectButton';
import {
  BanknotesIcon,
  CheckCircleIcon,
  LinkIcon,
  SparklesIcon,
  ShieldCheckIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

/**
 * Professional Connected Wallets Section with Modern UI/UX
 */
export default function ConnectedWalletsSection() {
  const {
    connectedWallets,
    isConnecting,
    connectEthereum,
    connectSui,
    disconnectEthereum,
    disconnectSui,
    isEthereumConnected,
    isSuiConnected,
  } = useWallet();

  const [showSuiModal, setShowSuiModal] = useState(false);

  const getNetworkName = (chainId?: number) => {
    const networks = {
      1: 'Ethereum',
      137: 'Polygon',
      56: 'BSC',
      42161: 'Arbitrum',
      10: 'Optimism',
      8453: 'Base',
      11155111: 'Sepolia',
      84532: 'Base Sepolia',
      421614: 'Arbitrum Sepolia',
    };
    return networks[chainId as keyof typeof networks] || `Chain ${chainId}`;
  };

  const getNetworkColor = (chainId?: number) => {
    const colors = {
      1: 'bg-blue-100 text-blue-800 border-blue-200',
      137: 'bg-purple-100 text-purple-800 border-purple-200',
      56: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      42161: 'bg-blue-100 text-blue-800 border-blue-200',
      10: 'bg-red-100 text-red-800 border-red-200',
      8453: 'bg-blue-100 text-blue-800 border-blue-200',
    };
    return (
      colors[chainId as keyof typeof colors] ||
      'bg-gray-100 text-gray-800 border-gray-200'
    );
  };

  const WalletCard = ({ wallet, index }: { wallet: any; index: number }) => {
    const isEthereum = wallet.type === 'ethereum';
    const gradientClass = isEthereum
      ? 'from-blue-50 via-blue-25 to-indigo-50'
      : 'from-purple-50 via-purple-25 to-violet-50';
    const borderClass = isEthereum
      ? 'border-blue-200 hover:border-blue-300'
      : 'border-purple-200 hover:border-purple-300';
    const iconBg = isEthereum
      ? 'bg-gradient-to-br from-blue-500 to-blue-600'
      : 'bg-gradient-to-br from-purple-500 to-purple-600';

    return (
      <div
        className={`group relative overflow-hidden rounded-xl border-2 ${borderClass} bg-gradient-to-br ${gradientClass} p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1`}
      >
        {/* Status Indicator */}
        <div className='absolute top-4 right-4 flex items-center space-x-2'>
          <div className='relative'>
            <div className='w-3 h-3 bg-green-500 rounded-full'></div>
            <div className='absolute inset-0 w-3 h-3 bg-green-500 rounded-full animate-ping opacity-75'></div>
          </div>
          <WalletDisconnectButton
            walletAddress={wallet.address}
            variant='icon'
            size='sm'
            className='opacity-0 group-hover:opacity-100 transition-opacity duration-200'
          />
        </div>

        {/* Wallet Icon */}
        <div
          className={`w-12 h-12 ${iconBg} rounded-xl flex items-center justify-center mb-4 shadow-lg`}
        >
          <span className='text-2xl text-white'>
            {isEthereum ? '🔷' : '🔵'}
          </span>
        </div>

        {/* Wallet Info */}
        <div className='space-y-3'>
          <div>
            <h4 className='text-lg font-bold text-gray-900 flex items-center space-x-2'>
              <span>{isEthereum ? 'Ethereum' : 'Sui'} Wallet</span>
              <CheckCircleIcon className='w-5 h-5 text-green-500' />
            </h4>
            <p className='text-sm text-gray-600 font-medium'>
              via {wallet.provider}
            </p>
          </div>

          {/* Address */}
          <div className='bg-white bg-opacity-70 rounded-lg p-3 border border-white border-opacity-50'>
            <p className='text-xs text-gray-500 mb-1 font-medium'>
              Wallet Address
            </p>
            <p className='font-mono text-sm text-gray-800 break-all'>
              {formatAddress(wallet.address, 8)}
            </p>
          </div>

          {/* Network Info */}
          {wallet.type === 'ethereum' && wallet.chainId && (
            <div className='flex items-center space-x-2'>
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getNetworkColor(wallet.chainId)}`}
              >
                <div className='w-2 h-2 rounded-full bg-current mr-1.5'></div>
                {getNetworkName(wallet.chainId)}
              </span>
            </div>
          )}

          {wallet.type === 'sui' && (
            <div className='flex items-center space-x-2'>
              <span className='inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border bg-purple-100 text-purple-800 border-purple-200'>
                <div className='w-2 h-2 rounded-full bg-current mr-1.5'></div>
                Sui Mainnet
              </span>
            </div>
          )}
        </div>

        {/* Decorative Elements */}
        <div className='absolute -bottom-2 -right-2 w-20 h-20 bg-gradient-to-br from-white to-transparent opacity-20 rounded-full'></div>
        <div className='absolute -top-2 -left-2 w-16 h-16 bg-gradient-to-br from-white to-transparent opacity-10 rounded-full'></div>
      </div>
    );
  };

  if (connectedWallets.length === 0) {
    return (
      <div className='relative overflow-hidden bg-gradient-to-br from-gray-50 via-white to-blue-50 rounded-2xl shadow-lg border border-gray-200 p-8 text-center'>
        {/* Background Pattern */}
        <div className='absolute inset-0 bg-grid-pattern opacity-5'></div>

        <div className='relative z-10'>
          <div className='w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl'>
            <BanknotesIcon className='w-10 h-10 text-white' />
          </div>

          <h3 className='text-2xl font-bold text-gray-900 mb-3'>
            Welcome to UniPortfolio
          </h3>

          <p className='text-gray-600 mb-8 max-w-md mx-auto leading-relaxed'>
            Connect your{' '}
            <span className='font-semibold text-blue-600'>Ethereum</span> and{' '}
            <span className='font-semibold text-purple-600'>Sui</span> wallets
            to start managing your DeFi portfolio across multiple chains.
          </p>

          <div className='flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4 mb-6'>
            <div className='flex items-center space-x-2 text-sm text-gray-500'>
              <ShieldCheckIcon className='w-4 h-4' />
              <span>Secure & Non-custodial</span>
            </div>
            <div className='flex items-center space-x-2 text-sm text-gray-500'>
              <SparklesIcon className='w-4 h-4' />
              <span>Multi-chain Support</span>
            </div>
          </div>

          <WalletConnect />
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='text-center'>
        <h3 className='text-2xl font-bold text-gray-900 mb-2'>
          Connected Wallets
        </h3>
        <p className='text-gray-600'>
          {connectedWallets.length === 2
            ? 'Perfect! Both ecosystems connected and ready for cross-chain operations.'
            : `${connectedWallets.length}/2 wallets connected. Connect both for full functionality.`}
        </p>
      </div>

      {/* Cross-chain Ready Banner */}
      {connectedWallets.length === 2 && (
        <div className='relative overflow-hidden bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 rounded-2xl p-6 text-white shadow-xl'>
          <div className='absolute inset-0 bg-gradient-to-r from-green-600/20 via-emerald-600/20 to-teal-600/20'></div>
          <div className='relative z-10 flex items-center justify-center space-x-3'>
            <div className='flex items-center space-x-2'>
              <div className='w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center'>
                <LinkIcon className='w-5 h-5 text-white' />
              </div>
              <div>
                <h4 className='text-lg font-bold'>Cross-Chain Ready! 🚀</h4>
                <p className='text-sm text-green-100'>
                  All systems go for cross-chain operations
                </p>
              </div>
            </div>
          </div>

          {/* Animated Background Elements */}
          <div className='absolute -top-4 -right-4 w-24 h-24 bg-white bg-opacity-10 rounded-full animate-pulse'></div>
          <div className='absolute -bottom-4 -left-4 w-16 h-16 bg-white bg-opacity-10 rounded-full animate-pulse delay-1000'></div>
        </div>
      )}

      {/* Wallets Grid */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {connectedWallets.map((wallet, index) => (
          <WalletCard
            key={`${wallet.type}-${index}`}
            wallet={wallet}
            index={index}
          />
        ))}
      </div>

      {/* Next Steps */}
      {connectedWallets.length === 1 && (
        <div className='bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200'>
          <div className='flex items-start space-x-3'>
            <div className='w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0'>
              <span className='text-white text-sm font-bold'>2</span>
            </div>
            <div className='flex-1'>
              <h4 className='font-semibold text-gray-900 mb-2'>
                Connect Your Second Wallet
              </h4>
              <p className='text-gray-600 text-sm mb-4'>
                Connect a{' '}
                {connectedWallets[0].type === 'ethereum' ? 'Sui' : 'Ethereum'}{' '}
                wallet to unlock cross-chain features and complete portfolio
                tracking.
              </p>

              {/* Connection buttons based on missing wallet type */}
              {connectedWallets[0].type === 'ethereum' ? (
                // Need to connect SUI wallet
                <div className='space-y-2'>
                  <button
                    onClick={() => setShowSuiModal(true)}
                    disabled={isConnecting}
                    className='w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
                  >
                    {isConnecting ? 'Connecting...' : 'Connect SUI Wallet'}
                  </button>
                </div>
              ) : (
                // Need to connect Ethereum wallet
                <div className='space-y-2'>
                  <button
                    onClick={() => connectEthereum()}
                    disabled={isConnecting}
                    className='w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
                  >
                    {isConnecting ? 'Connecting...' : 'Connect Ethereum Wallet'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SUI Wallet Selection Modal */}
      {showSuiModal && (
        <div
          className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'
          onClick={() => setShowSuiModal(false)}
        >
          <div
            className='bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-xl'
            onClick={(e) => e.stopPropagation()}
          >
            <div className='flex items-center justify-between mb-4'>
              <h3 className='text-lg font-bold text-gray-900'>
                Choose SUI Wallet
              </h3>
              <button
                onClick={() => setShowSuiModal(false)}
                className='p-1 hover:bg-gray-100 rounded'
              >
                <XMarkIcon className='w-5 h-5 text-gray-500' />
              </button>
            </div>

            <p className='text-gray-600 text-sm mb-6'>
              Select your preferred SUI wallet to connect to your portfolio.
            </p>

            <div className='space-y-3'>
              <button
                onClick={async () => {
                  try {
                    await connectSui('suiet');
                    setShowSuiModal(false);
                  } catch (error) {
                    console.error('Failed to connect Suiet wallet:', error);
                  }
                }}
                disabled={isConnecting}
                className='w-full flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
              >
                <div className='w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center'>
                  <span className='text-lg'>🔵</span>
                </div>
                <div className='text-left flex-1'>
                  <h4 className='font-medium text-gray-900'>Suiet Wallet</h4>
                  <p className='text-sm text-gray-500'>Connect with Suiet</p>
                </div>
              </button>

              <button
                onClick={async () => {
                  try {
                    await connectSui('slush');
                    setShowSuiModal(false);
                  } catch (error) {
                    console.error('Failed to connect Slush wallet:', error);
                  }
                }}
                disabled={isConnecting}
                className='w-full flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
              >
                <div className='w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center'>
                  <span className='text-lg'>🔵</span>
                </div>
                <div className='text-left flex-1'>
                  <h4 className='font-medium text-gray-900'>Slush Wallet</h4>
                  <p className='text-sm text-gray-500'>Connect with Slush</p>
                </div>
              </button>
            </div>

            <div className='mt-6 pt-4 border-t border-gray-200'>
              <p className='text-xs text-gray-500 text-center'>
                Make sure you have one of these wallets installed in your
                browser
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
