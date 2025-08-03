'use client';

import React, { useState, useEffect } from 'react';
import {
  MagnifyingGlassIcon,
  ChevronDownIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';
import type { Token } from '@/types';

interface TokenSelectorProps {
  selectedToken: Token | null;
  onTokenSelect: (token: Token) => void;
  availableTokens: Token[];
  balances: Record<string, string>;
  isLoadingBalances: boolean;
  placeholder?: string;
  disabled?: boolean;
}

const TokenSelector: React.FC<TokenSelectorProps> = ({
  selectedToken,
  onTokenSelect,
  availableTokens,
  balances,
  isLoadingBalances,
  placeholder = 'Select Token',
  disabled = false,
}) => {
  // Ensure dropdown is closed on mount
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filteredTokens, setFilteredTokens] = useState<Token[]>([]);

  // Debug: Log state changes
  useEffect(() => {
    console.log(
      'TokenSelector isOpen:',
      isOpen,
      'availableTokens:',
      availableTokens.length
    );
  }, [isOpen, availableTokens.length]);

  // Force close dropdown when component mounts or tokens change
  useEffect(() => {
    setIsOpen(false);
    setSearchTerm('');
  }, [availableTokens]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      setIsOpen(false);
      setSearchTerm('');
    };
  }, []);

  // Filter tokens based on search term
  useEffect(() => {
    if (!searchTerm) {
      setFilteredTokens(availableTokens);
    } else {
      const filtered = availableTokens.filter(
        (token) =>
          token.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
          token.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          token.address.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredTokens(filtered);
    }
  }, [searchTerm, availableTokens]);

  const handleTokenSelect = (token: Token) => {
    console.log('Token selected:', token.symbol);
    onTokenSelect(token);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleToggleDropdown = () => {
    if (disabled) return;
    console.log('Toggling dropdown, current state:', isOpen);
    setIsOpen(!isOpen);
  };

  const getTokenBalance = (token: Token): string => {
    if (isLoadingBalances) return '...';
    return balances[token.symbol] || '0.0';
  };

  const formatBalance = (balance: string): string => {
    const num = parseFloat(balance);
    if (isNaN(num)) return '0.0';
    if (num === 0) return '0.0';
    if (num < 0.000001) return '< 0.000001';
    return num.toFixed(6);
  };

  return (
    <div className='relative'>
      {/* Token Selection Button */}
      <button
        onClick={handleToggleDropdown}
        disabled={disabled}
        className='flex items-center space-x-2 bg-white border border-gray-200 rounded-lg px-3 py-2 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-w-[120px]'
      >
        {selectedToken ? (
          <>
            <span className='text-lg'>🔷</span>
            <span className='font-semibold truncate'>
              {selectedToken.symbol}
            </span>
          </>
        ) : (
          <>
            <span className='text-lg'>💰</span>
            <span className='font-semibold text-gray-500 truncate'>
              {placeholder}
            </span>
          </>
        )}
        <ChevronDownIcon className='w-4 h-4 text-gray-400 flex-shrink-0' />
      </button>

      {/* Token Selection Dropdown */}
      {isOpen && availableTokens.length > 0 && (
        <div className='absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-[100] max-h-80 overflow-hidden min-w-[280px] sm:min-w-[320px]'>
          {/* Search Input */}
          <div className='p-3 border-b border-gray-100'>
            <div className='relative'>
              <MagnifyingGlassIcon className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400' />
              <input
                type='text'
                placeholder='Search tokens...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                autoFocus
              />
            </div>
          </div>

          {/* Token List */}
          <div className='max-h-60 overflow-y-auto'>
            {filteredTokens.length === 0 ? (
              <div className='p-4 text-center text-gray-500 text-sm'>
                No tokens found
              </div>
            ) : (
              filteredTokens.map((token) => {
                const balance = getTokenBalance(token);
                const formattedBalance = formatBalance(balance);
                const isSelected = selectedToken?.address === token.address;

                return (
                  <button
                    key={token.address}
                    onClick={() => handleTokenSelect(token)}
                    className='w-full px-4 py-3 hover:bg-gray-50 flex items-center justify-between transition-colors border-b border-gray-50 last:border-b-0'
                  >
                    <div className='flex items-center space-x-3 min-w-0 flex-1'>
                      <span className='text-lg flex-shrink-0'>🔷</span>
                      <div className='text-left min-w-0 flex-1'>
                        <div className='font-medium text-gray-900 truncate'>
                          {token.symbol}
                        </div>
                        <div className='text-xs text-gray-500 truncate'>
                          {token.name}
                        </div>
                      </div>
                    </div>
                    <div className='flex items-center space-x-2 flex-shrink-0'>
                      <div className='text-right'>
                        <div className='text-sm font-medium text-gray-900'>
                          {formattedBalance}
                        </div>
                        <div className='text-xs text-gray-500'>Balance</div>
                      </div>
                      {isSelected && (
                        <CheckIcon className='w-4 h-4 text-blue-600 flex-shrink-0' />
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Popular Tokens Section */}
          {!searchTerm && (
            <div className='border-t border-gray-100 p-3'>
              <div className='text-xs font-medium text-gray-500 mb-2'>
                Popular Tokens
              </div>
              <div className='flex flex-wrap gap-2'>
                {availableTokens
                  .filter((token) =>
                    ['ETH', 'USDC', 'USDT', 'WETH'].includes(token.symbol)
                  )
                  .slice(0, 4)
                  .map((token) => (
                    <button
                      key={token.address}
                      onClick={() => handleTokenSelect(token)}
                      className='px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-full transition-colors'
                    >
                      {token.symbol}
                    </button>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div
          className='fixed inset-0 z-[90]'
          onClick={() => {
            console.log('Clicking outside to close dropdown');
            setIsOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default TokenSelector;
