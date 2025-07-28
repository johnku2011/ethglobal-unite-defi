import React, { useState } from 'react'

const WalletConnect: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState('')

  const handleConnect = () => {
    // Placeholder implementation - will be replaced with actual wallet connection
    setIsConnected(true)
    setWalletAddress('0x1234...5678')
  }

  const handleDisconnect = () => {
    setIsConnected(false)
    setWalletAddress('')
  }

  if (isConnected) {
    return (
      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-2 bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span>{walletAddress}</span>
        </div>
        <button
          onClick={handleDisconnect}
          className="text-gray-500 hover:text-gray-700 text-sm"
        >
          Disconnect
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={handleConnect}
      className="btn-primary"
    >
      Connect Wallet
    </button>
  )
}

export default WalletConnect 