import React from 'react';
import { useWalletActions } from '@/hooks/useWalletActions';
import WalletDisconnectButton from './WalletDisconnectButton';
import {
  WalletIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

interface WalletStatusCardProps {
  className?: string;
}

export default function WalletStatusCard({
  className = '',
}: WalletStatusCardProps) {
  const {
    connectedWallets,
    isEthereumConnected,
    isSuiConnected,
    connectEthereum,
    connectSui,
  } = useWalletActions();

  const formatAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getChainName = (chainId?: number) => {
    switch (chainId) {
      case 1:
        return 'Ethereum';
      case 137:
        return 'Polygon';
      case 11155111:
        return 'Sepolia';
      default:
        return 'Unknown Chain';
    }
  };

  return (
    <div
      className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}
    >
      <div className='flex items-center justify-between mb-4'>
        <h3 className='text-lg font-semibold text-gray-900 flex items-center gap-2'>
          <WalletIcon className='w-5 h-5' />
          Wallet Status
        </h3>
        {connectedWallets.length > 1 && (
          <WalletDisconnectButton variant='text' size='sm'>
            Disconnect All
          </WalletDisconnectButton>
        )}
      </div>

      {connectedWallets.length === 0 ? (
        <div className='text-center py-8'>
          <ExclamationTriangleIcon className='w-12 h-12 text-gray-400 mx-auto mb-3' />
          <p className='text-gray-500 mb-4'>No wallets connected</p>
          <div className='space-y-2'>
            <button
              onClick={connectEthereum}
              className='w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors'
            >
              Connect Ethereum Wallet
            </button>
            <div className='flex gap-2'>
              <button
                onClick={() => connectSui('suiet')}
                className='flex-1 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors'
              >
                Connect Suiet
              </button>
              <button
                onClick={() => connectSui('slush')}
                className='flex-1 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors'
              >
                Connect Slush
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className='space-y-3'>
          {connectedWallets.map((wallet, index) => (
            <div
              key={`${wallet.type}-${wallet.address}`}
              className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'
            >
              <div className='flex items-center gap-3'>
                <div className='flex items-center gap-2'>
                  <CheckCircleIcon className='w-5 h-5 text-green-500' />
                  <div>
                    <div className='font-medium text-gray-900'>
                      {wallet.provider}
                      {wallet.type === 'ethereum' &&
                        ` (${getChainName(wallet.chainId)})`}
                      {wallet.type === 'sui' && ` (${wallet.network})`}
                    </div>
                    <div className='text-sm text-gray-500'>
                      {formatAddress(wallet.address)}
                    </div>
                  </div>
                </div>
              </div>

              <WalletDisconnectButton
                walletAddress={wallet.address}
                variant='icon'
                size='sm'
              />
            </div>
          ))}
        </div>
      )}

      {/* Connection Status Summary */}
      <div className='mt-4 pt-4 border-t border-gray-200'>
        <div className='grid grid-cols-2 gap-4 text-sm'>
          <div className='flex items-center gap-2'>
            <div
              className={`w-2 h-2 rounded-full ${isEthereumConnected ? 'bg-green-500' : 'bg-gray-300'}`}
            />
            <span
              className={
                isEthereumConnected ? 'text-green-600' : 'text-gray-500'
              }
            >
              Ethereum {isEthereumConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          <div className='flex items-center gap-2'>
            <div
              className={`w-2 h-2 rounded-full ${isSuiConnected ? 'bg-green-500' : 'bg-gray-300'}`}
            />
            <span
              className={isSuiConnected ? 'text-green-600' : 'text-gray-500'}
            >
              Sui {isSuiConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
