import { PrivyClientConfig } from '@privy-io/react-auth';

export const privyConfig: PrivyClientConfig = {
  appearance: {
    theme: 'light',
    accentColor: '#3b82f6',
    showWalletLoginFirst: true,
  },
  loginMethods: ['wallet', 'email'],
  embeddedWallets: {
    createOnLogin: 'users-without-wallets',
    noPromptOnSignature: false,
  },
  supportedChains: [
    {
      id: 1,
      name: 'Ethereum',
      nativeCurrency: {
        name: 'Ether',
        symbol: 'ETH',
        decimals: 18,
      },
      rpcUrls: {
        default: {
          http: ['https://eth.llamarpc.com'],
        },
        public: {
          http: ['https://eth.llamarpc.com'],
        },
      },
      blockExplorers: {
        default: {
          name: 'Etherscan',
          url: 'https://etherscan.io',
        },
      },
    },
    {
      id: 137,
      name: 'Polygon',
      nativeCurrency: {
        name: 'MATIC',
        symbol: 'MATIC',
        decimals: 18,
      },
      rpcUrls: {
        default: {
          http: ['https://polygon.llamarpc.com'],
        },
        public: {
          http: ['https://polygon.llamarpc.com'],
        },
      },
      blockExplorers: {
        default: {
          name: 'PolygonScan',
          url: 'https://polygonscan.com',
        },
      },
    },
    {
      id: 11155111,
      name: 'Sepolia',
      nativeCurrency: {
        name: 'Sepolia Ether',
        symbol: 'ETH',
        decimals: 18,
      },
      rpcUrls: {
        default: {
          http: ['https://sepolia.drpc.org'],
        },
        public: {
          http: ['https://sepolia.drpc.org'],
        },
      },
      blockExplorers: {
        default: {
          name: 'Etherscan',
          url: 'https://sepolia.etherscan.io',
        },
      },
      testnet: true,
    },
  ],
};
