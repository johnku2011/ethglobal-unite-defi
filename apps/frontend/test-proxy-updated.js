// 更新後的API代理路由測試腳本
// 測試使用新的1inch API v5路徑的代理路由

const testAddress = '0xFD931c8B5A90F21D2fb59Ea9a5F6cCB47505D0a9';

async function testLocalAPI() {
  console.log('🧪 測試本地Next.js API代理路由');
  console.log('============================');

  const baseUrl = 'http://localhost:3000/api';
  
  const tests = [
    {
      name: 'Portfolio數據',
      url: `${baseUrl}/portfolio/${testAddress}`,
      description: '測試投資組合數據端點'
    },
    {
      name: 'Value Chart數據',
      url: `${baseUrl}/portfolio/${testAddress}/value-chart?timerange=1month`,
      description: '測試價值圖表數據端點'
    },
    {
      name: 'Transaction History數據',
      url: `${baseUrl}/portfolio/${testAddress}/history?limit=10`,
      description: '測試交易歷史數據端點(臨時實現)'
    }
  ];

  for (const test of tests) {
    console.log(`\n🔍 測試: ${test.name}`);
    console.log(`📝 描述: ${test.description}`);
    console.log(`🔗 URL: ${test.url}`);
    
    try {
      const fetch = (await import('node-fetch')).default;
      const response = await fetch(test.url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      });

      console.log(`📊 狀態碼: ${response.status}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ 成功: 數據長度 ${JSON.stringify(data).length} bytes`);
        
        // 輸出簡短摘要
        if (test.name === 'Portfolio數據') {
          const result = data.result || {};
          const total = result.total || 0;
          console.log(`💰 總價值: $${total}`);
        } else if (test.name === 'Value Chart數據') {
          const points = data.result || [];
          console.log(`📈 圖表數據點: ${Array.isArray(points) ? points.length : 0} 個`);
        } else if (test.name === 'Transaction History數據') {
          const items = data.result || [];
          console.log(`📜 資產項目: ${Array.isArray(items) ? items.length : 0} 個`);
        }
      } else {
        const errorText = await response.text();
        console.log(`❌ 失敗: ${errorText.substring(0, 200)}`);
      }
    } catch (error) {
      console.log(`❌ 網絡錯誤: ${error.message}`);
    }
  }

  console.log('\n📋 測試總結:');
  console.log('   如果所有測試都顯示 ✅ 成功，說明API代理路由已成功更新');
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
    console.log('   請先啟動開發服務器: npm run dev');
    return false;
  }
}

// 主執行函數
(async () => {
  const serverRunning = await checkDevServer();
  if (serverRunning) {
    await testLocalAPI();
  }
})();