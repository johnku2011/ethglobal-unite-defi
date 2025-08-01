import React from 'react';
import { useWallet } from '@/providers/WalletProvider';
import { usePrivy } from '@privy-io/react-auth';

export default function WalletDebugInfo() {
  const { connectedWallets, isEthereumConnected } = useWallet();
  const { user, ready, authenticated } = usePrivy();

  if (!ready || !authenticated) {
    return (
      <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-4 m-4'>
        <h3 className='font-semibold text-yellow-800 mb-2'>
          🔍 Wallet Debug Info
        </h3>
        <p className='text-yellow-700'>Wallet not ready or not authenticated</p>
        <div className='text-sm text-yellow-600 mt-2'>
          <div>Ready: {ready ? '✅' : '❌'}</div>
          <div>Authenticated: {authenticated ? '✅' : '❌'}</div>
        </div>
      </div>
    );
  }

  return (
    <div className='bg-blue-50 border border-blue-200 rounded-lg p-4 m-4'>
      <h3 className='font-semibold text-blue-800 mb-4'>🔍 Wallet Debug Info</h3>

      {/* Privy User Data */}
      <div className='mb-4'>
        <h4 className='font-medium text-blue-700 mb-2'>Privy User Data:</h4>
        <div className='text-sm text-blue-600 space-y-1 font-mono'>
          <div>Address: {user?.wallet?.address || 'None'}</div>
          <div>Chain ID (hex): {user?.wallet?.chainId || 'None'}</div>
          <div>
            Chain ID (decimal):{' '}
            {user?.wallet?.chainId ? parseInt(user.wallet.chainId, 16) : 'None'}
          </div>
          <div>Wallet Type: {(user?.wallet as any)?.walletType || 'None'}</div>
          <div>Connected Via: {user?.wallet?.connectorType || 'None'}</div>
        </div>
      </div>

      {/* Connected Wallets */}
      <div className='mb-4'>
        <h4 className='font-medium text-blue-700 mb-2'>
          Connected Wallets ({connectedWallets.length}):
        </h4>
        {connectedWallets.length === 0 ? (
          <p className='text-blue-600 text-sm'>No wallets connected</p>
        ) : (
          <div className='space-y-2'>
            {connectedWallets.map((wallet, index) => (
              <div key={index} className='bg-blue-100 rounded p-2 text-sm'>
                <div className='font-mono'>
                  <div>
                    <strong>Address:</strong> {wallet.address}
                  </div>
                  <div>
                    <strong>Type:</strong> {wallet.type}
                  </div>
                  <div>
                    <strong>Provider:</strong> {wallet.provider}
                  </div>
                  <div>
                    <strong>Chain ID:</strong> {wallet.chainId || 'undefined'}
                  </div>
                  <div>
                    <strong>Network:</strong> {wallet.network || 'undefined'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Current Network Detection */}
      <div className='mb-4'>
        <h4 className='font-medium text-blue-700 mb-2'>Network Detection:</h4>
        <div className='text-sm text-blue-600'>
          <div>Ethereum Connected: {isEthereumConnected ? '✅' : '❌'}</div>
          <div>Current Chain: {getChainName(connectedWallets[0]?.chainId)}</div>
        </div>
      </div>

      {/* Manual Chain Check */}
      <div className='mb-4'>
        <h4 className='font-medium text-blue-700 mb-2'>Manual Chain Check:</h4>
        <button
          onClick={checkCurrentChain}
          className='px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600'
        >
          Check Current Chain
        </button>
        <div
          id='chain-check-result'
          className='text-sm text-blue-600 mt-2'
        ></div>
      </div>

      {/* Raw User Object */}
      <details className='mt-4'>
        <summary className='font-medium text-blue-700 cursor-pointer'>
          Raw User Object (Click to expand)
        </summary>
        <pre className='text-xs text-blue-600 mt-2 overflow-x-auto bg-blue-100 p-2 rounded'>
          {JSON.stringify(user, null, 2)}
        </pre>
      </details>
    </div>
  );
}

function getChainName(chainId?: number): string {
  const chainNames: Record<number, string> = {
    1: 'Ethereum Mainnet',
    11155111: 'Sepolia Testnet',
    137: 'Polygon',
    56: 'BSC',
    42161: 'Arbitrum',
    10: 'Optimism',
  };
  return chainId ? chainNames[chainId] || `Unknown (${chainId})` : 'No Chain';
}

async function checkCurrentChain() {
  const resultDiv = document.getElementById('chain-check-result');
  if (!resultDiv) return;

  try {
    if (!window.ethereum) {
      resultDiv.textContent = '❌ No ethereum provider found';
      return;
    }

    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    const accounts = await window.ethereum.request({ method: 'eth_accounts' });

    resultDiv.innerHTML = `
      <div>Current Chain ID (hex): ${chainId}</div>
      <div>Current Chain ID (decimal): ${parseInt(chainId, 16)}</div>
      <div>Current Accounts: ${accounts.length}</div>
      <div>First Account: ${accounts[0] || 'None'}</div>
    `;
  } catch (error) {
    resultDiv.textContent = `❌ Error: ${error}`;
  }
}
