# UniPortfolio

Unified DeFi portfolio management across multiple blockchains with seamless cross-chain swap capabilities.

## Features

- 🌐 **Multi-Chain Support**: Track assets across Ethereum, Polygon, and Sui
- 💰 **Portfolio Tracking**: Real-time portfolio valuation and analytics
- 🔄 **Optimal Swaps**: Best rates using 1inch aggregated liquidity
- 🌉 **Cross-Chain Bridge**: Seamless asset transfers via Wormhole
- 🔐 **Secure Wallet Integration**: Support for MetaMask, WalletConnect, Sui Wallet, and more
- 📱 **Responsive Design**: Beautiful, modern UI that works on all devices

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Wallet Integration**: wagmi (EVM) + @mysten/sui.js (Sui)
- **API Integration**: 1inch API, Wormhole API
- **Testing**: Jest + React Testing Library + Cypress

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ETHGlobal_Unite_UniPortfolio
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` and add your API keys:
   - Get 1inch API key from [1inch Developer Portal](https://portal.1inch.dev/)
   - Get Infura Project ID from [Infura](https://infura.io/)
   - Get WalletConnect Project ID from [WalletConnect Cloud](https://cloud.walletconnect.com/)

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm test` - Run unit tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Generate test coverage report
- `npm run cypress:open` - Open Cypress test runner
- `npm run cypress:run` - Run Cypress tests headlessly

## Project Structure

```
src/
├── components/          # React components
│   ├── Layout.tsx      # Main layout component
│   ├── Dashboard.tsx   # Dashboard page
│   ├── Portfolio.tsx   # Portfolio tracking
│   ├── Swap.tsx       # Token swap interface
│   ├── Bridge.tsx     # Cross-chain bridge
│   └── WalletConnect.tsx # Wallet connection
├── services/           # Service layer (to be implemented)
├── hooks/             # Custom React hooks (to be implemented)
├── stores/            # Zustand stores (to be implemented)
├── types/             # TypeScript type definitions
│   ├── index.ts       # Core types
│   ├── services.ts    # Service interfaces
│   └── constants.ts   # Constants and configuration
├── utils/             # Utility functions (to be implemented)
├── App.tsx            # Main App component
├── main.tsx           # Application entry point
└── index.css          # Global styles
```

## Development Roadmap

This project follows a structured implementation plan:

### ✅ Task 1: Project Setup (Current)
- [x] React TypeScript project structure
- [x] Essential dependencies (React, TypeScript, Tailwind CSS, Zustand)
- [x] Core TypeScript interfaces
- [x] Basic folder structure and configuration

### 🔄 Upcoming Tasks
- **Task 2**: Wallet connection infrastructure
- **Task 3**: Blockchain client infrastructure
- **Task 4**: 1inch API integration
- **Task 5**: Portfolio tracking functionality
- **Task 6**: Swap functionality
- **Task 7**: Cross-chain bridge functionality
- **Task 8**: Security and validation
- **Task 9**: User interface improvements
- **Task 10**: Real-time updates and optimization
- **Task 11**: Comprehensive testing
- **Task 12**: Future extensibility

## API Integration

### 1inch API
- Swap quotes and execution
- Real-time price feeds
- Supported tokens

### Wormhole API
- Cross-chain bridge quotes
- Transaction tracking
- Supported routes

### Blockchain RPCs
- Ethereum/Polygon: Infura, Alchemy
- Sui: Official RPC endpoints

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Security

- Never commit API keys or private keys
- Use environment variables for sensitive configuration
- Follow security best practices for wallet integration
- Regularly update dependencies

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Open an issue on GitHub
- Check the documentation
- Review the project specifications in `.kiro/specs/`

---

Built for ETH Global Unite hackathon 🚀 