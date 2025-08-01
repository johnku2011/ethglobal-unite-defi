'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { PrivyProvider, usePrivy } from '@privy-io/react-auth';
import { WagmiProvider } from '@privy-io/wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createConfig, http } from 'wagmi';
import { mainnet, polygon, sepolia } from 'wagmi/chains';
import { privyConfig } from '@/lib/privy';
import {
  connectSuiWallet,
  connectSuietWallet,
  connectSlushWallet,
  isSuiWalletInstalled,
  isSuietWalletInstalled,
  isSlushWalletInstalled,
  debugWalletDetection,
  SUI_NETWORKS,
} from '@/lib/sui';
import toast from 'react-hot-toast';

// Wagmi configuration for Privy
const wagmiConfig = createConfig({
  chains: [mainnet, polygon, sepolia],
  transports: {
    [mainnet.id]: http(),
    [polygon.id]: http(),
    [sepolia.id]: http(),
  },
});

// Query client for React Query
const queryClient = new QueryClient();

// Wallet context types
export interface ConnectedWallet {
  address: string;
  type: 'ethereum' | 'sui';
  provider: string;
  chainId?: number;
  network?: string;
}

interface WalletContextType {
  // Ethereum wallets (via Privy)
  isEthereumConnected: boolean;
  ethereumAddress: string | null;

  // Sui wallets
  isSuiConnected: boolean;
  suiAddress: string | null;
  suiProvider: string | null;

  // Combined state
  connectedWallets: ConnectedWallet[];
  isConnecting: boolean;

  // Actions
  connectEthereum: () => void;
  disconnectEthereum: () => void;
  connectSui: (walletType: 'suiet' | 'slush') => Promise<void>;
  disconnectSui: () => void;

