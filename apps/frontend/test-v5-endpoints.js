// 1inch Portfolio API v5端點測試腳本
// 測試不同的API端點，找出最適合的替代方案

const API_KEY = "rYv3tAhxEeTeRk5PBbWYebt8epHjz8Q7";
const BASE_URL = "https://api.1inch.dev/portfolio/portfolio/v5.0";
const testAddress = "0xFD931c8B5A90F21D2fb59Ea9a5F6cCB47505D0a9"; // 用戶的錢包地址

// 要測試的端點列表
const endpoints = [
  {
    name: "狀態檢查",
    url: `${BASE_URL}/general/status`,
    description: "檢查API服務狀態"
  },
  {
    name: "地址檢查",
    url: `${BASE_URL}/general/address_check?addresses=${testAddress}`,
    description: "檢查地址有效性"
  },
  {
    name: "當前價值",
    url: `${BASE_URL}/general/current_value?addresses=${testAddress}`,
    description: "獲取錢包當前總價值"
  },
  {
    name: "協議快照",
    url: `${BASE_URL}/protocols/snapshot?addresses=${testAddress}`,
    description: "獲取協議資產數據"
  },
  {
    name: "代幣快照",
    url: `${BASE_URL}/tokens/snapshot?addresses=${testAddress}`,
    description: "獲取代幣資產數據"
  },
  {
    name: "圖表數據",
    url: `${BASE_URL}/general/chart?addresses=${testAddress}&timerange=1month`,
    description: "獲取價值圖表數據"
  }
];

async function testEndpoint(endpoint) {
  console.log(`\n🔍 測試: ${endpoint.name}`);
  console.log(`📝 描述: ${endpoint.description}`);
  console.log(`🔗 URL: ${endpoint.url}`);

  try {
    const response = await fetch(endpoint.url, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Accept": "application/json",
        "Content-Type": "application/json",
      }
    });
    
    console.log(`📊 狀態: ${response.status} ${response.statusText}`);
    
    const text = await response.text();
    try {
      const data = JSON.parse(text);
      // 顯示數據摘要
      if (typeof data === 'object') {
        const keys = Object.keys(data);
        console.log(`🔑 數據結構: 包含 ${keys.length} 個頂級鍵`);
        console.log(`🔑 頂級鍵: ${keys.join(', ')}`);
        
        // 顯示詳細內容
        console.log(`📄 詳細內容: ${JSON.stringify(data, null, 2)}`);
        
        // 根據不同端點顯示相關信息
        if (endpoint.name === "當前價值" && data.result) {
          console.log(`💰 總價值: $${data.result.value_usd || '未知'}`);
        } else if (endpoint.name === "協議快照" && data.result) {
          console.log(`📊 協議數量: ${data.result.length || 0}`);
        } else if (endpoint.name === "代幣快照" && data.result) {
          console.log(`🪙 代幣數量: ${data.result.length || 0}`);
        }
      }
    } catch (e) {
      console.log("⚠️ 響應不是有效JSON:");
      console.log(text.substring(0, 200) + (text.length > 200 ? "..." : ""));
    }
  } catch (error) {
    console.log("❌ 錯誤:", error);
  }
}

async function runTests() {
  console.log("🚀 1inch Portfolio API v5 端點測試");
  console.log("=================================");
  console.log(`🔑 API KEY: ${API_KEY.substring(0, 4)}...${API_KEY.substring(API_KEY.length - 4)}`);
  console.log(`👛 測試地址: ${testAddress}`);
  
  for (const endpoint of endpoints) {
    await testEndpoint(endpoint);
  }
  
  console.log("\n📋 測試總結");
  console.log("===========");
  console.log("✅ 測試完成! 請根據上面的結果選擇最適合的API端點");
}

// 執行測試
runTests().catch(console.error);