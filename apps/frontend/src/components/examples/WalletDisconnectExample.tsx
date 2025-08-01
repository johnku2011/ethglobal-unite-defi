import React from 'react';
import { useWalletActions } from '@/hooks/useWalletActions';
import WalletDisconnectButton from '../WalletDisconnectButton';
import WalletStatusCard from '../WalletStatusCard';

/**
 * Example component showing different ways to use wallet disconnect functionality
 * This is for demonstration purposes - you can use these patterns in your app
 */
export default function WalletDisconnectExample() {
  const {
    connectedWallets,
    disconnectWallet,
    disconnectAllWallets,
    disconnectWalletByType,
    getPrimaryWallet,
  } = useWalletActions();

  const primaryWallet = getPrimaryWallet();

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Wallet Disconnect Examples
      </h2>

      {/* Wallet Status Card */}
      <WalletStatusCard />

      {/* Button Examples */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Disconnect Button Examples
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Default Button */}
          <div className="space-y-2">
            <h4 className="font-medium text-gray-700">Default Button</h4>
            <WalletDisconnectButton />
          </div>

          {/* Icon Button */}
          <div className="space-y-2">
            <h4 className="font-medium text-gray-700">Icon Button</h4>
            <WalletDisconnectButton variant="icon" size="lg" />
          </div>

          {/* Text Button */}
          <div className="space-y-2">
            <h4 className="font-medium text-gray-700">Text Button</h4>
            <WalletDisconnectButton variant="text">
              Disconnect Wallets
            </WalletDisconnectButton>
          </div>

          {/* Small Button */}
          <div className="space-y-2">
            <h4 className="font-medium text-gray-700">Small Button</h4>
            <WalletDisconnectButton size="sm" />
          </div>

          {/* Specific Wallet */}
          {primaryWallet && (
            <div className="space-y-2">
              <h4 className="font-medium text-gray-700">Disconnect Primary</h4>
              <WalletDisconnectButton 
                walletAddress={primaryWallet.address}
                size="sm"
              />
            </div>
          )}
        </div>
      </div>

      {/* Custom Function Examples */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Custom Function Examples
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => disconnectWalletByType('ethereum')}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            disabled={connectedWallets.filter(w => w.type === 'ethereum').length === 0}
          >
            Disconnect Ethereum Only
          </button>

          <button
            onClick={() => disconnectWalletByType('sui')}
            className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
            disabled={connectedWallets.filter(w => w.type === 'sui').length === 0}
          >
            Disconnect Sui Only
          </button>

          <button
            onClick={disconnectAllWallets}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            disabled={connectedWallets.length === 0}
          >
            Disconnect All (Custom)
          </button>

          {primaryWallet && (
            <button
              onClick={() => disconnectWallet(primaryWallet.address)}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              Disconnect Primary Wallet
            </button>
          )}
        </div>
      </div>

      {/* Code Examples */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Usage Examples
        </h3>
        
        <div className="space-y-4 text-sm">
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-800 mb-2">1. Using the Hook</h4>
            <pre className="text-gray-600 overflow-x-auto">
{`import { useWalletActions } from '@/hooks/useWalletActions';

function MyComponent() {
  const { disconnectWallet, disconnectAllWallets } = useWalletActions();
  
  return (
    <button onClick={() => disconnectWallet('0x123...')}>
      Disconnect Specific Wallet
    </button>
  );
}`}
            </pre>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-800 mb-2">2. Using the Component</h4>
            <pre className="text-gray-600 overflow-x-auto">
{`import WalletDisconnectButton from '@/components/WalletDisconnectButton';

// Disconnect all wallets
<WalletDisconnectButton />

// Disconnect specific wallet
<WalletDisconnectButton walletAddress="0x123..." variant="icon" />

// Text button
<WalletDisconnectButton variant="text">Disconnect</WalletDisconnectButton>`}
            </pre>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-800 mb-2">3. Using the Status Card</h4>
            <pre className="text-gray-600 overflow-x-auto">
{`import WalletStatusCard from '@/components/WalletStatusCard';

// Complete wallet management UI
<WalletStatusCard className="max-w-md" />`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
} 