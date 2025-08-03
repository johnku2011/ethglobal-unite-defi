'use client';

import React, { useState, useEffect } from 'react';
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  ClockIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import type { SwapTransaction, TransactionStatus } from '@/types';

interface TransactionStatusProps {
  transaction: SwapTransaction;
  onStatusChange?: (status: TransactionStatus) => void;
  onClose?: () => void;
}

const TransactionStatusComponent: React.FC<TransactionStatusProps> = ({
  transaction,
  onStatusChange,
  onClose,
}) => {
  const [currentStatus, setCurrentStatus] = useState<TransactionStatus>(
    transaction.status
  );
  const [isChecking, setIsChecking] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Status configuration
  const statusConfig = {
    [TransactionStatus.PENDING]: {
      icon: ClockIcon,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      title: 'Transaction Pending',
      description:
        'Your swap transaction is being processed on the blockchain.',
    },
    [TransactionStatus.CONFIRMED]: {
      icon: CheckCircleIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      title: 'Transaction Confirmed',
      description: 'Your swap has been successfully completed!',
    },
    [TransactionStatus.FAILED]: {
      icon: ExclamationCircleIcon,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      title: 'Transaction Failed',
      description: 'Your swap transaction failed. Please try again.',
    },
  };

  const config = statusConfig[currentStatus];
  const StatusIcon = config.icon;

  // Auto-check transaction status
  useEffect(() => {
    if (currentStatus === TransactionStatus.PENDING) {
      const checkInterval = setInterval(async () => {
        await checkTransactionStatus();
      }, 5000); // Check every 5 seconds

      return () => clearInterval(checkInterval);
    }
  }, [currentStatus]);

  const checkTransactionStatus = async () => {
    if (isChecking) return;

    setIsChecking(true);
    try {
      // This would typically call your backend API to check transaction status
      // For now, we'll simulate the check
      const response = await fetch(
        `/api/transactions/status/${transaction.txHash}`
      );

      if (response.ok) {
        const data = await response.json();
        const newStatus = data.status as TransactionStatus;

        if (newStatus !== currentStatus) {
          setCurrentStatus(newStatus);
          onStatusChange?.(newStatus);

          // Auto-close on success after 3 seconds
          if (newStatus === TransactionStatus.CONFIRMED) {
            setTimeout(() => {
              onClose?.();
            }, 3000);
          }
        }
      }
    } catch (error) {
      console.error('Failed to check transaction status:', error);
      setErrorMessage('Failed to check transaction status');
    } finally {
      setIsChecking(false);
    }
  };

  const formatAmount = (amount: string, decimals: number) => {
    const value = parseFloat(amount) / Math.pow(10, decimals);
    return value.toFixed(6);
  };

  const formatGasPrice = (gasPrice: string) => {
    const price = parseInt(gasPrice, 16) / Math.pow(10, 9);
    return `${price.toFixed(2)} Gwei`;
  };

  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50`}
    >
      <div
        className={`max-w-md w-full mx-4 ${config.bgColor} ${config.borderColor} border-2 rounded-xl p-6 shadow-xl`}
      >
        {/* Header */}
        <div className='flex items-center justify-between mb-4'>
          <div className='flex items-center space-x-3'>
            <StatusIcon className={`w-8 h-8 ${config.color}`} />
            <div>
              <h3 className={`text-lg font-semibold ${config.color}`}>
                {config.title}
              </h3>
              <p className='text-sm text-gray-600'>{config.description}</p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className='text-gray-400 hover:text-gray-600 transition-colors'
            >
              <svg
                className='w-6 h-6'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M6 18L18 6M6 6l12 12'
                />
              </svg>
            </button>
          )}
        </div>

        {/* Transaction Details */}
        <div className='space-y-4'>
          {/* Swap Details */}
          <div className='bg-white rounded-lg p-4 border border-gray-200'>
            <div className='flex items-center justify-between mb-2'>
              <span className='text-sm font-medium text-gray-600'>
                Swap Details
              </span>
              <span className='text-xs text-gray-500'>
                {new Date(transaction.timestamp).toLocaleTimeString()}
              </span>
            </div>

            <div className='flex items-center justify-between mb-2'>
              <div className='flex items-center space-x-2'>
                <span className='text-sm font-medium'>
                  {formatAmount(
                    transaction.fromAmount,
                    transaction.fromToken.decimals
                  )}
                </span>
                <span className='text-sm text-gray-600'>
                  {transaction.fromToken.symbol}
                </span>
              </div>
              <svg
                className='w-4 h-4 text-gray-400'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M7 16l-4-4m0 0l4-4m-4 4h18'
                />
              </svg>
              <div className='flex items-center space-x-2'>
                <span className='text-sm font-medium'>
                  {formatAmount(
                    transaction.toAmount,
                    transaction.toToken.decimals
                  )}
                </span>
                <span className='text-sm text-gray-600'>
                  {transaction.toToken.symbol}
                </span>
              </div>
            </div>

            {/* Transaction Hash */}
            <div className='mt-3 pt-3 border-t border-gray-200'>
              <div className='flex items-center justify-between'>
                <span className='text-xs text-gray-500'>Transaction Hash:</span>
                <a
                  href={`https://etherscan.io/tx/${transaction.txHash}`}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-xs text-blue-600 hover:text-blue-800 truncate ml-2'
                >
                  {transaction.txHash.slice(0, 8)}...
                  {transaction.txHash.slice(-6)}
                </a>
              </div>
            </div>
          </div>

          {/* Gas Information */}
          <div className='bg-white rounded-lg p-4 border border-gray-200'>
            <div className='grid grid-cols-2 gap-4 text-sm'>
              <div>
                <span className='text-gray-500'>Gas Used:</span>
                <div className='font-medium'>{transaction.gasUsed}</div>
              </div>
              <div>
                <span className='text-gray-500'>Gas Price:</span>
                <div className='font-medium'>
                  {formatGasPrice(transaction.gasPrice || '0x0')}
                </div>
              </div>
              <div>
                <span className='text-gray-500'>Slippage:</span>
                <div className='font-medium'>{transaction.slippage}%</div>
              </div>
              <div>
                <span className='text-gray-500'>Price Impact:</span>
                <div className='font-medium'>
                  {transaction.priceImpact.toFixed(2)}%
                </div>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className='bg-red-50 border border-red-200 rounded-lg p-3'>
              <p className='text-sm text-red-600'>{errorMessage}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className='flex space-x-3'>
            {currentStatus === TransactionStatus.PENDING && (
              <button
                onClick={checkTransactionStatus}
                disabled={isChecking}
                className='flex-1 flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
              >
                <ArrowPathIcon
                  className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`}
                />
                <span>{isChecking ? 'Checking...' : 'Check Status'}</span>
              </button>
            )}

            {currentStatus === TransactionStatus.FAILED && (
              <button
                onClick={onClose}
                className='flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors'
              >
                Close
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionStatusComponent;
