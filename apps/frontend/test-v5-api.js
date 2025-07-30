// 1inch Portfolio API v5測試腳本
// 直接測試1inch API v5端點是否正確工作

const testAddress = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'; // Vitalik的地址

async function testV5Endpoints() {
  console.log('🧪 測試1inch Portfolio API v5端點');
  console.log('=================================');

  // 檢查API KEY是否設置
  const apiKey = process.env.NEXT_PUBLIC_1INCH_API_KEY;
  if (!apiKey) {
    console.error('❌ 未設置API KEY，請在.env.local中設置NEXT_PUBLIC_1INCH_API_KEY');
    return;
  }
  
  // 測試端點列表
  const baseUrl = 'https://api.1inch.dev/portfolio/portfolio/v5.0';
  
  const endpoints = [
    {
      name: '狀態檢查',
      url: `${baseUrl}/general/status`,
      description: '測試API狀態是否正常'
    },
    {
      name: 'Portfolio數據',
      url: `${baseUrl}/wallets/${testAddress}/portfolio`,
      description: '測試Portfolio數據端點'
    },
    {
      name: 'Value Chart數據',
      url: `${baseUrl}/wallets/${testAddress}/value-chart?timerange=1month`,
      description: '測試價值圖表數據端點'
    },
    {
      name: 'Transaction History數據',
      url: `${baseUrl}/wallets/${testAddress}/history?limit=10`,
      description: '測試交易歷史數據端點'
    }
  ];

  // 循環測試每個端點
  for (const endpoint of endpoints) {
    console.log(`\n🔍 ${endpoint.name}`);
    console.log(`   ${endpoint.description}`);
    console.log(`   URL: ${endpoint.url}`);
    
    try {
      const fetch = (await import('node-fetch')).default;
      const response = await fetch(endpoint.url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      });

      console.log(`   狀態碼: ${response.status}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`   ✅ 成功: 數據長度 ${JSON.stringify(data).length} bytes`);
        
        // 簡單顯示數據結構
        if (endpoint.name === 'Portfolio數據') {
          console.log(`      鏈數量: ${data.chains?.length || 0}`);
          console.log(`      總價值: $${data.totalValueUsd?.toLocaleString() || '0'}`);
        } else if (endpoint.name === 'Value Chart數據') {
          console.log(`      圖表數據: ${Object.keys(data.result || {}).length} 條目`);
        } else if (endpoint.name === 'Transaction History數據') {
          console.log(`      交易數量: ${data.items?.length || 0}`);
        } else {
          console.log(`      數據: ${JSON.stringify(data).substring(0, 100)}...`);
        }
      } else {
        const errorText = await response.text();
        console.log(`   ❌ 失敗: ${errorText}`);
      }
    } catch (error) {
      console.log(`   ❌ 錯誤: ${error.message}`);
    }
  }

  console.log('\n📋 測試總結:');
  console.log('   如果有端點顯示 ✅ 成功，說明API路徑正確');
  console.log('   如果看到 401 錯誤，請確認API KEY是否有效');
  console.log('   如果看到 404 錯誤，說明API路徑可能不正確');
}

// 從環境變量文件加載API KEY（直接使用process.env）
// 假設開發服務器已經加載了.env.local中的環境變量

// 執行測試
testV5Endpoints().catch(error => {
  console.error('測試執行失敗:', error);
});