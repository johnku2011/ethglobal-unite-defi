'use client';

import React, { useMemo, useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
} from 'recharts';
import {
  ChartPieIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
} from '@heroicons/react/24/outline';
import type { Protocol } from '@/services/api/oneinchAPI';

interface PortfolioChartProps {
  assets: Protocol[];
  isLoading?: boolean;
  totalValue: number;
}

type ChartType = 'pie' | 'bar' | 'trend';

// Color palette for charts
const COLORS = [
  '#3B82F6',
  '#10B981',
  '#F59E0B',
  '#EF4444',
  '#8B5CF6',
  '#06B6D4',
  '#84CC16',
  '#F97316',
  '#EC4899',
  '#6366F1',
  '#14B8A6',
  '#F59E0B',
  '#EF4444',
  '#8B5CF6',
  '#06B6D4',
];

// Chain information for better display
const CHAIN_INFO: Record<number, { name: string; icon: string }> = {
  1: { name: 'Ethereum', icon: '🔷' },
  56: { name: 'BNB Chain', icon: '🟡' },
  137: { name: 'Polygon', icon: '🟣' },
  10: { name: 'Optimism', icon: '🔴' },
  42161: { name: 'Arbitrum', icon: '🔵' },
  8453: { name: 'Base', icon: '🔵' },
  43114: { name: 'Avalanche', icon: '🔺' },
  100: { name: 'Gnosis', icon: '🟢' },
  324: { name: 'zkSync Era', icon: '⚡' },
  59144: { name: 'Linea', icon: '📏' },
};

