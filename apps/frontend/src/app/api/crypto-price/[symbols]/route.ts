import { NextRequest, NextResponse } from 'next/server';

// 1inch Spot Price API基礎URL
const ONEINCH_API_BASE = 'https://api.1inch.dev/spot-price/v1.1';

/**
 * GET處理程序 - 獲取特定代幣的價格數據
 *
 * 路由: /api/crypto-price/{symbols}?chainId={chainId}
 *
 * @param request Next.js請求對象
 * @param params 路由參數，包含代幣地址列表（逗號分隔）
 * @returns 價格數據響應
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { symbols: string } }
) {
  try {
    const { symbols } = params;
    const searchParams = request.nextUrl.searchParams;
    const chainId = searchParams.get('chainId') || '1'; // 默認使用以太坊主網

    // 基本參數驗證
    if (!symbols || symbols.trim() === '') {
      return NextResponse.json(
        { error: 'Missing token symbols or addresses' },
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

    console.log(
      `🔄 代理請求: Spot Price data for tokens ${symbols} on chain ${chainId}`
    );

    // 調用1inch Spot Price API
    const oneinchUrl = `${ONEINCH_API_BASE}/${chainId}/${symbols}`;
    console.log(`🔍 訪問1inch Spot Price API: ${oneinchUrl}`);

    const response = await fetch(oneinchUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'User-Agent': 'UniPortfolio/1.0',
      },
      // 設置10秒超時
      signal: AbortSignal.timeout(10000),
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
        errorMessage = 'Price data not found';
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

    // 打印信息
    const tokenCount = Object.keys(data).length;
    console.log(`✅ 價格數據獲取成功: ${tokenCount}個代幣`);

    // 返回代理響應，添加CORS頭部和緩存控制
    return NextResponse.json(data, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Cache-Control': 'public, max-age=30', // 緩存30秒
      },
    });
  } catch (error) {
    console.error('❌ Spot Price API代理錯誤:', error);

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

/**
 * OPTIONS處理程序 - 處理預檢請求 (CORS)
 */
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
