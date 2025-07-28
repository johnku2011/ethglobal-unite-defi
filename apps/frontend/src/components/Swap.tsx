import React from 'react'

const Swap: React.FC = () => {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Swap</h1>
        <p className="text-gray-600">
          Exchange tokens with optimal rates using 1inch
        </p>
      </div>

      {/* Swap Interface */}
      <div className="card">
        <div className="space-y-4">
          {/* From Token */}
          <div>
            <label className="label">From</label>
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="0.0"
                className="input flex-1"
                disabled
              />
              <button className="btn-secondary">Select Token</button>
            </div>
          </div>

          {/* Swap Icon */}
          <div className="flex justify-center">
            <button className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors duration-200">
              🔄
            </button>
          </div>

          {/* To Token */}
          <div>
            <label className="label">To</label>
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="0.0"
                className="input flex-1"
                disabled
              />
              <button className="btn-secondary">Select Token</button>
            </div>
          </div>

          {/* Swap Button */}
          <button className="w-full btn-primary" disabled>
            Connect Wallet to Swap
          </button>
        </div>
      </div>

      {/* Swap Details */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Swap Details
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Expected Output:</span>
            <span className="text-gray-900">-</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Price Impact:</span>
            <span className="text-gray-900">-</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Slippage Tolerance:</span>
            <span className="text-gray-900">1%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Network Fee:</span>
            <span className="text-gray-900">-</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Swap 