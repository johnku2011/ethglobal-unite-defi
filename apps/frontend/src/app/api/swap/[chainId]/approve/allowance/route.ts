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
    const walletAddress = searchParams.get('walletAddress');

    if (!tokenAddress || !walletAddress) {
      return NextResponse.json(
        { error: 'Missing required parameters: tokenAddress, walletAddress' },
        { status: 400 }
      );
    }

    console.log(`🔍 Checking allowance for token ${tokenAddress} wallet ${walletAddress} on chain ${chainId}`);

    // Build query string for 1inch API
    const queryParams = new URLSearchParams({
      tokenAddress,
      walletAddress: walletAddress.toLowerCase(),
    });

    // Make request to 1inch Allowance API
    const response = await fetch(
      `${ONEINCH_API_BASE}/swap/v6.1/${chainId}/approve/allowance?${queryParams}`,
      {
        headers: {
          Authorization: `Bearer ${ONEINCH_API_KEY}`,
          Accept: 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ 1inch Allowance API error: ${response.status} - ${errorText}`);
      
      return NextResponse.json(
        { 
          error: `1inch API error: ${response.status}`,
          details: errorText 
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log(`✅ Allowance check complete: ${data.allowance}`);

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, max-age=30', // Cache for 30 seconds
      },
    });

  } catch (error) {
    console.error('❌ Allowance API route error:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 