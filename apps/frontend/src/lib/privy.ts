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
    // Mainnet chains
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
      id: 56,
      name: 'BNB Smart Chain',
      nativeCurrency: {
        name: 'BNB',
        symbol: 'BNB',
        decimals: 18,
      },
      rpcUrls: {
        default: {
          http: ['https://bsc.llamarpc.com'],
        },
        public: {
          http: ['https://bsc.llamarpc.com'],
        },
      },
      blockExplorers: {
        default: {
          name: 'BscScan',
          url: 'https://bscscan.com',
        },
      },
    },
    {
      id: 42161,
      name: 'Arbitrum One',
      nativeCurrency: {
        name: 'Ether',
        symbol: 'ETH',
        decimals: 18,
      },
      rpcUrls: {
        default: {
          http: ['https://arbitrum.llamarpc.com'],
        },
        public: {
          http: ['https://arbitrum.llamarpc.com'],
        },
      },
      blockExplorers: {
        default: {
          name: 'Arbiscan',
          url: 'https://arbiscan.io',
        },
      },
    },
    {
      id: 10,
      name: 'Optimism',
      nativeCurrency: {
        name: 'Ether',
        symbol: 'ETH',
        decimals: 18,
      },
      rpcUrls: {
        default: {
          http: ['https://optimism.llamarpc.com'],
        },
        public: {
          http: ['https://optimism.llamarpc.com'],
        },
      },
      blockExplorers: {
        default: {
          name: 'Optimistic Etherscan',
          url: 'https://optimistic.etherscan.io',
        },
      },
    },
    {
      id: 8453,
      name: 'Base',
      nativeCurrency: {
        name: 'Ether',
        symbol: 'ETH',
        decimals: 18,
      },
      rpcUrls: {
        default: {
          http: ['https://mainnet.base.org'],
        },
        public: {
          http: ['https://mainnet.base.org'],
        },
      },
      blockExplorers: {
        default: {
          name: 'BaseScan',
          url: 'https://basescan.org',
        },
      },
    },
    // Testnet chains
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
    {
      id: 84532,
      name: 'Base Sepolia',
      nativeCurrency: {
        name: 'Sepolia Ether',
        symbol: 'ETH',
        decimals: 18,
      },
      rpcUrls: {
        default: {
          http: ['https://sepolia.base.org'],
        },
        public: {
          http: ['https://sepolia.base.org'],
        },
      },
      blockExplorers: {
        default: {
          name: 'BaseScan',
          url: 'https://sepolia.basescan.org',
        },
      },
      testnet: true,
    },
    {
      id: 421614,
      name: 'Arbitrum Sepolia',
      nativeCurrency: {
        name: 'Sepolia Ether',
        symbol: 'ETH',
        decimals: 18,
      },
      rpcUrls: {
        default: {
          http: ['https://sepolia-rollup.arbitrum.io/rpc'],
        },
        public: {
          http: ['https://sepolia-rollup.arbitrum.io/rpc'],
        },
      },
      blockExplorers: {
        default: {
          name: 'Arbiscan',
          url: 'https://sepolia.arbiscan.io',
        },
      },
      testnet: true,
    },
  ],
};
