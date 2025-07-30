'use client';

import React from 'react';
import {
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  LinkIcon,
} from '@heroicons/react/24/outline';
import type { Protocol } from '@/services/api/oneinchAPI';

// Chain information mapping
const CHAIN_INFO: Record<
  number,
  { name: string; icon: string; color: string }
> = {
  1: { name: 'Ethereum', icon: '🔷', color: 'bg-blue-100 text-blue-800' },
  56: { name: 'BNB Chain', icon: '🟡', color: 'bg-yellow-100 text-yellow-800' },
  137: { name: 'Polygon', icon: '🟣', color: 'bg-purple-100 text-purple-800' },
  10: { name: 'Optimism', icon: '🔴', color: 'bg-red-100 text-red-800' },
  42161: { name: 'Arbitrum', icon: '🔵', color: 'bg-blue-100 text-blue-800' },
  8453: { name: 'Base', icon: '🔵', color: 'bg-blue-100 text-blue-800' },
  43114: { name: 'Avalanche', icon: '🔺', color: 'bg-red-100 text-red-800' },
  100: { name: 'Gnosis', icon: '🟢', color: 'bg-green-100 text-green-800' },
  324: {
    name: 'zkSync Era',
    icon: '⚡',
    color: 'bg-purple-100 text-purple-800',
  },
  59144: { name: 'Linea', icon: '📏', color: 'bg-gray-100 text-gray-800' },
};

interface AssetCardProps {
  asset: Protocol;
  showChainBadge?: boolean;
  onViewDetails?: (asset: Protocol) => void;
}

export const AssetCard: React.FC<AssetCardProps> = ({
  asset,
  showChainBadge = true,
  onViewDetails,
}) => {
  const chainInfo = CHAIN_INFO[asset.chain_id] || {
    name: `Chain ${asset.chain_id}`,
    icon: '⛓️',
    color: 'bg-gray-100 text-gray-800',
  };

  // Calculate ROI display
  const roiDisplay = asset.roi !== null ? asset.roi : 0;
  const profitDisplay = asset.profit_abs_usd || 0;
  const isPositive = profitDisplay > 0;
  const isNegative = profitDisplay < 0;

  // Format large numbers
  const formatValue = (value: number): string => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(2)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(2)}K`;
    }
    return `$${value.toFixed(2)}`;
  };

  // Get the main token for display
  const mainToken = asset.underlying_tokens?.[0];
  const totalTokens = asset.underlying_tokens?.length || 0;

  return (
    <div className='bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 hover:border-gray-300'>
      {/* Header */}
      <div className='flex items-start justify-between mb-4'>
        <div className='flex-1 max-w-[calc(100%-4rem)]'>
          <div className='flex items-center space-x-3 mb-2'>
            <div className='w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm'>
              {asset.protocol.slice(0, 2).toUpperCase()}
            </div>
            <div className='flex-1 min-w-0'>
              <h3 className='font-semibold text-gray-900 truncate'>
                {asset.name || asset.protocol}
              </h3>
              <p className='text-sm text-gray-500 truncate'>{asset.protocol}</p>
            </div>
          </div>

          {/* Chain Badge */}
          {showChainBadge && (
            <div className='flex items-center space-x-2'>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${chainInfo.color}`}
              >
                <span className='mr-1'>{chainInfo.icon}</span>
                {chainInfo.name}
              </span>
            </div>
          )}
        </div>

        {/* Options Button */}
        <button
          onClick={() => onViewDetails?.(asset)}
          className='text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors'
          title='View Details'
        >
          <LinkIcon className='w-4 h-4' />
        </button>
      </div>

      {/* Value Section */}
      <div className='space-y-3'>
        {/* Total Value */}
        <div className='flex items-center justify-between'>
          <span className='text-sm text-gray-600'>Total Value</span>
          <span className='font-semibold text-gray-900'>
            {formatValue(asset.value_usd)}
          </span>
        </div>

        {/* Profit/Loss */}
        {profitDisplay !== 0 && (
          <div className='flex items-center justify-between'>
            <span className='text-sm text-gray-600'>P&L</span>
            <div className='flex items-center space-x-1'>
              {isPositive && (
                <ArrowTrendingUpIcon className='w-4 h-4 text-green-500' />
              )}
              {isNegative && (
                <ArrowTrendingDownIcon className='w-4 h-4 text-red-500' />
              )}
              <span
                className={`text-sm font-medium ${
                  isPositive
                    ? 'text-green-600'
                    : isNegative
                      ? 'text-red-600'
                      : 'text-gray-600'
                }`}
              >
                {isPositive ? '+' : ''}
                {formatValue(profitDisplay)}
              </span>
            </div>
          </div>
        )}

        {/* ROI */}
        {asset.roi !== null && asset.roi !== 0 && (
          <div className='flex items-center justify-between'>
            <span className='text-sm text-gray-600'>ROI</span>
            <div className='flex items-center space-x-1'>
              {roiDisplay > 0 && (
                <ArrowTrendingUpIcon className='w-4 h-4 text-green-500' />
              )}
              {roiDisplay < 0 && (
                <ArrowTrendingDownIcon className='w-4 h-4 text-red-500' />
              )}
              <span
                className={`text-sm font-medium ${
                  roiDisplay > 0
                    ? 'text-green-600'
                    : roiDisplay < 0
                      ? 'text-red-600'
                      : 'text-gray-600'
                }`}
              >
                {roiDisplay > 0 ? '+' : ''}
                {roiDisplay.toFixed(2)}%
              </span>
            </div>
          </div>
        )}

        {/* Token Information */}
        {mainToken && (
          <div className='pt-3 border-t border-gray-100'>
            <div className='flex items-center justify-between text-sm'>
              <span className='text-gray-600'>
                {totalTokens > 1 ? `${totalTokens} tokens` : mainToken.symbol}
              </span>
              {totalTokens === 1 ? (
                <span className='text-gray-900 font-medium'>
                  {mainToken.amount.toLocaleString(undefined, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 6,
                  })}
                </span>
              ) : (
                <span className='text-gray-500 text-xs'>Multiple tokens</span>
              )}
            </div>

            {totalTokens === 1 && (
              <div className='flex items-center justify-between text-xs text-gray-500 mt-1'>
                <span>@ ${mainToken.price_to_usd.toFixed(4)}</span>
                <span>${mainToken.value_usd.toFixed(2)}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Contract Address (for advanced users) */}
      <div className='mt-4 pt-3 border-t border-gray-100'>
        <div className='flex items-center justify-between text-xs text-gray-400'>
          <span>Contract</span>
          <span className='font-mono'>
            {asset.contract_address.slice(0, 6)}...
            {asset.contract_address.slice(-4)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default AssetCard;
