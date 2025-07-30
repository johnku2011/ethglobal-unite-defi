
const API_KEY = "rYv3tAhxEeTeRk5PBbWYebt8epHjz8Q7";
const testUrl = "https://api.1inch.dev/portfolio/portfolio/v5.0/general/status";

async function testApi() {
  console.log("🚀 測試1inch Portfolio API v5連接");
  console.log("================================");
  console.log(`API KEY: ${API_KEY.substring(0, 4)}...${API_KEY.substring(API_KEY.length - 4)}`);
  console.log(`URL: ${testUrl}`);
  console.log("發送請求...");

  try {
    const response = await fetch(testUrl, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Accept": "application/json",
        "Content-Type": "application/json",
      }
    });
    
    console.log(`狀態碼: ${response.status} ${response.statusText}`);
    
    const text = await response.text();
    try {
      const data = JSON.parse(text);
      console.log("✅ 成功!");
      console.log(data);
    } catch (e) {
      console.log("⚠️ 響應不是有效JSON: " + text);
    }
  } catch (error) {
    console.log("❌ 錯誤:", error);
  }
}

testApi();

