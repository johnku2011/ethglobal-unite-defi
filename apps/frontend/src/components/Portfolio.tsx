import React from 'react'

const Portfolio: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Portfolio</h1>
        <button className="btn-primary">Refresh</button>
      </div>

      {/* Portfolio Summary */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Portfolio Summary
        </h2>
        <div className="text-center py-12">
          <div className="text-6xl mb-4">💼</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No wallets connected
          </h3>
          <p className="text-gray-600 mb-6">
            Connect your wallets to view your portfolio
          </p>
          <button className="btn-primary">Connect Wallet</button>
        </div>
      </div>

      {/* Chain Breakdown */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Assets by Chain
        </h2>
        <div className="text-center py-8">
          <p className="text-gray-500">
            Asset breakdown will appear here once wallets are connected
          </p>
        </div>
      </div>
    </div>
  )
}

export default Portfolio 