import { NextRequest, NextResponse } from 'next/server';

// 1inch Portfolio API v5 - Value Chart 代理路由

// 更新到1inch Portfolio API v5版本
const ONEINCH_API_BASE = 'https://api.1inch.dev/portfolio/portfolio/v5.0';

export async function GET(
  request: NextRequest,
  { params }: { params: { address: string } }
) {
  try {
    const { address } = params;
    const { searchParams } = new URL(request.url);

    // 獲取查詢參數
    const timerange = searchParams.get('timerange') || '1month';
    const useCache = searchParams.get('useCache') !== 'false';

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

    console.log(`📈 代理請求: Value chart for ${address} (${timerange})`);

    // 構建1inch API v5 URL
    const oneinchUrl = new URL(`${ONEINCH_API_BASE}/general/chart`);
    oneinchUrl.searchParams.set('addresses', address);
    oneinchUrl.searchParams.set('timerange', timerange);
    oneinchUrl.searchParams.set('useCache', useCache.toString());
    console.log(
      `🔍 訪問1inch Portfolio API v5 Chart端點: ${oneinchUrl.toString()}`
    );

    // 調用1inch Portfolio API
    const response = await fetch(oneinchUrl.toString(), {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'User-Agent': 'UniPortfolio/1.0',
      },
      signal: AbortSignal.timeout(30000),
    });

    console.log(
      `📊 1inch Value Chart API響應: ${response.status} ${response.statusText}`
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `❌ 1inch Value Chart API錯誤 (${response.status}):`,
        errorText
      );

      let errorMessage = 'Value chart request failed';
      if (response.status === 401) {
        errorMessage = 'Invalid API key';
      } else if (response.status === 429) {
        errorMessage = 'Rate limit exceeded';
      } else if (response.status === 404) {
        errorMessage = 'Value chart data not found';
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
    console.log(
      `✅ Value Chart數據獲取成功: ${Object.keys(data.result || {}).length} chains`
    );

    return NextResponse.json(data, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Cache-Control': 'public, max-age=300', // 緩存5分鐘
      },
    });
  } catch (error) {
    console.error('❌ Value Chart API代理錯誤:', error);

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

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
