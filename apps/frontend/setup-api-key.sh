#!/bin/bash

# 1inch Portfolio API KEY 設置腳本
# 使用方法: ./setup-api-key.sh YOUR_ACTUAL_API_KEY

echo "🔑 1inch Portfolio API KEY 設置工具"
echo "=================================="

if [ $# -eq 0 ]; then
    echo "❌ 錯誤: 請提供您的1inch API KEY"
    echo ""
    echo "使用方法:"
    echo "  ./setup-api-key.sh YOUR_ACTUAL_API_KEY"
    echo ""
    echo "或者手動編輯 .env.local 文件："
    echo "  nano .env.local"
    echo "  # 將 'your_1inch_api_key_here' 替換為您的真實API KEY"
    exit 1
fi

API_KEY="$1"

# 驗證API KEY格式 (基本檢查)
if [ ${#API_KEY} -lt 10 ]; then
    echo "⚠️ 警告: API KEY長度似乎過短，請確認是否正確"
fi

# 備份原文件
if [ -f .env.local ]; then
    cp .env.local .env.local.backup
    echo "📋 已備份原.env.local文件為 .env.local.backup"
fi

# 替換API KEY
if [ -f .env.local ]; then
    sed -i.bak "s/your_1inch_api_key_here/$API_KEY/g" .env.local
    rm .env.local.bak
    echo "✅ API KEY已成功設置到 .env.local 文件"
else
    # 創建新文件
    cat > .env.local << EOF
# 1inch Portfolio API 配置
NEXT_PUBLIC_1INCH_API_KEY=$API_KEY

# 開發環境配置
NODE_ENV=development
EOF
    echo "✅ 已創建 .env.local 文件並設置API KEY"
fi

echo ""
echo "🎯 接下來的步驟:"
echo "  1. 重啟開發服務器: pnpm dev"
echo "  2. 訪問: http://localhost:3000/portfolio"
echo "  3. 連接錢包查看您的投資組合數據"
echo ""
echo "🧪 測試API配置:"
echo "  node src/utils/testAPI.js" 