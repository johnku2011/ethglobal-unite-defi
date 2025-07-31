import { NextRequest, NextResponse } from 'next/server';

// 1inch History API v2.0 - Transaction Details 代理路由
const ONEINCH_API_BASE = 'https://api.1inch.dev/history';

export async function GET(
  request: NextRequest,
  { params }: { params: { chainId: string; txHash: string } }
) {
  try {
    const { chainId, txHash } = params;

    // 驗證參數
    if (!chainId || isNaN(parseInt(chainId))) {
      return NextResponse.json(
        { error: 'Invalid chain ID format' },
        { status: 400 }
      );
    }

    if (!txHash || !txHash.match(/^0x[a-fA-F0-9]{64}$/)) {
      return NextResponse.json(
        { error: 'Invalid transaction hash format' },
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
      `📜 代理請求: Transaction details for ${txHash} on chain ${chainId}`
    );

    // 構建1inch History API URL
    const oneinchUrl = `${ONEINCH_API_BASE}/v2.0/history/transaction/${chainId}/${txHash}`;
    console.log(`🔍 訪問1inch History API Transaction Details: ${oneinchUrl}`);

    // 調用1inch History API
    const response = await fetch(oneinchUrl, {
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
      `📊 1inch Transaction Details API響應: ${response.status} ${response.statusText}`
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `❌ 1inch Transaction Details API錯誤 (${response.status}):`,
        errorText
      );

      let errorMessage = 'Transaction details request failed';
      if (response.status === 401) {
        errorMessage = 'Invalid API key';
      } else if (response.status === 429) {
        errorMessage = 'Rate limit exceeded';
      } else if (response.status === 404) {
        errorMessage = 'Transaction not found';
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
    console.log(`✅ Transaction details retrieved for ${txHash}`);

    return NextResponse.json(data, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Cache-Control': 'public, max-age=3600', // 交易詳情可以緩存更長時間
      },
    });
  } catch (error) {
    console.error('❌ Transaction Details API代理錯誤:', error);

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
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
