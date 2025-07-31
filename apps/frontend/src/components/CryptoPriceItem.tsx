'use client';

import React, { useEffect, useRef } from 'react';
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid';
import type { CryptoPriceData } from '@/types/cryptoPrice';

interface CryptoPriceItemProps {
  data: CryptoPriceData;
  previousPrice?: number;
  compact?: boolean;
}

/**
 * 加密貨幣價格項目組件
 * 顯示單個加密貨幣的價格、變化和圖標
 */
export default function CryptoPriceItem({
  data,
  previousPrice,
  compact = false,
}: CryptoPriceItemProps) {
  const priceRef = useRef<HTMLSpanElement>(null);
  const priceChanged =
    previousPrice !== undefined && previousPrice !== data.price;

  // 價格變化閃爍效果
  useEffect(() => {
    if (priceChanged && priceRef.current) {
      // 添加閃爍動畫
      priceRef.current.classList.add('price-flash');

      const timer = setTimeout(() => {
        if (priceRef.current) {
          priceRef.current.classList.remove('price-flash');
        }
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [data.price, priceChanged]);

  // 格式化價格顯示
  const formatPrice = (price: number): string => {
    if (price >= 1000) {
      return price.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    } else if (price >= 1) {
      return price.toFixed(2);
    } else if (price >= 0.01) {
      return price.toFixed(4);
    } else {
      return price.toFixed(6);
    }
  };

  // 格式化變化百分比
  const formatChange = (change: number): string => {
    return Math.abs(change).toFixed(2);
  };

  // 判斷價格是否上漲
  const isPositiveChange = data.change24h >= 0;

  return (
    <div
      className={`
        flex items-center space-x-2 
        ${compact ? 'px-2 py-1' : 'px-3 py-1.5'} 
        whitespace-nowrap
        transition-colors duration-200
        hover:bg-gray-100 hover:dark:bg-gray-700
        rounded-md
      `}
    >
      {/* 代幣圖標 */}
      {data.token.logoUrl && (
        <img
          src={data.token.logoUrl}
          alt={data.token.symbol}
          className={`${compact ? 'w-4 h-4' : 'w-5 h-5'} rounded-full`}
          onError={(e) => {
            // 如果圖標加載失敗，隱藏圖標
            e.currentTarget.style.display = 'none';
          }}
        />
      )}

      {/* 代幣符號 */}
      <span
        className={`
          font-medium text-gray-900 dark:text-gray-100
          ${compact ? 'text-xs' : 'text-sm'}
        `}
      >
        {data.token.symbol}
      </span>

      {/* 價格 */}
      <span
        ref={priceRef}
        className={`
          text-gray-700 dark:text-gray-300 
          font-mono
          transition-colors duration-200
          ${compact ? 'text-xs' : 'text-sm'}
        `}
      >
        ${formatPrice(data.price)}
      </span>

      {/* 24小時變化 */}
      <span
        className={`
          flex items-center
          ${compact ? 'text-xs' : 'text-sm'}
          ${
            isPositiveChange
              ? 'text-green-600 dark:text-green-400'
              : 'text-red-600 dark:text-red-400'
          }
        `}
      >
        {isPositiveChange ? (
          <ArrowUpIcon className={`${compact ? 'w-2 h-2' : 'w-3 h-3'} mr-1`} />
        ) : (
          <ArrowDownIcon
            className={`${compact ? 'w-2 h-2' : 'w-3 h-3'} mr-1`}
          />
        )}
        {formatChange(data.change24h)}%
      </span>
    </div>
  );
}

// 添加CSS動畫樣式到全局CSS
export const priceFlashStyles = `
  .price-flash {
    background-color: rgba(59, 130, 246, 0.3);
    border-radius: 4px;
    animation: priceFlash 1s ease-out;
  }
  
  @keyframes priceFlash {
    0% {
      background-color: rgba(59, 130, 246, 0.5);
    }
    50% {
      background-color: rgba(59, 130, 246, 0.3);
    }
    100% {
      background-color: transparent;
    }
  }
`;
