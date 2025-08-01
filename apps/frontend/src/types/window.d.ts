// Wallet object interfaces
interface SuiWalletObject {
  connect(): Promise<{ address: string }>;
  disconnect(): Promise<void>;
  signAndExecuteTransactionBlock(params: any): Promise<any>;
  [key: string]: any;
}

interface SuietWalletObject {
  connect(): Promise<{ address: string }>;
  disconnect(): Promise<void>;
  signAndExecuteTransactionBlock(params: any): Promise<any>;
  [key: string]: any;
}

// Extend the Window interface to include wallet objects
declare global {
  interface Window {
    suiWallet?: SuiWalletObject;
    sui?: SuiWalletObject;
    SuiWallet?: SuiWalletObject;
    suiet?: SuietWalletObject;
    slush?: SuiWalletObject;
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, callback: (...args: any[]) => void) => void;
      removeListener: (
        event: string,
        callback: (...args: any[]) => void
      ) => void;
    };
  }
}

export {};
