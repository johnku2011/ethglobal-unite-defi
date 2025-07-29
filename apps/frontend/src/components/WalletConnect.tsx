'use client'

import React, { useState } from 'react'
import { useWallet } from '@/providers/WalletProvider'
import { formatAddress } from '@/utils/format'

export default function WalletConnect() {
  const {
    connectedWallets,
    isConnecting,
    availableWallets,
    connectEthereum,
    disconnectEthereum,
    connectSui,
    disconnectSui,
    isEthereumConnected,
    isSuiConnected,
  } = useWallet()

  const [showWalletModal, setShowWalletModal] = useState(false)

  const handleConnect = () => {
    setShowWalletModal(true)
  }

  const handleConnectEthereum = () => {
    connectEthereum()
    setShowWalletModal(false)
  }

  const handleConnectSui = (walletType: 'suiet' | 'slush') => {
    connectSui(walletType)
    setShowWalletModal(false)
  }

  const handleDisconnectAll = () => {
    if (isEthereumConnected) disconnectEthereum()
    if (isSuiConnected) disconnectSui()
  }

  // If wallets are connected, show connected state
  if (connectedWallets.length > 0) {
    return (
      <div className="flex items-center space-x-3">
        {/* Connected wallets display */}
        <div className="flex items-center space-x-2">
          {connectedWallets.map((wallet, index) => (
            <div
              key={index}
              className="flex items-center space-x-2 bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm"
            >
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="font-medium">
                {wallet.type === 'ethereum' ? '🔷' : '🔵'} {formatAddress(wallet.address)}
              </span>
              <span className="text-xs text-green-600">({wallet.provider})</span>
            </div>
          ))}
        </div>

        {/* Disconnect button */}
        <button
          onClick={handleDisconnectAll}
          className="text-gray-500 hover:text-gray-700 text-sm font-medium"
        >
          Disconnect All
        </button>
      </div>
    )
  }

  return (
    <>
      {/* Connect button */}
      <button
        onClick={handleConnect}
        disabled={isConnecting}
        className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isConnecting ? 'Connecting...' : 'Connect Wallet'}
      </button>

      {/* Wallet selection modal */}
      {showWalletModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Connect Wallet
              </h3>
              <button
                onClick={() => setShowWalletModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4">
              {/* Ethereum Wallets Section */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                  <span className="mr-2">🔷</span>
                  Ethereum Wallets
                </h4>
                <div className="space-y-2">
                  <button
                    onClick={handleConnectEthereum}
                    disabled={!availableWallets.ethereum || isConnecting}
                    className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        🦊
                      </div>
                      <div className="text-left">
                        <div className="font-medium text-gray-900">MetaMask & More</div>
                        <div className="text-sm text-gray-500">Via Privy (MetaMask, WalletConnect, Coinbase)</div>
                      </div>
                    </div>
                    <div className="text-green-600 text-sm">
                      {availableWallets.ethereum ? 'Available' : 'Not Available'}
                    </div>
                  </button>
                </div>
              </div>

              {/* Sui Wallets Section */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                  <span className="mr-2">🔵</span>
                  Sui Wallets
                </h4>
                <div className="space-y-2">

                  {/* Suiet Wallet */}
                  <button
                    onClick={() => handleConnectSui('suiet')}
                    disabled={!availableWallets.suiet || isConnecting}
                    className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        🟣
                      </div>
                      <div className="text-left">
                        <div className="font-medium text-gray-900">Suiet</div>
                        <div className="text-sm text-gray-500">Popular Sui wallet extension</div>
                      </div>
                    </div>
                    <div className={`text-sm ${availableWallets.suiet ? 'text-green-600' : 'text-red-600'}`}>
                      {availableWallets.suiet ? 'Available' : 'Not Installed'}
                    </div>
                  </button>

                  {/* Slush Wallet */}
                  <button
                    onClick={() => handleConnectSui('slush')}
                    disabled={!availableWallets.slush || isConnecting}
                    className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-200 rounded-full flex items-center justify-center">
                        💧
                      </div>
                      <div className="text-left">
                        <div className="font-medium text-gray-900">Slush</div>
                        <div className="text-sm text-gray-500">Your Sui super app (formerly Sui Wallet)</div>
                      </div>
                    </div>
                    <div className={`text-sm ${availableWallets.slush ? 'text-green-600' : 'text-red-600'}`}>
                      {availableWallets.slush ? 'Available' : 'Not Installed'}
                    </div>
                  </button>
                </div>
              </div>

              {/* Installation Links */}
              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600 mb-2">Don&apos;t have a wallet?</p>
                <div className="flex space-x-2 text-sm">
                  <a
                    href="https://chromewebstore.google.com/detail/suiet-sui-wallet/khpkpbbcccdmmclmpigdgddabeilkdpd"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Install Suiet
                  </a>
                  <span className="text-gray-400">•</span>
                  <a
                    href="https://chromewebstore.google.com/detail/slush-%E2%80%94-a-sui-wallet/opcgpfmipidbgpenhmajoajpbobppdil"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Install Slush
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
} 