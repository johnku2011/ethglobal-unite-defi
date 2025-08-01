'use client';

import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import WalletDisconnectExample from '@/components/examples/WalletDisconnectExample';
import DualWalletDisplay, {
  CompactDualWalletDisplay,
} from '@/components/DualWalletDisplay';
import WalletConnect from '@/components/WalletConnect';
import WalletStatusCard from '@/components/WalletStatusCard';

export default function WalletDemo() {
  return (
    <DashboardLayout>
      <div className='space-y-6'>
        <div className='text-center'>
          <h1 className='text-3xl font-bold text-gray-900 mb-2'>
            Multi-Chain Wallet Demo
          </h1>
          <p className='text-gray-600'>
            Connect and manage both ETH and SUI wallets for cross-chain
            operations
          </p>
        </div>

        {/* NEW: Professional Dual Wallet Display */}
        <div className='bg-white rounded-lg border border-gray-200 p-6 shadow-sm'>
          <h2 className='text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2'>
            <span className='text-2xl'>🔗</span>
            <span>Advanced Multi-Chain Interface</span>
          </h2>
          <DualWalletDisplay />
        </div>

        {/* Compact Display Demo */}
        <div className='bg-white rounded-lg border border-gray-200 p-6 shadow-sm'>
          <h2 className='text-xl font-semibold text-gray-900 mb-4'>
            Compact Display (for Headers/Navigation)
          </h2>
          <div className='bg-gray-50 p-4 rounded-lg'>
            <CompactDualWalletDisplay />
          </div>
        </div>

        {/* Original Components for Comparison */}
        <div className='bg-white rounded-lg border border-gray-200 p-6 shadow-sm'>
          <h2 className='text-xl font-semibold text-gray-900 mb-4'>
            Original Wallet Interface
          </h2>
          <WalletConnect />
        </div>

        <WalletStatusCard />

        <WalletDisconnectExample />

        {/* Feature Highlights */}
        <div className='bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200'>
          <h2 className='text-xl font-semibold text-gray-900 mb-4'>
            🚀 Multi-Chain Features
          </h2>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <h3 className='font-semibold text-blue-900'>ETH Ecosystem</h3>
              <ul className='text-sm text-blue-700 space-y-1'>
                <li>• Metamask, WalletConnect, Coinbase</li>
                <li>• Multiple EVM chains supported</li>
                <li>• 1inch API integration</li>
                <li>• DeFi protocol access</li>
              </ul>
            </div>
            <div className='space-y-2'>
              <h3 className='font-semibold text-purple-900'>SUI Ecosystem</h3>
              <ul className='text-sm text-purple-700 space-y-1'>
                <li>• Suiet & Slush wallet support</li>
                <li>• Native SUI operations</li>
                <li>• Fast transaction processing</li>
                <li>• Low fees & high throughput</li>
              </ul>
            </div>
          </div>
          <div className='mt-4 p-3 bg-white bg-opacity-70 rounded border-l-4 border-green-500'>
            <p className='text-sm text-gray-700'>
              <strong>Cross-Chain Ready:</strong> When both wallets are
              connected, cross-chain swap functionality will be enabled for
              seamless asset transfers between ETH and SUI ecosystems.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
