'use client';

import React, { useState } from 'react';
import {
  LineChart,
  Line,
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

// 定義時間範圍類型
export type TimeRange = '1day' | '1week' | '1month' | '1year' | '3years';

// 組件屬性定義
interface ValueChartProps {
  data?: any; // 圖表數據
  isLoading?: boolean; // 加載狀態
  isRefetching?: boolean; // 重新獲取狀態
  onTimeRangeChange?: (range: TimeRange) => void; // 時間範圍變更回調
  onRefresh?: () => void; // 刷新數據回調
  timeRange?: TimeRange; // 當前選中的時間範圍
}

export const ValueChart: React.FC<ValueChartProps> = ({
  data,
  isLoading = false,
  isRefetching = false,
  onTimeRangeChange,
  onRefresh,
  timeRange = '1month',
}) => {
  // 處理時間範圍變更
  const handleTimeRangeChange = (range: TimeRange) => {
    if (onTimeRangeChange) {
      onTimeRangeChange(range);
    }
  };

  // 處理刷新按鈕點擊
  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
    }
  };

  // 格式化圖表數據
  const chartData = React.useMemo(() => {
    if (!data || !data.result || !Array.isArray(data.result)) {
      return [];
    }

    // 轉換數據格式
    return data.result.map((point: any) => ({
      timestamp: point.timestamp,
      date: moment(point.timestamp * 1000).format('MMM DD'),
      value: point.value_usd,
    }));
  }, [data]);

  // 格式化X軸日期
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

  // 格式化工具提示
  const formatTooltip = (value: number, name: string) => {
    return [
      `$${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`,
      'Portfolio Value',
    ];
  };

  // 格式化工具提示標籤
  const formatTooltipLabel = (timestamp: number) => {
    if (timeRange === '1day') {
      return moment(timestamp * 1000).format('MMM DD, YYYY HH:mm');
    } else {
      return moment(timestamp * 1000).format('MMM DD, YYYY');
    }
  };

  // 加載狀態顯示
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

  // 無數據顯示
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
      {/* 頭部控制項 */}
      <div className='flex justify-between items-center mb-6'>
        <h3 className='text-lg font-semibold text-gray-900'>
          Portfolio Value Chart
        </h3>

        <div className='flex items-center space-x-4'>
          {/* 時間範圍選擇器 */}
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

          {/* 刷新按鈕 */}
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

      {/* 圖表區域 */}
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

      {/* 圖表統計信息 */}
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
        </div>
      )}
    </div>
  );
};

export default ValueChart;
