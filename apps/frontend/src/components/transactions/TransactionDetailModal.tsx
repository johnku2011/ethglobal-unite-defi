import React from 'react';
import { Transaction } from '../../types/transaction';
import { format } from 'date-fns';
import { getTransactionTypeInfo } from '../../constants/transactionTypes';
import {
  formatAddress,
  getTxHashLink,
  getAddressLink,
  getChainName,
  getChainIcon,
} from '../../utils/chainUtils';
import {
  XMarkIcon,
  ArrowTopRightOnSquareIcon,
} from '@heroicons/react/24/outline';

interface TransactionDetailModalProps {
  transaction: Transaction | null;
  onClose: () => void;
}

const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({
  transaction,
  onClose,
}) => {
  if (!transaction) return null;

  const { details } = transaction;
  const typeInfo = getTransactionTypeInfo(details.type);

  // Calculate total transaction value
  const totalValue = details.tokenActions.reduce(
    (sum, action) => sum + (action.priceToUsd || 0),
    0
  );

  // Format date and time
  const formattedDate = format(
    new Date(transaction.timeMs),
    'yyyy-MM-dd HH:mm:ss'
  );

  return (
    <div className='fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4 md:p-6'>
      <div className='bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto'>
        {/* Header */}
        <div className='px-6 py-4 border-b flex justify-between items-center'>
          <h3 className='text-lg font-medium text-gray-900 flex items-center'>
            <div className={`${typeInfo.color} mr-2`}>
              <span className='material-icons text-xl'>{typeInfo.icon}</span>
            </div>
            <span>Transaction Details: {typeInfo.label}</span>
          </h3>

          <button
            onClick={onClose}
            className='text-gray-400 hover:text-gray-500 transition-colors'
          >
            <XMarkIcon className='h-5 w-5' />
          </button>
        </div>

        {/* Main Content */}
        <div className='px-6 py-4'>
          {/* Basic Information */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-6'>
            <div>
              <h4 className='text-sm font-medium text-gray-500 mb-1'>
                Transaction Hash
              </h4>
              <a
                href={getTxHashLink(details.chainId, details.txHash)}
                target='_blank'
                rel='noopener noreferrer'
                className='text-blue-500 hover:text-blue-700 hover:underline break-all'
              >
                {details.txHash}
              </a>
            </div>

            <div>
              <h4 className='text-sm font-medium text-gray-500 mb-1'>
                Block Number
              </h4>
              <p className='text-gray-900'>{details.blockNumber}</p>
            </div>

            <div>
              <h4 className='text-sm font-medium text-gray-500 mb-1'>
                Blockchain
              </h4>
              <div className='flex items-center'>
                {getChainIcon(details.chainId) && (
                  <img
                    src={getChainIcon(details.chainId)}
                    alt={getChainName(details.chainId)}
                    className='w-5 h-5 mr-2'
                  />
                )}
                <span>{getChainName(details.chainId)}</span>
              </div>
            </div>

            <div>
              <h4 className='text-sm font-medium text-gray-500 mb-1'>Time</h4>
              <p className='text-gray-900'>{formattedDate}</p>
            </div>

            <div>
              <h4 className='text-sm font-medium text-gray-500 mb-1'>Status</h4>
              <div className='flex items-center'>
                <span
                  className={`
                  px-2.5 py-0.5 rounded-full text-xs
                  ${
                    details.status === 'success' ||
                    details.status === 'completed'
                      ? 'bg-green-100 text-green-800'
                      : details.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                  }
                `}
                >
                  {details.status}
                </span>
              </div>
            </div>

            <div>
              <h4 className='text-sm font-medium text-gray-500 mb-1'>
                Transaction Type
              </h4>
              <p className='text-gray-900'>{typeInfo.label}</p>
            </div>

            <div>
              <h4 className='text-sm font-medium text-gray-500 mb-1'>
                Total Value
              </h4>
              <p className='text-gray-900'>
                $
                {totalValue.toLocaleString(undefined, {
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>

            <div>
              <h4 className='text-sm font-medium text-gray-500 mb-1'>
                Transaction Fee
              </h4>
              <p className='text-gray-900'>
                {parseFloat(details.feeInSmallestNative) / 1e18} ETH
                {details.nativeTokenPriceToUsd && (
                  <span className='text-gray-500 text-sm ml-1'>
                    ($
                    {(
                      (parseFloat(details.feeInSmallestNative) / 1e18) *
                      details.nativeTokenPriceToUsd
                    ).toFixed(2)}
                    )
                  </span>
                )}
              </p>
            </div>

            <div>
              <h4 className='text-sm font-medium text-gray-500 mb-1'>Nonce</h4>
              <p className='text-gray-900'>{details.nonce}</p>
            </div>
          </div>

          {/* From/To */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-6'>
            <div>
              <h4 className='text-sm font-medium text-gray-500 mb-1'>From</h4>
              <a
                href={getAddressLink(details.chainId, details.fromAddress)}
                target='_blank'
                rel='noopener noreferrer'
                className='text-blue-500 hover:text-blue-700 hover:underline break-all'
              >
                {details.fromAddress}
              </a>
            </div>

            <div>
              <h4 className='text-sm font-medium text-gray-500 mb-1'>To</h4>
              <a
                href={getAddressLink(details.chainId, details.toAddress)}
                target='_blank'
                rel='noopener noreferrer'
                className='text-blue-500 hover:text-blue-700 hover:underline break-all'
              >
                {details.toAddress}
              </a>
            </div>
          </div>

          {/* Token Actions */}
          <div>
            <h4 className='text-base font-medium text-gray-900 mb-2'>
              Token Actions
            </h4>
            <div className='bg-gray-50 rounded-lg overflow-hidden'>
              <table className='min-w-full divide-y divide-gray-200'>
                <thead className='bg-gray-100'>
                  <tr>
                    <th
                      scope='col'
                      className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                    >
                      Token
                    </th>
                    <th
                      scope='col'
                      className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                    >
                      Amount
                    </th>
                    <th
                      scope='col'
                      className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                    >
                      Value (USD)
                    </th>
                    <th
                      scope='col'
                      className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                    >
                      Direction
                    </th>
                  </tr>
                </thead>
                <tbody className='bg-white divide-y divide-gray-200'>
                  {details.tokenActions.map((action, index) => (
                    <tr key={index}>
                      <td className='px-4 py-3 whitespace-nowrap text-sm text-gray-900'>
                        <a
                          href={getAddressLink(
                            parseInt(action.chainId),
                            action.address
                          )}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='text-blue-500 hover:text-blue-700'
                        >
                          {action.standard}
                        </a>
                      </td>
                      <td className='px-4 py-3 whitespace-nowrap text-sm text-gray-900'>
                        {parseFloat(action.amount).toLocaleString()}
                      </td>
                      <td className='px-4 py-3 whitespace-nowrap text-sm text-gray-900'>
                        {action.priceToUsd !== undefined
                          ? `$${action.priceToUsd.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
                          : '-'}
                      </td>
                      <td className='px-4 py-3 whitespace-nowrap text-sm text-gray-900'>
                        <span
                          className={`
                          px-2 py-1 rounded-full
                          ${action.direction === 'in' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                        `}
                        >
                          {action.direction === 'in' ? 'In' : 'Out'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className='px-6 py-3 bg-gray-50 flex justify-end'>
          <a
            href={getTxHashLink(details.chainId, details.txHash)}
            target='_blank'
            rel='noopener noreferrer'
            className='px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 inline-flex items-center'
          >
            <span>View on Block Explorer</span>
            <ArrowTopRightOnSquareIcon className='h-4 w-4 ml-1' />
          </a>
        </div>
      </div>
    </div>
  );
};

export default TransactionDetailModal;
