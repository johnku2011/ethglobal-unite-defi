import { NextRequest, NextResponse } from 'next/server';

// 1inch Portfolio API v5 代理路由
// 解決CORS問題並安全管理API密鑰

// 更新到1inch Portfolio API v5版本
// 參考: https://portal.1inch.dev/documentation/apis/portfolio/swagger
const ONEINCH_API_BASE = 'https://api.1inch.dev/portfolio/portfolio/v5.0';

export async function GET(
  request: NextRequest,
  { params }: { params: { address: string } }
) {
  try {
    const { address } = params;

    // 驗證地址格式
    if (!address || !address.match(/^0x[a-fA-F0-9]{40}$/)) {
      return NextResponse.json(
        { error: 'Invalid Ethereum address format' },
        { status: 400 }
      );
    }

    // 檢查API密鑰
    const apiKey = process.env.NEXT_PUBLIC_1INCH_API_KEY;
    if (!apiKey) {
      console.error('❌ 1inch API key not configured');
      return NextResponse.json(
        { error: 'API configuration error' },
        { status: 500 }
      );
    }

    console.log(`🔄 代理請求: Portfolio data for ${address}`);

    // 調用1inch Portfolio API v5
    // 基於測試，使用confirmed的端點
    const oneinchUrl = `${ONEINCH_API_BASE}/general/current_value?addresses=${address}`;
    console.log(`🔍 訪問1inch Portfolio API v5: ${oneinchUrl}`);
    const response = await fetch(oneinchUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'User-Agent': 'UniPortfolio/1.0',
      },
      // 設置超時
      signal: AbortSignal.timeout(30000), // 30秒超時
    });

    // 記錄響應狀態
    console.log(`📊 1inch API響應: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ 1inch API錯誤 (${response.status}):`, errorText);

      // 返回適當的錯誤響應
      let errorMessage = 'API request failed';
      if (response.status === 401) {
        errorMessage = 'Invalid API key';
      } else if (response.status === 429) {
        errorMessage = 'Rate limit exceeded';
      } else if (response.status === 404) {
        errorMessage = 'Portfolio not found';
      }

      return NextResponse.json(
        {
          error: errorMessage,
          details: errorText,
          status: response.status,
        },
        { status: response.status }
      );
    }

    // 解析並返回數據
    const data = await response.json();
    console.log(`✅ Portfolio數據獲取成功: ${data.totalValueUsd || 0} USD`);

    // 返回代理響應，添加CORS頭部
    return NextResponse.json(data, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Cache-Control': 'public, max-age=60', // 緩存1分鐘
      },
    });
  } catch (error) {
    console.error('❌ Portfolio API代理錯誤:', error);

    // 處理不同類型的錯誤
    let errorMessage = 'Internal server error';
    let statusCode = 500;

    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        errorMessage = 'Request timeout';
        statusCode = 504;
      } else if (error.message.includes('fetch')) {
        errorMessage = 'Network error';
        statusCode = 502;
      }
    }

    return NextResponse.json(
      {
        error: errorMessage,
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: statusCode }
    );
  }
}

// 處理預檢請求 (CORS)
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
