'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useWallet } from '@/providers/WalletProvider';
import {
  Cog6ToothIcon,
  BellIcon,
  EyeIcon,
  EyeSlashIcon,
  TrashIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';

export default function Settings() {
  const { connectedWallets, disconnectEthereum, disconnectSui } = useWallet();
  const [showBalances, setShowBalances] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [slippage, setSlippage] = useState('0.5');

  return (
    <DashboardLayout>
      <div className='space-y-6'>
        {/* Header */}
        <div className='bg-white rounded-xl shadow-soft p-6 border border-gray-100'>
          <div className='flex items-center space-x-3 mb-2'>
            <Cog6ToothIcon className='w-6 h-6 text-primary-600' />
            <h2 className='text-2xl font-bold text-gray-900'>Settings</h2>
          </div>
          <p className='text-gray-600'>
            Manage your UniPortfolio preferences and settings
          </p>
        </div>

        {/* General Settings */}
        <div className='bg-white rounded-xl shadow-soft p-6 border border-gray-100'>
          <h3 className='text-lg font-semibold text-gray-900 mb-4'>General</h3>

          <div className='space-y-4'>
            {/* Show Balances */}
            <div className='flex items-center justify-between'>
              <div className='flex items-center space-x-3'>
                {showBalances ? (
                  <EyeIcon className='w-5 h-5 text-gray-400' />
                ) : (
                  <EyeSlashIcon className='w-5 h-5 text-gray-400' />
                )}
                <div>
                  <div className='font-medium text-gray-900'>Show Balances</div>
                  <div className='text-sm text-gray-500'>
                    Display portfolio values and balances
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowBalances(!showBalances)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  showBalances ? 'bg-primary-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    showBalances ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Notifications */}
            <div className='flex items-center justify-between'>
              <div className='flex items-center space-x-3'>
                <BellIcon className='w-5 h-5 text-gray-400' />
                <div>
                  <div className='font-medium text-gray-900'>Notifications</div>
                  <div className='text-sm text-gray-500'>
                    Get alerts for transactions and price changes
                  </div>
                </div>
              </div>
              <button
                onClick={() => setNotifications(!notifications)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  notifications ? 'bg-primary-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    notifications ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Trading Settings */}
        <div className='bg-white rounded-xl shadow-soft p-6 border border-gray-100'>
          <h3 className='text-lg font-semibold text-gray-900 mb-4'>Trading</h3>

          <div className='space-y-4'>
            {/* Default Slippage */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Default Slippage Tolerance
              </label>
              <div className='flex items-center space-x-2'>
                <button
                  onClick={() => setSlippage('0.1')}
                  className={`px-3 py-2 text-sm rounded ${
                    slippage === '0.1'
                      ? 'bg-primary-100 text-primary-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  0.1%
                </button>
                <button
                  onClick={() => setSlippage('0.5')}
                  className={`px-3 py-2 text-sm rounded ${
                    slippage === '0.5'
                      ? 'bg-primary-100 text-primary-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  0.5%
                </button>
                <button
                  onClick={() => setSlippage('1.0')}
                  className={`px-3 py-2 text-sm rounded ${
                    slippage === '1.0'
                      ? 'bg-primary-100 text-primary-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  1.0%
                </button>
                <input
                  type='text'
                  value={slippage}
                  onChange={(e) => setSlippage(e.target.value)}
                  className='w-20 px-3 py-2 text-sm border border-gray-300 rounded text-center'
                  placeholder='Custom'
                />
              </div>
            </div>
          </div>
        </div>

        {/* Connected Wallets */}
        <div className='bg-white rounded-xl shadow-soft p-6 border border-gray-100'>
          <h3 className='text-lg font-semibold text-gray-900 mb-4'>
            Connected Wallets ({connectedWallets.length})
          </h3>

          <div className='space-y-3'>
            {connectedWallets.map((wallet, index) => (
              <div
                key={index}
                className='flex items-center justify-between p-4 bg-gray-50 rounded-lg'
              >
                <div className='flex items-center space-x-3'>
                  <div className='text-xl'>
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
                <button
                  onClick={() => {
                    if (wallet.type === 'ethereum') {
                      disconnectEthereum();
                    } else {
                      disconnectSui();
                    }
                  }}
                  className='flex items-center space-x-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors'
                >
                  <ArrowRightOnRectangleIcon className='w-4 h-4' />
                  <span>Disconnect</span>
                </button>
              </div>
            ))}

            {connectedWallets.length === 0 && (
              <div className='text-center py-8'>
                <div className='w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                  <Cog6ToothIcon className='w-6 h-6 text-gray-400' />
                </div>
                <p className='text-gray-500'>No wallets connected</p>
              </div>
            )}
          </div>
        </div>

        {/* Data & Privacy */}
        <div className='bg-white rounded-xl shadow-soft p-6 border border-gray-100'>
          <h3 className='text-lg font-semibold text-gray-900 mb-4'>
            Data & Privacy
          </h3>

          <div className='space-y-4'>
            <button className='flex items-center space-x-3 p-3 w-full text-left hover:bg-gray-50 rounded-lg transition-colors'>
              <TrashIcon className='w-5 h-5 text-gray-400' />
              <div>
                <div className='font-medium text-gray-900'>
                  Clear Transaction History
                </div>
                <div className='text-sm text-gray-500'>
                  Remove all local transaction data
                </div>
              </div>
            </button>

            <button className='flex items-center space-x-3 p-3 w-full text-left hover:bg-gray-50 rounded-lg transition-colors'>
              <TrashIcon className='w-5 h-5 text-gray-400' />
              <div>
                <div className='font-medium text-gray-900'>
                  Reset All Settings
                </div>
                <div className='text-sm text-gray-500'>
                  Restore default preferences
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* About */}
        <div className='bg-white rounded-xl shadow-soft p-6 border border-gray-100'>
          <h3 className='text-lg font-semibold text-gray-900 mb-4'>About</h3>

          <div className='space-y-3'>
            <div className='flex justify-between'>
              <span className='text-gray-600'>Version</span>
              <span className='font-medium'>1.0.0</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-gray-600'>Build</span>
              <span className='font-medium font-mono text-sm'>dev-2024.1</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-gray-600'>Network</span>
              <span className='font-medium'>Mainnet</span>
            </div>
          </div>

          <div className='mt-6 pt-4 border-t border-gray-100'>
            <p className='text-sm text-gray-500 mb-2'>
              UniPortfolio is an open-source DeFi portfolio management platform.
            </p>
            <div className='flex space-x-4 text-sm'>
              <a href='#' className='text-primary-600 hover:text-primary-700'>
                Documentation
              </a>
              <a href='#' className='text-primary-600 hover:text-primary-700'>
                GitHub
              </a>
              <a href='#' className='text-primary-600 hover:text-primary-700'>
                Support
              </a>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
