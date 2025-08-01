'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useWallet } from './WalletProvider';
import { ChainService } from '@/services/chainService';
import type { SupportedChain } from '@/services/chainService';
import { toast } from 'react-hot-toast';

/**
 * 中央鏈狀態管理 Provider
 * 解決全域 chain ID 管理問題
 */

interface ChainContextType {
  // 當前活動的鏈信息
  currentChain: SupportedChain | null;
  currentChainId: number | null;

  // 狀態檢查
  isMainnet: boolean;
  isTestnet: boolean;
  isSupported1inchChain: boolean;

  // 鏈管理操作
  switchToChain: (chainId: number) => Promise<boolean>;

  // 錢包和鏈狀態
  connectedWallet: {
    address: string;
    chainId: number;
    chainName: string;
  } | null;
}

const ChainContext = createContext<ChainContextType | undefined>(undefined);

/**
 * 1inch API 支持的鏈 ID
 * 基於最新的1inch文檔和實際測試
 */
const SUPPORTED_1INCH_MAINNET_CHAINS = [
  1, // Ethereum
  56, // BSC
  137, // Polygon
  42161, // Arbitrum
  10, // Optimism
  8453, // Base
];

const SUPPORTED_1INCH_TESTNET_CHAINS: number[] = [
  // 1inch 對 testnet 支持非常有限
  // 大多數 testnet 不支持 Portfolio API
];

export function ChainProvider({ children }: { children: React.ReactNode }) {
  const { connectedWallets } = useWallet();
  const [currentChainId, setCurrentChainId] = useState<number | null>(null);

  // 獲取當前連接的以太坊錢包
  const ethereumWallet = connectedWallets.find(
    (wallet) => wallet.type === 'ethereum'
  );

  // 監聽錢包鏈變化
  useEffect(() => {
    if (ethereumWallet?.chainId) {
      setCurrentChainId(ethereumWallet.chainId);
      console.log(`🔗 鏈狀態更新: ${ethereumWallet.chainId}`);
    } else {
      setCurrentChainId(null);
    }
  }, [ethereumWallet?.chainId]);

  // 監聽瀏覽器鏈變化事件
  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      const handleChainChanged = (chainId: string) => {
        const newChainId = parseInt(chainId, 16);
        setCurrentChainId(newChainId);

        const chainInfo = ChainService.getChainById(newChainId);
        const chainName = chainInfo?.shortName || `Chain ${newChainId}`;

        toast.success(`已切換到 ${chainName}`);
        console.log(`🔗 瀏覽器鏈變化: ${newChainId} (${chainName})`);
      };

      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum?.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, []);

  // 計算當前鏈信息
  const currentChain = currentChainId
    ? ChainService.getChainById(currentChainId)
    : null;

  // 狀態檢查
  const isMainnet = currentChain ? !currentChain.testnet : false;
  const isTestnet = currentChain ? currentChain.testnet : false;
  const isSupported1inchChain = currentChainId
    ? SUPPORTED_1INCH_MAINNET_CHAINS.includes(currentChainId) ||
      SUPPORTED_1INCH_TESTNET_CHAINS.includes(currentChainId)
    : false;

  // 錢包和鏈狀態
  const connectedWallet =
    ethereumWallet && currentChain
      ? {
          address: ethereumWallet.address,
          chainId: currentChainId!,
          chainName: currentChain.shortName,
        }
      : null;

  // 切換鏈
  const switchToChain = async (chainId: number): Promise<boolean> => {
    try {
      const success = await ChainService.switchChain(chainId);
      if (success) {
        // 鏈狀態會通過事件監聽器自動更新
        return true;
      }
      return false;
    } catch (error) {
      console.error('切換鏈失敗:', error);
      return false;
    }
  };

  const contextValue: ChainContextType = {
    // 當前鏈信息
    currentChain,
    currentChainId,

    // 狀態檢查
    isMainnet,
    isTestnet,
    isSupported1inchChain,

    // 操作
    switchToChain,

    // 錢包狀態
    connectedWallet,
  };

  return (
    <ChainContext.Provider value={contextValue}>
      {children}
    </ChainContext.Provider>
  );
}

// Hook 來使用鏈上下文
export function useChain() {
  const context = useContext(ChainContext);
  if (context === undefined) {
    throw new Error('useChain 必須在 ChainProvider 內使用');
  }
  return context;
}

// 便捷 Hook 來獲取當前錢包和鏈信息
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
