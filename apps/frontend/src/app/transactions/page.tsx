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

  // Handle sorting
  const sortedTransactions = useMemo(() => {
    if (!transactionData?.items) return [];

    return [...transactionData.items].sort((a, b) => {
      if (viewSettings.sortBy === 'timeMs') {
        return viewSettings.sortDirection === 'asc'
          ? a.timeMs - b.timeMs
          : b.timeMs - a.timeMs;
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
              className='px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center'
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
        {authenticated && sortedTransactions.length > 0 && (
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
        )}

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
