// API代理測試腳本
// 測試本地Next.js API路由是否正常工作

const testAddress = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'; // Vitalik的地址

async function testProxyRoutes() {
  console.log('🧪 測試Next.js API代理路由');
  console.log('===========================');

  const baseUrl = 'http://localhost:3000/api';
  
  const tests = [
    {
      name: 'Portfolio數據',
      url: `${baseUrl}/portfolio/${testAddress}`,
      description: '測試主要投資組合數據獲取'
    },
    {
      name: 'Value Chart數據',
      url: `${baseUrl}/portfolio/${testAddress}/value-chart?timerange=1month`,
      description: '測試價值圖表數據獲取'
    },
    {
      name: 'Transaction History數據',
      url: `${baseUrl}/portfolio/${testAddress}/history?limit=10`,
      description: '測試交易歷史數據獲取'
    }
  ];

  for (const test of tests) {
    console.log(`\n🔍 ${test.name}`);
    console.log(`   ${test.description}`);
    console.log(`   URL: ${test.url}`);
    
    try {
      const fetch = (await import('node-fetch')).default;
      const response = await fetch(test.url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      });

      console.log(`   狀態碼: ${response.status}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`   ✅ 成功: 數據長度 ${JSON.stringify(data).length} bytes`);
        
        // 簡要顯示數據結構
        if (test.name === 'Portfolio數據') {
          console.log(`      總價值: $${data.totalValueUsd?.toLocaleString() || '0'}`);
          console.log(`      鏈數量: ${data.chains?.length || 0}`);
        } else if (test.name === 'Value Chart數據') {
          console.log(`      圖表數據: ${Object.keys(data.result || {}).length} chains`);
        } else if (test.name === 'Transaction History數據') {
          console.log(`      交易數量: ${data.items?.length || 0}`);
        }
      } else {
        const errorText = await response.text();
        console.log(`   ❌ 失敗: ${errorText}`);
      }
    } catch (error) {
      console.log(`   ❌ 網絡錯誤: ${error.message}`);
    }
  }

  console.log('\n📋 測試總結:');
  console.log('   如果所有測試都顯示 ✅ 成功，說明CORS問題已解決');
  console.log('   如果看到錯誤，請檢查:');
  console.log('   1. API KEY是否正確設置在 .env.local');
  console.log('   2. 開發服務器是否在運行 (pnpm dev)');
  console.log('   3. Next.js API路由是否正確配置');
}

// 檢查開發服務器是否運行
async function checkDevServer() {
  try {
    const fetch = (await import('node-fetch')).default;
    const response = await fetch('http://localhost:3000', { 
      method: 'HEAD',
      timeout: 5000 
    });
    return true;
  } catch (error) {
    console.log('❌ 開發服務器未運行或不可訪問');
    console.log('   請先啟動開發服務器: pnpm dev');
    return false;
  }
}

// 主執行函數
(async () => {
  const serverRunning = await checkDevServer();
  if (serverRunning) {
    await testProxyRoutes();
  }
})(); 