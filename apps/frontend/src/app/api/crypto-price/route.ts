import { NextRequest, NextResponse } from 'next/server';
import { COMMON_TOKEN_ADDRESSES } from '@/types/cryptoPrice';

// 1inch Spot Price API base URL
// Back to official format from documentation
const ONEINCH_API_BASE = 'https://api.1inch.dev/price/v1.1';

/**
 * Get default popular cryptocurrency price data
 * Route: /api/crypto-price
 */
export async function GET(_request: NextRequest) {
  try {
    const searchParams = _request.nextUrl.searchParams;
    const chainId = searchParams.get('chainId') || '1'; // Default to Ethereum mainnet

    // Get default popular token prices
    // Using a predefined set of popular tokens
    const defaultTokens = [
      COMMON_TOKEN_ADDRESSES.ETH,
      COMMON_TOKEN_ADDRESSES.BTC,
      COMMON_TOKEN_ADDRESSES.USDT,
      COMMON_TOKEN_ADDRESSES.USDC,
      COMMON_TOKEN_ADDRESSES.BNB,
      COMMON_TOKEN_ADDRESSES.SOL,
    ]
      .filter(Boolean)
      .join(',');

    // Check API key
    const apiKey = process.env.NEXT_PUBLIC_1INCH_API_KEY;
    if (!apiKey) {
      console.error('❌ 1inch API key not configured');
      return NextResponse.json(
        { error: 'API configuration error' },
        { status: 500 }
      );
    }

    console.log(
      `🔄 Proxy request: Default popular tokens price data (Chain ID: ${chainId})`
    );

    // Call 1inch Spot Price API with required currency parameter
    const oneinchUrl = `${ONEINCH_API_BASE}/${chainId}/${defaultTokens}?currency=USD`;
    console.log(`🔍 Accessing 1inch Spot Price API: ${oneinchUrl}`);

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

    // Parse and return data
    const data = await response.json();

    // Print information
    const tokenCount = Object.keys(data).length;
    console.log(`✅ Price data fetched successfully: ${tokenCount} tokens`);

    // Return proxy response with CORS headers and cache control
    return NextResponse.json(data, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Cache-Control': 'public, max-age=30', // Cache for 30 seconds
      },
    });
  } catch (error) {
    console.error('❌ Spot Price API proxy error:', error);

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
