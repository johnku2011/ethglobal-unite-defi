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
    const tokenAddress = searchParams.get('tokenAddress');
    const amount = searchParams.get('amount');

    if (!tokenAddress || !amount) {
      return NextResponse.json(
        { error: 'Missing required parameters: tokenAddress, amount' },
        { status: 400 }
      );
    }

    console.log(
      `📝 Getting approval transaction for token ${tokenAddress} amount ${amount} on chain ${chainId}`
    );

    // Build query string for 1inch API
    const queryParams = new URLSearchParams({
      tokenAddress,
      amount,
    });

    // Make request to 1inch Approval Transaction API
    const response = await fetch(
      `${ONEINCH_API_BASE}/swap/v6.1/${chainId}/approve/transaction?${queryParams}`,
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
        `❌ 1inch Approval Transaction API error: ${response.status} - ${errorText}`
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
    console.log(`✅ Approval transaction data retrieved for ${tokenAddress}`);

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, max-age=60', // Cache for 1 minute
      },
    });
  } catch (error) {
    console.error('❌ Approval Transaction API route error:', error);

    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
