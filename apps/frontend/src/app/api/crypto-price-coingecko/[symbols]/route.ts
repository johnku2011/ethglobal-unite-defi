import { NextResponse } from 'next/server';
import { CryptoPriceService } from '@/services/cryptoPriceService';

interface RouteParams {
  symbols: string;
}

/**
 * Dynamic cryptocurrency price API route using CoinGecko
 * GET /api/crypto-price-coingecko/[symbols]
 * Returns price data with real 24h changes for specified cryptocurrencies
 */
export async function GET(
  _request: Request,
  { params }: { params: RouteParams }
) {
  try {
    const { symbols } = params;

    console.log(
      `🔄 CoinGecko API: Fetching specific cryptocurrency prices with 24h changes for: ${symbols}`
    );

    if (!symbols) {
      return NextResponse.json(
        { error: 'Missing symbols parameter' },
        { status: 400 }
      );
    }

    // Parse symbols from URL parameter
    const symbolArray = symbols.split(',').map((s) => s.trim().toUpperCase());

    if (symbolArray.length === 0) {
      return NextResponse.json(
        { error: 'No valid symbols provided' },
        { status: 400 }
      );
    }

    console.log(`📊 Requested symbols: ${symbolArray.join(', ')}`);

    // Fetch data using CoinGecko
    const pricesData =
      await CryptoPriceService.getPricesWithChanges(symbolArray);

    console.log(
      `✅ Successfully fetched CoinGecko price data for ${pricesData.length} tokens`
    );

    return NextResponse.json(pricesData, {
      status: 200,
      headers: {
        'Cache-Control': 's-maxage=30, stale-while-revalidate=60',
      },
    });
  } catch (error: any) {
    console.error('❌ CoinGecko API error:', error.message);

    return NextResponse.json(
      {
        error: 'Failed to fetch cryptocurrency price data from CoinGecko',
        message: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
