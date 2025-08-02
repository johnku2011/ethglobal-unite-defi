import { NextRequest, NextResponse } from 'next/server';

const ONEINCH_API_KEY = process.env.NEXT_PUBLIC_ONEINCH_API_KEY;
const ONEINCH_API_BASE = 'https://api.1inch.dev';

export async function GET(
  request: NextRequest,
  { params }: { params: { chainId: string } }
) {
  try {
    const { chainId } = params;
    const { searchParams } = new URL(request.url);

    if (!ONEINCH_API_KEY) {
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }

    // Extract query parameters
    const src = searchParams.get('src');
    const dst = searchParams.get('dst');
    const amount = searchParams.get('amount');

    if (!src || !dst || !amount) {
      return NextResponse.json(
        { error: 'Missing required parameters: src, dst, amount' },
        { status: 400 }
      );
    }

    console.log(
      `💱 Getting quote for ${amount} from ${src} to ${dst} on chain ${chainId}`
    );

    // Build query string for 1inch API
    const queryParams = new URLSearchParams({
      src,
      dst,
      amount,
      includeTokensInfo: 'true',
      includeProtocols: 'true',
      includeGas: 'true',
    });

    // Make request to 1inch Quote API
    const response = await fetch(
      `${ONEINCH_API_BASE}/swap/v6.1/${chainId}/quote?${queryParams}`,
      {
        headers: {
          Authorization: `Bearer ${ONEINCH_API_KEY}`,
          Accept: 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `❌ 1inch Quote API error: ${response.status} - ${errorText}`
      );

      return NextResponse.json(
        {
          error: `1inch API error: ${response.status}`,
          details: errorText,
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log(`✅ Successfully got quote for ${amount} ${src} -> ${dst}`);

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, max-age=10', // Cache for 10 seconds
      },
    });
  } catch (error) {
    console.error('❌ Quote API route error:', error);

    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