export const PortfolioChart: React.FC<PortfolioChartProps> = ({
  assets,
  isLoading = false,
  totalValue,
}) => {
  const [chartType, setChartType] = useState<ChartType>('pie');

  // Process data for pie chart (by protocol)
  const protocolData = useMemo(() => {
    const protocolMap = new Map<string, number>();

    assets.forEach((asset) => {
      const protocol = asset.protocol || 'Unknown';
      const currentValue = protocolMap.get(protocol) || 0;
      protocolMap.set(protocol, currentValue + asset.value_usd);
    });

    return Array.from(protocolMap.entries())
      .map(([name, value]) => ({
        name,
        value,
        percentage: totalValue > 0 ? (value / totalValue) * 100 : 0,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10); // Top 10 protocols
  }, [assets, totalValue]);

  // Process data for chain distribution
  const chainData = useMemo(() => {
    const chainMap = new Map<number, number>();

    assets.forEach((asset) => {
      const currentValue = chainMap.get(asset.chain_id) || 0;
      chainMap.set(asset.chain_id, currentValue + asset.value_usd);
    });

    return Array.from(chainMap.entries())
      .map(([chainId, value]) => ({
        chainId,
        name: CHAIN_INFO[chainId]?.name || `Chain ${chainId}`,
        icon: CHAIN_INFO[chainId]?.icon || '⛓️',
        value,
        percentage: totalValue > 0 ? (value / totalValue) * 100 : 0,
      }))
      .sort((a, b) => b.value - a.value);
  }, [assets, totalValue]);

  // Process data for asset value distribution
  const assetValueData = useMemo(() => {
    return assets
      .map((asset) => ({
        name: asset.name || asset.protocol,
        value: asset.value_usd,
        protocol: asset.protocol,
        chainId: asset.chain_id,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 15); // Top 15 assets
  }, [assets]);

  // Custom tooltip for pie chart
  const renderPieTooltip = (props: any) => {
    if (props.active && props.payload && props.payload[0]) {
      const data = props.payload[0].payload;
      return (
        <div className='bg-white p-3 rounded-lg shadow-lg border border-gray-200'>
          <p className='font-medium text-gray-900'>{data.name}</p>
          <p className='text-sm text-gray-600'>
            Value: $
            {data.value.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
          <p className='text-sm text-gray-600'>
            Share: {data.percentage.toFixed(1)}%
          </p>
        </div>
      );
    }
    return null;
  };

  // Custom tooltip for bar chart
  const renderBarTooltip = (props: any) => {
    if (props.active && props.payload && props.payload[0]) {
      const data = props.payload[0].payload;
      return (
        <div className='bg-white p-3 rounded-lg shadow-lg border border-gray-200'>
          <p className='font-medium text-gray-900'>{data.name}</p>
          <p className='text-sm text-gray-600'>
            $
            {data.value.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
          <p className='text-sm text-gray-500'>Protocol: {data.protocol}</p>
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className='bg-white rounded-xl shadow-soft p-6 border border-gray-100'>
        <div className='animate-pulse'>
          <div className='h-6 bg-gray-200 rounded mb-4 w-48'></div>
          <div className='h-64 bg-gray-200 rounded'></div>
        </div>
      </div>
    );
  }

  if (assets.length === 0) {
    return (
      <div className='bg-white rounded-xl shadow-soft p-6 border border-gray-100'>
        <h3 className='text-lg font-semibold text-gray-900 mb-4'>
          Portfolio Visualization
        </h3>
        <div className='text-center py-12'>
          <ChartPieIcon className='w-16 h-16 text-gray-300 mx-auto mb-4' />
          <p className='text-gray-500 mb-2'>No data to visualize</p>
          <p className='text-sm text-gray-400'>
            Charts will appear when you have assets in your portfolio
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='bg-white rounded-xl shadow-soft p-6 border border-gray-100'>
      {/* Header */}
      <div className='flex items-center justify-between mb-6'>
        <h3 className='text-lg font-semibold text-gray-900'>
          Portfolio Visualization
        </h3>
        <div className='flex items-center space-x-2'>
          <button
            onClick={() => setChartType('pie')}
            className={`px-3 py-1 rounded-md text-sm transition-colors ${
              chartType === 'pie'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <ChartPieIcon className='w-4 h-4 inline mr-1' />
            Pie Chart
          </button>
          <button
            onClick={() => setChartType('bar')}
            className={`px-3 py-1 rounded-md text-sm transition-colors ${
              chartType === 'bar'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <ChartBarIcon className='w-4 h-4 inline mr-1' />
            Bar Chart
          </button>
        </div>
      </div>

      {/* Chart Content */}
      <div className='h-80'>
        {chartType === 'pie' && (
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 h-full'>
            {/* Pie Chart */}
            <div className='lg:col-span-2'>
              <ResponsiveContainer width='100%' height='100%'>
                <PieChart>
                  <Pie
                    data={protocolData}
                    cx='50%'
                    cy='50%'
                    outerRadius={100}
                    innerRadius={40}
                    paddingAngle={2}
                    dataKey='value'
                  >
                    {protocolData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={renderPieTooltip} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div className='lg:col-span-1'>
              <h4 className='font-medium text-gray-900 mb-3'>Top Protocols</h4>
              <div className='space-y-2 max-h-64 overflow-y-auto'>
                {protocolData.map((item, index) => (
                  <div
                    key={item.name}
                    className='flex items-center justify-between text-sm'
                  >
                    <div className='flex items-center space-x-2'>
                      <div
                        className='w-3 h-3 rounded-full'
                        style={{
                          backgroundColor: COLORS[index % COLORS.length],
                        }}
                      />
                      <span className='text-gray-700 truncate max-w-20'>
                        {item.name}
                      </span>
                    </div>
                    <div className='text-right'>
                      <div className='font-medium text-gray-900'>
                        $
                        {item.value.toLocaleString(undefined, {
                          maximumFractionDigits: 0,
                        })}
                      </div>
                      <div className='text-xs text-gray-500'>
                        {item.percentage.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {chartType === 'bar' && (
          <div>
            <h4 className='font-medium text-gray-900 mb-4'>
              Top Assets by Value
            </h4>
            <ResponsiveContainer width='100%' height={300}>
              <BarChart
                data={assetValueData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray='3 3' stroke='#f0f0f0' />
                <XAxis
                  dataKey='name'
                  angle={-45}
                  textAnchor='end'
                  height={80}
                  interval={0}
                  fontSize={11}
                />
                <YAxis
                  tickFormatter={(value) => `$${value.toLocaleString()}`}
                  fontSize={11}
                />
                <Tooltip content={renderBarTooltip} />
                <Bar dataKey='value' radius={[4, 4, 0, 0]}>
                  {assetValueData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Chain Distribution Summary */}
      <div className='mt-6 pt-6 border-t border-gray-100'>
        <h4 className='font-medium text-gray-900 mb-3'>Chain Distribution</h4>
        <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
          {chainData.map((chain) => (
            <div
              key={chain.chainId}
              className='text-center p-3 bg-gray-50 rounded-lg'
            >
              <div className='text-2xl mb-1'>{chain.icon}</div>
              <div className='text-sm font-medium text-gray-900'>
                {chain.name}
              </div>
              <div className='text-xs text-gray-600'>
                $
                {chain.value.toLocaleString(undefined, {
                  maximumFractionDigits: 0,
                })}
              </div>
              <div className='text-xs text-gray-500'>
                {chain.percentage.toFixed(1)}%
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PortfolioChart;
