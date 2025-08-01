'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useWallet } from './WalletProvider';
import { ChainService } from '@/services/chainService';
import type { SupportedChain } from '@/services/chainService';
import { toast } from 'react-hot-toast';

/**
 * Central Chain State Management Provider
 * Resolves global chain ID management issues
 */

interface ChainContextType {
  // Current active chain information
  currentChain: SupportedChain | null;
  currentChainId: number | null;

  // State checks
  isMainnet: boolean;
  isTestnet: boolean;
  isSupported1inchChain: boolean;

  // Chain management operations
  switchToChain: (chainId: number) => Promise<boolean>;

  // Wallet and chain state
  connectedWallet: {
    address: string;
    chainId: number;
    chainName: string;
  } | null;
}

const ChainContext = createContext<ChainContextType | undefined>(undefined);

/**
 * 1inch API Supported Chain IDs
 * Based on latest 1inch official information (2025)
 *
 * Sorted by feature completeness and recommendation:
 * 1. Ethereum - Most complete features, best liquidity
 * 2. Polygon - Low cost, feature complete
 * 3. Arbitrum - L2 advantages, fast and cheap
 * 4. BSC - Low cost, large user base
 * 5. Base - Emerging L2, rapid growth
 * 6. Optimism - Mature L2
 */
const SUPPORTED_1INCH_MAINNET_CHAINS = [
  1, // Ethereum - 🥇 Most complete features
  137, // Polygon - 🥈 Best for development testing
  42161, // Arbitrum - 🥉 Excellent L2
  56, // BSC - Low cost option
  8453, // Base - Emerging strong L2
  10, // Optimism - Mature L2
  // Recently added networks (API key verification needed):
  // Unichain, Solana, etc.
];

const SUPPORTED_1INCH_TESTNET_CHAINS: number[] = [
  // ⚠️ 1inch API v5 does not support testnets
  // All testnets do not support Portfolio, Swap and other APIs
  // Recommend using low-cost mainnets for development testing
];

export function ChainProvider({ children }: { children: React.ReactNode }) {
  const { connectedWallets } = useWallet();
  const [currentChainId, setCurrentChainId] = useState<number | null>(null);

  // Get current connected Ethereum wallet
  const ethereumWallet = connectedWallets.find(
    (wallet) => wallet.type === 'ethereum'
  );

  // Listen to wallet chain changes
  useEffect(() => {
    if (ethereumWallet?.chainId) {
      setCurrentChainId(ethereumWallet.chainId);
      console.log(`🔗 Chain state updated: ${ethereumWallet.chainId}`);
    } else {
      setCurrentChainId(null);
    }
  }, [ethereumWallet?.chainId]);

  // Listen to browser chain change events
  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      const handleChainChanged = (chainId: string) => {
        const newChainId = parseInt(chainId, 16);
        setCurrentChainId(newChainId);

        const chainInfo = ChainService.getChainById(newChainId);
        const chainName = chainInfo?.shortName || `Chain ${newChainId}`;

        toast.success(`Switched to ${chainName}`);
        console.log(`🔗 Browser chain changed: ${newChainId} (${chainName})`);
      };

      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum?.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, []);

  // Calculate current chain information
  const currentChain = currentChainId
    ? ChainService.getChainById(currentChainId)
    : null;

  // State checks
  const isMainnet = currentChain ? !currentChain.testnet : false;
  const isTestnet = currentChain ? currentChain.testnet : false;
  const isSupported1inchChain = currentChainId
    ? SUPPORTED_1INCH_MAINNET_CHAINS.includes(currentChainId) ||
      SUPPORTED_1INCH_TESTNET_CHAINS.includes(currentChainId)
    : false;

  // Wallet and chain state
  const connectedWallet =
    ethereumWallet && currentChain
      ? {
          address: ethereumWallet.address,
          chainId: currentChainId!,
          chainName: currentChain.shortName,
        }
      : null;

  // Switch chain
  const switchToChain = async (chainId: number): Promise<boolean> => {
    try {
      const success = await ChainService.switchChain(chainId);
      if (success) {
        // Chain state will be updated automatically through event listeners
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to switch chain:', error);
      return false;
    }
  };

  const contextValue: ChainContextType = {
    // Current chain information
    currentChain: currentChain || null,
    currentChainId,

    // State checks
    isMainnet,
    isTestnet,
    isSupported1inchChain,

    // Operations
    switchToChain,

    // Wallet state
    connectedWallet,
  };

  return (
    <ChainContext.Provider value={contextValue}>
      {children}
    </ChainContext.Provider>
  );
}

// Hook to use chain context
export function useChain() {
  const context = useContext(ChainContext);
  if (context === undefined) {
    throw new Error('useChain must be used within a ChainProvider');
  }
  return context;
}

// Convenience hook to get current wallet and chain information
export function useCurrentWalletChain() {
  const { connectedWallet, currentChain, isSupported1inchChain } = useChain();

  return {
    wallet: connectedWallet,
    chain: currentChain,
    canUse1inch: isSupported1inchChain && !!connectedWallet,
    shouldShowTestnetWarning: currentChain?.testnet || false,
  };
}

export default ChainProvider;
