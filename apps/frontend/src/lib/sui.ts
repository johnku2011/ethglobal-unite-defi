import { SuiClient, getFullnodeUrl } from '@mysten/sui.js/client';
import { Ed25519Keypair } from '@mysten/sui.js/keypairs/ed25519';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { getWallets } from '@mysten/wallet-standard';

// Sui network configurations
export const SUI_NETWORKS = {
  mainnet: {
    id: 'sui:mainnet',
    name: 'Sui Mainnet',
    rpcUrl: getFullnodeUrl('mainnet'),
    explorerUrl: 'https://explorer.sui.io',
  },
  testnet: {
    id: 'sui:testnet',
    name: 'Sui Testnet',
    rpcUrl: getFullnodeUrl('testnet'),
    explorerUrl: 'https://explorer.sui.io/?network=testnet',
  },
  devnet: {
    id: 'sui:devnet',
    name: 'Sui Devnet',
    rpcUrl: getFullnodeUrl('devnet'),
    explorerUrl: 'https://explorer.sui.io/?network=devnet',
  },
};

// Sui client instance
export const suiClient = new SuiClient({
  url: SUI_NETWORKS.mainnet.rpcUrl,
});

// Sui wallet interface
export interface SuiWallet {
  name: string;
  icon: string;
  isInstalled: boolean;
  connect: () => Promise<{ address: string }>;
  disconnect: () => Promise<void>;
  signAndExecuteTransactionBlock: (params: {
    transactionBlock: TransactionBlock;
  }) => Promise<any>;
}

// Wallet detection with retry logic and Wallet Standard
const waitForWallets = (timeout = 5000): Promise<void> => {
  return new Promise((resolve) => {
    let attempts = 0;
    const maxAttempts = 50; // 5 seconds total

    const checkWallets = () => {
      attempts++;

      // Check for Wallet Standard
      const standardWallets = getWallets().get();

      // Check if any wallet objects exist (legacy detection)
      const hasLegacyWallets = !!(
        window.suiWallet ||
        (window as any).sui ||
        (window as any).suiet ||
        (window as any).slush ||
        (window as any).wallet ||
        Object.keys(window).some(
          (key) =>
            key.toLowerCase().includes('wallet') ||
            key.toLowerCase().includes('sui')
        )
      );

      if (
        standardWallets.length > 0 ||
        hasLegacyWallets ||
        attempts >= maxAttempts
      ) {
        console.log(`Wallet detection completed after ${attempts * 100}ms`);
        resolve();
      } else {
        setTimeout(checkWallets, 100);
      }
    };

    checkWallets();
  });
};

// Debug function to log all wallet-like objects
export const debugWalletDetection = async (): Promise<void> => {
  if (typeof window === 'undefined') return;

  // Wait for wallets to potentially load
  await waitForWallets();

  console.group('🔍 Wallet Detection Debug (After Wait)');

  // Check Wallet Standard first
  const standardWallets = getWallets().get();
  console.log('Wallet Standard wallets found:', standardWallets.length);
  standardWallets.forEach((wallet, index) => {
    console.log(`  ${index + 1}. ${wallet.name} (${wallet.version})`);
    console.log(`     - Icon: ${wallet.icon}`);
    console.log(
      `     - Chains: ${wallet.chains.map((c) => c.split(':')[1]).join(', ')}`
    );
    console.log(`     - Features: ${Object.keys(wallet.features).join(', ')}`);
  });

  // Legacy detection for debugging
  const allKeys = Object.keys(window);
  const walletLikeKeys = allKeys.filter((key) => {
    const lowerKey = key.toLowerCase();
    return (
      lowerKey.includes('wallet') ||
      lowerKey.includes('sui') ||
      lowerKey.includes('slush') ||
      lowerKey.includes('suiet') ||
      lowerKey.includes('phantom') ||
      lowerKey.includes('coinbase')
    );
  });

  console.log('All window keys (first 20):', allKeys.slice(0, 20));
  console.log('Wallet-like objects found:', walletLikeKeys);

  // Test specific wallet detection
  const tests = [
    { name: 'window.suiWallet', exists: !!window.suiWallet },
    { name: 'window.sui', exists: !!(window as any).sui },
    { name: 'window.suiet', exists: !!(window as any).suiet },
    { name: 'window.slush', exists: !!(window as any).slush },
    { name: 'window.wallet', exists: !!(window as any).wallet },
  ];

  tests.forEach((test) => {
    console.log(`${test.name}: ${test.exists ? '✅' : '❌'}`);
    if (test.exists) {
      const obj = (window as any)[test.name.split('.')[1]];
      console.log(`  - Object:`, obj);
      console.log(
        `  - Has connect method:`,
        typeof obj?.connect === 'function'
      );
      console.log(`  - Constructor name:`, obj?.constructor?.name);
    }
  });

  console.groupEnd();
};