  // Wallet availability
  availableWallets: {
    ethereum: boolean;
    suiet: boolean;
    slush: boolean;
  };
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

// Internal provider component that uses Privy hooks
function WalletProviderInternal({ children }: { children: React.ReactNode }) {
  const { ready, authenticated, user, login, logout } = usePrivy();

  // Sui wallet state
  const [isSuiConnected, setIsSuiConnected] = useState(false);
  const [suiAddress, setSuiAddress] = useState<string | null>(null);
  const [suiProvider, setSuiProvider] = useState<string | null>(null);

  // General state
  const [isConnecting, setIsConnecting] = useState(false);
  const [currentChainId, setCurrentChainId] = useState<number | null>(null);

  // Check wallet availability
  const [availableWallets, setAvailableWallets] = useState({
    ethereum: true, // Privy handles this
    suiet: false,
    slush: false,
  });

  useEffect(() => {
    const detectWallets = async () => {
      if (typeof window !== 'undefined') {
        // Debug wallet detection in development
        if (process.env.NODE_ENV === 'development') {
          console.log('🔍 Running wallet detection...');
          await debugWalletDetection();
        }

        const [suiet, slush] = await Promise.all([
          isSuietWalletInstalled(),
          isSlushWalletInstalled(),
        ]);

        setAvailableWallets({
          ethereum: true,
          suiet,
          slush,
        });
      }
    };

    detectWallets();
  }, []);

  // Listen for chain changes
  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      const handleChainChanged = (chainId: string) => {
        const newChainId = parseInt(chainId, 16);
        setCurrentChainId(newChainId);
        console.log('Chain changed to:', newChainId);

        // Force re-render by triggering a state change
        window.location.reload(); // Temporary solution
      };

      window.ethereum.on('chainChanged', handleChainChanged);

      // Get initial chain ID
      window.ethereum
        .request({ method: 'eth_chainId' })
        .then((chainId: string) => {
          setCurrentChainId(parseInt(chainId, 16));
        })
        .catch(console.error);

      return () => {
        window.ethereum?.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, []);

  // Ethereum wallet info from Privy
  const isEthereumConnected = ready && authenticated && !!user?.wallet?.address;
  const ethereumAddress = user?.wallet?.address || null;

  // Connect to Ethereum via Privy
  const connectEthereum = () => {
    if (!ready) return;
    setIsConnecting(true);

    try {
      login();
      toast.success('Ethereum wallet connected!');
    } catch (error: any) {
      toast.error('Failed to connect Ethereum wallet');
      console.error('Ethereum connection error:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  // Disconnect Ethereum via Privy
  const disconnectEthereum = () => {
    logout();
    toast.success('Ethereum wallet disconnected');
  };

  // Connect to Sui wallet
  const connectSui = async (walletType: 'suiet' | 'slush') => {
    setIsConnecting(true);

    try {
      let result: { address: string } | null = null;
      let providerName = '';

      if (walletType === 'suiet') {
        if (!availableWallets.suiet) {
          throw new Error('Suiet Wallet is not installed');
        }
        result = await connectSuietWallet();
        providerName = 'Suiet';
      } else if (walletType === 'slush') {
        if (!availableWallets.slush) {
          throw new Error('Slush Wallet is not installed');
        }
        result = await connectSlushWallet();
        providerName = 'Slush';
      }

      if (result && result.address) {
        setSuiAddress(result.address);
        setSuiProvider(providerName);
        setIsSuiConnected(true);
        toast.success(`${providerName} connected!`);
      } else {
        throw new Error('Failed to get wallet address');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to connect Sui wallet');
      console.error('Sui connection error:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  // Disconnect Sui wallet
  const disconnectSui = () => {
    setSuiAddress(null);
    setSuiProvider(null);
    setIsSuiConnected(false);
    toast.success('Sui wallet disconnected');
  };

  // Combined connected wallets
  const connectedWallets: ConnectedWallet[] = [];

  if (isEthereumConnected && ethereumAddress) {
    // Use current chain ID from ethereum provider if available, fallback to Privy data
    const detectedChainId =
      currentChainId ||
      (user?.wallet?.chainId ? parseInt(user.wallet.chainId, 16) : 1);

    connectedWallets.push({
      address: ethereumAddress,
      type: 'ethereum',
      provider: 'Privy',
      chainId: detectedChainId,
    });
  }

  if (isSuiConnected && suiAddress) {
    connectedWallets.push({
      address: suiAddress,
      type: 'sui',
      provider: suiProvider || 'Unknown',
      network: SUI_NETWORKS.mainnet.name,
    });
  }

  const contextValue: WalletContextType = {
    // Ethereum
    isEthereumConnected,
    ethereumAddress,

    // Sui
    isSuiConnected,
    suiAddress,
    suiProvider,

    // Combined
    connectedWallets,
    isConnecting,

    // Actions
    connectEthereum,
    disconnectEthereum,
    connectSui,
    disconnectSui,

    // Availability
    availableWallets,
  };

  return (
    <WalletContext.Provider value={contextValue}>
      {children}
    </WalletContext.Provider>
  );
}

// Main wallet provider component
export function WalletProvider({ children }: { children: React.ReactNode }) {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;

  // If no app ID during build, show a placeholder message
  if (!appId) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-50'>
        <div className='text-center'>
          <h2 className='text-2xl font-bold text-gray-900 mb-4'>
            Privy Configuration Required
          </h2>
          <p className='text-gray-600 mb-6'>
            Please set your NEXT_PUBLIC_PRIVY_APP_ID environment variable.
          </p>
          <p className='text-sm text-gray-500'>
            Get your App ID from{' '}
            <a
              href='https://console.privy.io/'
              target='_blank'
              rel='noopener noreferrer'
              className='text-blue-600 hover:text-blue-800'
            >
              Privy Console
            </a>
          </p>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <PrivyProvider appId={appId} config={privyConfig}>
        <WagmiProvider config={wagmiConfig}>
          <WalletProviderInternal>{children}</WalletProviderInternal>
        </WagmiProvider>
      </PrivyProvider>
    </QueryClientProvider>
  );
}

// Hook to use wallet context
export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}
