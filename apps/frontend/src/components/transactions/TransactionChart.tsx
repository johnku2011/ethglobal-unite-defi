import React, { useMemo, useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Sector,
} from 'recharts';
import { Transaction } from '../../types/transaction';
import { format, subDays, subMonths } from 'date-fns';
import { getTransactionTypeInfo } from '../../constants/transactionTypes';

interface TransactionChartProps {
  transactions: Transaction[];
  isLoading?: boolean;
  error?: string | null;
}

// 餅圖的自定義顏色
const PIE_COLORS = [
  '#4ade80', // Green (交換)
  '#f87171', // Red (轉賬)
  '#60a5fa', // Blue (收款)
  '#fbbf24', // Yellow (授權)
  '#a78bfa', // Purple (其他)
  '#34d399', // Teal
  '#fb923c', // Orange
  '#a855f7', // Purple
];

// 自定義工具提示
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    // 計算總和
    const total = payload.reduce(
      (sum: number, entry: any) => sum + entry.value,
      0
    );

    return (
      <div className='bg-white p-3 border border-gray-200 shadow-md rounded-md'>
        <p className='font-medium text-gray-900'>{label}</p>
        <div className='mt-2 space-y-1'>
          {payload.map((entry: any, index: number) => (
            <div key={`item-${index}`} className='flex items-center'>
              <div
                className='w-3 h-3 rounded-sm mr-2'
                style={{ backgroundColor: entry.color }}
              />
              <span className='text-gray-700'>
                {entry.name}: {entry.value.toFixed(2)} USD (
                {((entry.value / total) * 100).toFixed(1)}%)
              </span>
            </div>
          ))}
          <div className='pt-1 mt-1 border-t border-gray-200'>
            <span className='font-medium text-gray-900'>
              Total: {total.toFixed(2)} USD
            </span>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

// 自定義餅圖活動扇形
const renderActiveShape = (props: any) => {
  const {
    cx,
    cy,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    fill,
    payload,
    percent,
    value,
  } = props;

  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 10}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <text x={cx} y={cy - 20} dy={8} textAnchor='middle' fill='#333'>
        {payload.name}
      </text>
      <text x={cx} y={cy} dy={8} textAnchor='middle' fill='#333'>
        {value.toFixed(2)} USD
      </text>
      <text x={cx} y={cy + 20} dy={8} textAnchor='middle' fill='#999'>
        {`${(percent * 100).toFixed(1)}%`}
      </text>
    </g>
  );
};

// 日期範圍選項
type DateRangeOption = '1day' | '7days' | '30days' | '90days' | 'all';