// Enhanced Slush Wallet detection using Wallet Standard
export const isSlushWalletInstalled = async (): Promise<boolean> => {
  if (typeof window === 'undefined') return false;

  // Wait for wallets to load
  await waitForWallets();

  // Check Wallet Standard first
  const standardWallets = getWallets().get();
  const slushWallet = standardWallets.find(
    (wallet) =>
      wallet.name.toLowerCase().includes('slush') ||
      wallet.name.toLowerCase().includes('sui wallet') ||
      wallet.name.toLowerCase().includes('sui')
  );

  if (slushWallet) {
    console.log('Slush Wallet detected via Wallet Standard:', slushWallet.name);
    return true;
  }

  // Fallback to legacy detection
  const hasWallet = !!(
    (window as any).suiWallet ||
    (window as any).sui ||
    (window as any).slush ||
    (window as any).SuiWallet
  );

  console.log('Slush Wallet detection result (legacy):', hasWallet);
  return hasWallet;
};

// Enhanced Suiet Wallet detection using Wallet Standard
export const isSuietWalletInstalled = async (): Promise<boolean> => {
  if (typeof window === 'undefined') return false;

  // Wait for wallets to load
  await waitForWallets();

  // Check Wallet Standard first
  const standardWallets = getWallets().get();
  const suietWallet = standardWallets.find((wallet) =>
    wallet.name.toLowerCase().includes('suiet')
  );

  if (suietWallet) {
    console.log('Suiet Wallet detected via Wallet Standard:', suietWallet.name);
    return true;
  }

  // Fallback to legacy detection
  const hasWallet = !!(window as any).suiet;
  console.log('Suiet Wallet detection result (legacy):', hasWallet);
  return hasWallet;
};

// Keep this for backward compatibility but make it async
export const isSuiWalletInstalled = async (): Promise<boolean> => {
  // Redirect to Slush detection since Sui Wallet is now Slush
  return isSlushWalletInstalled();
};

// Enhanced connect to Slush Wallet using Wallet Standard
export const connectSlushWallet = async (): Promise<{
  address: string;
} | null> => {
  const isInstalled = await isSlushWalletInstalled();
  if (!isInstalled) {
    throw new Error('Slush Wallet is not installed');
  }

  try {
    // Try Wallet Standard first
    const standardWallets = getWallets().get();
    const slushWallet = standardWallets.find(
      (wallet) =>
        wallet.name.toLowerCase().includes('slush') ||
        wallet.name.toLowerCase().includes('sui wallet') ||
        wallet.name.toLowerCase().includes('sui')
    );

    if (slushWallet && slushWallet.features['standard:connect']) {
      console.log('Connecting via Wallet Standard:', slushWallet.name);
      const connectFeature = slushWallet.features['standard:connect'] as any;
      const result = await connectFeature.connect();
      if (result.accounts && result.accounts.length > 0) {
        return { address: result.accounts[0].address };
      }
    }

    // Fallback to legacy connection
    const wallet =
      (window as any).suiWallet ||
      (window as any).sui ||
      (window as any).slush ||
      (window as any).SuiWallet;

    if (!wallet) {
      throw new Error('No Slush wallet object found');
    }

    console.log('Attempting to connect to Slush wallet (legacy):', wallet);
    const result = await wallet.connect();
    console.log('Slush wallet connection result:', result);
    return result;
  } catch (error) {
    console.error('Failed to connect to Slush Wallet:', error);
    return null;
  }
};

// Enhanced connect to Sui Wallet (redirect to Slush)
export const connectSuiWallet = async (): Promise<{
  address: string;
} | null> => {
  return connectSlushWallet();
};

// Enhanced connect to Suiet Wallet using Wallet Standard
export const connectSuietWallet = async (): Promise<{
  address: string;
} | null> => {
  const isInstalled = await isSuietWalletInstalled();
  if (!isInstalled) {
    throw new Error('Suiet Wallet is not installed');
  }

  try {
    // Try Wallet Standard first
    const standardWallets = getWallets().get();
    const suietWallet = standardWallets.find((wallet) =>
      wallet.name.toLowerCase().includes('suiet')
    );

    if (suietWallet && suietWallet.features['standard:connect']) {
      console.log('Connecting via Wallet Standard:', suietWallet.name);
      const connectFeature = suietWallet.features['standard:connect'] as any;
      const result = await connectFeature.connect();
      if (result.accounts && result.accounts.length > 0) {
        return { address: result.accounts[0].address };
      }
    }

    // Fallback to legacy connection
    const wallet = (window as any).suiet;
    console.log('Attempting to connect to Suiet wallet (legacy):', wallet);
    const result = await wallet.connect();
    console.log('Suiet wallet connection result:', result);
    return result;
  } catch (error) {
    console.error('Failed to connect to Suiet Wallet:', error);
    return null;
  }
};

// Get Sui wallet balance
export const getSuiBalance = async (address: string): Promise<string> => {
  try {
    const balance = await suiClient.getBalance({
      owner: address,
    });
    return balance.totalBalance;
  } catch (error) {
    console.error('Failed to get Sui balance:', error);
    return '0';
  }
};

// Get Sui objects owned by address
export const getSuiObjects = async (address: string) => {
  try {
    const objects = await suiClient.getOwnedObjects({
      owner: address,
      options: {
        showType: true,
        showContent: true,
        showDisplay: true,
      },
    });
    return objects.data;
  } catch (error) {
    console.error('Failed to get Sui objects:', error);
    return [];
  }
};
