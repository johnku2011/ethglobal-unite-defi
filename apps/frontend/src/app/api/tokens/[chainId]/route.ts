import { NextRequest, NextResponse } from 'next/server';

const ONEINCH_API_KEY = process.env.NEXT_PUBLIC_1INCH_API_KEY;
const ONEINCH_API_BASE = 'https://api.1inch.dev';

export async function GET(
  request: NextRequest,
  { params }: { params: { chainId: string } }
) {
  try {
    const { chainId } = params;

    if (!ONEINCH_API_KEY) {
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }

    console.log(`🪙 Fetching tokens for chain ${chainId}`);

    // Make request to 1inch Tokens API
    const response = await fetch(
      `${ONEINCH_API_BASE}/swap/v6.1/${chainId}/tokens`,
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
        `❌ 1inch Tokens API error: ${response.status} - ${errorText}`
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
    console.log(`✅ Successfully fetched tokens for chain ${chainId}`);

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
      },
    });
  } catch (error) {
    console.error('❌ Tokens API route error:', error);

    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
