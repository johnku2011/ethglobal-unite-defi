import React from 'react'

const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6">
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
          <p className="text-3xl font-bold text-accent-600">0</p>
          <p className="text-sm text-gray-500 mt-1">EVM + Sui wallets</p>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Assets Tracked
          </h3>
          <p className="text-3xl font-bold text-success-600">0</p>
          <p className="text-sm text-gray-500 mt-1">Across all chains</p>
        </div>
      </div>

      {/* Getting Started */}
      <div className="card">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Getting Started
        </h3>
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-semibold">
              1
            </div>
            <p className="text-gray-700">Connect your EVM and Sui wallets</p>
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
  )
}

export default Dashboard 