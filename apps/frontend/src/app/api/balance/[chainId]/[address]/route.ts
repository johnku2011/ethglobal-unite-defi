import { NextRequest, NextResponse } from 'next/server';

const ONEINCH_API_KEY = process.env.NEXT_PUBLIC_1INCH_API_KEY;
const ONEINCH_API_BASE = 'https://api.1inch.dev';

export async function GET(
  request: NextRequest,
  { params }: { params: { chainId: string; address: string } }
) {
  try {
    const { chainId, address } = params;

    if (!ONEINCH_API_KEY) {
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }

    // Validate address format
    if (!address.match(/^0x[a-fA-F0-9]{40}$/)) {
      return NextResponse.json(
        { error: 'Invalid wallet address format' },
        { status: 400 }
      );
    }

    console.log(`📊 Fetching balance for ${address} on chain ${chainId}`);

    // Make request to 1inch Balance API
    // 根据1inch API文档，正确的路径应该是 /balance/v1.2/{chainId}/{address}
    const response = await fetch(
      `${ONEINCH_API_BASE}/balance/v1.2/${chainId}/balances/${address}`,
      {
        headers: {
          Authorization: `Bearer ${ONEINCH_API_KEY}`,
          Accept: 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ 1inch API error: ${response.status} - ${errorText}`);

      return NextResponse.json(
        {
          error: `1inch API error: ${response.status}`,
          details: errorText,
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log(`✅ Successfully fetched balances for ${address}`);

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, max-age=30', // Cache for 30 seconds
      },
    });
  } catch (error) {
    console.error('❌ Balance API route error:', error);

    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
