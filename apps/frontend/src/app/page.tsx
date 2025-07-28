'use client'

import React from 'react'
import WalletConnect from '@/components/WalletConnect'
import { useWallet } from '@/providers/WalletProvider'

export default function Home() {
  const { connectedWallets } = useWallet()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gradient">
                UniPortfolio
              </h1>
            </div>
            
            <WalletConnect />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6 fade-in">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome to UniPortfolio
            </h1>
            <p className="text-gray-600">
              Unified DeFi portfolio management across multiple blockchains
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Total Portfolio Value
              </h3>
              <p className="text-3xl font-bold text-primary-600">$0.00</p>
              <p className="text-sm text-gray-500 mt-1">+0.00% (24h)</p>
            </div>

            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Connected Wallets
              </h3>
              <p className="text-3xl font-bold text-accent-600">{connectedWallets.length}</p>
              <p className="text-sm text-gray-500 mt-1">
                {connectedWallets.map(w => w.type).join(' + ') || 'None connected'}
              </p>
            </div>

            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Assets Tracked
              </h3>
              <p className="text-3xl font-bold text-success-600">0</p>
              <p className="text-sm text-gray-500 mt-1">Across all chains</p>
            </div>
          </div>

          {/* Connected Wallets Info */}
          {connectedWallets.length > 0 && (
            <div className="card">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Connected Wallets
              </h3>
              <div className="space-y-3">
                {connectedWallets.map((wallet, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">
                        {wallet.type === 'ethereum' ? '🔷' : '🔵'}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {wallet.type === 'ethereum' ? 'Ethereum' : 'Sui'} Wallet
                        </div>
                        <div className="text-sm text-gray-500 font-mono">
                          {wallet.address}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        {wallet.provider}
                      </div>
                      {wallet.chainId && (
                        <div className="text-xs text-gray-500">
                          Chain ID: {wallet.chainId}
                        </div>
                      )}
                      {wallet.network && (
                        <div className="text-xs text-gray-500">
                          {wallet.network}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Getting Started */}
          <div className="card">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Getting Started
            </h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                  connectedWallets.length > 0 
                    ? 'bg-green-100 text-green-600' 
                    : 'bg-primary-100 text-primary-600'
                }`}>
                  {connectedWallets.length > 0 ? '✓' : '1'}
                </div>
                <p className={connectedWallets.length > 0 ? 'text-green-700' : 'text-gray-700'}>
                  Connect your Ethereum and Sui wallets
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center font-semibold">
                  2
                </div>
                <p className="text-gray-500">View your portfolio across all chains</p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center font-semibold">
                  3
                </div>
                <p className="text-gray-500">Start swapping and bridging assets</p>
              </div>
            </div>
          </div>

          {/* Features Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="card text-center">
              <div className="text-4xl mb-4">💼</div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Portfolio Tracking
              </h4>
              <p className="text-gray-600 text-sm">
                Monitor all your assets across Ethereum, Polygon, and Sui in one place
              </p>
            </div>

            <div className="card text-center">
              <div className="text-4xl mb-4">🔄</div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Optimal Swaps
              </h4>
              <p className="text-gray-600 text-sm">
                Get the best rates using 1inch aggregated liquidity
              </p>
            </div>

            <div className="card text-center">
              <div className="text-4xl mb-4">🌉</div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Cross-Chain Bridge
              </h4>
              <p className="text-gray-600 text-sm">
                Seamlessly move assets between EVM chains and Sui
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
