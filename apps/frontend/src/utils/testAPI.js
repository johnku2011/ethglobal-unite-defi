// 1inch Portfolio API 測試腳本
// 使用方法: node src/utils/testAPI.js

const API_BASE_URL =
  process.env.NEXT_PUBLIC_PORTFOLIO_API_BASE_URL ||
  'https://api.1inch.dev/portfolio/v4';
const API_KEY = process.env.NEXT_PUBLIC_1INCH_API_KEY;

console.log('🔍 1inch Portfolio API 配置測試');
console.log('================================');
console.log(`API Base URL: ${API_BASE_URL}`);
console.log(
  `API Key: ${API_KEY ? `${API_KEY.substring(0, 8)}...` : '❌ 未設置'}`
);

if (!API_KEY) {
  console.log('❌ 錯誤: 請設置 NEXT_PUBLIC_1INCH_API_KEY 環境變量');
  process.exit(1);
}

// 測試API連接
async function testAPI() {
  const testAddress = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'; // Vitalik的地址
  const url = `${API_BASE_URL}/portfolio/${testAddress}`;

  console.log('\n🚀 測試API調用...');
  console.log(`URL: ${url}`);

  try {
    const fetch = (await import('node-fetch')).default;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });

    console.log(`狀態碼: ${response.status}`);

    if (response.ok) {
      const data = await response.json();
      console.log('✅ API調用成功！');
      console.log(`📊 數據概覽:`);
      console.log(
        `  - 總價值: $${data.totalValueUsd?.toLocaleString() || '0'}`
      );
      console.log(`  - 鏈數量: ${data.chains?.length || 0}`);
      console.log(`  - 位置數量: ${data.positions?.length || 0}`);
    } else {
      const errorText = await response.text();
      console.log('❌ API調用失敗');
      console.log(`錯誤: ${errorText}`);
    }
  } catch (error) {
    console.log('❌ 網絡錯誤:', error.message);
  }
}

testAPI();
