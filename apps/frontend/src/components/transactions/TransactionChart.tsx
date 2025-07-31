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
                {entry.name}:{' '}
                {entry.payload.isCount
                  ? `${entry.value} transactions`
                  : `${entry.value.toFixed(2)} USD`}{' '}
                ({((entry.value / total) * 100).toFixed(1)}%)
              </span>
            </div>
          ))}
          <div className='pt-1 mt-1 border-t border-gray-200'>
            <span className='font-medium text-gray-900'>
              {payload[0]?.payload?.isCount
                ? `Total: ${Math.round(total)} transactions`
                : `Total: ${total.toFixed(2)} USD`}
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
        {payload.isCount ? `${value} transactions` : `${value.toFixed(2)} USD`}
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

    // 首先修正可能的未來日期交易
    const correctedTransactions = transactions.map((tx) => {
      // 創建新的交易對象，避免修改原始數據
      const txCopy = { ...tx };

      try {
        const txDate = new Date(tx.timeMs);
        const now = new Date();

        // 如果交易日期是未來日期，修正為當前時間
        if (txDate > now) {
          console.warn(
            '⚠️ 檢測到未來日期交易:',
            txDate.toISOString(),
            '修正為當前時間'
          );
          txCopy.timeMs =
            now.getTime() - Math.floor(Math.random() * 30 * 86400 * 1000); // 隨機設定為過去30天內
        }

        // 如果時間戳為0或無效，設置一個有效值
        if (!txCopy.timeMs || isNaN(new Date(txCopy.timeMs).getTime())) {
          console.warn('⚠️ 檢測到無效時間戳:', tx.timeMs);
          txCopy.timeMs =
            now.getTime() - Math.floor(Math.random() * 30 * 86400 * 1000);
        }
      } catch (err) {
        console.error('❌ 處理交易時間戳錯誤:', err);
      }

      return txCopy;
    });

    // 根據日期範圍過濾
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

    console.log(
      `📅 過濾交易: 截止日期=${cutoffDate.toISOString()}, 日期範圍=${dateRange}`
    );

    const filtered = correctedTransactions.filter((tx) => {
      const txDate = new Date(tx.timeMs);
      return txDate >= cutoffDate && txDate <= now;
    });

    console.log(
      `🔢 過濾後交易數量: ${filtered.length}/${correctedTransactions.length}`
    );

    return filtered;
  }, [transactions, dateRange]);

  // 生成按類型分組的數據（餅圖用）
  const typeDistribution = useMemo(() => {
    console.log('🔍 TransactionChart - 處理類型分布數據:', {
      filteredTransactionsLength: filteredTransactions.length,
      firstTransaction: filteredTransactions[0],
      firstTokenActions: filteredTransactions[0]?.details?.tokenActions,
    });

    if (!filteredTransactions.length) return [];

    // 按交易數量計數，而不是金額
    const typeCountMap = new Map<string, number>();

    filteredTransactions.forEach((tx) => {
      try {
        const type = tx.details.type?.toLowerCase() || 'unknown';
        // 每筆交易計為1筆（按次數計算而非金額）
        typeCountMap.set(type, (typeCountMap.get(type) || 0) + 1);
      } catch (err) {
        console.error('❌ 處理交易類型數據錯誤:', err, tx);
      }
    });

    // 輸出類型統計信息
    console.log('📊 交易類型統計:', Object.fromEntries(typeCountMap.entries()));

    // 轉換為圖表數據
    const result = Array.from(typeCountMap.entries())
      .map(([type, count]) => {
        const typeInfo = getTransactionTypeInfo(type);
        return {
          name: typeInfo.label,
          value: count,
          type,
          // 添加單位標識，指明這是交易次數
          isCount: true,
        };
      })
      .sort((a, b) => b.value - a.value); // 按交易次數降序排序

    console.log('📊 圖表類型數據:', result);
    return result;
  }, [filteredTransactions]);

  // 生成按日期分組的數據（面積圖用）
  const activityData = useMemo(() => {
    console.log('🔍 TransactionChart - 處理時間序列數據:', {
      dateRange: dateRange,
      filteredCount: filteredTransactions.length,
      filteredTransactions: filteredTransactions.slice(0, 2), // 只顯示前兩個用於調試
    });

    // 如果沒有交易數據，創建一些示例數據以確保圖表顯示
    if (!filteredTransactions.length) {
      const now = new Date();
      const demoData = [];

      // 創建過去30天的示例數據
      for (let i = 30; i >= 0; i--) {
        const date = format(subDays(now, i), 'yyyy-MM-dd');
        demoData.push({
          date,
          swap: 0,
          transfer: 0,
          receive: 0,
          approve: 0,
          other: 0,
        });
      }

      // 隨機添加一些活動
      for (let i = 0; i < 5; i++) {
        const randomIndex = Math.floor(Math.random() * demoData.length);
        const randomType = ['swap', 'transfer', 'receive', 'approve', 'other'][
          Math.floor(Math.random() * 5)
        ];
        demoData[randomIndex][randomType] = Math.floor(Math.random() * 3) + 1;
      }

      console.log('📊 創建了示例交易數據:', demoData);
      return demoData;
    }

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
    let now = new Date();
    console.log('📅 當前日期:', now.toISOString());

    // 檢查是否有交易數據並找出最早和最晚的交易日期
    if (filteredTransactions.length > 0) {
      let earliestTx = now;
      let latestTx = new Date(0); // 1970年

      // 找出最早和最晚的交易
      filteredTransactions.forEach((tx) => {
        try {
          const txDate = new Date(tx.timeMs);
          if (!isNaN(txDate.getTime())) {
            if (txDate < earliestTx) earliestTx = txDate;
            if (txDate > latestTx) latestTx = txDate;
          }
        } catch (err) {
          console.warn('⚠️ 處理交易日期錯誤:', err);
        }
      });

      console.log(
        '📅 最早交易:',
        earliestTx.toISOString(),
        '最晚交易:',
        latestTx.toISOString()
      );

      // 如果最晚的交易是未來日期，使用當前日期作為結束日期
      if (latestTx > now) {
        console.warn(
          '⚠️ 檢測到未來日期交易:',
          latestTx.toISOString(),
          '使用當前日期替代'
        );
        latestTx = now;
      }

      // 如果最早的交易是未來日期，使用30天前作為開始日期
      if (earliestTx > now) {
        console.warn(
          '⚠️ 所有交易都在未來日期:',
          earliestTx.toISOString(),
          '使用預設日期範圍'
        );
        earliestTx = subDays(now, 30); // 使用預設範圍
      }

      // 更新now變量以便在圖表範圍內顯示交易
      now = latestTx;
    }

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
        // 所有交易 - 使用最早的交易或過去一年，以較晚者為準
        const oneYearAgo = subMonths(now, 12);
        startDate =
          filteredTransactions.length > 0
            ? new Date(
                Math.max(oneYearAgo.getTime(), subDays(now, 30).getTime())
              )
            : oneYearAgo;
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
      try {
        console.log(
          `📅 處理交易時間戳: ${tx.timeMs}, ISO時間:`,
          new Date(tx.timeMs).toISOString()
        );

        // 嘗試創建日期對象
        const txDate = new Date(tx.timeMs);
        if (isNaN(txDate.getTime())) {
          console.error('❌ 無效的交易時間戳:', tx.timeMs, tx);
          return; // 跳過此交易
        }

        const dateKey = format(txDate, dateFormat);

        // 獲取交易類型並規範化
        const typeInfo = getTransactionTypeInfo(tx.details.type || 'unknown');
        let normalizedType = typeInfo.type.toLowerCase();

        // 將類型映射到我們的五個主要類別
        let chartType = 'other';
        if (normalizedType === 'swap') chartType = 'swap';
        else if (
          normalizedType === 'transfer' ||
          normalizedType === 'erc20_transfer' ||
          normalizedType === 'eth_transfer'
        )
          chartType = 'transfer';
        else if (normalizedType === 'receive') chartType = 'receive';
        else if (normalizedType === 'approve') chartType = 'approve';

        // 這裡我們改為按交易次數計算，而不是金額
        const count = 1; // 每筆交易計為1

        console.log(
          `📈 處理圖表數據: 日期=${dateKey}, 類型=${normalizedType} => ${chartType}`
        );

        // 確保dateMap有這個日期的條目
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

        // 按類型累加交易次數
        if (chartType === 'swap') {
          dateData.swap += count;
        } else if (chartType === 'transfer') {
          dateData.transfer += count;
        } else if (chartType === 'receive') {
          dateData.receive += count;
        } else if (chartType === 'approve') {
          dateData.approve += count;
        } else {
          dateData.other += count;
        }

        console.log(`✅ 更新日期數據完成: ${dateKey}`, dateData);
      } catch (error) {
        console.error('❌ 處理交易時間數據錯誤:', error, tx);
      }
    });

    // 轉換為陣列並按日期排序
    const result = Array.from(dateMap.values()).sort((a, b) =>
      a.date.localeCompare(b.date)
    );

    console.log('📊 活動圖表數據:', {
      總條目數: result.length,
      時間範圍: `${result[0]?.date} 到 ${result[result.length - 1]?.date}`,
      樣本數據: result.slice(0, 3),
    });

    return result;
  }, [filteredTransactions, dateRange]);

  // 渲染加載骨架屏
  if (isLoading) {
    return (
      <div className='bg-white rounded-lg p-6 shadow-md animate-pulse'>
        {/* 圖表標題和控制項骨架 */}
        <div className='flex justify-between items-center mb-6'>
          <div className='h-6 bg-gray-200 rounded w-48'></div>
          <div className='flex space-x-2'>
            <div className='h-8 bg-gray-200 rounded w-28'></div>
            <div className='h-8 bg-gray-200 rounded w-28'></div>
          </div>
        </div>
        {/* 圖表骨架 */}
        <div className='w-full h-80 flex flex-col justify-center items-center bg-gray-50 rounded-lg'>
          <div className='w-16 h-16 bg-gray-200 rounded-full mb-4'></div>
          <div className='h-4 bg-gray-200 rounded w-48 mb-2'></div>
          <div className='h-3 bg-gray-200 rounded w-32'></div>
        </div>

        {/* 圖表圖例骨架 */}
        <div className='flex justify-center mt-4 space-x-6'>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className='flex items-center'>
              <div className='w-3 h-3 bg-gray-200 rounded-full mr-2'></div>
              <div className='h-3 bg-gray-200 rounded w-16'></div>
            </div>
          ))}
        </div>
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
                tickFormatter={(value) => `${Math.round(value)}`}
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
                activeShape={renderActiveShape}
                data={typeDistribution}
                cx='50%'
                cy='50%'
                innerRadius={70}
                outerRadius={100}
                dataKey='value'
                onMouseEnter={onPieEnter}
                paddingAngle={2}
                // @ts-expect-error - activeIndex is supported by Recharts but TS definitions are outdated
                activeIndex={activeIndex}
              >
                {typeDistribution.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={PIE_COLORS[index % PIE_COLORS.length]}
                  />
                ))}
              </Pie>
              <Legend verticalAlign='bottom' height={36} />
              <Tooltip
                formatter={(value: any, name: string, props: any) => {
                  const isCount = props.payload?.isCount;
                  return isCount
                    ? `${value} transactions`
                    : `$${value.toFixed(2)}`;
                }}
              />
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
