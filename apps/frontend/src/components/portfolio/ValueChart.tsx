'use client';

import React from 'react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import moment from 'moment';

// Define time range type
export type TimeRange = '1day' | '1week' | '1month' | '1year' | '3years';

// Chart data point interface
interface ChartDataPoint {
  timestamp: number;
  date: string;
  value: number;
}

// Component props definition
interface ValueChartProps {
  data?: { result?: Array<{ timestamp: number; value_usd: number }> }; // Chart data
  isLoading?: boolean; // Loading state
  isRefetching?: boolean; // Refetching state
  onTimeRangeChange?: (range: TimeRange) => void; // Time range change callback
  onRefresh?: () => void; // Refresh data callback
  timeRange?: TimeRange; // Currently selected time range
  showHighLow?: boolean; // Whether to show high/low values
  showAverage?: boolean; // Whether to show average value
  showDownloadButton?: boolean; // Whether to show download button
}

export const ValueChart: React.FC<ValueChartProps> = ({
  data,
  isLoading = false,
  isRefetching = false,
  onTimeRangeChange,
  onRefresh,
  timeRange = '1month',
  showHighLow = false,
  showAverage = false,
  showDownloadButton = false,
}) => {
  // Handle time range change
  const handleTimeRangeChange = (range: TimeRange) => {
    if (onTimeRangeChange) {
      onTimeRangeChange(range);
    }
  };

  // Handle refresh button click
  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
    }
  };

  // Format chart data
  const chartData = React.useMemo<ChartDataPoint[]>(() => {
    if (!data || !data.result || !Array.isArray(data.result)) {
      return [];
    }

    // Convert data format
    return data.result.map((point) => ({
      timestamp: point.timestamp,
      date: moment(point.timestamp * 1000).format('MMM DD'),
      value: point.value_usd,
    }));
  }, [data]);

  // Calculate additional statistics
  const chartStats = React.useMemo(() => {
    if (!chartData || chartData.length === 0) {
      return {
        highValue: 0,
        lowValue: 0,
        avgValue: 0,
        highTimestamp: 0,
        lowTimestamp: 0,
      };
    }

    let sum = 0;
    let highValue = chartData[0].value;
    let lowValue = chartData[0].value;
    let highTimestamp = chartData[0].timestamp;
    let lowTimestamp = chartData[0].timestamp;

    chartData.forEach((point) => {
      sum += point.value;
      if (point.value > highValue) {
        highValue = point.value;
        highTimestamp = point.timestamp;
      }
      if (point.value < lowValue) {
        lowValue = point.value;
        lowTimestamp = point.timestamp;
      }
    });

    return {
      highValue,
      lowValue,
      avgValue: sum / chartData.length,
      highTimestamp,
      lowTimestamp,
    };
  }, [chartData]);

  // Format X-axis dates
  const formatXAxis = (timestamp: number) => {
    if (timeRange === '1day') {
      return moment(timestamp * 1000).format('HH:mm');
    } else if (timeRange === '1week') {
      return moment(timestamp * 1000).format('ddd DD');
    } else if (timeRange === '1month') {
      return moment(timestamp * 1000).format('MMM DD');
    } else {
      return moment(timestamp * 1000).format('MMM YYYY');
    }
  };

  // Format tooltip
  const formatTooltip = (value: number, _name: string) => {
    return [
      `$${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`,
      'Portfolio Value',
    ];
  };

  // Handle chart download
  const handleDownloadChart = () => {
    if (!chartData || chartData.length === 0) return;

    // Create CSV content
    const headers = ['Date', 'Timestamp', 'Value (USD)'];
    const rows = chartData.map((point) => [
      moment(point.timestamp * 1000).format('YYYY-MM-DD HH:mm:ss'),
      point.timestamp,
      point.value.toFixed(2),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.join(',')),
    ].join('\n');

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `portfolio-value-${timeRange}-${moment().format('YYYY-MM-DD')}.csv`
    );
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Format tooltip label
  const formatTooltipLabel = (timestamp: number) => {
    if (timeRange === '1day') {
      return moment(timestamp * 1000).format('MMM DD, YYYY HH:mm');
    } else {
      return moment(timestamp * 1000).format('MMM DD, YYYY');
    }
  };

  // Loading state display
  if (isLoading) {
    return (
      <div className='bg-white rounded-xl shadow-sm p-6 border border-gray-100'>
        <div className='animate-pulse'>
          <div className='h-6 bg-gray-200 rounded mb-4 w-48'></div>
          <div className='flex justify-end mb-4'>
            <div className='h-8 bg-gray-200 rounded w-64'></div>
          </div>
          <div className='h-64 bg-gray-200 rounded'></div>
        </div>
      </div>
    );
  }

  // No data display
  if (!chartData || chartData.length === 0) {
    return (
      <div className='bg-white rounded-xl shadow-sm p-6 border border-gray-100'>
        <h3 className='text-lg font-semibold text-gray-900 mb-4'>
          Portfolio Value Chart
        </h3>
        <div className='text-center py-12'>
          <ArrowPathIcon className='w-16 h-16 text-gray-300 mx-auto mb-4' />
          <p className='text-gray-500 mb-2'>No chart data available</p>
          <p className='text-sm text-gray-400'>
            Chart will appear when historical data is available
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='bg-white rounded-xl shadow-sm p-6 border border-gray-100'>
      {/* Header controls */}
      <div className='flex justify-between items-center mb-6'>
        <h3 className='text-lg font-semibold text-gray-900'>
          Portfolio Value Chart
        </h3>

        <div className='flex items-center space-x-4'>
          {/* Download button (optional) */}
          {showDownloadButton && (
            <button
              onClick={handleDownloadChart}
              disabled={!chartData.length}
              className='p-1.5 rounded-md bg-gray-50 text-gray-700 hover:bg-gray-100 flex items-center space-x-1'
              title='Download CSV'
            >
              <svg
                xmlns='http://www.w3.org/2000/svg'
                className='h-4 w-4'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4'
                />
              </svg>
              <span className='text-xs'>CSV</span>
            </button>
          )}

          {/* Time range selector */}
          <div className='flex rounded-md shadow-sm'>
            <button
              onClick={() => handleTimeRangeChange('1day')}
              className={`px-3 py-1.5 text-xs font-medium rounded-l-md ${
                timeRange === '1day'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
              }`}
            >
              1D
            </button>
            <button
              onClick={() => handleTimeRangeChange('1week')}
              className={`px-3 py-1.5 text-xs font-medium ${
                timeRange === '1week'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
              }`}
            >
              1W
            </button>
            <button
              onClick={() => handleTimeRangeChange('1month')}
              className={`px-3 py-1.5 text-xs font-medium ${
                timeRange === '1month'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
              }`}
            >
              1M
            </button>
            <button
              onClick={() => handleTimeRangeChange('1year')}
              className={`px-3 py-1.5 text-xs font-medium ${
                timeRange === '1year'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
              }`}
            >
              1Y
            </button>
            <button
              onClick={() => handleTimeRangeChange('3years')}
              className={`px-3 py-1.5 text-xs font-medium rounded-r-md ${
                timeRange === '3years'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
              }`}
            >
              3Y
            </button>
          </div>

          {/* Refresh button */}
          <button
            onClick={handleRefresh}
            disabled={isLoading || isRefetching}
            className={`p-1.5 rounded-md ${
              isLoading || isRefetching
                ? 'bg-gray-100 text-gray-400'
                : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
            }`}
            title='Refresh data'
          >
            <ArrowPathIcon
              className={`w-4 h-4 ${isRefetching ? 'animate-spin' : ''}`}
            />
          </button>
        </div>
      </div>

      {/* Chart area */}
      <div className='h-64'>
        <ResponsiveContainer width='100%' height='100%'>
          <AreaChart
            data={chartData}
            margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
          >
            <defs>
              <linearGradient id='colorValue' x1='0' y1='0' x2='0' y2='1'>
                <stop offset='5%' stopColor='#3B82F6' stopOpacity={0.8} />
                <stop offset='95%' stopColor='#3B82F6' stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray='3 3' stroke='#f0f0f0' />
            <XAxis
              dataKey='timestamp'
              tickFormatter={formatXAxis}
              tick={{ fontSize: 12 }}
              minTickGap={30}
            />
            <YAxis
              tickFormatter={(value) => `$${value.toLocaleString()}`}
              tick={{ fontSize: 12 }}
              width={60}
              domain={['auto', 'auto']}
            />
            <Tooltip
              formatter={formatTooltip}
              labelFormatter={formatTooltipLabel}
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '0.375rem',
                boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                padding: '0.5rem 1rem',
              }}
            />
            <Area
              type='monotone'
              dataKey='value'
              stroke='#3B82F6'
              strokeWidth={2}
              fillOpacity={1}
              fill='url(#colorValue)'
              activeDot={{ r: 6 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Chart statistics */}
      {chartData.length > 0 && (
        <div className='mt-4 grid grid-cols-2 md:grid-cols-4 gap-4'>
          <div className='bg-gray-50 p-3 rounded-md'>
            <div className='text-xs text-gray-500'>Current Value</div>
            <div className='text-sm font-semibold text-gray-900'>
              $
              {chartData[chartData.length - 1]?.value.toLocaleString(
                undefined,
                { maximumFractionDigits: 2 }
              )}
            </div>
          </div>
          <div className='bg-gray-50 p-3 rounded-md'>
            <div className='text-xs text-gray-500'>Start Value</div>
            <div className='text-sm font-semibold text-gray-900'>
              $
              {chartData[0]?.value.toLocaleString(undefined, {
                maximumFractionDigits: 2,
              })}
            </div>
          </div>
          <div className='bg-gray-50 p-3 rounded-md'>
            <div className='text-xs text-gray-500'>Change</div>
            {chartData.length > 1 && (
              <div
                className={`text-sm font-semibold ${
                  chartData[chartData.length - 1]?.value >= chartData[0]?.value
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}
              >
                {chartData[chartData.length - 1]?.value >= chartData[0]?.value
                  ? '+'
                  : ''}
                {(
                  ((chartData[chartData.length - 1]?.value -
                    chartData[0]?.value) /
                    chartData[0]?.value) *
                  100
                ).toFixed(2)}
                %
              </div>
            )}
          </div>
          <div className='bg-gray-50 p-3 rounded-md'>
            <div className='text-xs text-gray-500'>Time Period</div>
            <div className='text-sm font-semibold text-gray-900'>
              {timeRange === '1day'
                ? '24 Hours'
                : timeRange === '1week'
                  ? '7 Days'
                  : timeRange === '1month'
                    ? '30 Days'
                    : timeRange === '1year'
                      ? '1 Year'
                      : '3 Years'}
            </div>
          </div>

          {/* Additional statistics */}
          {showHighLow && (
            <>
              <div className='bg-gray-50 p-3 rounded-md'>
                <div className='text-xs text-gray-500'>Highest Value</div>
                <div className='text-sm font-semibold text-gray-900'>
                  $
                  {chartStats.highValue.toLocaleString(undefined, {
                    maximumFractionDigits: 2,
                  })}
                </div>
                <div className='text-xs text-gray-400'>
                  {moment(chartStats.highTimestamp * 1000).format(
                    'MMM DD, YYYY'
                  )}
                </div>
              </div>
              <div className='bg-gray-50 p-3 rounded-md'>
                <div className='text-xs text-gray-500'>Lowest Value</div>
                <div className='text-sm font-semibold text-gray-900'>
                  $
                  {chartStats.lowValue.toLocaleString(undefined, {
                    maximumFractionDigits: 2,
                  })}
                </div>
                <div className='text-xs text-gray-400'>
                  {moment(chartStats.lowTimestamp * 1000).format(
                    'MMM DD, YYYY'
                  )}
                </div>
              </div>
            </>
          )}

          {showAverage && (
            <div className='bg-gray-50 p-3 rounded-md'>
              <div className='text-xs text-gray-500'>Average Value</div>
              <div className='text-sm font-semibold text-gray-900'>
                $
                {chartStats.avgValue.toLocaleString(undefined, {
                  maximumFractionDigits: 2,
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ValueChart;
