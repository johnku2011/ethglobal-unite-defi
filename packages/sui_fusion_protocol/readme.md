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

## Notes

- Make sure your environment variables are set correctly for Sui and wallet configuration.
- Each script may require specific arguments or configuration; refer to the script source for details.
- Use the provided Makefile for easier script management:
  ```bash
  make list
  make run SCRIPT=create_dst_escrow.ts
  ```
