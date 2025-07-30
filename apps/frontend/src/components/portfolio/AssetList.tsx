'use client';

import React, { useState, useMemo } from 'react';
import {
  EyeIcon,
  EyeSlashIcon,
  FunnelIcon,
  Bars3Icon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import AssetCard from './AssetCard';
import type { Protocol } from '@/services/api/oneinchAPI';

interface AssetListProps {
  assets: Protocol[];
  isLoading?: boolean;
  onAssetClick?: (asset: Protocol) => void;
  groupByChain?: boolean;
}

type SortOption = 'value' | 'name' | 'roi' | 'chain';
type ViewMode = 'grid' | 'list';

// Minimum value threshold for "small balances"
const SMALL_BALANCE_THRESHOLD = 10; // $10

export const AssetList: React.FC<AssetListProps> = ({
  assets,
  isLoading = false,
  onAssetClick,
  groupByChain = true,
}) => {
  const [sortBy, setSortBy] = useState<SortOption>('value');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [hideSmallBalances, setHideSmallBalances] = useState(false);
  const [selectedChain, setSelectedChain] = useState<number | 'all'>('all');

  // Process and filter assets
  const processedAssets = useMemo(() => {
    let filtered = [...assets];

    // Hide small balances filter
    if (hideSmallBalances) {
      filtered = filtered.filter(
        (asset) => asset.value_usd >= SMALL_BALANCE_THRESHOLD
      );
    }

    // Chain filter
    if (selectedChain !== 'all') {
      filtered = filtered.filter((asset) => asset.chain_id === selectedChain);
    }

    // Sort assets
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'value':
          return b.value_usd - a.value_usd;
        case 'name':
          return (a.name || a.protocol).localeCompare(b.name || b.protocol);
        case 'roi':
          const aRoi = a.roi || 0;
          const bRoi = b.roi || 0;
          return bRoi - aRoi;
        case 'chain':
          return a.chain_id - b.chain_id;
        default:
          return 0;
      }
    });

    return filtered;
  }, [assets, hideSmallBalances, selectedChain, sortBy]);

  // Group assets by chain
  const groupedAssets = useMemo(() => {
    if (!groupByChain) return { all: processedAssets };

    const groups: Record<string, Protocol[]> = {};
    processedAssets.forEach((asset) => {
      const chainKey = asset.chain_id.toString();
      if (!groups[chainKey]) {
        groups[chainKey] = [];
      }
      groups[chainKey].push(asset);
    });

    return groups;
  }, [processedAssets, groupByChain]);

  // Get unique chains for filter dropdown
  const availableChains = useMemo(() => {
    const chains = new Set(assets.map((asset) => asset.chain_id));
    return Array.from(chains).sort((a, b) => a - b);
  }, [assets]);

  // Chain names mapping
  const getChainName = (chainId: number): string => {
    const chainNames: Record<number, string> = {
      1: 'Ethereum',
      56: 'BNB Chain',
      137: 'Polygon',
      10: 'Optimism',
      42161: 'Arbitrum',
      8453: 'Base',
      43114: 'Avalanche',
      100: 'Gnosis',
      324: 'zkSync Era',
      59144: 'Linea',
    };
    return chainNames[chainId] || `Chain ${chainId}`;
  };

  // Calculate total value for filtered assets
  const totalValue = processedAssets.reduce(
    (sum, asset) => sum + asset.value_usd,
    0
  );
  const hiddenCount = assets.length - processedAssets.length;

  if (isLoading) {
    return (
      <div className='space-y-4'>
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className='bg-white rounded-xl border border-gray-200 p-6 animate-pulse'
          >
            <div className='flex items-center space-x-3 mb-4'>
              <div className='w-10 h-10 bg-gray-200 rounded-lg'></div>
              <div className='flex-1'>
                <div className='h-4 bg-gray-200 rounded w-32 mb-2'></div>
                <div className='h-3 bg-gray-200 rounded w-24'></div>
              </div>
            </div>
            <div className='space-y-2'>
              <div className='h-3 bg-gray-200 rounded w-full'></div>
              <div className='h-3 bg-gray-200 rounded w-3/4'></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (assets.length === 0) {
    return (
      <div className='text-center py-12'>
        <ChartBarIcon className='w-16 h-16 text-gray-300 mx-auto mb-4' />
        <h3 className='text-lg font-medium text-gray-900 mb-2'>
          No Assets Found
        </h3>
        <p className='text-gray-600'>
          Your portfolio doesn't contain any assets on the supported networks.
        </p>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Controls */}
      <div className='flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between'>
        <div className='flex items-center space-x-4'>
          {/* Sort Options */}
          <div className='flex items-center space-x-2'>
            <FunnelIcon className='w-4 h-4 text-gray-500' />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className='text-sm border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500'
            >
              <option value='value'>Sort by Value</option>
              <option value='name'>Sort by Name</option>
              <option value='roi'>Sort by ROI</option>
              <option value='chain'>Sort by Chain</option>
            </select>
          </div>

          {/* Chain Filter */}
          {availableChains.length > 1 && (
            <select
              value={selectedChain}
              onChange={(e) =>
                setSelectedChain(
                  e.target.value === 'all' ? 'all' : parseInt(e.target.value)
                )
              }
              className='text-sm border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500'
            >
              <option value='all'>All Chains</option>
              {availableChains.map((chainId) => (
                <option key={chainId} value={chainId}>
                  {getChainName(chainId)}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className='flex items-center space-x-4'>
          {/* Hide Small Balances Toggle */}
          <button
            onClick={() => setHideSmallBalances(!hideSmallBalances)}
            className={`flex items-center space-x-2 px-3 py-1 rounded-md text-sm transition-colors ${
              hideSmallBalances
                ? 'bg-blue-100 text-blue-700 border border-blue-200'
                : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
            }`}
          >
            {hideSmallBalances ? (
              <EyeSlashIcon className='w-4 h-4' />
            ) : (
              <EyeIcon className='w-4 h-4' />
            )}
            <span>Hide Small Balances</span>
          </button>

          {/* View Mode Toggle */}
          <div className='flex items-center border border-gray-300 rounded-md'>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1 text-sm ${
                viewMode === 'grid'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              } rounded-l-md transition-colors`}
            >
              <ChartBarIcon className='w-4 h-4' />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 text-sm ${
                viewMode === 'list'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              } rounded-r-md transition-colors`}
            >
              <Bars3Icon className='w-4 h-4' />
            </button>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className='bg-gray-50 rounded-lg p-4'>
        <div className='flex items-center justify-between text-sm'>
          <span className='text-gray-600'>
            Showing {processedAssets.length} assets
            {hiddenCount > 0 && (
              <span className='text-gray-500'> ({hiddenCount} hidden)</span>
            )}
          </span>
          <span className='font-medium text-gray-900'>
            Total Value: $
            {totalValue.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        </div>
      </div>

      {/* Assets Display */}
      {processedAssets.length === 0 ? (
        <div className='text-center py-8'>
          <EyeSlashIcon className='w-12 h-12 text-gray-300 mx-auto mb-4' />
          <h3 className='text-lg font-medium text-gray-900 mb-2'>
            No Assets to Display
          </h3>
          <p className='text-gray-600 mb-4'>
            All assets are hidden by the current filters.
          </p>
          <button
            onClick={() => {
              setHideSmallBalances(false);
              setSelectedChain('all');
            }}
            className='btn-secondary'
          >
            Clear Filters
          </button>
        </div>
      ) : groupByChain && Object.keys(groupedAssets).length > 1 ? (
        // Grouped view
        <div className='space-y-8'>
          {Object.entries(groupedAssets).map(([chainId, chainAssets]) => (
            <div key={chainId}>
              <h3 className='text-lg font-semibold text-gray-900 mb-4 flex items-center'>
                <span className='mr-2'>{getChainName(parseInt(chainId))}</span>
                <span className='text-sm font-normal text-gray-500'>
                  ({chainAssets.length} assets • $
                  {chainAssets
                    .reduce((sum, asset) => sum + asset.value_usd, 0)
                    .toLocaleString()}
                  )
                </span>
              </h3>
              <div
                className={`grid gap-6 ${
                  viewMode === 'grid'
                    ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                    : 'grid-cols-1'
                }`}
              >
                {chainAssets.map((asset, index) => (
                  <AssetCard
                    key={`${asset.contract_address}-${index}`}
                    asset={asset}
                    showChainBadge={false}
                    onViewDetails={onAssetClick}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Non-grouped view
        <div
          className={`grid gap-6 ${
            viewMode === 'grid'
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
              : 'grid-cols-1'
          }`}
        >
          {processedAssets.map((asset, index) => (
            <AssetCard
              key={`${asset.contract_address}-${index}`}
              asset={asset}
              showChainBadge={true}
              onViewDetails={onAssetClick}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AssetList;
