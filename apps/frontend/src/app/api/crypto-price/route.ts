import { NextRequest, NextResponse } from 'next/server';
import { COMMON_TOKEN_ADDRESSES } from '@/types/cryptoPrice';

// 1inch Spot Price API基礎URL
// Back to official format from documentation
const ONEINCH_API_BASE = 'https://api.1inch.dev/price/v1.1';

/**
 * 獲取默認流行加密貨幣價格數據
 * 路由: /api/crypto-price
 */
export async function GET(_request: NextRequest) {
  try {
    const searchParams = _request.nextUrl.searchParams;
    const chainId = searchParams.get('chainId') || '1'; // 默認使用以太坊主網

    // 默認獲取熱門代幣的價格
    // 這裡使用預設的一組熱門代幣
    const defaultTokens = [
      COMMON_TOKEN_ADDRESSES.ETH,
      COMMON_TOKEN_ADDRESSES.WBTC,
      COMMON_TOKEN_ADDRESSES.USDT,
      COMMON_TOKEN_ADDRESSES.USDC,
      COMMON_TOKEN_ADDRESSES.BNB,
      COMMON_TOKEN_ADDRESSES.SOL,
    ]
      .filter(Boolean)
      .join(',');

    // 檢查API密鑰
    const apiKey = process.env.NEXT_PUBLIC_1INCH_API_KEY;
    if (!apiKey) {
      console.error('❌ 1inch API key not configured');
      return NextResponse.json(
        { error: 'API configuration error' },
        { status: 500 }
      );
    }

    console.log(`🔄 代理請求: 默認熱門代幣價格數據 (鏈ID: ${chainId})`);

    // 調用1inch Spot Price API
    const oneinchUrl = `${ONEINCH_API_BASE}/${chainId}/${defaultTokens}`;
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

      return NextResponse.json(
        {
          error: 'Failed to fetch price data',
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

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function OPTIONS(_request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
