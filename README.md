# ETHGlobal Unite DeFi Monorepo

A DeFi application built for ETHGlobal Unite using pnpm workspaces.

## Requirements

### System Requirements
- **Node.js**: >= 18.0.0
- **pnpm**: >= 8.0.0

### Installation

1. **Install pnpm globally** (if not already installed):
   ```bash
   npm install -g pnpm
   ```
   
   Or using other methods:
   ```bash
   # Using Homebrew (macOS)
   brew install pnpm
   
   # Using curl
   curl -fsSL https://get.pnpm.io/install.sh | sh -
   ```

2. **Install dependencies**:
   ```bash
   pnpm install
   ```

## Project Structure

```
├── apps/
│   └── frontend/          # Next.js 14 interface
├── packages/              # Shared packages
├── pnpm-workspace.yaml    # Workspace configuration
└── package.json           # Root package.json
```

## Development

### Adding New Packages

To add a new package to a specific app or package:

```bash
# Add to frontend app
pnpm add lodash --filter frontend

# Add dev dependency to frontend
pnpm add -D @types/lodash --filter frontend

# Add to all workspaces
pnpm add -w some-package

# Add to root only
pnpm add -W some-package
```

### Running Projects

```bash
# Run frontend development server
pnpm --filter frontend dev

# Or use the predefined script
pnpm dev:interface

# Run all dev scripts across workspaces
pnpm -r dev

# Build all projects
pnpm -r build
```

### Available Scripts

- `pnpm dev:interface` - Start frontend development server
- `pnpm -r build` - Build all packages
- `pnpm -r test` - Run tests in all packages
- `pnpm -r lint` - Lint all packages
- `pnpm -r clean` - Clean build artifacts

### Workspace Commands

```bash
# List all workspaces
pnpm -r list

# Run command in specific workspace
pnpm --filter <workspace-name> <command>

# Run command in multiple workspaces
pnpm --filter "./apps/*" <command>
```

## Getting Started

1. Install dependencies: `pnpm install`
2. Start the frontend: `pnpm dev:interface`
3. Open http://localhost:3000 in your browser

## Adding New Apps/Packages

1. Create new directory in `apps/` or `packages/`
2. Add `package.json` with proper naming: `@ethglobal-unite-defi/<name>`
3. The workspace will automatically be detected by pnpm