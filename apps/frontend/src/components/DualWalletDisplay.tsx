'use client';

import React, { useState } from 'react';
import { useWallet, type ConnectedWallet } from '@/providers/WalletProvider';
import { formatAddress } from '@/utils/format';
import {
  WalletIcon,
  ChevronDownIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  LinkIcon,
} from '@heroicons/react/24/outline';

/**
 * Professional Dual Wallet Display Component
 * Shows ETH + SUI wallets with advanced management features
 */
export default function DualWalletDisplay() {
  const {
    connectedWallets,
    isConnecting,
    availableWallets,
    connectEthereum,
    connectSui,
    disconnectEthereum,
    disconnectSui,
    isEthereumConnected,
    isSuiConnected,
  } = useWallet();

  const [showConnectionModal, setShowConnectionModal] = useState(false);
  const [expandedView, setExpandedView] = useState(false);

  // Separate wallets by type
  const ethereumWallet = connectedWallets.find((w) => w.type === 'ethereum');
  const suiWallet = connectedWallets.find((w) => w.type === 'sui');

  const getWalletStatusColor = (isConnected: boolean) => {
    return isConnected
      ? 'bg-green-50 border-green-200 text-green-800'
      : 'bg-gray-50 border-gray-200 text-gray-600';
  };

  const getChainName = (chainId?: number) => {
    const chains = {
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
    return chains[chainId as keyof typeof chains] || `Chain ${chainId}`;
  };

  const WalletCard = ({
    title,
    icon,
    wallet,
    isConnected,
    onConnect,
    onDisconnect,
    connectionOptions,
  }: {
    title: string;
    icon: string;
    wallet?: ConnectedWallet;
    isConnected: boolean;
    onConnect: () => void;
    onDisconnect: () => void;
    connectionOptions?: { label: string; action: () => void }[];
  }) => (
    <div
      className={`relative border rounded-lg p-4 transition-all duration-200 ${getWalletStatusColor(
        isConnected
      )}`}
    >
      <div className='flex items-center justify-between mb-3'>
        <div className='flex items-center space-x-2'>
          <span className='text-2xl'>{icon}</span>
          <h3 className='font-semibold text-base'>{title}</h3>
        </div>
        <div className='flex items-center space-x-2'>
          {isConnected ? (
            <CheckCircleIcon className='w-5 h-5 text-green-500' />
          ) : (
            <ExclamationTriangleIcon className='w-5 h-5 text-gray-400' />
          )}
        </div>
      </div>

      {isConnected && wallet ? (
        <div className='space-y-2'>
          <div>
            <p className='text-sm font-medium'>Address:</p>
            <p className='font-mono text-sm bg-white px-2 py-1 rounded border'>
              {formatAddress(wallet.address)}
            </p>
          </div>
          {wallet.type === 'ethereum' && wallet.chainId && (
            <div>
              <p className='text-sm font-medium'>Network:</p>
              <p className='text-sm'>{getChainName(wallet.chainId)}</p>
            </div>
          )}
          {wallet.type === 'sui' && wallet.network && (
            <div>
              <p className='text-sm font-medium'>Network:</p>
              <p className='text-sm'>{wallet.network}</p>
            </div>
          )}
          <div>
            <p className='text-sm font-medium'>Provider:</p>
            <p className='text-sm'>{wallet.provider}</p>
          </div>
          <button
            onClick={onDisconnect}
            className='w-full mt-3 px-3 py-2 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors'
          >
            Disconnect {title}
          </button>
        </div>
      ) : (
        <div className='text-center py-4'>
          <p className='text-sm text-gray-500 mb-3'>Not connected</p>
          {connectionOptions && connectionOptions.length > 1 ? (
            <div className='space-y-2'>
              {connectionOptions.map((option, index) => (
                <button
                  key={index}
                  onClick={option.action}
                  disabled={isConnecting}
                  className='w-full px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
                >
                  {isConnecting ? 'Connecting...' : option.label}
                </button>
              ))}
            </div>
          ) : (
            <button
              onClick={onConnect}
              disabled={isConnecting}
              className='w-full px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
            >
              {isConnecting ? 'Connecting...' : `Connect ${title}`}
            </button>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className='space-y-4'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <h2 className='text-xl font-bold text-gray-900 flex items-center space-x-2'>
          <WalletIcon className='w-6 h-6' />
          <span>Multi-Chain Wallets</span>
        </h2>
        <div className='flex items-center space-x-2'>
          <span className='text-sm text-gray-500'>
            {connectedWallets.length}/2 Connected
          </span>
          <button
            onClick={() => setExpandedView(!expandedView)}
            className='p-1 hover:bg-gray-100 rounded'
          >
            <ChevronDownIcon
              className={`w-4 h-4 transition-transform ${
                expandedView ? 'rotate-180' : ''
              }`}
            />
          </button>
        </div>
      </div>

      {/* Connection Status Summary */}
      <div className='flex items-center space-x-4 p-3 bg-gray-50 rounded-lg'>
        <div className='flex items-center space-x-2'>
          <div
            className={`w-3 h-3 rounded-full ${
              isEthereumConnected ? 'bg-green-500' : 'bg-gray-300'
            }`}
          />
          <span className='text-sm font-medium'>ETH Ecosystem</span>
        </div>
        <div className='flex items-center space-x-2'>
          <div
            className={`w-3 h-3 rounded-full ${
              isSuiConnected ? 'bg-purple-500' : 'bg-gray-300'
            }`}
          />
          <span className='text-sm font-medium'>SUI Ecosystem</span>
        </div>
        <div className='ml-auto'>
          {connectedWallets.length === 2 && (
            <div className='flex items-center space-x-1 text-sm text-green-600'>
              <LinkIcon className='w-4 h-4' />
              <span>Cross-chain Ready</span>
            </div>
          )}
        </div>
      </div>

      {/* Wallet Cards */}
      {expandedView && (
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          {/* ETH Ecosystem Wallet */}
          <WalletCard
            title='ETH Ecosystem'
            icon='🔷'
            wallet={ethereumWallet}
            isConnected={isEthereumConnected}
            onConnect={connectEthereum}
            onDisconnect={disconnectEthereum}
          />

          {/* SUI Ecosystem Wallet */}
          <WalletCard
            title='SUI Ecosystem'
            icon='🔵'
            wallet={suiWallet}
            isConnected={isSuiConnected}
            onConnect={() => setShowConnectionModal(true)}
            onDisconnect={disconnectSui}
            connectionOptions={
              showConnectionModal
                ? [
                    {
                      label: 'Connect with Suiet',
                      action: () => {
                        connectSui('suiet');
                        setShowConnectionModal(false);
                      },
                    },
                    {
                      label: 'Connect with Slush',
                      action: () => {
                        connectSui('slush');
                        setShowConnectionModal(false);
                      },
                    },
                  ]
                : undefined
            }
          />
        </div>
      )}

      {/* Compact View */}
      {!expandedView && (
        <div className='space-y-2'>
          {connectedWallets.map((wallet, index) => (
            <div
              key={`${wallet.type}-${index}`}
              className='flex items-center justify-between p-3 bg-white border rounded-lg'
            >
              <div className='flex items-center space-x-3'>
                <span className='text-xl'>
                  {wallet.type === 'ethereum' ? '🔷' : '🔵'}
                </span>
                <div>
                  <p className='font-medium text-sm'>
                    {wallet.type === 'ethereum' ? 'ETH' : 'SUI'} -{' '}
                    {wallet.provider}
                  </p>
                  <p className='text-xs text-gray-500 font-mono'>
                    {formatAddress(wallet.address)}
                  </p>
                </div>
              </div>
              <div className='flex items-center space-x-2'>
                {wallet.type === 'ethereum' && wallet.chainId && (
                  <span className='text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded'>
                    {getChainName(wallet.chainId)}
                  </span>
                )}
                <CheckCircleIcon className='w-4 h-4 text-green-500' />
              </div>
            </div>
          ))}

          {connectedWallets.length === 0 && (
            <div className='text-center py-8 text-gray-500'>
              <WalletIcon className='w-12 h-12 mx-auto mb-3 text-gray-300' />
              <p className='text-sm'>No wallets connected</p>
              <button
                onClick={() => setExpandedView(true)}
                className='mt-2 text-blue-600 hover:text-blue-800 text-sm flex items-center space-x-1 mx-auto'
              >
                <PlusIcon className='w-4 h-4' />
                <span>Connect Wallets</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Cross-chain Features Teaser */}
      {connectedWallets.length === 2 && (
        <div className='mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg'>
          <div className='flex items-center space-x-3'>
            <LinkIcon className='w-6 h-6 text-blue-600' />
            <div>
              <h3 className='font-semibold text-blue-900'>
                Cross-Chain Ready! 🚀
              </h3>
              <p className='text-sm text-blue-700'>
                Both ETH and SUI wallets connected. Cross-chain swaps will be
                available soon.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SUI Wallet Selection Modal */}
      {showConnectionModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-lg p-6 max-w-md w-full mx-4'>
            <h3 className='text-lg font-semibold mb-4'>Choose SUI Wallet</h3>
            <div className='space-y-3'>
              <button
                onClick={() => {
                  connectSui('suiet');
                  setShowConnectionModal(false);
                }}
                disabled={!availableWallets.suiet || isConnecting}
                className='w-full p-3 text-left border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
              >
                <div className='flex items-center space-x-3'>
                  <div className='w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center'>
                    🔵
                  </div>
                  <div>
                    <p className='font-medium'>Suiet Wallet</p>
                    <p className='text-sm text-gray-500'>
                      {availableWallets.suiet ? 'Available' : 'Not installed'}
                    </p>
                  </div>
                </div>
              </button>
              <button
                onClick={() => {
                  connectSui('slush');
                  setShowConnectionModal(false);
                }}
                disabled={!availableWallets.slush || isConnecting}
                className='w-full p-3 text-left border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
              >
                <div className='flex items-center space-x-3'>
                  <div className='w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center'>
                    🟣
                  </div>
                  <div>
                    <p className='font-medium'>Slush Wallet</p>
                    <p className='text-sm text-gray-500'>
                      {availableWallets.slush ? 'Available' : 'Not installed'}
                    </p>
                  </div>
                </div>
              </button>
            </div>
            <div className='mt-4 flex justify-end space-x-2'>
              <button
                onClick={() => setShowConnectionModal(false)}
                className='px-4 py-2 text-gray-600 hover:text-gray-800'
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Compact version for use in headers/navigation
 */
export function CompactDualWalletDisplay({
  variant = 'default',
}: {
  variant?: 'default' | 'light';
}) {
  const { connectedWallets, isEthereumConnected, isSuiConnected } = useWallet();

  const getWalletStyle = (walletType: 'ethereum' | 'sui') => {
    if (variant === 'light') {
      return walletType === 'ethereum'
        ? 'bg-blue-100 text-blue-800 border border-blue-200'
        : 'bg-purple-100 text-purple-800 border border-purple-200';
    }
    return walletType === 'ethereum'
      ? 'bg-blue-50 text-blue-700 border border-blue-200'
      : 'bg-purple-50 text-purple-700 border border-purple-200';
  };

  return (
    <div className='flex items-center space-x-2'>
      {connectedWallets.map((wallet, index) => (
        <div
          key={`${wallet.type}-${index}`}
          className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium ${getWalletStyle(wallet.type)}`}
        >
          <div
            className={`w-2 h-2 rounded-full ${
              wallet.type === 'ethereum' ? 'bg-blue-500' : 'bg-purple-500'
            }`}
          />
          <span className='font-medium'>
            {wallet.type === 'ethereum' ? '🔷' : '🔵'}{' '}
            {formatAddress(wallet.address)}
          </span>
          {wallet.type === 'ethereum' && wallet.chainId && (
            <span className='text-xs opacity-75'>
              (
              {wallet.chainId === 1
                ? 'ETH'
                : wallet.chainId === 137
                  ? 'MATIC'
                  : 'L2'}
              )
            </span>
          )}
        </div>
      ))}
      {connectedWallets.length === 0 && (
        <div
          className={`text-xs ${variant === 'light' ? 'text-gray-400' : 'text-gray-500'}`}
        >
          No wallets connected
        </div>
      )}
      {connectedWallets.length === 2 && (
        <div
          className={`flex items-center space-x-1 text-xs font-medium ${
            variant === 'light'
              ? 'text-green-700 bg-green-100 border border-green-200'
              : 'text-green-600'
          } px-2 py-1 rounded-full`}
        >
          <LinkIcon className='w-3 h-3' />
          <span>Cross-chain Ready</span>
        </div>
      )}
    </div>
  );
}
