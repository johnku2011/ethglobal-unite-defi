# Sui Fusion Protocol Scripts Guide

## Installation

```bash
pnpm install
```

## Workflow

1. **Publish Move package to Sui:**

    ```bash
    sui publish
    ```

2. **Register resolver whitelist:**

    ```bash
    pnpm tsx ./scripts/register_resolver.ts
    ```

3. **Create destination escrow:**

    ```bash
    pnpm tsx ./scripts/create_dst_escrow.ts
    ```

4. **Create source escrow:**

    ```bash
    pnpm tsx ./scripts/create_src_escrow.ts
    ```

5. **Withdraw destination escrow:**

    ```bash
    pnpm tsx ./scripts/withdraw_dst_escrow.ts
    ```

6. **Withdraw source escrow:**

    ```bash
    pnpm tsx ./scripts/withdraw_src_escrow.ts
    ```

7. **Cancel destination escrow:**

    ```bash
    pnpm tsx ./scripts/cancel_dst_escrow.ts
    ```

8. **Cancel source escrow:**
    ```bash
    pnpm tsx ./scripts/cancel_src_escrow.ts
    ```

## Flow

### Transferring FROM Other Chains TO SUI:

1. Setup → We deploy the escrow factory
2. Security → Whitelist trusted resolvers
3. Receive → Get transfer request from sender's chain
4. Lock → Create escrows on both EVM & SUI and lock
   "from asset" on EVM and "to asset" on SUI
5. Verify → Receive proof of payment
6. Release → Unlock funds to recipient

### Transferring FROM SUI TO Other Chains:

1. Setup → We deploy the escrow factory
2. Security → Whitelist trusted resolvers
3. Request → User submits transfer order
4. Lock → Create escrows on both SUI & EVM and lock
   "from asset" on SUI and "to asset" on EVM
5. Verify → Receive proof of delivery
6. Release → Unlock funds to recipient

## Diagrams

### Cross Chain Swap Overview
![Cross Chain Swap Diagram](../../Cross%20Chain%20Swap%20Diagram.svg)

### EVM to SUI Flow
![EVM to SUI](../../evm-to-sui.svg)

### SUI to EVM Flow
![SUI to EVM](../../sui-to-evm.svg)

## Notes

- Make sure your environment variables are set correctly for Sui and wallet configuration.
- Each script may require specific arguments or configuration; refer to the script source for details.
- Use the provided Makefile for easier script management:
    ```bash
    make list
    make run SCRIPT=create_dst_escrow.ts
    ```

## Sui Testnet Deployment

- **Sui Testnet Package**
  - `PACKAGE_ID=0x61b76704d27522ce6d3e643227ce3ef5afc79fddbcc580fafaf5a9643b5ad8a8`
  - `ESCROW_FACTORY_ID=0x552f8e3054c1cb2fba8fc40b43b44c3c4e7231829d742dc0a87d2fb768caf08e`
  - [View on SuiVision](https://testnet.suivision.xyz/package/0x61b76704d27522ce6d3e643227ce3ef5afc79fddbcc580fafaf5a9643b5ad8a8)
