import React, { useState } from 'react';
import { SUPPORTED_CHAINS } from '../../utils/chainUtils';
import { transactionTypes } from '../../constants/transactionTypes';
import { TransactionFilter as FilterType } from '../../stores/transactionStore';
import { DateRange } from 'react-day-picker';
import { ChevronDownIcon, FunnelIcon } from '@heroicons/react/24/outline';
import { format, endOfDay } from 'date-fns';

interface TransactionFilterProps {
  onFilterChange: (filter: FilterType) => void;
  initialFilter?: Partial<FilterType>;
}

const TransactionFilter: React.FC<TransactionFilterProps> = ({
  onFilterChange,
  initialFilter = {},
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [filter, setFilter] = useState<FilterType>({
    chainIds: initialFilter.chainIds || [],
    types: initialFilter.types || [],
    fromDate: initialFilter.fromDate,
    toDate: initialFilter.toDate,
    search: initialFilter.search || '',
  });

  // 處理日期範圍變更
  const handleDateRangeChange = (range: DateRange | undefined) => {
    setFilter((prev) => ({
      ...prev,
      fromDate: range?.from,
      toDate: range?.to ? endOfDay(range.to) : undefined,
    }));
  };

  // 處理鏈ID變更
  const handleChainChange = (chainId: number) => {
    setFilter((prev) => {
      const newChainIds = prev.chainIds.includes(chainId)
        ? prev.chainIds.filter((id) => id !== chainId)
        : [...prev.chainIds, chainId];

      return {
        ...prev,
        chainIds: newChainIds,
      };
    });
  };

  // 處理交易類型變更
  const handleTypeChange = (type: string) => {
    setFilter((prev) => {
      const newTypes = prev.types.includes(type)
        ? prev.types.filter((t) => t !== type)
        : [...prev.types, type];

      return {
        ...prev,
        types: newTypes,
      };
    });
  };

  // 處理搜索變更
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilter((prev) => ({
      ...prev,
      search: e.target.value,
    }));
  };

  // 應用過濾器
  const applyFilter = () => {
    onFilterChange(filter);
  };

  // 清除過濾器
  const clearFilter = () => {
    const emptyFilter: FilterType = {
      chainIds: [],
      types: [],
      search: '',
    };
    setFilter(emptyFilter);
    onFilterChange(emptyFilter);
  };

  return (
    <div className='mb-6'>
      <div className='flex justify-between items-center mb-4'>
        <h3 className='text-lg font-medium text-gray-900'>
          Transaction History
        </h3>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className='flex items-center text-sm text-gray-600 hover:text-gray-900'
        >
          <FunnelIcon className='h-4 w-4 mr-1' />
          <span>Filters</span>
          <ChevronDownIcon
            className={`h-4 w-4 ml-1 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          />
        </button>
      </div>

      {isExpanded && (
        <div className='bg-white p-4 rounded-lg shadow-md mb-4'>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-4'>
            {/* Search */}
            <div>
              <label
                htmlFor='search'
                className='block text-sm font-medium text-gray-700 mb-1'
              >
                Search
              </label>
              <input
                type='text'
                id='search'
                value={filter.search}
                onChange={handleSearchChange}
                placeholder='Address, transaction hash...'
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500'
              />
            </div>

            {/* Date Range */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Date Range
              </label>
              <div className='grid grid-cols-2 gap-2'>
                <input
                  type='date'
                  value={
                    filter.fromDate ? format(filter.fromDate, 'yyyy-MM-dd') : ''
                  }
                  onChange={(e) => {
                    const date = e.target.value
                      ? new Date(e.target.value)
                      : undefined;
                    handleDateRangeChange({ from: date, to: filter.toDate });
                  }}
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500'
                />
                <input
                  type='date'
                  value={
                    filter.toDate ? format(filter.toDate, 'yyyy-MM-dd') : ''
                  }
                  onChange={(e) => {
                    const date = e.target.value
                      ? endOfDay(new Date(e.target.value))
                      : undefined;
                    handleDateRangeChange({ from: filter.fromDate, to: date });
                  }}
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500'
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className='flex items-end gap-2'>
              <button
                onClick={applyFilter}
                className='px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex-1'
              >
                Apply Filters
              </button>
              <button
                onClick={clearFilter}
                className='px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200'
              >
                Clear
              </button>
            </div>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {/* Blockchain Filter */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Blockchain
              </label>
              <div className='flex flex-wrap gap-2'>
                {SUPPORTED_CHAINS.map((chain) => (
                  <button
                    key={chain.id}
                    onClick={() => handleChainChange(chain.id)}
                    className={`
                      inline-flex items-center px-2.5 py-1.5 rounded-md text-sm
                      ${
                        filter.chainIds.includes(chain.id)
                          ? 'bg-blue-100 text-blue-700 border border-blue-300'
                          : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
                      }
                    `}
                  >
                    {chain.icon && (
                      <img
                        src={chain.icon}
                        alt={chain.name}
                        className='w-4 h-4 mr-1.5'
                      />
                    )}
                    {chain.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Transaction Type Filter */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Transaction Type
              </label>
              <div className='flex flex-wrap gap-2'>
                {transactionTypes.slice(0, 9).map((type) => (
                  <button
                    key={type.type}
                    onClick={() => handleTypeChange(type.type)}
                    className={`
                      inline-flex items-center px-2.5 py-1.5 rounded-md text-sm
                      ${
                        filter.types.includes(type.type)
                          ? 'bg-blue-100 text-blue-700 border border-blue-300'
                          : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
                      }
                    `}
                  >
                    <span className='material-icons text-sm mr-1'>
                      {type.icon}
                    </span>
                    {type.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionFilter;
