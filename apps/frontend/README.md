# 🚀 UniPortfolio - Unified DeFi Portfolio Management

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.3-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![1inch API](https://img.shields.io/badge/1inch_API-v6.1-FF6B6B?style=for-the-badge)](https://1inch.dev/)

> **Unified DeFi portfolio management across multiple blockchains with real-time tracking, token swapping, and comprehensive analytics.**

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Getting Started](#-getting-started)
- [API Integration](#-api-integration)
- [Development](#-development)
- [Deployment](#-deployment)
- [Contributing](#-contributing)

## 🎯 Overview

UniPortfolio is a sophisticated Next.js-based DeFi portfolio management application that provides a unified interface for tracking assets, executing swaps, and analyzing performance across multiple blockchains. Built with modern web technologies and integrated with 1inch's comprehensive API ecosystem.

### Key Highlights

- 🔗 **Multi-Chain Support**: Ethereum, Polygon, BNB Chain, Arbitrum, Optimism, Base + testnets
- 💼 **Portfolio Tracking**: Real-time value tracking across all supported chains
- 🔄 **DEX Aggregation**: Token swapping via 1inch DEX aggregator
- 📊 **Analytics**: Historical charts and performance metrics
- 🔐 **Secure**: Proxy architecture for API key security
- ⚡ **Performance**: Intelligent caching and error handling

## ✨ Features

### 🏦 Portfolio Management
- **Real-time Portfolio Value**: Track total portfolio value across multiple chains
- **Asset Breakdown**: Detailed view of holdings by token and chain
- **Historical Charts**: Portfolio value over time with customizable timeframes
- **Performance Metrics**: ROI tracking and profit/loss analysis

### 🔄 DeFi Operations
- **Token Swapping**: Execute swaps across multiple DEXs via 1inch aggregation
- **Quote Generation**: Real-time swap quotes with gas estimates
- **Approval Management**: Automatic token approval handling
- **Transaction History**: Complete swap and transaction tracking

### 🌐 Multi-Chain Support
- **Ethereum Mainnet & Testnets**: Full support for Ethereum ecosystem
- **Layer 2 Networks**: Optimism, Arbitrum, Base, Polygon
- **Alternative Chains**: BNB Smart Chain
- **Sui Blockchain**: Custom integration for Sui ecosystem

### 🔐 Wallet Integration
- **Multi-Wallet Support**: MetaMask, WalletConnect, and more via Privy
- **Sui Wallets**: Suiet and Slush wallet integration
- **Chain Switching**: Seamless network switching
- **Transaction Signing**: Secure transaction execution

## 🛠️ Tech Stack

### Frontend Framework
- **[Next.js 14](https://nextjs.org/)** - React-based full-stack framework with App Router
- **[React 18](https://react.dev/)** - Component library for UI
- **[TypeScript 5.0](https://www.typescriptlang.org/)** - Type safety throughout

### Styling & UI
- **[Tailwind CSS 3.3](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Heroicons](https://heroicons.com/)** - Icon library
- **[Recharts](https://recharts.org/)** - Data visualization
- **[React Hot Toast](https://react-hot-toast.com/)** - Notifications

### State Management
- **[Zustand](https://zustand-demo.pmnd.rs/)** - Lightweight state management
- **[TanStack React Query](https://tanstack.com/query)** - Server state management
- **[React Context](https://react.dev/learn/passing-data-deeply-with-context)** - Wallet and chain state

### Wallet & Blockchain
- **[Privy](https://privy.io/)** - Wallet authentication system
- **[Wagmi](https://wagmi.sh/)** - Ethereum wallet interactions
- **[Ethers.js](https://docs.ethers.org/)** - Ethereum library
- **[Sui.js](https://sdk.mystenlabs.com/)** - Sui blockchain integration

### APIs & Data
- **[1inch API](https://1inch.dev/)** - Portfolio, Swap, Price, Balance, History APIs
- **[CoinGecko API](https://www.coingecko.com/en/api)** - Alternative price data
- **[Axios](https://axios-http.com/)** - HTTP client

## 📄 Architecture

### Proxy Architecture Pattern
All external API calls are proxied through Next.js API routes for security and CORS handling:

```typescript
// Frontend calls internal API
const response = await fetch('/api/portfolio/0x123...', {
  method: 'GET',
  headers: { 'Content-Type': 'application/json' }
});

// Next.js API route proxies to 1inch
const oneinchResponse = await fetch(
  'https://api.1inch.dev/portfolio/portfolio/v5.0/general/current_value?addresses=0x123...',
  {
    headers: {
      'Authorization': `Bearer ${process.env.NEXT_PUBLIC_1INCH_API_KEY}`,
      'Accept': 'application/json'
    }
  }
);
```

### Multi-Level Error Handling
- **Axios Interceptors**: Request/response transformation
- **Service Layer**: Retry logic with exponential backoff
- **React Query**: Intelligent retry and caching
- **Error Boundaries**: Runtime error handling

### Caching Strategy
- **Portfolio data**: 5-minute cache
- **Price data**: 30-second cache
- **Token lists**: 5-minute cache
- **Balance data**: 30-second cache
- **Quotes**: 5-second cache (price volatility)

## 🚀 Getting Started

### Prerequisites
- **Node.js** >= 18.0.0
- **pnpm** >= 8.0.0
- **1inch API Key** - Get from [1inch Developer Portal](https://portal.1inch.dev/)
- **Privy App ID** - Get from [Privy Console](https://console.privy.io/)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd UniPortfolio
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   # Copy environment template
   cp .env.example .env.local
   
   # Or use the automated setup script
   chmod +x setup-api-key.sh
   ./setup-api-key.sh
   ```

4. **Configure environment variables**
   ```bash
   # .env.local
   NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id
   NEXT_PUBLIC_1INCH_API_KEY=your_1inch_api_key
   ```

5. **Run development server**
   ```bash
   pnpm dev
   ```

6. **Open your browser**
   ```
   http://localhost:3000
   ```

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_PRIVY_APP_ID` | Privy application ID for wallet authentication | ✅ |
| `NEXT_PUBLIC_1INCH_API_KEY` | 1inch API key for DeFi operations | ✅ |

## 🔗 API Integration

### 1inch API Ecosystem

The project integrates with **5 different 1inch API services**:

#### 1. Portfolio API (v5.0)
- **Base URL**: `https://api.1inch.dev/portfolio/portfolio/v5.0`
- **Purpose**: Portfolio value tracking and analytics
- **Endpoints**:
  - `GET /general/current_value` - Current portfolio value
  - `GET /general/chart` - Historical value charts
  - `GET /tokens/snapshot` - Portfolio holdings

#### 2. Swap API (v6.1)
- **Base URL**: `https://api.1inch.dev/swap/v6.1`
- **Purpose**: DEX aggregation and token swapping
- **Endpoints**:
  - `GET /{chainId}/quote` - Get swap quotes
  - `GET /{chainId}/swap` - Execute swaps
  - `GET /{chainId}/tokens` - Available tokens
  - `GET /{chainId}/approve/*` - Approval management

#### 3. Spot Price API (v1.1)
- **Base URL**: `https://api.1inch.dev/price/v1.1`
- **Purpose**: Real-time token prices
- **Endpoints**:
  - `GET /{chainId}/{tokens}?currency=USD` - Token prices

#### 4. Balance API (v1.2)
- **Base URL**: `https://api.1inch.dev/balance/v1.2`
- **Purpose**: Token balance tracking
- **Endpoints**:
  - `GET /{chainId}/{address}` - Wallet balances

#### 5. History API (v2.0)
- **Base URL**: `https://api.1inch.dev/history/v2.0`
- **Purpose**: Transaction history
- **Endpoints**:
  - `GET /history/{address}/events` - Transaction events
  - `GET /history/{address}/events/swaps` - Swap transactions
  - `GET /history/transaction/{chainId}/{txHash}` - Transaction details

### Supported Networks

| Network | Chain ID | Type | Status |
|---------|----------|------|--------|
| Ethereum | 1 | Mainnet | ✅ |
| Polygon | 137 | Mainnet | ✅ |
| BNB Chain | 56 | Mainnet | ✅ |
| Arbitrum | 42161 | Mainnet | ✅ |
| Optimism | 10 | Mainnet | ✅ |
| Base | 8453 | Mainnet | ✅ |
| Sepolia | 11155111 | Testnet | ✅ |
| Base Sepolia | 84532 | Testnet | ✅ |
| Arbitrum Sepolia | 421614 | Testnet | ✅ |

## 💻 Development

### Available Scripts

```bash
# Development
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server

# Code Quality
pnpm lint         # Run ESLint
pnpm lint:fix     # Fix ESLint errors
pnpm format       # Format code with Prettier
pnpm format:check # Check code formatting
pnpm type-check   # Run TypeScript type checking

# Testing
pnpm test         # Run tests (if configured)
```

### Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes (proxy endpoints)
│   ├── portfolio/         # Portfolio pages
│   ├── swap/             # Swap interface
│   └── transactions/     # Transaction history
├── components/            # React components
│   ├── portfolio/        # Portfolio components
│   ├── transactions/     # Transaction components
│   └── WalletConnect.tsx # Wallet integration
├── hooks/                # Custom React hooks
├── lib/                  # Utility libraries
├── providers/            # Context providers
├── services/             # API services
├── stores/               # Zustand stores
├── types/                # TypeScript types
└── utils/                # Utility functions
```

### Code Quality

- **ESLint** - Code linting with Next.js configuration
- **Prettier** - Code formatting
- **TypeScript** - Static type checking
- **Husky** - Git hooks (if configured)

### Development Guidelines

1. **Type Safety**: Use TypeScript for all new code
2. **Error Handling**: Implement proper error boundaries
3. **Performance**: Use React Query for data fetching
4. **Styling**: Follow Tailwind CSS conventions
5. **Testing**: Write tests for critical functionality

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect repository** to Vercel
2. **Set environment variables** in Vercel dashboard
3. **Deploy** automatically on push to main branch

### Manual Deployment

1. **Build the application**
   ```bash
   pnpm build
   ```

2. **Start production server**
   ```bash
   pnpm start
   ```

### Environment Variables for Production

Ensure all required environment variables are set in your deployment platform:

```bash
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id
NEXT_PUBLIC_1INCH_API_KEY=your_1inch_api_key
```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Run quality checks**
   ```bash
   pnpm lint:fix
   pnpm format
   pnpm type-check
   ```
5. **Commit your changes**
   ```bash
   git commit -m 'Add amazing feature'
   ```
6. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
7. **Open a Pull Request**

### Contribution Guidelines

- Follow the existing code style
- Add tests for new functionality
- Update documentation as needed
- Ensure all checks pass before submitting

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Acknowledgments

- **[1inch](https://1inch.dev/)** - For comprehensive DeFi APIs
- **[Privy](https://privy.io/)** - For wallet authentication
- **[Next.js](https://nextjs.org/)** - For the amazing React framework
- **[Tailwind CSS](https://tailwindcss.com/)** - For the utility-first CSS framework

## 📞 Support

- **Documentation**: Check the [docs/](docs/) folder
- **Issues**: [GitHub Issues](https://github.com/your-repo/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-repo/discussions)

---

**Built with ❤️ for the DeFi community** 