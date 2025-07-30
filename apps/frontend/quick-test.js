
const API_KEY = "rYv3tAhxEeTeRk5PBbWYebt8epHjz8Q7";
const BASE_URL = "https://api.1inch.dev/portfolio/portfolio/v5.0";

async function testEndpoint(url, name) {
  console.log(`\n📌 測試: ${name}`);
  console.log(`🔗 URL: ${url}`);
  
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Accept": "application/json"
      }
    });
    
    console.log(`📊 狀態: ${response.status}`);
    
    const text = await response.text();
    try {
      const data = JSON.parse(text);
      console.log(`🔑 數據: ${JSON.stringify(data).substring(0, 200)}...`);
    } catch (e) {
      console.log(`⚠️ 錯誤: ${text.substring(0, 200)}`);
    }
  } catch (error) {
    console.log(`❌ 錯誤: ${error.message}`);
  }
}

async function main() {
  const testAddress = "0xFD931c8B5A90F21D2fb59Ea9a5F6cCB47505D0a9";
  
  await testEndpoint(`${BASE_URL}/general/status`, "狀態檢查");
  await testEndpoint(`${BASE_URL}/general/address_check?addresses=${testAddress}`, "地址檢查");
  await testEndpoint(`${BASE_URL}/general/current_value?addresses=${testAddress}`, "當前價值");
  await testEndpoint(`${BASE_URL}/tokens/snapshot?addresses=${testAddress}`, "代幣快照");
  await testEndpoint(`${BASE_URL}/protocols/snapshot?addresses=${testAddress}`, "協議快照");
}

main();

