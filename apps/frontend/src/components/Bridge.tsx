import React from 'react'

const Bridge: React.FC = () => {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Bridge</h1>
        <p className="text-gray-600">
          Transfer assets between EVM chains and Sui
        </p>
      </div>

      {/* Bridge Interface */}
      <div className="card">
        <div className="space-y-4">
          {/* From Chain */}
          <div>
            <label className="label">From Chain</label>
            <button className="w-full input text-left flex items-center justify-between">
              <span className="text-gray-500">Select source chain</span>
              <span>▼</span>
            </button>
          </div>

          {/* To Chain */}
          <div>
            <label className="label">To Chain</label>
            <button className="w-full input text-left flex items-center justify-between">
              <span className="text-gray-500">Select destination chain</span>
              <span>▼</span>
            </button>
          </div>

          {/* Asset Selection */}
          <div>
            <label className="label">Asset</label>
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="0.0"
                className="input flex-1"
                disabled
              />
              <button className="btn-secondary">Select Asset</button>
            </div>
          </div>

          {/* Bridge Button */}
          <button className="w-full btn-primary" disabled>
            Connect Wallets to Bridge
          </button>
        </div>
      </div>

      {/* Bridge Details */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Bridge Details
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">You will receive:</span>
            <span className="text-gray-900">-</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Bridge Fee:</span>
            <span className="text-gray-900">-</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Network Fee:</span>
            <span className="text-gray-900">-</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Estimated Time:</span>
            <span className="text-gray-900">-</span>
          </div>
        </div>
      </div>

      {/* Bridge Steps */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          How Bridge Works
        </h3>
        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-semibold">
              1
            </div>
            <div>
              <p className="font-medium text-gray-900">Lock Asset</p>
              <p className="text-sm text-gray-600">
                Asset is locked on the source chain
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-semibold">
              2
            </div>
            <div>
              <p className="font-medium text-gray-900">Bridge Transfer</p>
              <p className="text-sm text-gray-600">
                Wormhole processes the cross-chain transfer
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-semibold">
              3
            </div>
            <div>
              <p className="font-medium text-gray-900">Mint on Destination</p>
              <p className="text-sm text-gray-600">
                Equivalent asset is minted on destination chain
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Bridge 