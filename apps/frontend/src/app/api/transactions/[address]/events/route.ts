import { NextRequest, NextResponse } from 'next/server';

// 1inch History API v2.0 - Events 代理路由
const ONEINCH_API_BASE = 'https://api.1inch.dev/history';

export async function GET(
  request: NextRequest,
  { params }: { params: { address: string } }
) {
  try {
    const { address } = params;
    const { searchParams } = new URL(request.url);

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

    console.log(`📜 Proxy request: Transaction events for ${address}`);

    // 構建1inch History API URL
    const oneinchUrl = new URL(
      `${ONEINCH_API_BASE}/v2.0/history/${address}/events`
    );

    // 添加所有查詢參數
    searchParams.forEach((value, key) => {
      oneinchUrl.searchParams.append(key, value);
    });

    console.log(`🔍 Accessing 1inch History API: ${oneinchUrl.toString()}`);

    // 調用1inch History API
    const response = await fetch(oneinchUrl.toString(), {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'User-Agent': 'UniPortfolio/1.0',
      },
      signal: AbortSignal.timeout(30000), // 30秒超時
    });

    console.log(
      `📊 1inch History API響應: ${response.status} ${response.statusText}`
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `❌ 1inch History API錯誤 (${response.status}):`,
        errorText
      );

      let errorMessage = 'Transaction events request failed';
      if (response.status === 401) {
        errorMessage = 'Invalid API key';
      } else if (response.status === 429) {
        errorMessage = 'Rate limit exceeded';
      } else if (response.status === 404) {
        errorMessage = 'Transaction events not found';
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
    const transactionCount = data.items?.length || 0;
    console.log(
      `✅ Transaction events data retrieved: ${transactionCount} transactions`
    );

    return NextResponse.json(data, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Cache-Control': 'public, max-age=60', // 緩存1分鐘
      },
    });
  } catch (error) {
    console.error('❌ History API代理錯誤:', error);

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

// POST方法用於更複雜的過濾條件
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

    console.log(`📜 代理POST請求: Transaction events for ${address}`);

    // 構建1inch History API URL
    const oneinchUrl = `${ONEINCH_API_BASE}/v2.0/history/${address}/events`;
    console.log(`🔍 訪問1inch History API (POST): ${oneinchUrl}`);

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
      `📊 1inch History API POST響應: ${response.status} ${response.statusText}`
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `❌ 1inch History API POST錯誤 (${response.status}):`,
        errorText
      );

      return NextResponse.json(
        {
          error: 'Transaction events request failed',
          details: errorText,
          status: response.status,
        },
        { status: response.status }
      );
    }

    // 解析並返回數據
    const data = await response.json();
    const transactionCount = data.items?.length || 0;
    console.log(
      `✅ Transaction events data retrieved (POST): ${transactionCount} transactions`
    );

    return NextResponse.json(data, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Cache-Control': 'no-cache', // POST請求不緩存
      },
    });
  } catch (error) {
    console.error('❌ History API代理錯誤 (POST):', error);

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
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
