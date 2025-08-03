'use client';

import React, { useState, useEffect } from 'react';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';
import type { SwapQuote, Token } from '@/types';
import { CryptoPriceService } from '@/services/cryptoPriceService';

interface SwapConfirmationProps {
  quote: SwapQuote;
  onConfirm: () => void;
  onCancel: () => void;
  isExecuting: boolean;
}

const SwapConfirmation: React.FC<SwapConfirmationProps> = ({
  quote,
  onConfirm,
  onCancel,
  isExecuting,
}) => {
  const [hasConfirmed, setHasConfirmed] = useState(false);
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [isLoadingPrices, setIsLoadingPrices] = useState(true);

  const formatAmount = (amount: string, decimals: number) => {
    const value = parseFloat(amount) / Math.pow(10, decimals);
    return value.toFixed(6);
  };

  const formatTokenAmount = (amount: string, token: Token) => {
    return `${formatAmount(amount, token.decimals)} ${token.symbol}`;
  };

  // Fetch real-time prices
  useEffect(() => {
    const fetchPrices = async () => {
      try {
        setIsLoadingPrices(true);
        const symbols = [quote.fromToken.symbol, quote.toToken.symbol];
        const priceData = await CryptoPriceService.getPrices(symbols);

        const priceMap: Record<string, number> = {};
        priceData.forEach((item) => {
          priceMap[item.token.symbol] = item.price;
        });

        setPrices(priceMap);
      } catch (error) {
        console.error('Failed to fetch prices:', error);
        // Fallback to default prices
        setPrices({
          ETH: 2000,
          USDC: 1,
          USDT: 1,
        });
      } finally {
        setIsLoadingPrices(false);
      }
    };

    fetchPrices();
  }, [quote.fromToken.symbol, quote.toToken.symbol]);

  // Calculate exchange rate properly
  const calculateExchangeRate = () => {
    const fromAmountDecimal =
      parseFloat(quote.fromAmount) / Math.pow(10, quote.fromToken.decimals);
    const toAmountDecimal =
      parseFloat(quote.toAmount) / Math.pow(10, quote.toToken.decimals);

    if (fromAmountDecimal === 0) return 0;

    return toAmountDecimal / fromAmountDecimal;
  };

  const calculatePriceImpact = () => {
    const fromAmountDecimal =
      parseFloat(quote.fromAmount) / Math.pow(10, quote.fromToken.decimals);
    const toAmountDecimal =
      parseFloat(quote.toAmount) / Math.pow(10, quote.toToken.decimals);

    if (fromAmountDecimal === 0) return 0;

    // Calculate price impact based on USD values
    const fromPrice = prices[quote.fromToken.symbol] || 0;
    const toPrice = prices[quote.toToken.symbol] || 0;

    if (fromPrice === 0 || toPrice === 0) return 0;

    const fromUSDValue = fromAmountDecimal * fromPrice;
    const toUSDValue = toAmountDecimal * toPrice;

    if (fromUSDValue === 0) return 0;

    // Price impact is the difference between input and output USD values
    return Math.abs((toUSDValue / fromUSDValue - 1) * 100);
  };

  const priceImpact = calculatePriceImpact();
  const isHighPriceImpact = priceImpact > 5; // Warning threshold

  const getMinimumReceived = () => {
    const toAmountDecimal =
      parseFloat(quote.toAmount) / Math.pow(10, quote.toToken.decimals);
    const slippageMultiplier = 1 - quote.slippage / 100;
    return toAmountDecimal * slippageMultiplier;
  };

  const exchangeRate = calculateExchangeRate();

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
      <div className='max-w-md w-full mx-4 bg-white rounded-xl shadow-xl'>
        {/* Header */}
        <div className='flex items-center justify-between p-6 border-b border-gray-200'>
          <div className='flex items-center space-x-3'>
            <InformationCircleIcon className='w-8 h-8 text-blue-600' />
            <div>
              <h3 className='text-lg font-semibold text-gray-900'>
                Confirm Swap
              </h3>
              <p className='text-sm text-gray-600'>
                Review your swap details before confirming
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className='text-gray-400 hover:text-gray-600 transition-colors'
          >
            <svg
              className='w-6 h-6'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M6 18L18 6M6 6l12 12'
              />
            </svg>
          </button>
        </div>

        {/* Swap Details */}
        <div className='p-6 space-y-6'>
          {/* Swap Amounts */}
          <div className='bg-gray-50 rounded-lg p-4'>
            <div className='flex items-center justify-between mb-4'>
              <div className='flex items-center space-x-2'>
                <span className='text-sm font-medium text-gray-600'>
                  You Pay
                </span>
              </div>
              <div className='text-right'>
                <div className='text-lg font-semibold'>
                  {formatTokenAmount(quote.fromAmount, quote.fromToken)}
                </div>
                <div className='text-sm text-gray-500'>
                  ≈ $
                  {isLoadingPrices
                    ? '...'
                    : (
                        (parseFloat(quote.fromAmount) /
                          Math.pow(10, quote.fromToken.decimals)) *
                        (prices[quote.fromToken.symbol] || 0)
                      ).toFixed(2)}{' '}
                  USD
                </div>
              </div>
            </div>

            <div className='flex justify-center mb-4'>
              <div className='w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center'>
                <svg
                  className='w-4 h-4 text-blue-600'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M7 16l-4-4m0 0l4-4m-4 4h18'
                  />
                </svg>
              </div>
            </div>

            <div className='flex items-center justify-between'>
              <div className='flex items-center space-x-2'>
                <span className='text-sm font-medium text-gray-600'>
                  You Receive
                </span>
              </div>
              <div className='text-right'>
                <div className='text-lg font-semibold'>
                  {formatTokenAmount(quote.toAmount, quote.toToken)}
                </div>
                <div className='text-sm text-gray-500'>
                  ≈ $
                  {isLoadingPrices
                    ? '...'
                    : (
                        (parseFloat(quote.toAmount) /
                          Math.pow(10, quote.toToken.decimals)) *
                        (prices[quote.toToken.symbol] || 0)
                      ).toFixed(2)}{' '}
                  USD
                </div>
              </div>
            </div>
          </div>

          {/* Exchange Rate */}
          <div className='bg-blue-50 rounded-lg p-4'>
            <div className='flex items-center justify-between'>
              <span className='text-sm font-medium text-blue-900'>
                Exchange Rate
              </span>
              <div className='text-right'>
                <div className='text-sm font-semibold text-blue-900'>
                  1 {quote.fromToken.symbol} ={' '}
                  {exchangeRate > 0 ? exchangeRate.toFixed(6) : '0.000000'}{' '}
                  {quote.toToken.symbol}
                </div>
              </div>
            </div>
          </div>

          {/* Transaction Details */}
          <div className='space-y-3'>
            <div className='flex items-center justify-between'>
              <span className='text-sm text-gray-600'>Slippage Tolerance</span>
              <span className='text-sm font-medium'>{quote.slippage}%</span>
            </div>

            <div className='flex items-center justify-between'>
              <span className='text-sm text-gray-600'>Minimum Received</span>
              <span className='text-sm font-medium'>
                {formatAmount(
                  getMinimumReceived().toString(),
                  quote.toToken.decimals
                )}{' '}
                {quote.toToken.symbol}
              </span>
            </div>

            <div className='flex items-center justify-between'>
              <span className='text-sm text-gray-600'>Estimated Gas</span>
              <span className='text-sm font-medium'>
                {quote.estimatedGas || 'Unknown'} gas
              </span>
            </div>

            <div className='flex items-center justify-between'>
              <span className='text-sm text-gray-600'>Price Impact</span>
              <span
                className={`text-sm font-medium ${isHighPriceImpact ? 'text-red-600' : 'text-green-600'}`}
              >
                {priceImpact.toFixed(2)}%
                {isHighPriceImpact && (
                  <ExclamationTriangleIcon className='w-4 h-4 inline ml-1' />
                )}
              </span>
            </div>
          </div>

          {/* Price Impact Warning */}
          {isHighPriceImpact && (
            <div className='bg-red-50 border border-red-200 rounded-lg p-3'>
              <div className='flex items-start space-x-2'>
                <ExclamationTriangleIcon className='w-5 h-5 text-red-600 mt-0.5' />
                <div>
                  <p className='text-sm font-medium text-red-800'>
                    High Price Impact
                  </p>
                  <p className='text-sm text-red-700 mt-1'>
                    This swap has a high price impact of{' '}
                    {priceImpact.toFixed(2)}%. Consider using a smaller amount
                    or check for better routes.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Slippage Warning */}
          {quote.slippage > 10 && (
            <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-3'>
              <div className='flex items-start space-x-2'>
                <ExclamationTriangleIcon className='w-5 h-5 text-yellow-600 mt-0.5' />
                <div>
                  <p className='text-sm font-medium text-yellow-800'>
                    High Slippage
                  </p>
                  <p className='text-sm text-yellow-700 mt-1'>
                    Your slippage tolerance is set to {quote.slippage}%. This is
                    higher than recommended and may result in unfavorable rates.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Confirmation Checkbox */}
          <div className='flex items-start space-x-3'>
            <input
              type='checkbox'
              id='confirm-swap'
              checked={hasConfirmed}
              onChange={(e) => setHasConfirmed(e.target.checked)}
              className='mt-1 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2'
            />
            <label htmlFor='confirm-swap' className='text-sm text-gray-700'>
              I understand that this transaction cannot be undone and I accept
              the terms of this swap.
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className='flex space-x-3 p-6 border-t border-gray-200'>
          <button
            onClick={onCancel}
            disabled={isExecuting}
            className='flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={!hasConfirmed || isExecuting}
            className='flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2'
          >
            {isExecuting ? (
              <>
                <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
                <span>Executing...</span>
              </>
            ) : (
              <>
                <CheckCircleIcon className='w-4 h-4' />
                <span>Confirm Swap</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SwapConfirmation;
