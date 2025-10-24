# ATFI PROJECT

A Web3 project that solves the problem of people registering for events but not attending. The platform uses smart contracts and financial commitments to ensure participant accountability and fair reward distribution.

## 🎯 Problem Statement

Event organizers often face issues where participants register but don't show up, leading to inefficient resource allocation and unreliable attendance. ATFI addresses this by requiring financial commitments that are either returned upon attendance or distributed to attending participants.

## 🚀 Features

- **Smart Contract Integration**: Ethereum/Base Sepolia blockchain for secure financial commitments
- **Multi-Wallet Support**: Works with both Privy Gmail-linked wallets and external wallets like MetaMask
- **Event Management**: Complete event lifecycle from creation to settlement
- **QR Code Check-ins**: Modern check-in system with QR code validation
- **Reward Distribution**: Automated reward distribution to attending participants
- **Yield Generation**: Staked funds generate yield through DeFi protocols while events are active

## 🛠️ Tech Stack

### Frontend
- **[Next.js 15.5.4](https://nextjs.org/)** - React framework with Turbopack
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Flowbite React](https://flowbite-react.com/)** - UI component library
- **[Privy](https://www.privy.io/)** - Wallet authentication and management
- **[Ethers.js](https://docs.ethers.org/)** - Ethereum interaction library

### Backend
- **[Go](https://golang.org/)** - REST API server
- **[Gin](https://gin-gonic.com/)** - HTTP web framework
- **[PostgreSQL](https://www.postgresql.org/)** - Primary database
- **[pgx](https://github.com/jackc/pgx)** - PostgreSQL driver

### Blockchain
- **[Solidity](https://soliditylang.org/)** - Smart contract language
- **[Foundry](https://book.getfoundry.sh/)** - Smart contract development framework
- **[Base Sepolia](https://sepolia.base.org/)** - Testnet deployment
- **[ERC-4626](https://eips.ethereum.org/EIPS/eip-4626)** - Vault standard
- **[Morpho Protocol](https://www.morpho.org/)** - Yield generation

## 👥 Team

**Project Lead**: Albary - [GitHub](https://github.com/EndPx)
**Team Member**: Wijdan - [GitHub](https://github.com/simad9)

## 📋 Prerequisites

- **Node.js 18+** - [Install Node.js](https://nodejs.org/)
- **Go 1.21+** - [Install Go](https://golang.org/doc/install)
- **PostgreSQL** - [Install PostgreSQL](https://www.postgresql.org/download/)
- **Git** - [Install Git](https://git-scm.com/)

## 🚀 Quick Start

### Frontend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd atfi-project
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your configuration:
   ```env
   # Privy Configuration
   NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id
   NEXT_PUBLIC_PRIVY_APP_SECRET=your_privy_app_secret

   # Database Configuration
   DATABASE_URL=postgres://user:password@localhost/atfi_db?sslmode=disable

   # Blockchain Configuration
   NEXT_PUBLIC_BASE_SEPOLIA_RPC=https://base-sepolia-rpc.publicnode.com
   NEXT_PUBLIC_FACTORY_CONTRACT_ADDRESS=0x...
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

   The application will be available at [http://localhost:3000](http://localhost:3000)

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install Go dependencies**
   ```bash
   go mod download
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your configuration:
   ```env
   DATABASE_URL=postgres://user:password@localhost/atfi_db?sslmode=disable
   PORT=8080
   RPC_URL=https://base-sepolia-rpc.publicnode.com
   ```

4. **Start backend server**
   ```bash
   go run main.go
   ```

   The API will be available at [http://localhost:8080](http://localhost:8080)

## 📁 Project Structure

```
atfi-project/
├── src/
│   ├── components/         # React components
│   │   ├── features/      # Feature-specific components
│   │   ├── layout/        # Layout components
│   │   └── ui/            # UI components
│   ├── pages/             # Next.js pages
│   ├── hooks/             # Custom React hooks
│   ├── utils/             # Utility functions
│   ├── types/             # TypeScript type definitions
│   └── services/          # API and blockchain services
├── backend/
│   ├── handlers/          # HTTP handlers
│   ├── models/            # Data models
│   ├── middleware/        # HTTP middleware
│   └── main.go           # Application entry point
├── sc/                    # Smart contracts
│   ├── src/              # Solidity contracts
│   ├── test/             # Contract tests
│   └── foundry.toml      # Foundry configuration
└── README.md
```

## 🧪 Testing

### Frontend Tests
```bash
npm run test
```

### Smart Contract Tests
```bash
cd sc
forge test
```

### Backend Tests
```bash
cd backend
go test ./...
```

## 🎨 UI Components Status

### Completed Pages
- [x] **Landing Page** - Marketing and introduction
- [x] **Home Page** - Dashboard and event discovery
- [x] **Sign-in Page** - Authentication with Privy
- [x] **Create Event Page** - Event creation flow
- [x] **Event Management Page** - Organizer dashboard
- [x] **Event Guests Page** - Participant management

### In Progress
- [ ] **Check-in Page** - QR code scanning and validation

### Planned Features
- [ ] **Discover Page** - Enhanced event discovery
- [ ] **Calendar Page** - Personal event calendar

## 🔧 Development Workflow

1. **Feature Development**
   - Create feature branches from `main`
   - Follow conventional commit messages
   - Test locally before pushing

2. **Smart Contract Development**
   - Use Foundry for contract testing
   - Deploy to Base Sepolia for testing
   - Verify contracts on Etherscan

3. **API Development**
   - Follow RESTful conventions
   - Include proper error handling
   - Add API documentation

## 📚 Key Components

### Wallet Integration
- **Privy Authentication**: Seamless wallet creation via Gmail
- **MetaMask Support**: External wallet integration
- **Smart Wallet Selection**: Automatic wallet choice based on user setup

### Smart Contracts
- **FactoryATFi**: Creates vault contracts for events
- **VaultATFi**: Manages event stakes and rewards with yield generation
- **ERC-4626 Compliance**: Standardized vault interface

### Event Flow
1. **Creation**: Organizer creates event with stake requirements
2. **Registration**: Participants stake USDC to join
3. **Active Period**: Funds generate yield through DeFi protocols
4. **Check-in**: QR code validation at event
5. **Settlement**: Rewards distributed to attendees

## 🔍 Monitoring & Debugging

### Frontend
- Browser DevTools for React debugging
- Privy Dashboard for authentication monitoring
- Network tab for API debugging

### Backend
- Structured logging with request/response details
- Database connection monitoring
- Health check endpoints available

### Blockchain
- Etherscan Base Sepolia for transaction monitoring
- Foundry test output for contract debugging

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Troubleshooting

### Common Issues

#### Privy Authentication Issues
- Verify `NEXT_PUBLIC_PRIVY_APP_ID` is correct
- Check Privy dashboard for app configuration
- Ensure proper CORS settings

#### MetaMask Connection Issues
- Check if MetaMask is installed and unlocked
- Verify network is set to Base Sepolia
- Ensure wallet has sufficient gas fees

#### Build Errors
- Clear Next.js cache: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules package-lock.json && npm install`
- Check TypeScript configuration

#### Database Connection Issues
- Verify PostgreSQL is running
- Check connection string in `.env`
- Ensure database exists and is accessible

### Getting Help

- Check application console logs
- Verify environment variables are set correctly
- Test API endpoints independently
- Review smart contract events and errors

## 📊 Architecture Overview

The ATFI platform consists of:
- **Frontend**: React-based user interface with Web3 integrations
- **Backend**: RESTful API for data persistence and business logic
- **Blockchain**: Smart contracts for financial commitments and rewards
- **Database**: PostgreSQL for user profiles, events, and check-in records

Built with ❤️ using Next.js, Go, Ethereum, and PostgreSQL