const TransactionChart: React.FC<TransactionChartProps> = ({
  transactions,
  isLoading = false,
  error = null,
}) => {
  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined);
  const [dateRange, setDateRange] = useState<DateRangeOption>('30days');
  const [chartType, setChartType] = useState<'activity' | 'distribution'>(
    'activity'
  );

  // 處理餅圖扇形激活
  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  // 根據日期範圍篩選交易
  const filteredTransactions = useMemo(() => {
    if (!transactions.length) return [];

    const now = new Date();
    let cutoffDate: Date;

    switch (dateRange) {
      case '1day':
        cutoffDate = subDays(now, 1);
        break;
      case '7days':
        cutoffDate = subDays(now, 7);
        break;
      case '30days':
        cutoffDate = subDays(now, 30);
        break;
      case '90days':
        cutoffDate = subDays(now, 90);
        break;
      default:
        cutoffDate = new Date(0); // All transactions
    }

    return transactions.filter((tx) => new Date(tx.timeMs) >= cutoffDate);
  }, [transactions, dateRange]);

  // 生成按類型分組的數據（餅圖用）
  const typeDistribution = useMemo(() => {
    if (!filteredTransactions.length) return [];

    const typeMap = new Map<string, number>();

    filteredTransactions.forEach((tx) => {
      const type = tx.details.type.toLowerCase();
      const volume = tx.details.tokenActions.reduce(
        (sum, action) => sum + (action.priceToUsd || 0),
        0
      );

      typeMap.set(type, (typeMap.get(type) || 0) + volume);
    });

    // 轉換為圖表數據
    return Array.from(typeMap.entries())
      .map(([type, volume]) => {
        const typeInfo = getTransactionTypeInfo(type);
        return {
          name: typeInfo.label,
          value: volume,
          type,
        };
      })
      .sort((a, b) => b.value - a.value); // 按金額降序排序
  }, [filteredTransactions]);

  // 生成按日期分組的數據（面積圖用）
  const activityData = useMemo(() => {
    if (!filteredTransactions.length) return [];

    // 按日期分組
    const dateMap = new Map<
      string,
      {
        date: string;
        swap: number;
        transfer: number;
        receive: number;
        approve: number;
        other: number;
      }
    >();

    // 初始化日期範圍內的所有日期
    const now = new Date();
    let startDate: Date;
    let dateFormat = 'yyyy-MM-dd';

    switch (dateRange) {
      case '1day':
        startDate = subDays(now, 1);
        dateFormat = 'HH:mm'; // 小時格式
        break;
      case '7days':
        startDate = subDays(now, 7);
        break;
      case '30days':
        startDate = subDays(now, 30);
        break;
      case '90days':
        startDate = subDays(now, 90);
        break;
      default:
        startDate = subMonths(now, 12); // 默認顯示1年
    }

    // 初始化所有日期，確保圖表連續
    let currentDate = new Date(startDate);
    while (currentDate <= now) {
      const dateKey = format(currentDate, dateFormat);

      if (!dateMap.has(dateKey)) {
        dateMap.set(dateKey, {
          date: dateKey,
          swap: 0,
          transfer: 0,
          receive: 0,
          approve: 0,
          other: 0,
        });
      }

      // 增加一天或一小時
      if (dateRange === '1day') {
        currentDate = new Date(currentDate.getTime() + 60 * 60 * 1000); // 增加一小時
      } else {
        currentDate = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000); // 增加一天
      }
    }

    // 處理實際交易數據
    filteredTransactions.forEach((tx) => {
      const txDate = new Date(tx.timeMs);
      const dateKey = format(txDate, dateFormat);
      const type = tx.details.type.toLowerCase();
      const volume = tx.details.tokenActions.reduce(
        (sum, action) => sum + (action.priceToUsd || 0),
        0
      );

      if (!dateMap.has(dateKey)) {
        // 初始化該日期的數據
        dateMap.set(dateKey, {
          date: dateKey,
          swap: 0,
          transfer: 0,
          receive: 0,
          approve: 0,
          other: 0,
        });
      }

      const dateData = dateMap.get(dateKey)!;

      // 按類型累加金額
      if (type === 'swap') {
        dateData.swap += volume;
      } else if (type === 'transfer') {
        dateData.transfer += volume;
      } else if (type === 'receive') {
        dateData.receive += volume;
      } else if (type === 'approve') {
        dateData.approve += volume;
      } else {
        dateData.other += volume;
      }
    });

    // 轉換為陣列並按日期排序
    return Array.from(dateMap.values()).sort((a, b) =>
      a.date.localeCompare(b.date)
    );
  }, [filteredTransactions, dateRange]);

  // 渲染加載狀態
  if (isLoading) {
    return (
      <div className='w-full h-80 flex justify-center items-center'>
        <div className='animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500'></div>
        <span className='ml-2'>Loading...</span>
      </div>
    );
  }

  // 渲染錯誤狀態
  if (error) {
    return (
      <div className='w-full h-80 bg-red-50 text-red-500 p-4 rounded-lg flex justify-center items-center'>
        <p>{error}</p>
      </div>
    );
  }

  // 渲染空狀態
  if (!transactions.length) {
    return (
      <div className='w-full h-80 bg-gray-50 p-4 rounded-lg flex justify-center items-center'>
        <p className='text-gray-500'>No data to display</p>
      </div>
    );
  }

  return (
    <div className='bg-white rounded-lg p-6 shadow-md'>
      {/* 圖表類型切換 */}
      <div className='flex justify-between items-center mb-6'>
        <h3 className='text-lg font-medium text-gray-900'>
          Transaction Activity Analysis
        </h3>

        <div className='flex space-x-1'>
          <button
            className={`px-3 py-1.5 text-sm rounded-md ${
              chartType === 'activity'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => setChartType('activity')}
          >
            Activity Trend
          </button>

          <button
            className={`px-3 py-1.5 text-sm rounded-md ${
              chartType === 'distribution'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => setChartType('distribution')}
          >
            Type Distribution
          </button>
        </div>

        {/* 日期範圍選擇器 */}
        <div className='flex rounded-md border border-gray-300 overflow-hidden'>
          {(
            ['1day', '7days', '30days', '90days', 'all'] as DateRangeOption[]
          ).map((range) => (
            <button
              key={range}
              onClick={() => setDateRange(range)}
              className={`px-3 py-1 text-sm ${
                dateRange === range
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {range === '1day'
                ? '1 Day'
                : range === '7days'
                  ? '7 Days'
                  : range === '30days'
                    ? '30 Days'
                    : range === '90days'
                      ? '90 Days'
                      : 'All'}
            </button>
          ))}
        </div>
      </div>

      {/* 圖表內容 */}
      <div className='w-full h-80'>
        <ResponsiveContainer width='100%' height='100%'>
          {chartType === 'activity' ? (
            <AreaChart
              data={activityData}
              margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray='3 3' opacity={0.3} />
              <XAxis dataKey='date' tick={{ fill: '#6B7280' }} />
              <YAxis
                tick={{ fill: '#6B7280' }}
                tickFormatter={(value) => `$${value.toLocaleString()}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign='top' height={36} />

              {/* 交換交易 */}
              <Area
                type='monotone'
                dataKey='swap'
                stackId='1'
                stroke='#60a5fa'
                fill='#60a5fa'
                fillOpacity={0.6}
                name='Swap'
              />

              {/* 轉賬交易 */}
              <Area
                type='monotone'
                dataKey='transfer'
                stackId='1'
                stroke='#4ade80'
                fill='#4ade80'
                fillOpacity={0.6}
                name='Transfer'
              />

              {/* 收款交易 */}
              <Area
                type='monotone'
                dataKey='receive'
                stackId='1'
                stroke='#f87171'
                fill='#f87171'
                fillOpacity={0.6}
                name='Receive'
              />

              {/* 授權交易 */}
              <Area
                type='monotone'
                dataKey='approve'
                stackId='1'
                stroke='#fbbf24'
                fill='#fbbf24'
                fillOpacity={0.6}
                name='Approve'
              />

              {/* 其他類型 */}
              <Area
                type='monotone'
                dataKey='other'
                stackId='1'
                stroke='#a78bfa'
                fill='#a78bfa'
                fillOpacity={0.6}
                name='Other'
              />
            </AreaChart>
          ) : (
            <PieChart>
              <Pie
                activeIndex={activeIndex}
                activeShape={renderActiveShape}
                data={typeDistribution}
                cx='50%'
                cy='50%'
                innerRadius={70}
                outerRadius={100}
                dataKey='value'
                onMouseEnter={onPieEnter}
                paddingAngle={2}
              >
                {typeDistribution.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={PIE_COLORS[index % PIE_COLORS.length]}
                  />
                ))}
              </Pie>
              <Legend verticalAlign='bottom' height={36} />
              <Tooltip formatter={(value: any) => `$${value.toFixed(2)}`} />
            </PieChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* 交易統計摘要 */}
      <div className='mt-6 grid grid-cols-2 md:grid-cols-4 gap-4'>
        <div className='p-3 bg-blue-50 rounded-lg'>
          <div className='text-sm text-blue-700 font-medium'>
            Total Transactions
          </div>
          <div className='text-xl font-semibold text-blue-900'>
            {filteredTransactions.length}
          </div>
        </div>

        <div className='p-3 bg-green-50 rounded-lg'>
          <div className='text-sm text-green-700 font-medium'>
            Total Transaction Volume
          </div>
          <div className='text-xl font-semibold text-green-900'>
            $
            {filteredTransactions
              .reduce((sum, tx) => {
                const txVolume = tx.details.tokenActions.reduce(
                  (s, action) => s + (action.priceToUsd || 0),
                  0
                );
                return sum + txVolume;
              }, 0)
              .toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </div>
        </div>

        <div className='p-3 bg-yellow-50 rounded-lg'>
          <div className='text-sm text-yellow-700 font-medium'>
            Most Common Type
          </div>
          <div className='text-xl font-semibold text-yellow-900'>
            {typeDistribution.length > 0 ? typeDistribution[0].name : 'No data'}
          </div>
        </div>

        <div className='p-3 bg-purple-50 rounded-lg'>
          <div className='text-sm text-purple-700 font-medium'>
            Average Transaction Amount
          </div>
          <div className='text-xl font-semibold text-purple-900'>
            $
            {filteredTransactions.length
              ? (
                  filteredTransactions.reduce((sum, tx) => {
                    const txVolume = tx.details.tokenActions.reduce(
                      (s, action) => s + (action.priceToUsd || 0),
                      0
                    );
                    return sum + txVolume;
                  }, 0) / filteredTransactions.length
                ).toLocaleString(undefined, { maximumFractionDigits: 2 })
              : '0.00'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionChart;
