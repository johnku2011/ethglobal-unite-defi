'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useWallet } from '@/providers/WalletProvider';
import { useValueChart, TimeRange } from '@/hooks/api/usePortfolioQuery';
import ValueChart from '@/components/portfolio/ValueChart';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

export default function PortfolioValueChart() {
  const { connectedWallets } = useWallet();
  const [timeRange, setTimeRange] = useState<TimeRange>('1month');

  // Get the first connected Ethereum wallet address
  const ethereumWallet = connectedWallets.find(
    (wallet) => wallet.type === 'ethereum'
  );
  const walletAddress = ethereumWallet?.address;

  // Use custom hook to fetch value chart data
  const {
    data: chartData,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useValueChart(walletAddress, timeRange);

  // Handle time range change
  const handleTimeRangeChange = (range: TimeRange) => {
    setTimeRange(range);
  };

  // Handle refresh button click
  const handleRefresh = () => {
    refetch();
  };

  // Error state
  if (error && !chartData) {
    return (
      <DashboardLayout>
        <div className='space-y-6'>
          <div className='bg-white rounded-xl shadow-soft p-6 border border-gray-100'>
            <div className='text-center py-8'>
              <div className='w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                <ArrowPathIcon className='w-8 h-8 text-red-500' />
              </div>
              <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                Failed to Load Chart Data
              </h3>
              <p className='text-gray-600 mb-4'>
                {error?.message || 'Unable to fetch value chart data'}
              </p>
              <button
                onClick={() => refetch()}
                className='btn-primary'
                disabled={isRefetching}
              >
                {isRefetching ? 'Retrying...' : 'Try Again'}
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
        {/* Page Title */}
        <div className='bg-white rounded-xl shadow-soft p-6 border border-gray-100'>
          <div className='flex items-center justify-between mb-2'>
            <div>
              <h2 className='text-2xl font-bold text-gray-900'>
                Portfolio Value Chart
              </h2>
              <p className='text-gray-600'>
                Track your portfolio value over time
              </p>
              {walletAddress && (
                <p className='text-sm text-gray-500 font-mono mt-1'>
                  {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Value Chart Component */}
        <ValueChart
          data={
            chartData as unknown as {
              result?: { timestamp: number; value_usd: number }[];
            }
          }
          isLoading={isLoading}
          isRefetching={isRefetching}
          onTimeRangeChange={handleTimeRangeChange}
          onRefresh={handleRefresh}
          timeRange={timeRange}
          showHighLow={true}
          showAverage={true}
          showDownloadButton={true}
        />

        {/* Chart Information */}
        <div className='bg-white rounded-xl shadow-soft p-6 border border-gray-100'>
          <h3 className='text-lg font-semibold text-gray-900 mb-4'>
            About Value Chart
          </h3>
          <div className='prose max-w-none text-gray-600'>
            <p>
              This chart displays the total value of your portfolio over time.
              You can select different time ranges to view value fluctuations
              across various periods.
            </p>
            <ul className='mt-2 space-y-1'>
              <li>
                <strong>1 Day (1D)</strong>: Shows value changes over the past
                24 hours, ideal for observing short-term volatility
              </li>
              <li>
                <strong>1 Week (1W)</strong>: Shows value changes over the past
                7 days, suitable for short-term trends
              </li>
              <li>
                <strong>1 Month (1M)</strong>: Shows value changes over the past
                30 days, good for medium-term trends
              </li>
              <li>
                <strong>1 Year (1Y)</strong>: Shows value changes over the past
                year, ideal for long-term trends
              </li>
              <li>
                <strong>3 Years (3Y)</strong>: Shows value changes over the past
                three years, best for long-term investment returns
              </li>
            </ul>
            <p className='mt-2'>
              Data is provided by the 1inch Portfolio API and updates
              automatically every 5 minutes. You can also click the refresh
              button to manually update the data.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
