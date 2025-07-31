'use client';

import React, { useState, useMemo } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useTransactionsQuery } from '../../hooks/api/useTransactionsQuery';
import { useTransactionStore } from '../../stores/transactionStore';
import TransactionTable from '../../components/transactions/TransactionTable';
import TransactionChart from '../../components/transactions/TransactionChart';
import TransactionFilter from '../../components/transactions/TransactionFilter';
import TransactionDetailModal from '../../components/transactions/TransactionDetailModal';
import { Transaction } from '../../types/transaction';
import { exportToCSV } from '../../utils/exportUtils';
import { format } from 'date-fns';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import DashboardLayout from '../../components/DashboardLayout';

export default function TransactionsPage() {
  const { user, authenticated } = usePrivy();
  const walletAddress = user?.wallet?.address;

  // Get filters and view settings from state store
  const {
    filter,
    viewSettings,
    setFilter,
    setViewSettings,
    addRecentTransaction,
  } = useTransactionStore();

  // Selected transaction (for detail modal)
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);

  // Query parameters processing
  const queryParams = useMemo(() => {
    return {
      chainIds: filter.chainIds.length ? filter.chainIds : undefined,
      limit: viewSettings.pageSize,
      fromTimestampMs: filter.fromDate?.getTime(),
      toTimestampMs: filter.toDate?.getTime(),
      types: filter.types.length ? filter.types : undefined,
    };
  }, [filter, viewSettings.pageSize]);

  // Fetch transaction data
  const {
    data: transactionData,
    isLoading,
    error,
    refetch,
  } = useTransactionsQuery(walletAddress, {
    ...queryParams,
    enabled: authenticated && !!walletAddress,
  });

  // 調試原始API數據
  React.useEffect(() => {
    if (transactionData) {
      console.log('🔍 原始交易數據:', {
        總條目數: transactionData.items?.length || 0,
        總交易量: transactionData.total,
        數據類型: typeof transactionData,
        第一筆交易樣本: transactionData.items?.[0],
      });
    }
  }, [transactionData]);

  // DEBUG: 檢查API返回數據結構
  React.useEffect(() => {
    if (transactionData) {
      console.log('🔍 交易數據結構檢查:', transactionData);
      console.log('🔍 是否有items屬性:', !!transactionData.items);
      console.log(
        '🔍 items類型:',
        Array.isArray(transactionData.items)
          ? 'Array'
          : typeof transactionData.items
      );
      console.log('🔍 items長度:', transactionData.items?.length);
      console.log('🔍 total值:', transactionData.total);

      // 檢查第一個交易項目的結構(如果存在)
      if (transactionData.items && transactionData.items.length > 0) {
        console.log('🔍 第一個交易結構:', transactionData.items[0]);
        console.log(
          '🔍 是否有timeMs屬性:',
          'timeMs' in transactionData.items[0]
        );
        console.log(
          '🔍 是否有details屬性:',
          'details' in transactionData.items[0]
        );
      }
    }
  }, [transactionData]);

  // Handle sorting
  const sortedTransactions = useMemo(() => {
    if (!transactionData?.items || !Array.isArray(transactionData.items)) {
      console.warn('⚠️ 沒有有效的交易數據項目，或者items不是陣列');
      return [];
    }

    // 確保所有交易都有必要的字段
    const validTransactions = transactionData.items.filter((tx) => {
      if (!tx || typeof tx !== 'object') {
        console.warn('⚠️ 發現無效的交易項目:', tx);
        return false;
      }
      // 檢查關鍵屬性
      if (tx.timeMs === undefined) {
        console.warn('⚠️ 交易缺少timeMs屬性:', tx);
      }
      return true;
    });

    console.log(
      `📊 有效交易數量: ${validTransactions.length}/${transactionData.items.length}`
    );

    return [...validTransactions].sort((a, b) => {
      if (viewSettings.sortBy === 'timeMs') {
        // 確保使用數字進行比較
        const aTime = typeof a.timeMs === 'number' ? a.timeMs : 0;
        const bTime = typeof b.timeMs === 'number' ? b.timeMs : 0;

        return viewSettings.sortDirection === 'asc'
          ? aTime - bTime
          : bTime - aTime;
      }

      return 0; // Default no sorting
    });
  }, [transactionData, viewSettings.sortBy, viewSettings.sortDirection]);

  // Handle transaction selection
  const handleTransactionSelect = (tx: Transaction) => {
    setSelectedTransaction(tx);
    addRecentTransaction(tx.id);
  };

  // Handle data export
  const handleExportCSV = () => {
    if (!sortedTransactions.length) return;

    const headers = [
      'Time',
      'Transaction Hash',
      'Type',
      'From',
      'To',
      'Status',
      'Chain',
      'Direction',
      'Total Amount (USD)',
    ];

    const data = sortedTransactions.map((tx) => {
      // Calculate transaction total
      const totalValue = tx.details.tokenActions.reduce(
        (sum, action) => sum + (action.priceToUsd || 0),
        0
      );

      return [
        format(new Date(tx.timeMs), 'yyyy-MM-dd HH:mm:ss'),
        tx.details.txHash,
        tx.details.type,
        tx.details.fromAddress,
        tx.details.toAddress,
        tx.details.status,
        tx.details.chainId.toString(),
        tx.direction,
        totalValue.toFixed(2),
      ];
    });

    exportToCSV({
      headers,
      data,
      filename: `transactions_${walletAddress}_${format(new Date(), 'yyyy-MM-dd')}`,
    });
  };

  return (
    <DashboardLayout>
      <div className='container mx-auto py-6 px-4'>
        {/* Filters */}
        <div className='flex justify-between items-start mb-6'>
          <TransactionFilter
            onFilterChange={setFilter}
            initialFilter={filter}
          />

          {sortedTransactions.length > 0 && (
            <button
              onClick={handleExportCSV}
              className='px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center ml-4'
            >
              <ArrowDownTrayIcon className='h-5 w-5 mr-2' />
              Export CSV
            </button>
          )}
        </div>

        {/* Authentication Notice */}
        {!authenticated && (
          <div className='bg-yellow-50 p-4 rounded-md mb-6'>
            <p className='text-yellow-700'>
              Please connect your wallet to view your transaction history.
            </p>
          </div>
        )}

        {/* Transaction Stats */}
        {/* Transaction Stats - Show with real data or skeleton when loading */}
        {authenticated &&
          (isLoading ? (
            <div className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-6'>
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className='bg-white p-4 rounded-lg shadow-sm border border-gray-100 animate-pulse'
                >
                  <div className='h-4 bg-gray-200 rounded w-28 mb-2'></div>
                  <div className='h-8 bg-gray-200 rounded w-16'></div>
                </div>
              ))}
            </div>
          ) : (
            sortedTransactions.length > 0 && (
              <div className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-6'>
                <div className='bg-white p-4 rounded-lg shadow-sm border border-gray-100'>
                  <div className='text-sm font-medium text-gray-500 mb-1'>
                    Total Transactions
                  </div>
                  <div className='text-2xl font-semibold'>
                    {transactionData?.total || sortedTransactions.length}
                  </div>
                </div>

                <div className='bg-white p-4 rounded-lg shadow-sm border border-gray-100'>
                  <div className='text-sm font-medium text-gray-500 mb-1'>
                    Completed
                  </div>
                  <div className='text-2xl font-semibold text-green-600'>
                    {
                      sortedTransactions.filter(
                        (tx) =>
                          tx.details.status === 'success' ||
                          tx.details.status === 'completed'
                      ).length
                    }
                  </div>
                </div>

                <div className='bg-white p-4 rounded-lg shadow-sm border border-gray-100'>
                  <div className='text-sm font-medium text-gray-500 mb-1'>
                    Pending
                  </div>
                  <div className='text-2xl font-semibold text-yellow-600'>
                    {
                      sortedTransactions.filter(
                        (tx) => tx.details.status === 'pending'
                      ).length
                    }
                  </div>
                </div>

                <div className='bg-white p-4 rounded-lg shadow-sm border border-gray-100'>
                  <div className='text-sm font-medium text-gray-500 mb-1'>
                    Failed
                  </div>
                  <div className='text-2xl font-semibold text-red-600'>
                    {
                      sortedTransactions.filter(
                        (tx) => tx.details.status === 'failed'
                      ).length
                    }
                  </div>
                </div>
              </div>
            )
          ))}

        {/* Charts */}
        {authenticated && viewSettings.showChart && (
          <div className='mb-6'>
            <TransactionChart
              transactions={sortedTransactions}
              isLoading={isLoading}
              error={error?.message || null}
            />
          </div>
        )}

        {/* Transaction Table */}
        <div className='bg-white rounded-lg shadow overflow-hidden'>
          <TransactionTable
            transactions={sortedTransactions}
            isLoading={isLoading}
            error={error?.message || null}
            onRowClick={handleTransactionSelect}
          />

          {/* Pagination Controls */}
          {transactionData?.items?.length > 0 && (
            <div className='px-6 py-3 border-t border-gray-200 flex justify-between items-center bg-gray-50'>
              <div className='text-sm text-gray-500'>
                Showing {transactionData.items.length} transactions
                {transactionData.total > transactionData.items.length && (
                  <span> (of {transactionData.total} total)</span>
                )}
              </div>

              <div className='flex items-center space-x-2'>
                <select
                  value={viewSettings.pageSize}
                  onChange={(e) =>
                    setViewSettings({ pageSize: parseInt(e.target.value) })
                  }
                  className='px-2 py-1 border border-gray-300 rounded-md bg-white text-sm'
                >
                  <option value={10}>10 per page</option>
                  <option value={25}>25 per page</option>
                  <option value={50}>50 per page</option>
                  <option value={100}>100 per page</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Transaction Detail Modal */}
        {selectedTransaction && (
          <TransactionDetailModal
            transaction={selectedTransaction}
            onClose={() => setSelectedTransaction(null)}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
