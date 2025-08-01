import { useWallet } from '@/providers/WalletProvider';
import toast from 'react-hot-toast';

export function useWalletActions() {
  const {
    connectedWallets,
    isEthereumConnected,
    isSuiConnected,
    connectEthereum,
    disconnectEthereum,
    connectSui,
    disconnectSui,
    isConnecting,
  } = useWallet();

  /**
   * Disconnect a specific wallet by address
   */
  const disconnectWallet = (walletAddress: string) => {
    const wallet = connectedWallets.find((w) => w.address === walletAddress);

    if (!wallet) {
      toast.error('Wallet not found');
      return;
    }

    try {
      if (wallet.type === 'ethereum') {
        disconnectEthereum();
      } else if (wallet.type === 'sui') {
        disconnectSui();
      }
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
      toast.error('Failed to disconnect wallet');
    }
  };

  /**
   * Disconnect all connected wallets
   */
  const disconnectAllWallets = () => {
    try {
      if (isEthereumConnected) {
        disconnectEthereum();
      }
      if (isSuiConnected) {
        disconnectSui();
      }

      if (connectedWallets.length > 0) {
        toast.success('All wallets disconnected');
      }
    } catch (error) {
      console.error('Error disconnecting all wallets:', error);
      toast.error('Failed to disconnect some wallets');
    }
  };

  /**
   * Disconnect wallet by type
   */
  const disconnectWalletByType = (type: 'ethereum' | 'sui') => {
    try {
      if (type === 'ethereum' && isEthereumConnected) {
        disconnectEthereum();
      } else if (type === 'sui' && isSuiConnected) {
        disconnectSui();
      } else {
        toast.error(`No ${type} wallet connected`);
      }
    } catch (error) {
      console.error(`Error disconnecting ${type} wallet:`, error);
      toast.error(`Failed to disconnect ${type} wallet`);
    }
  };

  /**
   * Get wallet info by address
   */
  const getWalletInfo = (walletAddress: string) => {
    return connectedWallets.find((w) => w.address === walletAddress);
  };

  /**
   * Check if a specific wallet is connected
   */
  const isWalletConnected = (walletAddress: string) => {
    return connectedWallets.some((w) => w.address === walletAddress);
  };

  /**
   * Get primary wallet (first connected wallet)
   */
  const getPrimaryWallet = () => {
    return connectedWallets[0] || null;
  };

  return {
    // Connection state
    connectedWallets,
    isConnecting,
    isEthereumConnected,
    isSuiConnected,

    // Connection actions
    connectEthereum,
    connectSui,

    // Disconnection actions
    disconnectWallet,
    disconnectAllWallets,
    disconnectWalletByType,
    disconnectEthereum,
    disconnectSui,

    // Utility functions
    getWalletInfo,
    isWalletConnected,
    getPrimaryWallet,
  };
}
