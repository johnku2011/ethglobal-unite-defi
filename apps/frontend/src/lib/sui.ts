import { SuiClient, getFullnodeUrl } from '@mysten/sui.js/client'
import { Ed25519Keypair } from '@mysten/sui.js/keypairs/ed25519'
import { TransactionBlock } from '@mysten/sui.js/transactions'

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
}

// Sui client instance
export const suiClient = new SuiClient({
  url: SUI_NETWORKS.mainnet.rpcUrl,
})

// Sui wallet interface
export interface SuiWallet {
  name: string
  icon: string
  isInstalled: boolean
  connect: () => Promise<{ address: string }>
  disconnect: () => Promise<void>
  signAndExecuteTransactionBlock: (params: {
    transactionBlock: TransactionBlock
  }) => Promise<any>
}

// Check if Sui Wallet is available
export const isSuiWalletInstalled = (): boolean => {
  return typeof window !== 'undefined' && 'suiWallet' in window
}

// Check if Suiet Wallet is available
export const isSuietWalletInstalled = (): boolean => {
  return typeof window !== 'undefined' && 'suiet' in window
}

// Connect to Sui Wallet
export const connectSuiWallet = async (): Promise<{ address: string } | null> => {
  if (!isSuiWalletInstalled()) {
    throw new Error('Sui Wallet is not installed')
  }

  try {
    const wallet = (window as any).suiWallet
    const result = await wallet.connect()
    return result
  } catch (error) {
    console.error('Failed to connect to Sui Wallet:', error)
    return null
  }
}

// Connect to Suiet Wallet
export const connectSuietWallet = async (): Promise<{ address: string } | null> => {
  if (!isSuietWalletInstalled()) {
    throw new Error('Suiet Wallet is not installed')
  }

  try {
    const wallet = (window as any).suiet
    const result = await wallet.connect()
    return result
  } catch (error) {
    console.error('Failed to connect to Suiet Wallet:', error)
    return null
  }
}

// Get Sui wallet balance
export const getSuiBalance = async (address: string): Promise<string> => {
  try {
    const balance = await suiClient.getBalance({
      owner: address,
    })
    return balance.totalBalance
  } catch (error) {
    console.error('Failed to get Sui balance:', error)
    return '0'
  }
}

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
    })
    return objects.data
  } catch (error) {
    console.error('Failed to get Sui objects:', error)
    return []
  }
} 