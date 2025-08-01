import { NextResponse } from 'next/server';
import { CryptoPriceService } from '@/services/cryptoPriceService';

/**
 * Default cryptocurrency price API route using CoinGecko
 * GET /api/crypto-price-coingecko
 * Returns price data with real 24h changes for popular cryptocurrencies
 */
export async function GET(_request: Request) {
  try {
    console.log(
      '🔄 CoinGecko API: Fetching default popular cryptocurrency prices with 24h changes'
    );

    // Default popular cryptocurrencies
    const defaultSymbols = [
      'BTC',
      'ETH',
      'USDT',
      'BNB',
      'SOL',
      'ADA',
      'XRP',
      'DOGE',
      'AVAX',
      'MATIC',
    ];

    // Fetch data using CoinGecko
    const pricesData =
      await CryptoPriceService.getPricesWithChanges(defaultSymbols);

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
