# 開發指南

## 代碼格式化和 Linting

本項目已配置 Prettier 和 ESLint 來確保代碼品質和一致性。

### 可用的腳本

```bash
# 格式化所有代碼檔案
pnpm run format

# 檢查代碼格式是否正確
pnpm run format:check

# 運行 ESLint 檢查
pnpm run lint

# 自動修復 ESLint 錯誤
pnpm run lint:fix

# 類型檢查
pnpm run type-check
```

### 配置檔案

- `.prettierrc` - Prettier 配置
- `.prettierignore` - Prettier 忽略檔案
- `.eslintrc.json` - ESLint 配置
- `.vscode/settings.json` - VS Code 編輯器設定
- `.vscode/extensions.json` - 推薦的 VS Code 擴展

### 推薦的 VS Code 擴展

- **Prettier - Code formatter** (`esbenp.prettier-vscode`)
- **ESLint** (`dbaeumer.vscode-eslint`)
- **Tailwind CSS IntelliSense** (`bradlc.vscode-tailwindcss`)
- **TypeScript Importer** (`ms-vscode.vscode-typescript-next`)

### 自動格式化

如果你使用 VS Code，代碼會在保存時自動格式化。你也可以手動運行格式化命令：

- 格式化當前檔案：`Cmd/Ctrl + Shift + P` → "Format Document"
- 修復 ESLint 問題：`Cmd/Ctrl + Shift + P` → "ESLint: Fix all auto-fixable Problems"

### 開發流程建議

1. 在提交代碼前運行：
   ```bash
   pnpm run format
   pnpm run lint:fix
   pnpm run type-check
   ```

2. 確保所有檢查通過：
   ```bash
   pnpm run format:check
   pnpm run lint
   ``` 