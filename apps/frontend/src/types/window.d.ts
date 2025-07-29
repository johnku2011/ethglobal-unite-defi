// Wallet object interfaces
interface SuiWalletObject {
  connect(): Promise<{ address: string }>
  disconnect(): Promise<void>
  signAndExecuteTransactionBlock(params: any): Promise<any>
  [key: string]: any
}

interface SuietWalletObject {
  connect(): Promise<{ address: string }>
  disconnect(): Promise<void>
  signAndExecuteTransactionBlock(params: any): Promise<any>
  [key: string]: any
}

// Extend the Window interface to include wallet objects
declare global {
  interface Window {
    suiWallet?: SuiWalletObject
    sui?: SuiWalletObject
    SuiWallet?: SuiWalletObject
    suiet?: SuietWalletObject
    slush?: SuiWalletObject
  }
}

export {} 