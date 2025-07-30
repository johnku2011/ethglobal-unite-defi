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
import { TimeRange } from './ValueChart';

// Chart data point interface
interface ChartDataPoint {
  timestamp: number;
  date: string;
  value: number;
}

// Component props definition
interface SimpleValueChartProps {
  data?: { result?: Array<{ timestamp: number; value_usd: number }> }; // Chart data
  isLoading?: boolean; // Loading state
  isRefetching?: boolean; // Refetching state
  onRefresh?: () => void; // Refresh data callback
  timeRange?: TimeRange; // Currently selected time range
  height?: number; // Chart height
  showStats?: boolean; // Whether to show statistics
}

export const SimpleValueChart: React.FC<SimpleValueChartProps> = ({
  data,
  isLoading = false,
  isRefetching = false,
  onRefresh,
  timeRange = '1month',
  height = 200,
  showStats = false,
}) => {
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

  // Format X-axis dates
  const formatXAxis = (timestamp: number) => {
    if (timeRange === '1day') {
      return moment(timestamp * 1000).format('HH:mm');
    } else if (timeRange === '1week') {
      return moment(timestamp * 1000).format('ddd');
    } else if (timeRange === '1month') {
      return moment(timestamp * 1000).format('DD');
    } else {
      return moment(timestamp * 1000).format('MMM');
    }
  };

  // Format tooltip
  const formatTooltip = (value: number, _name: string) => {
    return [
      `$${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`,
      'Portfolio Value',
    ];
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
      <div className='bg-white rounded-xl shadow-sm p-4 border border-gray-100'>
        <div className='animate-pulse'>
          <div className='h-4 bg-gray-200 rounded mb-4 w-32'></div>
          <div className={`h-${height / 4} bg-gray-200 rounded`}></div>
        </div>
      </div>
    );
  }

  // No data display
  if (!chartData || chartData.length === 0) {
    return (
      <div className='bg-white rounded-xl shadow-sm p-4 border border-gray-100'>
        <h3 className='text-sm font-medium text-gray-900 mb-2'>
          Portfolio Value Trend
        </h3>
        <div className='text-center py-6'>
          <ArrowPathIcon className='w-10 h-10 text-gray-300 mx-auto mb-2' />
          <p className='text-xs text-gray-500'>No chart data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className='bg-white rounded-xl shadow-sm p-4 border border-gray-100'>
      {/* Header */}
      <div className='flex justify-between items-center mb-4'>
        <h3 className='text-sm font-medium text-gray-900'>
          Portfolio Value Trend
        </h3>

        {/* Refresh button */}
        {onRefresh && (
          <button
            onClick={handleRefresh}
            disabled={isLoading || isRefetching}
            className={`p-1 rounded-md ${
              isLoading || isRefetching
                ? 'bg-gray-100 text-gray-400'
                : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
            }`}
            title='Refresh data'
          >
            <ArrowPathIcon
              className={`w-3 h-3 ${isRefetching ? 'animate-spin' : ''}`}
            />
          </button>
        )}
      </div>

      {/* Chart area */}
      <div style={{ height: `${height}px` }}>
        <ResponsiveContainer width='100%' height='100%'>
          <AreaChart
            data={chartData}
            margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
          >
            <defs>
              <linearGradient id='colorSimpleValue' x1='0' y1='0' x2='0' y2='1'>
                <stop offset='5%' stopColor='#3B82F6' stopOpacity={0.8} />
                <stop offset='95%' stopColor='#3B82F6' stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray='3 3' stroke='#f0f0f0' />
            <XAxis
              dataKey='timestamp'
              tickFormatter={formatXAxis}
              tick={{ fontSize: 10 }}
              minTickGap={20}
            />
            <YAxis
              tickFormatter={(value) => `$${value.toLocaleString()}`}
              tick={{ fontSize: 10 }}
              width={50}
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
                padding: '0.5rem 0.75rem',
                fontSize: '0.75rem',
              }}
            />
            <Area
              type='monotone'
              dataKey='value'
              stroke='#3B82F6'
              strokeWidth={2}
              fillOpacity={1}
              fill='url(#colorSimpleValue)'
              activeDot={{ r: 4 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Chart statistics (optional) */}
      {showStats && chartData.length > 0 && (
        <div className='mt-3 grid grid-cols-2 gap-2 text-xs'>
          <div className='bg-gray-50 p-2 rounded-md'>
            <div className='text-gray-500'>Change</div>
            {chartData.length > 1 && (
              <div
                className={`font-medium ${
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
          <div className='bg-gray-50 p-2 rounded-md'>
            <div className='text-gray-500'>Current Value</div>
            <div className='font-medium text-gray-900'>
              $
              {chartData[chartData.length - 1]?.value.toLocaleString(
                undefined,
                { maximumFractionDigits: 2 }
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimpleValueChart;
