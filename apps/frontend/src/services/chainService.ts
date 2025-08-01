import type { ConnectedWallet } from '@/providers/WalletProvider';

export interface SupportedChain {
  id: number;
  name: string;
  shortName: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrls: string[];
  blockExplorerUrls: string[];
  testnet: boolean;
}

export const SUPPORTED_CHAINS: SupportedChain[] = [
  {
    id: 1,
    name: 'Ethereum Mainnet',
    shortName: 'Ethereum',
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: ['https://eth.llamarpc.com'],
    blockExplorerUrls: ['https://etherscan.io'],
    testnet: false,
  },
  {
    id: 11155111,
    name: 'Sepolia Testnet',
    shortName: 'Sepolia',
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: ['https://sepolia.drpc.org'],
    blockExplorerUrls: ['https://sepolia.etherscan.io'],
    testnet: true,
  },
  {
    id: 137,
    name: 'Polygon Mainnet',
    shortName: 'Polygon',
    nativeCurrency: {
      name: 'Polygon',
      symbol: 'MATIC',
      decimals: 18,
    },
    rpcUrls: ['https://polygon.llamarpc.com'],
    blockExplorerUrls: ['https://polygonscan.com'],
    testnet: false,
  },
  {
    id: 56,
    name: 'BNB Smart Chain',
    shortName: 'BSC',
    nativeCurrency: {
      name: 'BNB',
      symbol: 'BNB',
      decimals: 18,
    },
    rpcUrls: ['https://bsc.llamarpc.com'],
    blockExplorerUrls: ['https://bscscan.com'],
    testnet: false,
  },
  {
    id: 42161,
    name: 'Arbitrum One',
    shortName: 'Arbitrum',
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: ['https://arbitrum.llamarpc.com'],
    blockExplorerUrls: ['https://arbiscan.io'],
    testnet: false,
  },
  {
    id: 10,
    name: 'Optimism',
    shortName: 'Optimism',
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: ['https://optimism.llamarpc.com'],
    blockExplorerUrls: ['https://optimistic.etherscan.io'],
    testnet: false,
  },
];

export class ChainService {
  /**
   * Get chain information by ID
   */
  static getChainById(chainId: number): SupportedChain | undefined {
    return SUPPORTED_CHAINS.find(chain => chain.id === chainId);
  }

  /**
   * Get all supported chains
   */
  static getAllChains(): SupportedChain[] {
    return SUPPORTED_CHAINS;
  }

  /**
   * Get mainnet chains only
   */
  static getMainnetChains(): SupportedChain[] {
    return SUPPORTED_CHAINS.filter(chain => !chain.testnet);
  }

  /**
   * Get testnet chains only
   */
  static getTestnetChains(): SupportedChain[] {
    return SUPPORTED_CHAINS.filter(chain => chain.testnet);
  }

  /**
   * Check if chain is supported for swaps
   */
  static isChainSupported(chainId: number): boolean {
    return SUPPORTED_CHAINS.some(chain => chain.id === chainId);
  }

  /**
   * Get chain name with fallback
   */
  static getChainName(chainId: number): string {
    const chain = this.getChainById(chainId);
    return chain ? chain.shortName : `Chain ${chainId}`;
  }

  /**
   * Switch wallet to a specific chain
   * This function requests the wallet to switch networks
   */
  static async switchChain(chainId: number): Promise<boolean> {
    try {
      const chain = this.getChainById(chainId);
      if (!chain) {
        throw new Error(`Unsupported chain ID: ${chainId}`);
      }

      // Check if MetaMask is available
      if (!window.ethereum) {
        throw new Error('MetaMask is not installed');
      }

      try {
        // Try to switch to the chain
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: `0x${chainId.toString(16)}` }],
        });
        return true;
      } catch (switchError: any) {
        // If the chain doesn't exist, add it
        if (switchError.code === 4902) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: `0x${chainId.toString(16)}`,
                chainName: chain.name,
                nativeCurrency: chain.nativeCurrency,
                rpcUrls: chain.rpcUrls,
                blockExplorerUrls: chain.blockExplorerUrls,
              },
            ],
          });
          return true;
        }
        throw switchError;
      }
    } catch (error) {
      console.error('Error switching chain:', error);
      return false;
    }
  }

  /**
   * Format wallet for display with chain info
   */
  static formatWalletDisplay(wallet: ConnectedWallet): string {
    const chainName = this.getChainName(wallet.chainId || 1);
    const shortAddress = `${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)}`;
    return `${wallet.provider} (${chainName}) - ${shortAddress}`;
  }

  /**
   * Get network status indicator
   */
  static getNetworkStatus(chainId: number): {
    color: string;
    label: string;
    isTestnet: boolean;
  } {
    const chain = this.getChainById(chainId);
    
    if (!chain) {
      return {
        color: 'gray',
        label: 'Unknown',
        isTestnet: false,
      };
    }

    return {
      color: chain.testnet ? 'yellow' : 'green',
      label: chain.testnet ? 'Testnet' : 'Mainnet',
      isTestnet: chain.testnet,
    };
  }
} 