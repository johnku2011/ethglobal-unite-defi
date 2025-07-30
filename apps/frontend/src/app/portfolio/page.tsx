'use client';

import React, { useMemo, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useWallet } from '@/providers/WalletProvider';
import {
  usePortfolio,
  useRefreshPortfolio,
  useValueChart,
} from '@/hooks/api/usePortfolioQuery';
import AssetList from '@/components/portfolio/AssetList';
import PortfolioChart from '@/components/portfolio/PortfolioChart';
import SimpleValueChart from '@/components/portfolio/SimpleValueChart';
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ChartPieIcon,
  ChartBarSquareIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import type { Protocol } from '@/services/api/oneinchAPI';

export default function Portfolio() {
  const { connectedWallets } = useWallet();
  const [chartView, setChartView] = useState<'pie' | 'trend'>('pie');

  // Get the first connected Ethereum wallet address
  const ethereumWallet = connectedWallets.find(
    (wallet) => wallet.type === 'ethereum'
  );
  const walletAddress = ethereumWallet?.address;

  // Fetch portfolio data using our custom hook
  const {
    data: portfolioData,
    isLoading,
    error,
    refetch,
    isFetching,
  } = usePortfolio(walletAddress);

  // Fetch value chart data
  const {
    data: chartData,
    isLoading: isChartLoading,
    refetch: refetchChart,
  } = useValueChart(walletAddress, '1month');

  // Refresh portfolio mutation
  const refreshPortfolioMutation = useRefreshPortfolio();

  // Extract all assets from portfolio data (adapting to v5 API response format)
  const allAssets = useMemo(() => {
    if (!portfolioData || !portfolioData.result) return [];

    // 在v5 API中，資產數據在不同的地方
    // 為了兼容現有代碼，我們模擬相同的資產格式
    const assets: Protocol[] = [];

    // 從by_category中獲取tokens、native和protocols
    // 注意：實際數據可能需要從tokens/snapshot API端點獲取

    // 暫時創建一個模擬的Protocol對象
    // 這裡僅創建一個示例資產表示總價值
    if (portfolioData.result.total > 0) {
      const mockProtocol: Protocol = {
        chain_id: 1, // 假設是以太坊
        contract_address: '0x0000000000000000000000000000000000000000',
        protocol: 'Total Assets',
        name: 'Portfolio Total',
        value_usd: portfolioData.result.total,
        underlying_tokens: [],
        profit_abs_usd: null,
        roi: null,
      };
      assets.push(mockProtocol);
    }

    return assets;
  }, [portfolioData]);

  // Calculate portfolio statistics (adapting to v5 API response format)
  const portfolioStats = useMemo(() => {
    if (!portfolioData || !portfolioData.result) {
      return {
        totalValue: '$0.00',
        change24h: '+0.00%',
        changeType: 'neutral' as const,
        totalAssets: 0,
        totalChains: 0,
      };
    }

    const totalValue = portfolioData.result.total;
    // TODO: Implement 24h change calculation using value chart data
    const change24h = 0; // Placeholder - will be calculated from historical data
    const changeType =
      change24h > 0 ? 'positive' : change24h < 0 ? 'negative' : 'neutral';
    const totalAssets = allAssets.length;

    // 獲取鏈的數量 (在v5 API中從by_chain獲取)
    const chainCount = portfolioData.result.by_chain?.length || 0;

    return {
      totalValue:
        totalValue > 0
          ? `$${totalValue.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`
          : '$0.00',
      change24h: `${change24h > 0 ? '+' : ''}${change24h.toFixed(2)}%`,
      changeType,
      totalAssets,
      totalChains: chainCount,
    };
  }, [portfolioData, allAssets]);

  // Handle asset click
  const handleAssetClick = (asset: Protocol) => {
    console.log('Asset clicked:', asset);
    toast.success(`Viewing ${asset.name || asset.protocol} details`);
    // TODO: Implement asset detail modal or navigation
  };

  // Handle manual refresh
  const handleRefresh = async () => {
    if (!walletAddress) {
      toast.error('No wallet connected');
      return;
    }

    try {
      await refreshPortfolioMutation.mutateAsync(walletAddress);
      await Promise.all([refetch(), refetchChart()]);
      toast.success('Portfolio data refreshed successfully');
    } catch (error) {
      console.error('Failed to refresh portfolio:', error);
      toast.error('Failed to refresh portfolio data');
    }
  };

  // Handle chart view toggle
  const toggleChartView = () => {
    setChartView(chartView === 'pie' ? 'trend' : 'pie');
  };

  // Loading state
  if (isLoading && !portfolioData) {
    return (
      <DashboardLayout>
        <div className='space-y-6'>
          <div className='bg-white rounded-xl shadow-soft p-6 border border-gray-100'>
            <div className='animate-pulse'>
              <div className='h-8 bg-gray-200 rounded mb-4'></div>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                {[1, 2, 3].map((i) => (
                  <div key={i} className='bg-gray-50 rounded-lg p-4'>
                    <div className='h-4 bg-gray-200 rounded mb-2'></div>
                    <div className='h-8 bg-gray-200 rounded mb-2'></div>
                    <div className='h-4 bg-gray-200 rounded'></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Error state
  if (error && !portfolioData) {
    return (
      <DashboardLayout>
        <div className='space-y-6'>
          <div className='bg-white rounded-xl shadow-soft p-6 border border-gray-100'>
            <div className='text-center py-8'>
              <div className='w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                <ChartBarIcon className='w-8 h-8 text-red-500' />
              </div>
              <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                Failed to Load Portfolio
              </h3>
              <p className='text-gray-600 mb-4'>
                {error?.message || 'Unable to fetch portfolio data'}
              </p>
              <button
                onClick={() => refetch()}
                className='btn-primary'
                disabled={isFetching}
              >
                {isFetching ? 'Retrying...' : 'Try Again'}
              </button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className='space-y-6'>
        {/* Portfolio Header */}
        <div className='bg-white rounded-xl shadow-soft p-6 border border-gray-100'>
          <div className='flex items-center justify-between mb-6'>
            <div>
              <h2 className='text-2xl font-bold text-gray-900'>
                Portfolio Overview
              </h2>
              <p className='text-gray-600'>
                Track your assets across all connected chains
              </p>
              {walletAddress && (
                <p className='text-sm text-gray-500 font-mono mt-1'>
                  {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                </p>
              )}
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshPortfolioMutation.isPending || isFetching}
              className='btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed'
            >
              <ArrowPathIcon
                className={`w-4 h-4 ${refreshPortfolioMutation.isPending || isFetching ? 'animate-spin' : ''}`}
              />
              <span>
                {refreshPortfolioMutation.isPending || isFetching
                  ? 'Refreshing...'
                  : 'Refresh'}
              </span>
            </button>
          </div>

          {/* Portfolio Stats */}
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            <div className='bg-gray-50 rounded-lg p-4'>
              <h3 className='text-sm font-medium text-gray-600 mb-1'>
                Total Value
              </h3>
              <p className='text-2xl font-bold text-gray-900 mb-1'>
                {portfolioStats.totalValue}
              </p>
              <div className='flex items-center space-x-1'>
                {portfolioStats.changeType === 'positive' && (
                  <ArrowTrendingUpIcon className='w-4 h-4 text-green-500' />
                )}
                {portfolioStats.changeType === 'negative' && (
                  <ArrowTrendingDownIcon className='w-4 h-4 text-red-500' />
                )}
                <span
                  className={`text-sm ${
                    portfolioStats.changeType === 'positive'
                      ? 'text-green-600'
                      : portfolioStats.changeType === 'negative'
                        ? 'text-red-600'
                        : 'text-gray-500'
                  }`}
                >
                  {portfolioStats.change24h}
                </span>
              </div>
            </div>

            <div className='bg-gray-50 rounded-lg p-4'>
              <h3 className='text-sm font-medium text-gray-600 mb-1'>
                Total Assets
              </h3>
              <p className='text-2xl font-bold text-gray-900 mb-1'>
                {portfolioStats.totalAssets}
              </p>
              <div className='flex items-center space-x-1'>
                <span className='text-sm text-gray-500'>
                  Across {portfolioStats.totalChains} chains
                </span>
              </div>
            </div>

            <div className='bg-gray-50 rounded-lg p-4'>
              <h3 className='text-sm font-medium text-gray-600 mb-1'>
                Data Status
              </h3>
              <p className='text-2xl font-bold text-gray-900 mb-1'>
                {portfolioData ? 'Live' : 'Offline'}
              </p>
              <div className='flex items-center space-x-1'>
                <div
                  className={`w-2 h-2 rounded-full ${portfolioData ? 'bg-green-500' : 'bg-gray-400'}`}
                ></div>
                <span className='text-sm text-gray-500'>
                  {portfolioData ? 'Data loaded' : 'No data'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Portfolio Chart with Toggle */}
        <div className='bg-white rounded-xl shadow-soft p-6 border border-gray-100'>
          <div className='flex justify-between items-center mb-4'>
            <h3 className='text-lg font-semibold text-gray-900'>
              Portfolio Visualization
            </h3>
            <div className='flex rounded-md shadow-sm'>
              <button
                onClick={() => setChartView('pie')}
                className={`p-2 text-xs font-medium rounded-l-md flex items-center ${
                  chartView === 'pie'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
                title='Pie Chart'
              >
                <ChartPieIcon className='w-4 h-4 mr-1' />
                <span>Pie Chart</span>
              </button>
              <button
                onClick={() => setChartView('trend')}
                className={`p-2 text-xs font-medium rounded-r-md flex items-center ${
                  chartView === 'trend'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
                title='Value Trend'
              >
                <ChartBarSquareIcon className='w-4 h-4 mr-1' />
                <span>Value Trend</span>
              </button>
            </div>
          </div>

          {chartView === 'pie' ? (
            <PortfolioChart
              assets={allAssets}
              isLoading={isLoading && !portfolioData}
              totalValue={portfolioData?.result?.total || 0}
            />
          ) : (
            <SimpleValueChart
              data={chartData}
              isLoading={isChartLoading}
              timeRange='1month'
              height={300}
              showStats={true}
              onRefresh={() => refetchChart()}
            />
          )}
        </div>

        {/* Assets List */}
        <div className='bg-white rounded-xl shadow-soft border border-gray-100'>
          <div className='p-6 border-b border-gray-100'>
            <div className='flex items-center justify-between'>
              <h3 className='text-lg font-semibold text-gray-900'>
                Your Assets
              </h3>
              <div className='text-sm text-gray-500'>
                {portfolioStats.totalAssets} assets across{' '}
                {portfolioStats.totalChains} chains
              </div>
            </div>
          </div>

          <div className='p-6'>
            {!walletAddress ? (
              <div className='text-center py-8'>
                <ChartBarIcon className='w-12 h-12 text-gray-300 mx-auto mb-4' />
                <h4 className='text-lg font-medium text-gray-900 mb-2'>
                  No Ethereum Wallet Connected
                </h4>
                <p className='text-gray-600 mb-4'>
                  Connect an Ethereum wallet to view your 1inch portfolio data
                </p>
              </div>
            ) : !portfolioData && isLoading ? (
              <div className='text-center py-8'>
                <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4'></div>
                <h4 className='text-lg font-medium text-gray-900 mb-2'>
                  Loading Portfolio Data
                </h4>
                <p className='text-gray-600 mb-4'>
                  Fetching your assets from 1inch Portfolio API...
                </p>
              </div>
            ) : portfolioStats.totalAssets === 0 ? (
              <div className='text-center py-8'>
                <ChartBarIcon className='w-12 h-12 text-gray-300 mx-auto mb-4' />
                <h4 className='text-lg font-medium text-gray-900 mb-2'>
                  No Assets Found
                </h4>
                <p className='text-gray-600 mb-4'>
                  Your wallet doesn't have any tracked assets on supported
                  chains.
                </p>
                <button onClick={handleRefresh} className='btn-primary'>
                  Refresh Portfolio
                </button>
              </div>
            ) : (
              <AssetList
                assets={allAssets}
                isLoading={isLoading && !portfolioData}
                onAssetClick={handleAssetClick}
                groupByChain={true}
              />
            )}
          </div>
        </div>

        {/* Connected Wallets Summary */}
        <div className='bg-white rounded-xl shadow-soft p-6 border border-gray-100'>
          <h3 className='text-lg font-semibold text-gray-900 mb-4'>
            Connected Wallets ({connectedWallets.length})
          </h3>
          <div className='space-y-3'>
            {connectedWallets.map((wallet, index) => (
              <div
                key={index}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  wallet.type === 'ethereum'
                    ? 'bg-blue-50 border border-blue-200'
                    : 'bg-gray-50'
                }`}
              >
                <div className='flex items-center space-x-3'>
                  <div className='text-xl'>
                    {wallet.type === 'ethereum' ? '🔷' : '🔵'}
                  </div>
                  <div>
                    <div className='font-medium text-gray-900'>
                      {wallet.type === 'ethereum' ? 'Ethereum' : 'Sui'} Wallet
                      {wallet.type === 'ethereum' && (
                        <span className='ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded'>
                          1inch Enabled
                        </span>
                      )}
                    </div>
                    <div className='text-sm text-gray-500 font-mono'>
                      {wallet.address}
                    </div>
                  </div>
                </div>
                <div className='text-right'>
                  <div className='text-sm font-medium text-gray-900'>
                    {wallet.type === 'ethereum' &&
                    portfolioData &&
                    portfolioData.result
                      ? `$${portfolioData.result.total.toLocaleString()}`
                      : '$0.00'}
                  </div>
                  <div className='text-xs text-gray-500'>
                    {wallet.type === 'ethereum'
                      ? `${portfolioStats.totalAssets} assets`
                      : 'Not tracked'}
                  </div>
                </div>
              </div>
            ))}
            {connectedWallets.length === 0 && (
              <div className='text-center py-4 text-gray-500'>
                No wallets connected
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
