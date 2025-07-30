import React, { useState, useMemo } from 'react';
import { Transaction } from '../../types/transaction';
import { getTransactionTypeInfo } from '../../constants/transactionTypes';
import {
  formatAddress,
  getTxHashLink,
  getAddressLink,
  getChainName,
  getChainIcon,
} from '../../utils/chainUtils';
import { format } from 'date-fns';
import Link from 'next/link';
import Image from 'next/image';

interface TransactionTableProps {
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;
  onRowClick?: (transaction: Transaction) => void;
}

const TransactionTable: React.FC<TransactionTableProps> = ({
  transactions,
  isLoading,
  error,
  onRowClick,
}) => {
  const [sortField, setSortField] = useState<string>('timeMs');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // 處理排序
  const handleSort = (field: string) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // 排序交易
  const sortedTransactions = useMemo(() => {
    if (!transactions.length) return [];

    return [...transactions].sort((a, b) => {
      let aValue: any = a;
      let bValue: any = b;

      // 處理嵌套屬性
      if (sortField.includes('.')) {
        const parts = sortField.split('.');
        aValue = parts.reduce((obj, part) => obj?.[part], a);
        bValue = parts.reduce((obj, part) => obj?.[part], b);
      } else {
        aValue = a[sortField as keyof Transaction];
        bValue = b[sortField as keyof Transaction];
      }

      // 比較
      if (typeof aValue === 'string') {
        const comparison = aValue.localeCompare(bValue);
        return sortDirection === 'asc' ? comparison : -comparison;
      }

      // 數值比較
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    });
  }, [transactions, sortField, sortDirection]);

  // 渲染排序圖標
  const renderSortIcon = (field: string) => {
    if (sortField !== field) return null;

    return <span className='ml-1'>{sortDirection === 'asc' ? '↑' : '↓'}</span>;
  };

  // 渲染交易類型
  const renderTransactionType = (type: string) => {
    const typeInfo = getTransactionTypeInfo(type);

    return (
      <div className={`flex items-center gap-2 ${typeInfo.color}`}>
        <span className='material-icons text-sm'>{typeInfo.icon}</span>
        <span>{typeInfo.label}</span>
      </div>
    );
  };

  // 渲染交易狀態
  const renderStatus = (status: string) => {
    let statusClass = '';

    if (status === 'completed' || status === 'success') {
      statusClass = 'bg-green-100 text-green-800';
    } else if (status === 'pending') {
      statusClass = 'bg-yellow-100 text-yellow-800';
    } else {
      statusClass = 'bg-red-100 text-red-800';
    }

    return <span className={`px-2 py-1 rounded ${statusClass}`}>{status}</span>;
  };

  // Render loading state
  if (isLoading) {
    return (
      <div className='w-full flex justify-center items-center py-12'>
        <div className='animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500'></div>
        <span className='ml-2'>Loading...</span>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className='w-full bg-red-50 text-red-500 p-4 rounded-lg'>
        <p className='font-medium'>Failed to load</p>
        <p>{error}</p>
      </div>
    );
  }

  // Render empty state
  if (transactions.length === 0) {
    return (
      <div className='w-full bg-gray-50 p-8 rounded-lg text-center'>
        <p className='text-gray-500 text-lg'>No transaction records found</p>
        <p className='text-gray-400'>
          Try connecting your wallet or adjusting the filters
        </p>
      </div>
    );
  }

  return (
    <div className='overflow-x-auto'>
      <table className='min-w-full divide-y divide-gray-200'>
        <thead className='bg-gray-50'>
          <tr>
            {/* Time */}
            <th
              className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer'
              onClick={() => handleSort('timeMs')}
            >
              Time{renderSortIcon('timeMs')}
            </th>

            {/* Transaction Hash */}
            <th
              className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer'
              onClick={() => handleSort('details.txHash')}
            >
              Hash{renderSortIcon('details.txHash')}
            </th>

            {/* Type */}
            <th
              className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer'
              onClick={() => handleSort('details.type')}
            >
              Type{renderSortIcon('details.type')}
            </th>

            {/* From */}
            <th
              className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer'
              onClick={() => handleSort('details.fromAddress')}
            >
              From{renderSortIcon('details.fromAddress')}
            </th>

            {/* To */}
            <th
              className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer'
              onClick={() => handleSort('details.toAddress')}
            >
              To{renderSortIcon('details.toAddress')}
            </th>

            {/* Status */}
            <th
              className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer'
              onClick={() => handleSort('details.status')}
            >
              Status{renderSortIcon('details.status')}
            </th>

            {/* Chain */}
            <th
              className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer'
              onClick={() => handleSort('details.chainId')}
            >
              Chain{renderSortIcon('details.chainId')}
            </th>
          </tr>
        </thead>

        <tbody className='bg-white divide-y divide-gray-200'>
          {sortedTransactions.map((tx) => (
            <tr
              key={tx.id}
              className='hover:bg-gray-50 cursor-pointer'
              onClick={() => onRowClick && onRowClick(tx)}
            >
              {/* 時間 */}
              <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                {format(new Date(tx.timeMs), 'yyyy-MM-dd HH:mm:ss')}
              </td>

              {/* 交易哈希 */}
              <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
                <a
                  href={getTxHashLink(tx.details.chainId, tx.details.txHash)}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-blue-500 hover:text-blue-700'
                  onClick={(e) => e.stopPropagation()}
                >
                  {formatAddress(tx.details.txHash)}
                </a>
              </td>

              {/* 類型 */}
              <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                {renderTransactionType(tx.details.type)}
              </td>

              {/* 發送方 */}
              <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                <a
                  href={getAddressLink(
                    tx.details.chainId,
                    tx.details.fromAddress
                  )}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-blue-500 hover:text-blue-700'
                  onClick={(e) => e.stopPropagation()}
                >
                  {formatAddress(tx.details.fromAddress)}
                </a>
              </td>

              {/* 接收方 */}
              <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                <a
                  href={getAddressLink(
                    tx.details.chainId,
                    tx.details.toAddress
                  )}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-blue-500 hover:text-blue-700'
                  onClick={(e) => e.stopPropagation()}
                >
                  {formatAddress(tx.details.toAddress)}
                </a>
              </td>

              {/* 狀態 */}
              <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                {renderStatus(tx.details.status)}
              </td>

              {/* 區塊鏈 */}
              <td className='px-6 py-4 whitespace-nowrap'>
                <div className='flex items-center'>
                  {getChainIcon(tx.details.chainId) && (
                    <img
                      src={getChainIcon(tx.details.chainId)}
                      alt={getChainName(tx.details.chainId)}
                      className='w-4 h-4 mr-2'
                    />
                  )}
                  <span className='text-sm text-gray-900'>
                    {getChainName(tx.details.chainId)}
                  </span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionTable;
