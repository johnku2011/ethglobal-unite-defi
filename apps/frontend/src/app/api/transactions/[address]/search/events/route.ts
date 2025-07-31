import { NextRequest, NextResponse } from 'next/server';

// 1inch History API v2.0 - Search Events 代理路由
const ONEINCH_API_BASE = 'https://api.1inch.dev/history';

export async function POST(
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

    // 解析請求體
    let requestBody;
    try {
      requestBody = await request.json();
    } catch (e) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    console.log(`🔍 代理請求: Search transaction events for ${address}`);

    // 構建1inch History API URL
    const oneinchUrl = `${ONEINCH_API_BASE}/v2.0/history/${address}/search/events`;
    console.log(`🔍 訪問1inch History API Search: ${oneinchUrl}`);

    // 調用1inch History API
    const response = await fetch(oneinchUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'User-Agent': 'UniPortfolio/1.0',
      },
      body: JSON.stringify(requestBody),
      signal: AbortSignal.timeout(30000), // 30秒超時
    });

    console.log(
      `📊 1inch History API Search響應: ${response.status} ${response.statusText}`
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `❌ 1inch History API Search錯誤 (${response.status}):`,
        errorText
      );

      return NextResponse.json(
        {
          error: 'Search transaction events failed',
          details: errorText,
          status: response.status,
        },
        { status: response.status }
      );
    }

    // 解析並返回數據
    const data = await response.json();
    const resultCount = data.items?.length || 0;
    console.log(`✅ Search results retrieved: ${resultCount} transactions`);

    return NextResponse.json(data, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Cache-Control': 'no-cache', // 搜索請求不緩存
      },
    });
  } catch (error) {
    console.error('❌ History API Search代理錯誤:', error);

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// 處理預檢請求 (CORS)
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
